import express from 'express';
import { get, post } from '../controllers/style.controller';
import passwordProtect from '../lib/passwordProtect';
const router = express.Router();

router.get('/', get);
// protection
router.use(passwordProtect);
router.post('/', post);

export default router;
