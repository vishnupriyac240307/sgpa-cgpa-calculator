import type { Response } from 'express';
import { AcademicData } from '../models/AcademicData';
import type { AuthRequest } from '../middleware/auth';

export async function getAcademicData(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    let academicData = await AcademicData.findOne({ userId });
    if (!academicData) {
      academicData = await AcademicData.create({ userId, marks: {} });
    }

    res.json({
      marks: academicData.marks || {},
      updatedAt: academicData.updatedAt,
    });
  } catch (err: any) {
    console.error('Error fetching academic data:', err);
    res.status(500).json({ error: 'Failed to retrieve academic data.' });
  }
}

export async function saveAcademicData(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { marks } = req.body;
    if (!marks || typeof marks !== 'object') {
      res.status(400).json({ error: 'Invalid marks data.' });
      return;
    }

    const academicData = await AcademicData.findOneAndUpdate(
      { userId },
      { marks },
      { returnDocument: 'after', upsert: true, runValidators: true }
    );

    res.json({
      message: 'Marks saved successfully.',
      marks: academicData.marks,
      updatedAt: academicData.updatedAt,
    });
  } catch (err: any) {
    console.error('Error saving academic data:', err);
    res.status(500).json({ error: 'Failed to save marks.' });
  }
}
