import { asyncHandler } from "../utils/asyncHandler.js";
import  { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose, { mongo } from "mongoose";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";


const generateAccessAndRefreshTokens = async ( userId ) => {
    try{
        const user =  await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save( { validateBeforeSave : false } );
        return { accessToken, refreshToken }
    }catch(err){
        throw new ApiError(500, "Something went wrong while generating Refresh and Access Tokens");
    }
}


const registerUser = asyncHandler( async ( req, res ) => {
    const { username, email, fullName, password  } = req.body;
    if( [username, email, fullName, password].some((field) => field?.trim() === "") ){
        throw new ApiError(400, "All Fields are required");
    }

    const userExists = await User.findOne({
        $or : [ { username }, { email } ]
    })

    if(userExists){
        throw new ApiError(409, "User with email or username already exists");
    }
    // console.log(req.files);
    
    const avatarLocalPath = req.files?.avatar[0].path;
    // const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    // console.log(req.files);

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }
    if(!avatarLocalPath){
        console.log(req.files);
        throw new ApiError(400, "Avatar file is required...");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(400, "Avatar file is required");
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
    
})

const loginUser = asyncHandler( async ( req, res ) => {

    const { email, username, password } = req.body;
    // console.log(email, username, password);

    if(!username && !email ){
        throw new ApiError(400,"Username or email is required");
    }

    const user = await User.findOne({
        $or : [{ username }, { email }]
    })

    if(!user){
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid User Credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
    // console.log("LoggedInUser : ",loggedInUser);

    const options = {
        httpOnly : true,
        secure : true
    }

    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user : loggedInUser, accessToken, refreshToken
            },
            "User Logged In Successfully"
        )
    )

})

const logoutUser = asyncHandler( async ( req, res ) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset : {
                refreshToken : undefined
            }
        },
        {
            new : true
        }
    )
    const options = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out"))
})

const refreshAccesstoken = asyncHandler( async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized Request");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    
        const user = await User.findById(decodedToken?._id);
    
        if(!user){
            throw new ApiError(401, " Invalid refresh Token");
        }
        
        if(incomingRefreshToken != user.refreshToken){
            throw new ApiError(401, "Refresh token is expired or used");
        }
    
        const options = {
            httpOnly : true,
            secure : true
        }
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id);
    
        return res
        .status(200)
        .cookie("accessToken", accessToken )
        .cookie("refreshToken", newRefreshToken)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken, refreshToken : newRefreshToken
                },
                "Access Token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
    
})

const forgotPassword = asyncHandler(async (req, res, next) => {
    const { email } = req.body;

    if(!email){
        throw new ApiError(400, "Email is required");
    }

    const user = await User.findOne({ email });

    if(!user){
        throw new ApiError(400, "Email not registered");
    }

    const resetToken = await user.generatePasswordResetToken();

    await user.save();

    const resetPasswordURL = `${process.env.FRONTEND_URL}/reset/${resetToken}`;

    const subject = "Reset Password Link";
    const message = `You can reset your password by clicking <a href=${resetPasswordURL} target="_blank" > Reset Your Password </a>.\nIf the above link does not work for some reason then copy paste this link in new tab ${resetPasswordURL}.\nIf you have not requested this, kindly Ignore.\n The Link will be valid for 15 minutes only`;



    try{

        await sendEmail(email, subject, message);
        return res.status(200).json(
            new ApiResponse(200, {}, `Reset Password has been sent to ${email} successfully`)
        );

    }catch(err){
        user.forgotPasswordExpiry = undefined;
        user.forgotPasswordToken = undefined;

        await user.save();

        throw new ApiError(400, err?.message || "Error occurred while sending reset token");
    }
})


