import { User } from "./db.js";
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "";

const authMiddleware = async (req, res, next) =>{
  
    const token = req.cookies['muku-token'].token || req.header("Authorization")?.replace("Bearer ", "")

    if(!token){
        return res.status(401).json({
            message: 'You are not logged in'
        })
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        const user = await User.findById(decoded.userId)
        
        if(!user){
            return res.status(401).json({
                message: 'You are not logged in'
            })
        }

        req.userId = user._id.toString();

        next();
    } catch (err) {
        console.log(err);
        return res.status(403).json({
            message: 'You are not logged in'
        });
    }
}

export default authMiddleware;