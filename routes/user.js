import { Router } from 'express';
import { User } from '../utils/db.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import z from 'zod';
import authMiddleware from '../utils/authMiddleware.js';

const JWT_SECRET =  process.env.JWT_SECRET ;

const userType = z.object({
    name: z.string().min(3).max(20).trim(),
    email: z.string().email(),
    password: z.string().min(6)
})

const loginType = z.object({
    email: z.string().email(),
    password: z.string().min(6)
})

const router = Router();


router.get('/me', authMiddleware, async (req, res) => {
    try {
        const userId = res.locals.userId;

        const user = await User.findOne({ _id: userId });
        
        if (!user) {
            return res.status(401).json({
                message: 'You are not logged in'
            });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/signup',async (req, res) => {

    try {

        console.log(req.body);
        const { name, email, password } = userType.parse(req.body);

        const userAlreadyExists = await User.findOne({ email: email });
        
        if(userAlreadyExists){
            return res.status(400).json({
                message: 'User already exists'
            })
        }

        const user = new User({
            name: name,
            email: email,
            password: password
        });
        
        await user.save();

        const token = jwt.sign({ userId: user._id }, JWT_SECRET);
        
        user.password = null ;

        res.cookie("muku-token", {token});
        
        res.status(200).json({
            message: 'User created successfully',
            user
        })

    } catch (error) {
        console.log(error);
        res.status(400).json({ message: error.message });
    }
})

router.post('/login',async (req, res) => {
    try {
        const { email, password } = loginType.parse(req.body);

        const user = await User.findOne({ email: email });
        
        if(!user){
            return res.status(400).json({
                message: 'User does not exist'
            })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if(!isPasswordValid) {
            return res.status(400).json({
                message: 'Invalid password'
            })
        }

        const token = jwt.sign({ userId: user._id }, JWT_SECRET);
        
        user.password = null ;

        res.cookie("muku-token", {token});
        
        res.status(200).json({
            message: 'User logged in successfully',
            user
        })

    } catch (error) {
        console.log(error);
        res.status(400).json({ message: error.message });
    }
})

export default router ;
