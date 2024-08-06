import { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { User } from "../models/user.model";
import { Tweet } from "../models/tweet.model";
import { ApiResponse } from "../utils/ApiResponse";



const createTweet = asyncHandler(async (req, res) => {
    const { content, ownerId } = req.body;

    if(!content || !ownerId){
        return res
        .status(400)
        .json(
            new ApiError(400,"Content and ownerId are required")
        );
    }

    if(!isValidObjectId(ownerId)){
        return res
        .status(400)
        .json(
            new ApiError(400, "Please provide a valid User Id")
        )
    }

    try{
        const userExists = await User.findById(ownerId);
        if(!userExists){
            return res
            .status(400)
            .json(
                new ApiError(400,"Invalid User")
            );
        }

        const newTweet = new Tweet({
            content,
            owner : ownerId
        });

        const savedTweet = await newTweet.save();


        return res
        .status(201)
        .json(
            new ApiResponse(
                201, {savedTweet}, "New tweet successfully created"
            )
        )
    }catch(err){
        return res
        .status(500)
        .json(
            new ApiError(500, `Error occurred while creating new tweet, please try again later : ${err}`)
        );
    }


})

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if(!isValidObjectId(userId)){
        return res
        .status(400)
        .json(
            new ApiError(400, "Invalid User Id")
        );
    }

    try{

        const user = await User.findById(userId);

        if(!user){
            return res
            .status(400)
            .json(
                new ApiError(400,"Requested User doesn't exists")
            );
        }

        const userTweets = await Tweet.find({owner : userId}).populate("owner", "username avatar");

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {userTweets},
                "Successfully fetched User Tweets"
            )
        )


    }catch(err){
        return res
        .status(400)
        .json(
            new ApiError(400, `Error occurred in fetching user Tweets : ${err}`)
        );
    }



})

const updateTweet = asyncHandler(async(req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;
    
    if(!isValidObjectId(tweetId)){
        return res
        .status(400)
        .json(
            new ApiError(400, "Invalid Tweet Id")
        );
    }

    if(!content){
        return res
        .status(400)
        .json(
            new ApiError(400, "New content is required to update the tweet")
        );
    }

    

    try {
        const updatedTweet = await Tweet.findByIdAndUpdate(
            tweetId,
            {
                $set : {
                    content
                }
            },
            {new : true}
        )
    
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {updatedTweet},
                "Tweet Updated Successfully"
            )
        )
    } catch (err) {
        return res
        .status(400)
        .json(
            new ApiResponse(
                400, `Error occurred while updating the tweet : ${err}`
            )
        )
    }

})

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if(!isValidObjectId(tweetId)){
        return res
        .status(400)
        .json(
            new ApiError(400, "Invalid Tweet Id")
        );
    }

    try{
        const deletedTweet = await Tweet.findByIdAndDelete(tweetId);

        if(!deletedTweet){
            return res
            .status(400)
            .json(new ApiError(400, "Some error occurred while deleting the tweet"))
        };

        return res
        .status(200)
        .json(
            new ApiResponse(200, {deletedTweet}, "Tweet successfully deleted")
        );

    }catch(err){
        return res
        .status(400)
        .json(
            new ApiError(400, `Error occurred in deleting the tweet : ${err}`)
        );
    }



})


export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}



















