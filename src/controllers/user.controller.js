import {asyncHandler} from "../utils/asyncHandler.js";
import {apiError} from "../utils/apiErrors.js";
import {User} from "../models/users.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import  {apiResponse}  from "../utils/apiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

const generateAccessAndRefreshTokens=async(userId)=>{
  try{
    const user=await User.findById(userId)
    const accessToken=user.generateAccessToken()
    const refreshToken=user.generateRefreshToken()

    user.refreshToken=refreshToken         //saving refresh token in  db
    await user.save({validateBeforeSave:false})
    
    return {accessToken,refreshToken}
  }
  catch(error){
    throw new apiError(500,"Something went wrong while generating refresh and access token")
  }
}

const registerUser=asyncHandler(async (req,res)=>{
        /* return res.status(200).json({
        message:"working"    */  
        //get user details from frontend
       //validation - check if empty or not
       //check if user already exists:username and email
       //check for images,check for avatar
       //upload them to cloudinary
       //create user object-create entry in db
       //remove password and refresh token field from response
       //check for user creation
       //return res                                                                          
        const{username,email,fullName,password}=req.body
        /*if(fullName==""){        //either we can check one by one by applying if else
            throw new apiError(400,"full name is required")
        }*/    
       if(
        [fullName,email,password,username].some((field)=>field?.trim==="")  //trimming if it is field and if still empty after trimming 
    )                                                                       //then it will return true that it is empty
    {
        throw new apiError(400,"All fields are required");
    }

    if(password.length < 6){
        throw new apiError(400, 'Password must be at least 6 characters')
      }
      if(username.length < 3){
        throw new apiError(400, 'Username must be at least 3 characters')
      }
      if(email.includes('@') === false){
        throw new apiError(400, 'Email is invalid')
      }
    
const existingUser=await User.findOne({
        $or:[{username},{email}]
    })
    if(existingUser){
        throw new apiError(409,"User with email or username already exists")
    }
   const avatarLocalPath = req.files?.avatar[0]?.path;          
   //const coverLocalPath=req.files?.coverImage[0]?.path;
   let coverLocalPath ;

   if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0 ){
     coverLocalPath = req.files.coverImage[0].path ;
 }

   if(!avatarLocalPath){
    throw new apiError(400,"Avatar file is required");
   }

 const avatar = await uploadOnCloudinary(avatarLocalPath)
 const coverImage=await uploadOnCloudinary(coverLocalPath)

 if(!avatar){
    throw new apiError(400,"Avatar file is required");
 }

 const user=await User.create({             //creating user object entry in db
    fullName,
    avatar:avatar.url,
    coverImage:coverImage?.url || "",   //if coverimage is there then take out its url otherwise letting it remain empty
    email,
    password,
    username:username.toLowerCase()
})
const createdUser=await User.findById(user._id).select(
    "-password -refreshToken"
)                                           //removing passwird and refreshToken from response
 if(!createdUser){                      //if the user is not created then throwing an error
        throw new apiResponse(500,"something went wrong while registering the user")   
}
return res.status(201).json(
    new apiResponse(200,createdUser,"User registered succesfully")
)
})

const loginUser=asyncHandler(async(req,res)=>{
    //req body->data
    //username or email
    //find the user
    //check password
    //access and refresh token to user
    //send cookie 
    const{email,username,password}=req.body

    if(!(username || email)){
      throw new apiError(400,"usesrname or email is required")
    }

    const user=await User.findOne({
      $or:[{username},{email}]
    })
    if(!user){
      throw new apiError(404,"User doesnt exist")
    }

    const isPasswordValid=await user.isPasswordCorrect(password)
    if(!isPasswordValid){
      throw new apiError(401,"Wrong password entered")
    }
    const{accessToken,refreshToken}=    //as generateAccessAndRefreshTokens generates accessToken and RefreshToken therefore destrtucutring
    await generateAccessAndRefreshTokens(user._id)

    const loggedInUser=awaitUser.findById(user._id).
    select("-password -refreshToken")

    const options={            //cookies
      httpOnly:true,           //by doing this only backend can see the cookies
      secure:true
    }
    
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
      new apiResponse(
        200,
        {
          user:loggedInUser,accessToken,refreshToken
        },
        "User logged in successfully"
      )
    )

})

const logoutUser=asyncHandler(async(req,res)=>{
    User.findByIdAndUpdate(                        
      req.user._id,                         //updating by removing refreshToken (we have to remove refreshToken if logging out)
      {
        $unset:{
          refreshToken:1  //this removes the field from document
        }
      },
      {
        new:true
      }
    )  
    const options={            //cookies
      httpOnly:true,           //by doing this only backend can see the cookies
      secure:true
    }  
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new apiResponse (200,{},"User logged out"))
})

