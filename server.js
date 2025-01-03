import express from "express"
import connectDb from "./config/connectDb.js"
import "dotenv/config"
import error from "./middlewares/error.js"
import apiResponse from "./utils/apiResponse.js"
import route from "./routes/indexRoute.js"
import cookieParser from "cookie-parser"
import cors from "cors"
const app = express()
const port = process.env.PORT || 4000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(cors(
    {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With'],
        exposedHeaders: ['Authorization']
    }
))

app.get('/', (req, res) =>
    apiResponse(true, 200, "Welcome to the API", null, res)

)
app.use('/api/v1', route)



app.use(error)
app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`)
    connectDb()
})