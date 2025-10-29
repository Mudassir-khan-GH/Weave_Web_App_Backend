import express from 'express'
import { createUser, login } from '../controllers/user.controller.js'
import { upload } from '../middlewares/multer.middleware.js'

const router = express.Router()

router.post("/create",upload.single("image"), createUser)
router.post("/login", login)

export default router