const resetPassword = asyncHandler(async (req, res, next) => {
    try{
        const { resetToken } = req.params;
        const { password } = req.body;


        if(!password){
            throw new ApiError(400, "New Password");
        }

        const forgotPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        const user = await User.findOne({
            forgotPasswordToken,
            forgotPasswordExpiry : {$gt : Date.now()}
        });

        if(!user){
            throw new ApiError(400, "Token is invalid or expired, please try again");
        }

        user.password = password;
        user.forgotPasswordExpiry = undefined;
        user.forgotPasswordToken = undefined;
        await user.save();

        return res.status(200).json(
            new ApiResponse(200, {}, "Password changed successfully")
        );
    }catch(err){
        throw new ApiError(400, err?.message || "Error occurred while resetting password");
    }
})

const changeCurrentPassword = asyncHandler( async ( req, res ) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id);

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if(!isPasswordCorrect){
        throw new ApiError(400, "Invalid Old Password");
    }

    user.password = newPassword;
    await user.save({
        validateBeforeSave : false
    })

    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"Password updated successfully ")
    );

})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
    .status(200)
    .json(200, req.user, "Current User fetched successfully");
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;

    if(!fullName || !email){
        throw new ApiError(400, "All fields are required");
    }

    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                fullName ,
                email
            }
        },
        {new : true}
    ).select("-password");

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
})


const updateUserAvatar = asyncHandler( async (req, res) => {
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if(!avatar.url){
        throw new ApiError(400, "Error while uploading on avatar");
    }

    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                avatar : avatar.url
            }
        },
        {new : true}
    ).select("-password");

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Avatar Image Updated")
    )

})

const updateCoverImage = asyncHandler( async (req, res) => {
    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400, "Avatar file is required");
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!coverImage.url){
        throw new ApiError(400, "Error while uploading on avatar");
    }

    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                coverImage : coverImage.url
            }
        },
        {new : true}
    ).select("-password");

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Cover Image Updated successfully")
    )

})

const getUserChannelProfile = asyncHandler( async(req, res) => {
    const { username } = req.params;
    if(!username?.trim()){
        throw new ApiError(400, "Username is missing");
    }

    const channel = await User.aggregate([
        {
            $match : {
                username : username?.toLowerCase()
            }
        },
        {
            $lookup : {
                from : "subscriptions",
                localField : "_id",
                foreignField : "channel",
                as : "subscribers"
            }
        },
        {
            $lookup : {
                from : "subscriptions",
                localField : "_id",
                foreignField : "subscriber",
                as : "subscribedTo"
            }
        },
        {
            $addFields : {
                subscribersCount : {
                    $size : "$subscribers"
                },
                channelSubscribedToCount : {
                    $size : "$subscribedTo"
                },
                isSubscribed : {
                    $cond : {
                        if : {$in : [req.user?._id, "$subscribers.subscriber"]},
                        then : true,
                        else : false
                    }
                }
            }
        },
        {
            $project : {
                fullName : 1,
                username : 1,
                subscribersCount : 1,
                channelSubscribedToCount : 1,
                isSubscribed : 1,
                avatar : 1,
                coverImage : 1,
                email : 1
            }
        }
    ])

    if(!channel?.length){
        throw new ApiError(404, "Channel does not exists");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], " User channel fetched successfully")
    )

})


const getWatchHistory = asyncHandler( async ( req, res ) => {

    const user = await User.aggregate([
        {
            $match : {
                _id : new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup : {
                from : "videos",
                localField : "watchHistory",
                foreignField : "_id",
                as : "watchHistory",
                pipeline : [
                    {
                        $lookup : {
                            from : "users",
                            localField : "owner",
                            foreignField : "_id",
                            as : "owner",
                            pipeline : [
                                {
                                    $project : {
                                        fullName : 1,
                                        username : 1,
                                        avatar : 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields : {
                            owner : {
                                $first : "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200, 
            user[0].watchHistory,
            "Watch History fetched Successfully"
        )
    )


})


export { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccesstoken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateCoverImage,
    getUserChannelProfile,
    getWatchHistory,
    resetPassword,
    forgotPassword
}


