import { Router } from 'express';
import { getAcademicData } from '../controllers/academicController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, getAcademicData);

export default router;
