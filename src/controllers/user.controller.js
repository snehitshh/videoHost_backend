
import {asyncHandler} from "../utils/asyncHandler.js";
import {apiError} from "../utils/apiErrors.js";
import {User} from "../models/users.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import  {apiResponse}  from "../utils/apiResponse.js";
import jwt from "jsonwebtoken"


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
export {registerUser}





/*const videoLocalFile = req?.files?.videoFile;
if (!(videoLocalFile && videoLocalFile[0].path)) {
throw new ApiError(400, "Video file is required");
}*/