import dotenv from 'dotenv'
dotenv.config()
import connectDB from "./database/index.js";
const {default :app} = await import ("./app.js")


connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000 , () => {
        console.log("Server is running on port", process.env.PORT || 8000)
        console.log(`http://localhost:${process.env.PORT || 8000}/api/v1/user/create`);
        
    })
})