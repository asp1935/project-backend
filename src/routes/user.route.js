import {Router} from 'express';
import { loginUser, logoutUser, refreshAccessToken, registerUser } from '../controllers/user.controller.js';
import {upload} from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
const router=Router();


//url will be http://localhost:4000/user/register

//calling middleware upload from multer.middleware for handling files 
//in that fields method is used for multiple diffrent images 

router.route('/register').post(
    upload.fields([                                            
        {
            name: 'avatar',    //name of field image 
            maxCount: 1       // max no of image in that
        },
        {
            name: 'coverImage',
            maxCount: 1
        }
    ]),
    registerUser
)
router.route('/login').post(loginUser)


//secured routes
//middleware enjected
router.route('/logout').post(verifyJWT, logoutUser)
router.route('/refresh-token').post(refreshAccessToken)

export default router;