import { Router } from 'express';
import { getAcademicData, saveAcademicData } from '../controllers/academicController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, getAcademicData);
router.put('/', authenticateToken, saveAcademicData);

export default router;
