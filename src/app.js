import express, { urlencoded } from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app=express()

app.use(cors({             // .use is generally used in middlewares, CORS-cross origin resource sharing
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

//importing routes
import userRouter from './routes/user.routes.js'

//declaring routes
app.use("/api/v1/users",userRouter)  //whenever a user writes /users we will gove control to userRouter and goes to user.routes.js


//  http://localhost:8000/api/v1/users/register
export {app}

