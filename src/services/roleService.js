module.exports.admin= async (req,res,next) => {
    try {
      if(req.info.role === 1){
         next()
      }else{
        res.status(401).send({success:false,message:"Invalid Request"})
      }
    } catch (error) {
      console.log("Something Went Wrong");
    }
}
  
module.exports.user= async (req,res,next) => {
  try {
    if(req.info.role === 2 || req.info.role === 1){
       next()
    }else{
      res.status(401).send({success:false,message:"Invalid Request"})
    }
  } catch (error) {
    console.log("Something Went Wrong");
  }
}