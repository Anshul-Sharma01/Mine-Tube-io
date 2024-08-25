import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { Comment } from "../models/comment.model";
import { ApiResponse } from "../utils/ApiResponse";



const getVideoComments = asyncHandler(async (req, res, next) => {
    try{
        const { videoId } = req.params;

        if(!isValidObjectId(videoId)){
            throw new ApiError(400, "Invalid Video Id");
        }

        const allComments = await Comment.find({video : videoId});

        if(allComments.length === 0){
            throw new ApiError(400, "Comments does not exists");
        }

        return res.status(200).json(
            new ApiResponse(200, allComments, "Comments fetched successfully")
        );


    }catch(err){
        throw new ApiError(400, "Error occurred while fetching all comments");
    }
})

const addComment = asyncHandler(async (req, res, next) => {
    try{
        const { videoId } = req.params;
        const { content } = req.body;
        const  userId  = req.user._id;

        if(!content){
            throw new ApiError(400, "Content field is mandatory");
        }

        if(!isValidObjectId(videoId)){
            throw new ApiError(400, "Invalid Video Id");
        }

        const addedComment = await Comment.create({
            content,
            video : videoId,
            owner : userId
        })

        return res.status(201).json(
            new ApiResponse(201, addedComment, "Comment added Successfully")
        );
        
    }catch(err){
        throw new ApiError(400, "Error occurred while publshing comment");
    }
})

const updateComment = asyncHandler(async(req, res, next) => {
    try{
        const { commentId } = req.params;
        const { content } = req.body;

        if(!isValidObjectId(commentId)){
            throw new ApiError(400, "Invalid Comment Id");
        }

        if(!content){
            throw new ApiError(400, "Content Fields is necessary for updation");
        }

        const updatedComment = await Comment.findByIdAndUpdate(
            commentId,
            {$set : {content}},
            {new : true}
        )

        if(!updatedComment){
            throw new ApiError(400, "Comment not updated due to error");
        }

        return res.status(200).json(
            new ApiResponse(200, updatedComment, "Comment updated successfully")
        );
        
    }catch(err){
        throw new ApiError(400, "Error occurred while updating the comment");
    }
})

const deleteComment = asyncHandler(async (req, res, next) => {
    try{
        const { commentId } = req.params;
        
        if(!isValidObjectId(commentId)){
            throw new ApiError(400, "Invalid Comment Id");
        }

        const deletedComment = await Comment.findByIdAndDelete(commentId);

        if(!deletedComment){
            throw new ApiError(400, "Comment not deleted due to some error");
        }

        return res.status(200).json(
            new ApiResponse(200, deletedComment, "Comment Deleted successfully")
        );

    }catch(err){
        throw new ApiError(400, "Error occurred while deleting the comment");
    }
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}