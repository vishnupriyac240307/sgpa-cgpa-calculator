import { Router } from 'express';
import { getAcademicData, saveAcademicData } from '../controllers/academicController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, getAcademicData);
router.put('/', authenticateToken, saveAcademicData);

export default router;
