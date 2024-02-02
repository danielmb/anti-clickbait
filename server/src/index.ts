import express from 'express';
import { z } from 'zod';
import fs from 'fs';
// import https from 'https';
import http from 'http';
import cors from 'cors';
import titleRouter from './routes/title.route';
import styleRouter from './routes/style.route';
import { errorHandler } from './lib/error';
// import { privateKey, certificate } from './config/ssl';
const app = express();
app.use(
  cors({
    origin: '*',
  }),
);
app.use(express.json());
app.use('/title', titleRouter);
app.use('/style', styleRouter);

app.use(errorHandler);

const httpsServer = http
  .createServer(
    // {
    //   key: privateKey,
    //   cert: certificate,
    // },
    app,
  )
  .listen(process.env.PORT || 3000, () => {
    console.log(`Server listening on port ${process.env.PORT || 3000}`);
  });
//
