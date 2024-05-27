import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from '../utils/APIError.js';
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/FileuploadCloudinary.js";
import { APIResponce } from "../utils/APIResponce.js";
import jwt from 'jsonwebtoken';

//this method require multiple times
// in this method first find user 
//then create tokens by calling method defined in user.model

const genrateAccessAndRefreshTokens = async (userID) => {
    try {
        const user = await User.findById(userID);
        // console.log("user ID=",userID,user);
        const accessToken = user.genrateAccessToken();

        const refreshToken = user.genrateRefreshToken();
        // console.log(accessToken,refreshToken);
        //saving refresh token in db 
        user.refreshToken = refreshToken;
        //this save method save updated field in db and validateBeforeSave property is used to avoid  require validation like password
        await user.save({ validateBeforeSave: false })


        return { accessToken, refreshToken }

    } catch (error) {
        throw new APIError(500, 'Something went wrong while generating Access and Refresh Tokens')
    }
}




const registerUser = asyncHandler(async (req, res) => {

    //1.get user details from frontend
    //2.validate data  -not empty
    //3.check user already exists  using email,username
    //4.check for images,check for avatar is available
    //5.upload to cloudinary check upload successfully or not  and get ref (url)
    //6.create user object  -  create entry in db
    //7.check for user creation
    //8.remove password and ref token from responce while showing responce to user
    //9.return responce


    //1. get data from user 
    const { fullName, email, username, password } = req.body
    // console.log(req.body);

    //2. validation

    // if(fullName===''){
    //     throw new APIError(400,'Full Name is Required')
    // }

    //check each field is it empty or not 
    if ([fullName, email, username, password].some((field) => field?.trim() === '')) {
        throw new APIError(400, 'All Fields are Require')
    }

    //3. check already exist user
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new APIError(409, "User with email or username already exists")
    }


    //4.check img and avt

    // for image we are using multer to store image to our server so express give req.body as defalut multer give access req.files
    // req.files? there is chance is there access is available or not so use optional chaining
    //avatar name defined in middleware   and it gives various properties but we are accessing first property in that we get object optionally and in that we are taking path of uploded file by multer on our server 
    // storing ref in avataLocalPath

    // console.log(req.files);
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath=req.files?.coverImage[0]?.path;


    const coverImageFile = req.files?.coverImage ? files.coverImage[0] : null;
    const coverImageLocalPath = coverImageFile ? coverImageFile.path : null;

    // let coverImageLocalPath;
    // if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    //     console.log('Local path cover img');
    //     coverImageLocalPath = req.files.coverImage[0].path
    // }
    // else{
    //     console.log('oooooooooooooooooooo');
    // }



    if (!avatarLocalPath) {
        throw new APIError(400, 'Avatar File is Required')
    }



    //5. Upload on cloud

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;

    if (!avatar) {
        throw new APIError(400, 'Avatar File is Required')
    }


    //6.

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || '',
        email,
        password,
        username: username.toLowerCase()
    })

    // 8. 7. Remove pass & ref token
    // in this line first check is it user created if created by using id if created then remove pass and reftoken from responce  
    // select method syntax is weired we need to give -and field name for removing that fileds from responce 
    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new APIError(500, 'Something went wrong while registering the User')
    }

    return res.status(201).json(
        new APIResponce(200, createdUser, "User Registered Successfully")
    )
});

const loginUser = asyncHandler(async (req, res) => {
    //1. get credentials from req body
    //2. username or email 
    //3. find user
    //4. pass check
    //5. access and ref token genrate
    //6. send token in cookies
    //7. send res


    //1 
    const { email, username, password } = req.body
    // console.log(email,username,password);

    //2. ckeck is there any filed available    
    // or if we want to check both field available if  (!email && !username)
    if (!(email || username)) {
        throw new APIError(400, "Username or Email Required")
    }
    //3
    //this quiry for find user based on email or username 
    const user = await User.findOne({
        //$or_$and_are mongodb operators 
        $or: [{ username }, { email }]

    })
    // console.log("user found",user)

    if (!user) {
        throw new APIError(404, 'User dose not Exist')
    }

    //4. password check
    //User is mongodb mongoose object   user is db instance
    // isPasswordCorrect is method defined in user.model this method take user ip password  
    const isPasswordValid = await user.isPasswordCorrect(password)
    // console.log(isPasswordValid,"Pass");
    if (!isPasswordValid) {
        throw new APIError(401, 'Invalid user Credentials')
    }

    //5.

    const { accessToken, refreshToken } = await genrateAccessAndRefreshTokens(user._id)

    //6.
    //we can update user object or get new user object
    const loggedInUSer = await User.findById(user._id).select('-password -refreshToken')

    // options for cookies 
    // httpOnly and secure true for cookies modified only from server side otherwise we can modify them from clientside also 
    const options = {
        httpOnly: true,
        secure: false
    }

    //in this return responce we are setting cookies but also json data is sending for handing some cases 
    //like if user want to save access and refresh token to there side in localstorage  for some resone 
    // or mobile app is devloping in that cookies not save this is bad practice but in above  case json data req   
    return res
        .status(200)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', refreshToken, options)
        .json(
            new APIResponce(
                200,
                {
                    user: loggedInUSer, accessToken, refreshToken
                },
                "User Logged In Successfully"
            )
        )




});

