import jwt from "jsonwebtoken"
import User from "../models/user.model"

const verifyJWT =async (req, res, next) => {
    const token= req.cookies?.accessToken

    if(!token) return res.status(400).json({message: "Unauthrized Access"})
    
    const data = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

    const result =await User.findById(data?._id).select("-password -__v -updatedAt")
    if(!result) return res.status(404).json({message: "user not registered"})

    req.user = result
    next()
}

export {verifyJWT}