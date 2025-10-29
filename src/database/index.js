import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}`)
        console.log(`\n MongoDB connected !! DB host ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("Error occured in connecting DB :", error)
        process.exit(1)
    }
}

export default connectDB;