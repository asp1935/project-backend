import mongoose,{Schema} from 'mongoose'
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'         //for mongodb adv aggregation queries
const videoSchema =new Schema({

    videoFile:{
        type:String,    //cloudinary url beacause if we store video on db it will huge load on db
        required: true,
    },
    thumbnail:{
        type: String,    //cloudinary url
        required: true,
    },
    title:{
        type: String,
        required: true,
    },
    description:{
        type: String,
        required: true,
    },
    duration:{
        type: Number,     //cloudinary url  cloudi provide duration of saved video
        required: true,
    },
    views:{
        type: Number,
        default:0        //default value
    },
    isPublished:{
        type: Boolean,
        default: true
    },
    owner:{
        type: Schema.types.ObjectId,
        ref:'User'
    }


},{
    timestamps: true
}
)

videoSchema.plugin(mongooseAggregatePaginate)          //adding plugin in schema middleware

export const Video=mongoose.model('video',videoSchema);