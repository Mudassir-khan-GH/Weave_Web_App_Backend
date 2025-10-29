import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: [true, "Email must be unique"],
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        min: [8, "Password must be greater than 8 characters"],
    },
    gender: {
        type: String,
        required: true,
        enum: ["male", "female"]
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationCode: {
        type: String,
        default: null,
    },
    image: {
        type: String,
        required: [true, "Image is required"]
    },
    refreshToken: {
        type: String,
        default: null
    }
},{timestamps: true})

const User = mongoose.model('User', userSchema)

export default User