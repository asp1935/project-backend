//Higher order functions functions that take func as a parameter or return
//handling request and sending promises
//***************using Promise*********************

const asyncHandler =(requestHandler)=>{
    return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next))
        .catch((err)=>{next(err)})
    }
}

export {asyncHandler }



//******************using Try catch*****************

// const asyncHandler=()=>{}   we can pass function but fuction not execute because callback is return 
//const asyncHandler =(fn)=>{()=>{}}           // simple version is bellow


// const asyncHandler =(fn)=>async(req,res,next)=>{                       // so we need to do like this 
//     try{
//         await fn(req,res,next)
//     }catch(error){
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }