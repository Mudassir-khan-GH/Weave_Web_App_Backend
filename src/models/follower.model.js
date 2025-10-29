import mongoose from 'mongoose'

const followerSchema = new mongoose.Schema({
    followedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    followedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }
},{timestamps: true})

const Follower = mongoose.model('Follower', followerSchema)

export default Follower