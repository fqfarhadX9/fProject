const asyncHandler = (requestHandler) => {
    (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).
        catch((error) => next(error));
    }
}

// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
        
//     } catch (error) {
//         await fn(req, res, next);
//         res.status(error.code || 500).json({
//             success: false,
//             msg: error.message
//         });
//     }
// }