import mongoose,{ isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse} from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { Video } from "../models/video.model.js";


const getAllVideos = asyncHandler( async(req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType} = req.query;
    const userId = req.user; 
})

const publishAVideo = asyncHandler(async(req, res) => {
    try{
        const { title, description } = req.body;
        if(!title || !description){
            throw new ApiError(400, "Title and description are required");
        }

        const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
        const videoFileLocalPath = req.files?.videoFile[0]?.path;

        if(!thumbnailLocalPath || !videoFileLocalPath){
            throw new ApiError(400, "Thumbnail and Video File are required");
        }

        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
        const videoFile = await uploadOnCloudinary(videoFileLocalPath);

        if(!thumbnail){
            throw new ApiError(400, "Thumbnail is required");
        }
        if(!videoFile){
            throw new ApiError(400, "Video File is required");
        }

        const video = await Video.create({
            videoFile : videoFile.secure_url,
            thumbnail : thumbnail.secure_url,
            title,
            description,
            duration : videoFile.duration,
            isPublished : true,
            owner : req.user?._id
        })


        if(!video){
            throw new ApiError(500, "Something went wrong while uploading the video");
        }

        return res
        .status(200)
        .json(
            new ApiResponse(200, video, "Video Published successfully")
        );

    }
    catch(err){
        throw new ApiError(500, "Internal Server Occurred while uploading Video");
    }
})


const getVideoById = asyncHandler(async(req, res) => {
    try{
        const { videoId } = req.params;
        
        if(!isValidObjectId(userId)){
            throw new ApiError(401, "Invalid Video Id");
        }

        const video = await Video.findById(videoId);

        if(!video){
            throw new ApiError(404, "Required Video not found or Video details not fetched");
        }

        return res
        .status(200)
        .json(
            new ApiResponse(200, video, "Video fetched successfully")
        );
        
    }catch(err){
        throw new ApiError(500, "Error occurred while fetching the required video");
    }
})

const updateVideo = asyncHandler(async(req, res) => {
    try{
        const { videoId } = req.params;
        if(!isValidObjectId(videoId)){
            throw new ApiError(401, "Invalid video Id");
        }

        const thumbnailLocalPath = req.file?.path;

        if(!title && !description && !thumbnailLocalPath){
            throw new ApiError(400, "At least one field is required");
        }

        let thumbnail;
        if(thumbnailLocalPath){
            thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
            if(!thumbnail.secure_url){
                throw new ApiError(400, "Error while updating thumbnail in cloudinary");
            }
        }

        const result = await Video.findByIdAndUpdate(
            videoId,
            {
                $set : {
                    title,
                    description,
                    thumbnail
                },
            },
            { new : true }
        )

        if(!result){
            throw new ApiError(401, "Video details not found");
        }

        return res
        .status(200)
        .json(new ApiResponse(200, result, "Video details updated successfully"));

    }catch(err){
        throw new ApiError(500, "Something went wrong while deleting the video");
    }
})


const deleteVideo = asyncHandler(async(req, res) => {
    try{
        const { videoId } = req.params;

        if(!isValidObjectId(videoId)){
            throw new ApiError(400,"Invalid Video Id");
        }

        const video = await Video.deleteOne({
            _id : ObjectID(`${videoId}`)
        });

        if(video.deletedCount === 0){
            throw new ApiError(401, "Video not found or not deleted due to error");
        }

        return res
        .status(200)
        .json(
            new ApiResponse(200, video, "Video deleted Successfully")
        );

    }catch(err){
        throw new ApiError(500, "Error occurred while deleting the video");
    }
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    try{
        const { videoId } = req.params;

        if(!isValidObjectId(videoId)){
            throw new ApiError(401, "Invalid Video Id");
        }

        const video = await Video.findById(videoId);

        if(!video){
            throw new ApiError(401, "Video not found !!");
        }

        video.isPublished = !isPublished;
        await video.save({ validateBeforeSave : false });

        return res
        .status(200)
        .json(
            new ApiResponse(200, video, "Published Toggled Successfully")
        );

    }catch(err){
        throw new ApiError(401, "Error occurred while toggling publish status of video");
    }
})



export { 
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}










