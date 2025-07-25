import 'dotenv/config';
import { Router } from "express";
import express from 'express';
import cors from 'cors';
import apiRoutes from './routes';
import swaggerLoader from './utils/swaggerLoader';

export const app = express();

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
swaggerLoader(app);
app.use('/api', apiRoutes);
