import User from '../models/user.model.js'
import fs from 'fs/promises'
import { uploadOnCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js'
import { compressImage } from '../utils/compress.js'
import { hashPassword, comparePassword } from '../utils/bcrypt.js'
import { generateAccessToken, generateRefreshToken } from '../utils/genTokens.js'


const options= {
    httpOnly: true,
    secure: true
}

export const createUser = async (req, res) => {
    try {

        const { username, email, password, image, gender } = req.body

        if ([username, email, password, image, gender].some((field) => { field?.trim() === "" })) {
            res
                .status(400)
                .json({ message: "All fields are required" })
        }

        const check = await User.exists({ email })

        if (check) return res.status(409).json({ message: "User already Exists " })

        const imageLocalPath = req.file?.path
        if (!imageLocalPath) return res.status(400).json({ message: "Image is required" })

        const compressedImagePath = await compressImage(imageLocalPath)
        if (!compressedImagePath) return res.status(500).json({ message: "Image compression failed" })

        const imageURL = await uploadOnCloudinary(compressedImagePath)
        if (!imageURL) return res.status(500).json({ message: "Image upload failed on cloudinary" })

        const hashedPassword = await hashPassword(password)
        if (!hashedPassword) return res.status(500).json({ message: "Password hashing failed" })



        Promise.allSettled([
            fs.unlink(imageLocalPath),
            fs.unlink(compressedImagePath)
        ]).catch(console.error);

        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            image: imageURL,
            gender
        })
        if (!user) return res.status(500).json({ message: "User creation failed" })

        res
            .status(201)
            .json({ message: "User created successfully" })
    } catch (error) {
        console.error("Error in createUser:", error)
        res
            .status(500)
            .json({ message: "Internal Server Error" })
    }
}

export const login = async (req, res) => {
    
    const { email, password } = req.body
    if(email.trim() === "" || password.trim() === "") return res.status(400).json({message: "Email and password are required"})
    
    const user = await User.findOne({email})
    if(!user) return res.status(400).json({message: "user not registered"})
        
    const result = await comparePassword(password, user.password)
    if(!result) return res.status(400).json({message: "invalid credentials"})

    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)

    user.refreshToken = refreshToken
    await user.save({validateBeforeSave: false})

    const loggedInUser= await User.findById(user._id).select("-refreshToken -password -updatedAt __v")

    return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json({loggedInUser})
}