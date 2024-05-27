import mongoose,{Schema} from 'mongoose'
import jwt from 'jsonwebtoken'         // jwt is a bearer token  bearer token in the sence like if i have key then data is given to me if my key stolen by someone someone can access data  
import bcrypt from 'bcrypt'            //convert password into hash /excription

// encryption not possible directly so we require mongoose hooks 
// pre hook is used it work like it execute when data is going to be save in db  there are various event that time we can cexcute code 

const userSchema=new Schema({
    username:{
        type:String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true       //if we want to make a field searchable then give index =true but it make expensive for optimiztion only 
    },
    email:{
        type:String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullName:{
        type:String,
        required: true,
        trim: true,
        index: true
    },
    avatar:{
        type:String,          //cloudinary url
        required: true,
    },
    coverImage:{
        type:String,            //cloudinary url
    },
    //watch history is array that why [] array is created
    watchHistory:[
        {
            type:Schema.Types.ObjectId,          //refrance from another collection
            ref:'Video'
        }
    ],
    password:{
        type:String,
        required: [true,'Password is Required'],  //custom error msg
    },
    refreshToken:{
        type:String
    }
},
{
    timestamps:true     // it gives createdAt and updatedAt timestamps
}
)

//in pre hook we cant use arrow function as callback because in arrow function dosnt have this referance we need to use  function keyword to create function and 
// this fuction take time to execute beacuse algorithms applied on this
// this is middleware so next access is given 
// this function execute every time if single field change 

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();  // check if passoword is not modified then retuen otherwise encrypt password 

    this.password= await bcrypt.hash(this.password,10)
    next()
})

userSchema.methods.isPasswordCorrect= async function (password) {
    // console.log("Pass check method");
    return await bcrypt.compare(password,this.password)      // this method compare password and give boolean value password is user give and this.password is incrypted password i db
}

//short lifespan
userSchema.methods.genrateAccessToken=function() {
    return jwt.sign({
        _id:this._id,                  //id get from db                              
        email:this.email,
        username:this.username,
        fullName:this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    })
}



// both token create by same process but in refresh token information is less than access token and refresh token refresh multiple times

//long lifespan
userSchema.methods.genrateRefreshToken=function() {
    // console.log("ref token method");
    
    
    return jwt.sign({
        _id:this._id,                  //id get from db                              
        
    },

    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    })
    
}

//this user we can use any where in app 
// this user directly contact to db
export const User=mongoose.model('User',userSchema)   //this name converted into plural like 'users'