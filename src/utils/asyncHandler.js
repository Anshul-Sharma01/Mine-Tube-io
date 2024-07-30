// using promises
const asyncHandler = ( requsetHandler) => {
    return (req, res, next) => {
        Promise.resolve(requsetHandler(req, res, next)).catch((err) => next(err))
    }
}



export { asyncHandler }


// using try and catch
// const asyncHandler = (fn) => async ( req, res, next ) => {
//     try{
//         await fn( req, res, next )
//     }catch(err){
//         res.status(err.code || 500).json({
//             success : false,
//             message : err.message
//         })
//     }
// }