import User from '../models/user.model.js'
import fs from 'fs/promises'
import { uploadOnCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js'
import { compressImage } from '../utils/compress.js'
import { hashPassword, comparePassword } from '../utils/bcrypt.js'
import { generateAccessToken, generateRefreshToken } from '../utils/genTokens.js'
import { sendVerificationEmail } from '../utils/nodemailer.js'


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

export const logout = async (req, res) => {
     user = req.user
     if(!user) return res.status(400).json({message: "unauthorized access"})

    const result = await User.findByIdAndUpdate(
        {
            _id: user._id
        },
        {
            $set: {
            refreshToken: undefined
            }
        })

    if(!result) return res.status(500).json({message: "something went wrong while logging out"})
    res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json({message: "logout successfully"})
}

export const verificationButtonClicked = async (req, res) => {
    const user = req.user

    const result = await User.findById(user._id).select("-password -__v -updatedAt")
    if(!result) return res.status(404).json({message: "user not found"})

    if(result.isVerified === true) return res.status(400).json({message: "user already verified"})

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    sendVerificationEmail(user.email, code)
    result.verificationCode = code
    await result.save({validateBeforeSave: false})
    res
    .status(200)
    .json({message: "email sent successfully"})
}

export const verify = async (req, res) => {
    const user = req.user
    const code = req.body

    const result = await User.findById(user._id).select("-image -password -updatedAt -__v")
    if(!result?.verificationCode === code) return res.status(400).json({message: "incorrect OTP"})
    
    result.isVerified = true
    result.verificationCode = undefined
    await result.save({validateBeforeSave: false})

    res
    .status(200)
    .json({message: "user verified successfully"})
}

export const getCurrentUser = async (req, res) => {
    const user = req.user

    const result = await User.findById(user._id).select("-password -__v -updatedAt")
    if(!result) return res.stats(404).json({message: "user not logged in"})

    res
    .status(200)
    .json({currentUser: result})
}

export const changePassword = async (req, res) => {
    const user = req.user
    const {oldPassword, newPassword , confirmNewPassword} = req.body

    const result = await User.findById(user._id)
    if(!result) return res.stats(404).json({message: "user not found"})

    const check = await comparePassword(oldPassword, result.password)
    if(!check) return res.status(400).json({message: "wrong old password"})

    if(newPassword != confirmNewPassword) return res.status(400).json({message: "both fields for new password must be same"})

    result.password= newPassword
    await result.save({validateBeforeSave: false})
    res
    .status(200)
    .json({message: "password changed successfully"})
}

export const changeImage = async (req, res) => {
    const user = req.user
    const imageLocalPath = req.file?.path
    if(!imageLocalPath) return res.status(400).json({message: "image is required"})

    const compressedImagePath = await compressImage(imageLocalPath)
    if(!compressedImagePath) return res.status(500).json({message: "image compression failed"})

    const imageURL = await uploadOnCloudinary(compressedImagePath)
    const result = await User.findByIdAndUpdate(
        {
            _id: user._id
        },
        {
            $set: {
                image: imageURL
            }
        }
    )

    const response = await deleteFromCloudinary(user.image)
    Promise.allSettled([
        fs.unlink(compressedImagePath),
        fs.unlink(imageLocalPath)
    ]).catch(console.log(error))

    if(!result) return res.status(500).json({message: "something went wrong while updating image"})
    res
    .status(200)
    .json({message: "image changed successfully"})
}