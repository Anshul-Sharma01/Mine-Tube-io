import { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";
import { ApiResponse } from "../utils/ApiResponse";



const toggleVideoLike = asyncHandler(async (req, res, next) => {
    try{
        const { videoId } = req.params;
        const userId = req.user._id;

        if(!isValidObjectId(videoId)){
            throw new ApiError(400, "Invalid Video Id");
        }

        const videoLiked = await Like.findOne({ video : videoId, likedBy : userId });

        if(videoLiked){
            await videoLiked.deleteOne();
            return res.status(200).json(new ApiResponse(200, videoLiked, "Liked Removed successfully"));
        }else{
            const likeVideo = await Like.create({
                likedBy : userId,
                video : videoId
            })

            return res.status(201).json(new ApiResponse(201, likeVideo, "Video Liked successfully"));
        }
    }catch(err){
        throw new ApiError(400, "Error occurred while toggling Like");
    }
})

const toggleCommentLike = asyncHandler(async ( req, res, next) => {
    try{
        const { commentId } = req.params;
        const userId = req.user._id;

        if(!isValidObjectId(commentId)){
            throw new ApiError(400, "Invalid Comment Id");
        }

        const commentLiked = await Like.findOne({comment : commentId, likedBy : userId});

        if(commentLiked){
            await commentLiked.deleteOne();
            return res.status(200).json(new ApiResponse(200, commentLiked, "Comment Liked removed Successfully"));
        }else{
            const likeComment = await Like.create({
                comment : commentId,
                likedBy : userId
            })

            return res.status(201).json(new ApiResponse(201, likeComment, "Comment Liked Successfully"));
        }
    }catch(err){
        throw new ApiError(400, "Error occurred while toggling Comment Like");
    }
})

const toggleTweetLike = asyncHandler(async(req, res, next) => {
    try{
        const { tweetId } = req.params;
        const userId = req.user._id;

        if(!isValidObjectId(tweetId)){
            throw new ApiError(400, "Invalid Tweet Id");
        }

        const tweetLiked = await Like.findOne({ tweet : tweetId, likedBy : userId });
        
        if(tweetLiked){
            await tweetLiked.deleteOne();
            return res.status(200).json(new ApiResponse(200, tweetLiked, "Tweet Liked removed successfully"));
        }else{
            const likeTweet = await Like.create({
                likedBy : userId,
                tweet : tweetId
            });
            return res.status(201).json(new ApiResponse(201, likeTweet, "Tweet Liked successfully"));
        }

    }catch(err){
        throw new ApiError(400, "Error occurred while toggling tweet like");
    }
})

const getLikedVideos = asyncHandler(async(req, res, next) => {
    try{
        const userId = req.user._id;

        const likedVidoes = await Like.find({ likedBy : userId,  video : {$exists : true}}).populate("video");
        if(likedVidoes.length === 0){
            return res.status(200).json(new ApiResponse(200,likedVidoes, "No liked videos found !!"));
        }

        return res.status(200).json(
            new ApiResponse(200,likedVidoes, "All liked videos fetched successfully")
        );

    }catch(err){
        throw new ApiError(400, "Error occurred while fetching all liked videos");
    }
})


export { 
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}



