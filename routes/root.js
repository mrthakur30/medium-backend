import { Router } from 'express';
import userRouter from './user.js';
import blogRouter from './blog.js';

const router = Router();

router.use('/user',userRouter);
router.use('/blog',blogRouter);

export default router