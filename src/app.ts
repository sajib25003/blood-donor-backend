import express, { Application, Request, Response } from 'express';
import cors, { CorsOptions } from 'cors';
import cookieParser from 'cookie-parser';
import authRouter from './app/modules/auth/auth.route';
import donorRouter from './app/modules/donor/donor.route';
import updateRequestRouter from './app/modules/updateRequest/updateRequest.route';

const app: Application = express();

const allowedOrigins = [
  'http://localhost:3000',
  'https://blood-donors-backend.vercel.app',
  // 'https://your-frontend.vercel.app',
];

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    console.error(`Blocked by CORS: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/donors', donorRouter);
app.use('/api/v1/update-requests', updateRequestRouter);

app.get('/', (_req: Request, res: Response) => {
  res.send({ success: true, message: 'Welcome To Blood Donor Server.' });
});

export default app;
