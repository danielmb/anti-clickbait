import express from 'express';
import { get } from '../controllers/title.controller';
const router = express.Router();

router.get('/', get);

export default router;
