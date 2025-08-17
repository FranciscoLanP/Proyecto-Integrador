import 'dotenv/config';
import { Router } from "express";
import express from 'express';
import cors from 'cors';
import apiRoutes from './routes';
import swaggerLoader from './utils/swaggerLoader';

export const app = express();

const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003'
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        } else {
            console.warn(`CORS: Origin ${origin} no está permitido`);
            return callback(new Error('No permitido por CORS'), false);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin'
    ],
    exposedHeaders: ['Authorization'],
    maxAge: 86400 
}));
app.use(express.json());

app.use((req, res, next) => {
    const origin = req.headers.origin;
    const method = req.method;
    const url = req.url;

    console.log(`${new Date().toISOString()} - ${method} ${url} - Origin: ${origin || 'No origin'}`);

    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'DENY');
    res.header('X-XSS-Protection', '1; mode=block');

    next();
});

swaggerLoader(app);
app.use('/api', apiRoutes);
