import { APIError } from "../utils/APIError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import jwt from 'jsonwebtoken';

//if we are using(req,res,next) and we are using only req and next we can write like (req, _,next)

export const verifyJWT=asyncHandler(async (req, _,next)=>{
    try {
        // taking accesstoken is present in cookies or not or in header for mobile app in header 'Bearer <Token>' in this format token is stored so trim that bearer
        const token=req.cookies?.accessToken || req.header('Authorization')?.replace("Bearer ","")
    
        if(!token){
            throw new APIError(401,'Unothorized Request')
        }
    
        //verify & decode token
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
        //get logged user
        const user= await User.findById(decodedToken?._id).select("-password -refreshToken")
        if(!user){
            throw new APIError(401,"Invalid Access Token")
        }
    
        //adding new obj in request
        req.user=user;
        next()
    } catch (error) {
        throw new APIError(401,error?.message || 'Invalid Access Token')
        
    }

})