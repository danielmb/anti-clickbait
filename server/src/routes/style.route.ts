import express from 'express';
import { deleteStyle, get, post, put } from '../controllers/style.controller';
import passwordProtect from '../lib/passwordProtect';
const router = express.Router();

router.get('/', get);
// protection
router.use(passwordProtect);
router.post('/', post);
router.put('/', put);
router.delete('/', deleteStyle);
export default router;
