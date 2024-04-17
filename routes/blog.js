import { Router } from 'express';
import { z } from 'zod';
import authMiddleware from '../utils/authMiddleware.js';
import { Post } from '../utils/db.js';

const router = Router();


const postType = z.object({
    title: z.string(),
    content: z.string(),
    author: z.string()
});


router.post('/save', authMiddleware, async (req, res) => {
    try {
        const { title, content } = req.body;

        console.log(req.userId);

        const postData = postType.parse({
            title,
            content,
            author: req.userId
        });

        const post = new Post(postData);
        await post.save();

        return res.status(201).json({ postId: post._id, message: "Post Created Successfully" });
    } catch (error) {
        console.error(error);
        return res.status(400).json({ message: "Failed to create post", error: error.message });
    }
});


router.put('/update/:id', authMiddleware, async (req, res) => {
    try {
        const { title, content } = req.body;
        const postId = res.locals.userId;

        // Validate post data
        postType.partial().parse({
            title,
            content
        });

        const post = await Post.findOneAndUpdate(
            { _id: postId, author: res.locals.userId},
            { title, content },
            { new: true }
        );
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found or you do not have permission to update this post' });
        }

        return res.status(200).json({ postId: post._id, message: "Post Updated Successfully" });
    } catch (error) {
        console.error(error);
        return res.status(400).json({ message: "Failed to update post", error: error.message });
    }
});


router.get('/get/:id', async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.status(200).json(post);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: "Failed to fetch post", error: error.message });
    }
});


router.get('/bulk', async (req, res) => {
    try {
        const posts = await Post.find({});
        res.status(200).json(posts);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: "Failed to fetch posts", error: error.message });
    }
});

export default router;
