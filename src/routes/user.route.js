import {Router} from 'express';
import { registerUser } from '../controllers/user.controller.js';

const router=Router();


//url will be http://localhost:4000/user/register
router.route('/register').post(registerUser)


export default router;