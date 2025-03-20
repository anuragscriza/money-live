import express from 'express';
import connectToDatabase from './src/project_setup/Database.mjs';
import expressApp from './src/project_setup/Express.mjs';

const StartServer = async () => {
    const app = express();
    await connectToDatabase();
    await expressApp(app);

};

StartServer();