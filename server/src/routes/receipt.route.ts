import express from 'express';
import { GET } from '../controllers/receipt.controller';
import passwordProtect from '../lib/passwordProtect';
const router = express.Router();

router.use(passwordProtect);
router.get('/', GET);
export default router;