const refreshAccessToken=asyncHandler(async(req,res)=>{
  const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken

  if(!incomingRefreshToken){
    throw new apiError(401,"Unauthorized request")
  }

 try {
  const decodedToken = jwt.verify(                    //for verification we have to pass a token and a secret token
     incomingRefreshToken,
     process.env.REFRESH_TOKEN_SECRET
   )
   const user = await User.findById(decodedToken?._id)
   if(!user){
     throw new apiError(401,"Invalid refresh token")
   }
 
   if(incomingRefreshToken!==user?.refreshToken){    //if the incoming refresh token and user refresh token not same then throw error
     throw new apiError(401,"Refresh token is expired or used")
   }
         //if both match then we generate new access and refresh token
   const options={
     httpOnly:true,
     secure:true
   }
  const {accessToken,newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
   return res
   .status(200)
   .cookie("accessToken",accessToken,options)
   .cookie("refreshToken",newRefreshToken,options)
     .json(
       new apiResponse(
         200,
         {accessToken,newRefreshToken},
         "Access token refreshed"
       )
     )
 } catch (error) {
      throw new apiError(401,error?.message || "Invalid refresh token")
 }
})

const changeCurrentPassword=asyncHandler(async(req,res)=>{
  const{oldPassword,newPassword}=req.body

  const user=await User.findById(req.user?._id)
  const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)
  if(!isPasswordCorrect){
    throw new apiError(400,"invalid old password")
  }
  user.password=newPassword
  await user.save({validateBeforeSave:false})

  return res
  .status(200)
  .json(new apiResponse(200,{},"Password changed succesfully"))
})

const getCurrentUser=asyncHandler(async(req,res)=>{
  return res
  .status(200)
  .json(new apiResponse(200,req.user,"current user fetched succesfully"))  
})

const updateAccountDetails=asyncHandler(async(req,res)=>{
  const{fullName,email}=req.body
  if(!fullName || !email){
    throw new apiError(400,"All fields are required ")
  }
  User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        fullName:fullName,         //can also be just written as fullName
        email
      }
    },
    {new:true}             //info after updating is returned by maiking new : true
  ).select("-password")
  
  return res
  .status(200)
  .json(new apiResponse(200,User,"Account details updated succesfully"))
})

const updateUserAvatar=asyncHandler(async(req,res)=>{
  const avatarLocalPath=req.file?.path
  if(!avatarLocalPath){
    new apiError(400,"Avatar file is missing")
  }
  const avatar=await uploadOnCloudinary(avatarLocalPath)

  if(!avatar.url){
    throw new apiError(400,"Error while uploading avatar")
  }
 const user = await User.findByIdAndUpdate(
    req.user._id,
     {
      $set:{
        avatar:avatar.url
      }
     },
     {new:true}
  ).select("-password")

  return res
  .status(200)
  .json(
    new apiResponse(200,user,"Avatar updated succesfully")
  )
})

const updateUserCoverImage=asyncHandler(async(req,res)=>{
  const coverImageLocalPath=req.file?.path
  if(!coverImageLocalPath){
    new apiError(400,"Cover image file is missing")
  }
  const coverImage=await uploadOnCloudinary(coverImageLocalPath)

  if(!coverImage.url){ 
    throw new apiError(400,"Error while uploading image")
  }
 const user = await User.findByIdAndUpdate(
    req.user._id,
     {
      $set:{
        coverImage:coverImage.url
      }
     },
     {new:true}
  ).select("-password")

  return res
  .status(200)
  .json(
    new apiResponse(200,user,"Cover Image updated succesfully")
  )
})

const getUserChannelProfile=asyncHandler(async(req,res)=>{
    const {username}=req.params

    if(!username?.trim()){
      throw new apiError(400,"Username is missing")
    }

    const channel=await User.aggregate([
      {
        $match:{                    //matching username
          username:username?.toLowerCase()
        }
      },
      {
        $lookup:{       //finding how many subscribers through channel
          from:"subscriptions",
          localField:"_id",
          foreignField:"channel",
          as:"subscribers"
        }
      },
      {
        $lookup:{            //how many have the user subscribed through subscriber
          from:"subscriptions",
          localField:"_id",
          foreignField:"subscriber",
          as:"subscribedTo"
        }
      },
      {
        $addFields:{
          subscribersCount:{
            $size:"$subscribers"     //counting the subscribers,using $ sign as it is a field
          },
          channelsSubscribedToCount:{
            $size:"$subscribedTo"
          },
          isSubscribed:{
            $condition:{
              if:{$in:[req.user?._id,"$subscribers".subscriber]},
              then:true,
              else:false
            }
          }
        }
      },
      {
        $project:{
          fullName:1,              //1 sets the flag if the corresponding value is to be projected or not
          username:1,
          subscribersCount:1,
          channelsSubscribedToCount:1,
          isSubscribed:1,
          avatar:1,
          coverImage:1,
          email:1
        }
      }
  ])
  if(!channel?.length){   //checking if channel exists or not here ! is put in front therefore if this turns out true then channel doesnt exist
    throw new apiError(404,"Channel does not exist")
  }
  return res
  .status(200)
  .json(new apiResponse(200,channel[0],"User channel fetched succesfully"))
})

const getWatchHistory=asyncHandler(async(req,res)=>{
  const user= await User.aggregate([
    {
      $match:{
        _id:new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup:{
        from:"videos",
        localField:"watchHistory",
        foreignField:"_id",
        as:"watchHistory",
        pipeline:[
          {
              $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner",
                pipeline:[
                  {
                    $project:{
                      fullName:1,
                      username:1,
                      avatar:1
                    }
                  }
                ]
              }
          },
          {
            $addFields:{
              owner:{
                $first:"$owner"
              }
            }
          }
      ]
      }
    }
  ])

  return res
  .status(200)
  .json(new apiResponse(200,
    user[0].watchHistory,
    "Watch history fetched succesfully"))
})


export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory
}
