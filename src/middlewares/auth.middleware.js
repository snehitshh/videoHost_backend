import { apiError } from "../utils/apiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import  jwt  from "jsonwebtoken";
import {User} from "../models/users.model.js";

//this middleware is to check whether user is logged in or not by generating a token
export const verifyJWT=asyncHandler(async(req,res,
    next)=>{
      try {
        const token = req.cookies?.accessToken||req.header("Authorization")?.replace("Bearer ","")    //generating token
  
      if(!token){
          throw new apiError(401,"Unauthorized request")
      }
  
      const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
  
      const user=await User.findById (decodedToken?._id).select("-password -refreshToken")
  
     if(!user){
      throw new apiError(401,"Invalid access token")
     }
  
     req.user=user;
     next();
      } catch (error) {
        throw new apiError(401,error?.message || "invalid access token")
      } 

})


