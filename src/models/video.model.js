import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongooseAggregatePaginate";

const videoSchema=new Schema(
    {
        videoFile:{
            type:String,  //cloudinary url
            required:true,
        },
        thumbnail:{
            type:String,
            required:true
        },
        description:{
            type:String,
            required:true
        },
        duration:{
            type:Number,
            required:true
        },
        view:{
            type:Number,
            default:0
        },
        isPublished:{
            type:Boolean,
            default:true
        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User"
        }
    },
    {
        timestamps:true
    }
)
videoSchema.plugin(mongooseAggregatePaginate)

export const Video=mongoose.model("Video",videoSchema)
