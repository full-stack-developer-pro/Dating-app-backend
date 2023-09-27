const mongoose=require("mongoose");
const url="mongodb+srv://kumarmohan:mohan001@cluster0.vh6evpy.mongodb.net/Dating_app"

module.exports.connectdb=async(req,res)=>{
    try{
        await mongoose.connect(url,{
            useNewUrlParser:true,
            useUnifiedTopology:true
        }).then((res)=>{
            console.log("Database Connected Successfully")
        }).catch((error)=>{
            console.log(error);
            console.log("Something Went Wrong")
        })
    }catch(error){
        console.log(error);
        console.log("Something Went Wrong")
    } 
}
