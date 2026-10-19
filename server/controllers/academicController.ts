import type { Response } from 'express';
import { AcademicData } from '../models/AcademicData';
import type { AuthRequest } from '../middleware/auth';
import { saveAcademicToFile, loadAcademicFromFile } from '../services/fileStore';

export async function getAcademicData(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    let academicData = await AcademicData.findOne({ userId });
    if (!academicData) {
      const diskList = loadAcademicFromFile();
      const diskRecord = diskList.find((a) => a.userId === userId);
      if (diskRecord) {
        academicData = await AcademicData.create({
          userId,
          marksMap: diskRecord.marksMap || {},
          inclusionsMap: diskRecord.inclusionsMap || {},
          electivesMap: diskRecord.electivesMap || {},
        });
      } else {
        academicData = await AcademicData.create({
          userId,
          marksMap: {},
          inclusionsMap: {},
          electivesMap: {},
        });
      }
    }

    res.json({
      academicData: {
        userId,
        marksMap: academicData.marksMap || {},
        inclusionsMap: academicData.inclusionsMap || {},
        electivesMap: academicData.electivesMap || {},
        updatedAt: academicData.updatedAt,
      },
      marksMap: academicData.marksMap || {},
      inclusionsMap: academicData.inclusionsMap || {},
      electivesMap: academicData.electivesMap || {},
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

    const { marksMap = {}, inclusionsMap = {}, electivesMap = {} } = req.body;

    const academicData = await AcademicData.findOneAndUpdate(
      { userId },
      { marksMap, inclusionsMap, electivesMap },
      { returnDocument: 'after', upsert: true, runValidators: true }
    );

    saveAcademicToFile({
      userId,
      marksMap: academicData.marksMap,
      inclusionsMap: academicData.inclusionsMap,
      electivesMap: academicData.electivesMap,
    });

    res.json({
      message: 'Marks saved successfully.',
      marksMap: academicData.marksMap,
      inclusionsMap: academicData.inclusionsMap,
      electivesMap: academicData.electivesMap,
      updatedAt: academicData.updatedAt,
    });
  } catch (err: any) {
    console.error('Error saving academic data:', err);
    res.status(500).json({ error: 'Failed to save marks.' });
  }
}
