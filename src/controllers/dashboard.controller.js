import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getChannelStats = asyncHandler(async (req, res) => {
    const userId = req.params.userId;

    try {
        const channelStats = await Video.aggregate([
            {
                $facet: {
                    totalVideosByOwner: [
                        {
                            $match: { owner: mongoose.Types.ObjectId(userId) }
                        },
                        {
                            $count: "totalVideos"
                        }
                    ],
                    totalSubscribersByChannel: [
                        {
                            $match: { channel: mongoose.Types.ObjectId(userId) }
                        },
                        {
                            $count: "TotalSubscribers"
                        }
                    ],
                    totalLikesByVideo: [
                        {
                            $match: { owner: mongoose.Types.ObjectId(userId) }
                        },
                        {
                            $lookup: {
                                from: "likes",
                                localField: "_id",
                                foreignField: "video",
                                as: "likes"
                            }
                        },
                        {
                            $unwind: "$likes"
                        },
                        {
                            $count: "TotalLikes"
                        }
                    ],
                    totalVideoViews: [
                        {
                            $match: { owner: mongoose.Types.ObjectId(userId) }
                        },
                        {
                            $group: {
                                _id: null,
                                totalViews: { $sum: "$views" }
                            }
                        }
                    ]
                }
            }
        ]);

        if (!channelStats) {
            throw new ApiError(400, "Something went wrong");
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, channelStats[0], "Successfully fetched channel stats")
            );
    } catch (err) {
        return res
            .status(400)
            .json(
                new ApiError(400, `Error occurred while fetching channel stats: ${err.message}`)
            );
    }
});

import { Video } from "../models/video.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getChannelVideos = asyncHandler(async (req, res) => {
    try {
        const userId = req.params.userId;

        const userVideos = await Video.find({ owner: userId });

        if (!userVideos) {
            throw new ApiError(404, "No videos found for this user");
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, userVideos, "Successfully fetched user videos")
            );

    } catch (err) {
        return res
            .status(400)
            .json(
                new ApiError(400, `Error occurred while fetching videos: ${err.message}`)
            );
    }
});



export {
    getChannelStats,
    getChannelVideos
}












