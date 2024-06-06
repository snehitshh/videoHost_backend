const asyncHandler=(requestHandler)=>{
  return  (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).
        catch((err)=>next(err))
    }
}
 
export {asyncHandler}

/*   try-catch method
const asyncHandler=(fn)=>async (req,res,next)=>{    //wrapping cuntion,it will be used in many places therefore writing in utils
    try{
        await( fn(req,res,next))
    }
    catch(error){
        res.status(err.code||500).json({
            success:false,
            message:err.message
        })
    }
}
*/