const logoutUser = asyncHandler(async (req, res) => {
    //1 find active user
    //2 clear cookies
    //3 reset refreshtoken

    //1,2,3 

    await User.findByIdAndUpdate(
        //1 user find from auth middleware
        req.user._id,
        {
            //update reset ref token
            //$set_ mongodb operator to update fields
            $set: {
                refreshToken: undefined
            }
        },
        {
            //using this we get updated values in responce other wise old value get
            new: true
        }
    )

    //2 clear cookies

    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .clearCookie('accessToken', options)
        .clearCookie('refreshToken', options)
        .json(
            new APIResponce(200, {}, "User Logged Out")
        )

});

//this is for refresh or create new access token after expiry

const refreshAccessToken =  asyncHandler(async(req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (incomingRefreshToken) {
        throw new APIError(401, 'Unauthorized Request')
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id)
        if (!user) {
            throw new APIError(401, 'Invalid Refresh Token')
        }
        if(!incomingRefreshToken!==user?.refreshToken){
            throw new APIError(401,'Refresh Token is Expired')
        }
    
        const options={
            httpOnly:true,
            secure:true
        }
    
        const {accessToken,newrefreshToken}=await genrateAccessAndRefreshTokens(user._id)
    
        return res
            .status(200)
            .cookie('accessToken',accessToken,options)
            .cookie('newrefreshToken',newrefreshToken,options)
            .json(
                new APIResponce(
                    200,
                    {
                        accessToken,refreshToken:newrefreshToken
                    },
                    "Access token Refreshed"
                )
            )
    } catch (error) {

        throw new APIError(401,error?.message || 'Invalid Refresh Token')
        
    }



});

const changeCurrentPassword= asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword}=req.body

    
    const user=await User.findById(req.user?._id)

    const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)
    if(!isPasswordCorrect){
        throw new APIError(400,"Invalid Old Paaword")
    }

    user.password=newPassword
    await user.save({validateBeforeSave:false})

    return res
        .status(200)
        .json(new APIResponce(200,{},'Password Chnaged Successfully'))
});

const getCurrentUser=asyncHandler(async(req,res)=>{
    return res 
        .status(200)
        .json(200,req.user,'Currunt user fetched successfully')
});

const updateAccountDetails=asyncHandler(async(req,res)=>{

    const {fullName,email,}=req.body

    if(!fullName || !email){
        throw new APIError(400,'All Fields Require')
    }
    const user=User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullName,
                email
            }
        },
        {
            new:true
        }

    ).select('-password -refreshToken')

    return res
        .status(200)
        .json(new APIResponce(200,user,"Account Details Updated Successfully"))
});


const updateUserAvatar=asyncHandler(async(req,res)=>{
    const avatarLocalPath=req.file?.path
    if(!avatarLocalPath){
        throw new APIError(400,'Avatar file not found')
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if(!avatar.url){
        throw new APIError(400,'Error While uploading on avatar')
    }

    const user=User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar:avatar.url
            }
            
        },
        {new:true}
    ).select('-password -refreshToken')   
    return res
    .status(200)
    .json(new APIResponce(200,user,'Avatar Image Updated Successfully'))
})

const updateUserCoverImage=asyncHandler(async(req,res)=>{
    const coverLocalPath=req.file?.path
    if(!coverLocalPath){
        throw new APIError(400,'Cover file not found')
    }

    const coverImage = await uploadOnCloudinary(CoverLocalPath)
    if(!coverImage.url){
        throw new APIError(400,'Error While uploading on Cover Image')
    }

    const user=User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage:coverImage.url
            }
            
        },
        {new:true}
    ).select('-password -refreshToken')   

    return res
        .status(200)
        .json(new APIResponce(200,user,'Cover Image Updated Successfully'))
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
    updateUserCoverImage


};