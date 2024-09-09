import { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const createPlaylist = asyncHandler(async(req, res, next) => {
    try{
        const { name, description } = req.body;
        const userId = req.user?.id;

        if(!name || !description){
            throw new ApiError(400, "Name and description are required");
        }

        const newPlaylist = await Playlist.create({
            name, description, owner : userId
        })

        if(!newPlaylist){
            throw new ApiError(400, 'Playlist not created !!');
        }
        return res.status(201).json(
            new ApiResponse(201, newPlaylist, "New Playlist created successfully")
        );


    }catch(err){
        throw new ApiError(400, err?.message || "Error occurred while creating new playlist");
    }
})

const getUserPlaylists = asyncHandler(async(req, res, next) => {
    try{
        const { userId } = req.params;

        if(!isValidObjectId(userId)){
            throw new ApiError(400, "Invalid User Id");
        }

        const playlists = await Playlist.find({ owner : userId });

        if(playlists.length === 0){
            return res.status(200).json(
                new ApiResponse(200, 0, "No playlists found")
            )
        }

        return res.status(200).json(
            new ApiResponse(200, playlists, "User Playlists fetched")
        );

    }catch(err){
        throw new ApiError(400, err?.message || "Error occurred while fetching user playlists");
    }
})

const getPlaylistById = asyncHandler(async(req, res, next) => {
    try{
        const { playlistId } = req.params;

        if(!isValidObjectId(playlistId)){
            throw new ApiError(400, "Invalid Playlist Id");
        }

        const playlist = await Playlist.findById(playlistId);

        if(!playlist){
            throw new ApiError(404, "No Playlist Found");
        }

        return res.status(200).json(new ApiResponse(200, playlist, "Playlist successfully fetched"));


    }catch(err){    
        throw new ApiError(500, err?.message ||  "Error occurred while fetching Playlist");
    }
})

const addVideoToPlaylist = asyncHandler(async(req, res, next) => {
    try{
        const { videoId, playlistId } = req.params;
        
        if(!isValidObjectId(videoId)){
            throw new ApiError(400, "Invalid Video Id");
        }

        if(!isValidObjectId(playlistId)){
            throw new ApiError(400, "Invalid Playlist Id");
        }

        const playlist = await Playlist.findById(playlistId );
        if(!playlist){
            throw new ApiError(400, "Playlist does not exists");
        }

        if(playlist?.videos.includes(videoId)){
            throw new ApiError(400, "Video is already in the playlist");
        }

        playlist.videos.push(videoId);

        await playlist.save();

        return res.status(200).json(new ApiResponse(200, {playlist : playlist}, "Video added to the playlist"));


    }catch(err){
        throw new ApiError(400, err?.message || "Error occurred while adding video to Playlist");
    }
})


const removeVideoFromPlaylist = asyncHandler(async(req, res, next) => {
    try{
        const { videoId, playlistId } = req.params;

        if(!isValidObjectId(videoId)){
            throw new ApiError(400, "Invalid Video Id");
        }

        if(!playlistId){
            throw new ApiError(400, "Invalid Playlist Id");
        }

        const playlist = await Playlist.findById(playlistId);

        if(!playlist){
            throw new ApiError(400, "Playlist does not exists");
        }

        if(playlist.videos.indexOf(videoId) == -1){
            throw new ApiError(400, "Video does not exists in the playlist");
        }

        playlist.videos.splice(videoId, 1);
        await playlist.save();

        return res.status(200).json(new ApiResponse(200,playlist, "Video successfully removed from playlist"));

    }catch(err){
        throw new ApiError(400, "Error occurred while removing video from the playlist");
    }
})

const deletePlaylist = asyncHandler(async(req, res, next) => {
    try{
        const { playlistId } = req.params;

        if(!isValidObjectId(playlistId)){
            throw new ApiError(400, "Invalid Playlist Id");
        }

        const playlistExists = await Playlist.findById(playlistId);
        
        if(!playlistExists){
            throw new ApiError(404, "Playlist doesn't exists");
        }

        const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);

        return res.status(200).json(
            new ApiResponse(200, deletedPlaylist, "Playlist successfully deleted")
        );

    }catch(err){
        throw new ApiError(400, err?.message || "Error occurred while deleting the playlist");
    }
})

const updatePlaylist = asyncHandler(async( req, res, next) => {
    try{
        const { name, description } = req.body;
        const { playlistId } = req.params;

        if(!isValidObjectId(playlistId)){
            throw new ApiError(400, "Invalid Playlist Id");
        }

        if(!name && !description){
            throw new ApiError(400, "At least one field is required for updation");
        }
        const updationfields = {};

        if(name){
            updationfields.name = name;
        }
        if(description){
            updationfields.description = description;
        }

        const playlistExists = await Playlist.findById(playlistId);
        if(!playlistExists){
            throw new ApiError(404, "Playlist does not exists");
        }

        const updatedPlaylist = await Playlist.findByIdAndUpdate(
            playlistId,
            {
                $set : updationfields
            },
            { new : true }
        )

        return res.status(200).json(new ApiResponse(200, updatedPlaylist, "Playlist Updated successfully"));

    }catch(err){
        throw new ApiError(400, err?.message ||  "Error occurred while updating the playlist");
    }
})


export{
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}

