import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";




const servercheck = asyncHandler( async ( req, res) => {
    try{
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    status : 'ok'
                },
                "Server health is up-to-date"
            )
        )
    }catch(err){
        return res
        .status(500)
        .json(
            new ApiError(
                500,
                `!!!! ALERT !! Server health is degraded !!!!`
            )
        )
    }
})



export {
    servercheck
}













