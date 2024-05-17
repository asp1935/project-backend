import express from 'express';
import cors from 'cors';
import cookieparser from 'cookie-parser'    // used for perform crud op on user cookies 

const app=express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true
}))

//data is comming from multiple sources like json,body(form),url we need to give intructions 
//to our app like data is comming from given loactions so understand that data and  also set limit 
//security practices
app.use(express.json({limit:"16kb"}))    // for form json data 
app.use(express.urlencoded({extended:true,limit:'16kb'}))   // for url data
app.use(express.static('public'))   // for storing file img on server also for serving static files like css js img

app.use(cookieparser())   //cookie parser used for perform crud op like stroring cookies on use browser and reading cookies 

export {app}