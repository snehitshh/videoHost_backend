//require('dotenv').config({path:'./env'})
import dotenv from "dotenv"
import connectDB from "./db/index.js";
import {app} from "./app.js";
//import express from "express";
//const app=express()

dotenv.config({
    path: './env'
})

/*  FIRST APPROACH(all code in a single file)
import express from "express"
const app=express()

;(async()=>{
    try{
       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)   //connecting the database
       app.on("error",(error)=>{                                              //listener(db has connected but express app cant communicate)
        console.log("ERROR:",error);
        throw error
       })

       app.listen(process.env.PORT,()=>{
        console.log(`App is listening on port ${process.env.PORT}`)
       })

    }catch(error){
        console.error("ERROR:",error)                                    //throwing an error if cant connect to db
        throw error
    }
})()
*/
connectDB()
.then(()=>{
    app.listen(process.env.PORT||8000,()=>{
        console.log(`Server is running at port:${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("MONGODB connection FAILED !!!",err);
})


