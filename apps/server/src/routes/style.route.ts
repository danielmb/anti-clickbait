import express from 'express';
import { DELETE, GET, POST } from '../controllers/style.controller';
import passwordProtect from '../lib/passwordProtect';
const router = express.Router();

router.get('/', GET);
// protection
router.use(passwordProtect);
router.post('/', POST);
router.delete('/', DELETE);

export default router;
