import express from 'express';
import mongoose from 'mongoose';
// import { DB_NAME } from './constants.js';
import dotenv from 'dotenv/config'
import connectDB from './db/index.js';
import { app } from './app.js';

//return promis
connectDB()
.then(()=>{
    app.on('Error',(error)=>{
        console.log('Error: ',error);
        throw error;
    })
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is running on port : ${process.env.PORT || 8000} `);
    })
})
.catch((error)=>{
    console.log('DB Connection Failed',error);
})             

/*
const app=express();

;(async ()=>{
    try{
        mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on('Error',(error)=>{
            console.log('Error: ',error);
            throw error;
        })
        
        app.listen(process.env.PORT,()=>{
            console.log(`App is listining on port ${process.env.PORT}`);
        })

    }catch(error){
        console.log("Error: ",error);
        throw error;
    }
})()

*/
