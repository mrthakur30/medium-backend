import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import rootRouter from './routes/root.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));

app.use('/api/v1', rootRouter);

app.get('/', (req, res) => {
    res.json({
        message: 'Hello World!'
    });
});

app.listen(process.env.PORT, () => {
    console.log('Server is running on port', process.env.PORT);
});