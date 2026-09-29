import { Router } from 'express';
import { getAcademicData } from '../controllers/academicController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, getAcademicData);

export default router;
