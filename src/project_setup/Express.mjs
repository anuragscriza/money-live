//src/project_setup/Express.mjs
import express from "express";
import cors from "cors";
import cookieParser from 'cookie-parser';
import * as Routes from "../routes/AllRoutes.mjs";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function setupExpressApp() {
    const app = express();
    //   const monitor = new SystemMonitoring(); 
    app.use(cookieParser());
    app.use(express.json({ limit: '1mb' }));

    app.use(express.urlencoded({ extended: true, limit: '1mb' }));
    app.use(cors({ credentials: true, origin: ['http://localhost:8002', 'http://localhost:3001'] }));
    //app.use(express.static('src/public'));
    app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));
    // Mount routes
    Object.values(Routes).forEach(route => app.use(route));

    // Start the server
    app.listen(process.env.PORT, () => { console.log('Server is running on port 8002'); });

    return app;
}
