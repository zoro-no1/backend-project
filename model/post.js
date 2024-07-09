const mongoose=(require("mongoose"));


const postSchema = mongoose.Schema({
   
    post:String,
    userId: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    like:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    }]
});
module.exports=mongoose.model("post",postSchema);