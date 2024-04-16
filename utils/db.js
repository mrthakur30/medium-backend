import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();


try {
    mongoose.connect(process.env.MONGODB_URL);

    console.log("Connected to MongoDB")
} catch (error) {
    console.error('Error connecting to MongoDB', error);
}

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, minlength: 2, maxlength: 50 },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }]
});

const postSchema = new mongoose.Schema({
    title: { type: String, required: true, minlength: 5, maxlength: 200 },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    published: { type: Boolean, default: false }
});

userSchema.pre('save', async function(next) {
    try {
        if (!this.isModified('password')) {
            return next();
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(this.password, salt);
        this.password = hashedPassword;
        next();
    } catch (error) {
        next(error);
    }
});

const User = mongoose.model('User', userSchema);
const Post = mongoose.model('Post', postSchema);

export { User, Post };
