import { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Subscription } from "../models/subsrciption.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const toggleSubscription = asyncHandler(async(req, res,next) => {
    try{
        const { channelId } = req.params;
        const userId = req.user?._id;



        if(!isValidObjectId(channelId)){
            throw new ApiError(400, "Invalid Channel Id");
        }

        const subscriptionExists = await Subscription.findOne({ channel : channelId, subscriber : userId  });

        if(subscriptionExists){
            await subscriptionExists.deleteOne();
            return res.status(200).json(
                new ApiResponse(200, subscriptionExists, "Subscription removed successfully")
            );
        }

        const newSubscription = await Subscription.create({
            subscriber : userId,
            channel : channelId
        })

        return res.status(201).json(
            new ApiResponse(201, newSubscription, "Subscription added successfully")
        );

    }catch(err){    
        throw new ApiError(400, "Error occurred while toggling siubscription");
    }
})


const getUserChannelSubscribers = asyncHandler(async(req, res, next) => {
    try{
        const { channelId } = req.params;

        if(!isValidObjectId(channelId)){
            throw new ApiError(400, "Invalid Channel Id");
        }

        const subscribers = await Subscription.find({ channel : channelId });

        if(subscribers.length === 0){
            return res.status(200).json(
                new ApiResponse(200, [], "No subscribers found")
            );
        }

        return res.status(200).json(
            new ApiResponse(200, subscribers, "Subscribers fetched successfully")
        );

    }catch(err){
        throw new ApiError(400, err?.message || "Error occurred while fetching user channel subscribers");
    }
})


const getSubscribedChannels = asyncHandler(async(req, res, next) => {
    try{
        const { subscriberId } = req.params;

        if(!isValidObjectId(subscriberId)){
            throw new ApiError(400, "Invalid Subscriber Id");
        }

        const subscriptions = await Subscription.find({ subscriber : subscriberId });

        if(subscriptions.length === 0){
            return res.status(200).json(
                new ApiResponse(200, [], "No subscriptions found")
            );
        }

        return res.status(200).json(
            new ApiResponse(200, subscriptions, "User subscriptions fetched")
        );

    }catch(err){
        throw new ApiError(400, err?.message ||  "Error occurred fetching subscriptions of user");
    }
})


export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}




