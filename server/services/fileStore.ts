import fs from 'fs';
import path from 'path';
import { User, type IUser } from '../models/User';
import { AcademicData } from '../models/AcademicData';

const DATA_DIR = path.resolve(__dirname, '../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const ACADEMIC_FILE = path.join(DATA_DIR, 'academic.json');

function ensureDataDir(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.error('[FileStore] Failed to create data directory:', err);
  }
}

export interface StoredUser {
  id?: string;
  name: string;
  registerNo: string;
  username: string;
  email?: string;
  passwordHash: string;
  createdAt?: string;
  updatedAt?: string;
}

export function loadUsersFromFile(): StoredUser[] {
  ensureDataDir();
  try {
    if (!fs.existsSync(USERS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(data) || [];
  } catch (err) {
    console.error('[FileStore] Error reading users file:', err);
    return [];
  }
}

export function saveUserToFile(user: StoredUser): void {
  ensureDataDir();
  try {
    const users = loadUsersFromFile();
    const normalizedUsername = user.username.trim().toLowerCase();
    const normalizedReg = user.registerNo.trim().toUpperCase();

    const index = users.findIndex(
      (u) =>
        u.username.toLowerCase() === normalizedUsername ||
        u.registerNo.toUpperCase() === normalizedReg
    );

    const record: StoredUser = {
      ...user,
      username: normalizedUsername,
      registerNo: normalizedReg,
      updatedAt: new Date().toISOString(),
    };

    if (index >= 0) {
      users[index] = { ...users[index], ...record };
    } else {
      users.push(record);
    }

    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
    console.log(`[FileStore] Persisted user ${record.username} to disk.`);
  } catch (err) {
    console.error('[FileStore] Error saving user to file:', err);
  }
}

export interface StoredAcademic {
  userId: string;
  marksMap: Record<string, number | null>;
  inclusionsMap: Record<string, boolean>;
  electivesMap: Record<string, string>;
  updatedAt?: string;
}

export function loadAcademicFromFile(): StoredAcademic[] {
  ensureDataDir();
  try {
    if (!fs.existsSync(ACADEMIC_FILE)) {
      return [];
    }
    const data = fs.readFileSync(ACADEMIC_FILE, 'utf-8');
    return JSON.parse(data) || [];
  } catch (err) {
    console.error('[FileStore] Error reading academic file:', err);
    return [];
  }
}

export function saveAcademicToFile(record: StoredAcademic): void {
  ensureDataDir();
  try {
    const list = loadAcademicFromFile();
    const index = list.findIndex((a) => a.userId === record.userId);

    const updatedRecord: StoredAcademic = {
      ...record,
      updatedAt: new Date().toISOString(),
    };

    if (index >= 0) {
      list[index] = updatedRecord;
    } else {
      list.push(updatedRecord);
    }

    fs.writeFileSync(ACADEMIC_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('[FileStore] Error saving academic data to file:', err);
  }
}

// Sync all disk records into MongoDB on startup
export async function syncDiskToDatabase(): Promise<void> {
  try {
    const diskUsers = loadUsersFromFile();
    for (const diskUser of diskUsers) {
      const existing = await User.findOne({
        $or: [
          { username: diskUser.username.toLowerCase() },
          { registerNo: diskUser.registerNo.toUpperCase() },
        ],
      });

      if (!existing) {
        await User.create({
          name: diskUser.name,
          registerNo: diskUser.registerNo.toUpperCase(),
          username: diskUser.username.toLowerCase(),
          email: diskUser.email ? diskUser.email.toLowerCase() : undefined,
          passwordHash: diskUser.passwordHash,
        });
        console.log(`[FileStore] Restored user ${diskUser.username} into MongoDB.`);
      }
    }

    const diskAcademic = loadAcademicFromFile();
    for (const record of diskAcademic) {
      await AcademicData.findOneAndUpdate(
        { userId: record.userId },
        {
          marksMap: record.marksMap,
          inclusionsMap: record.inclusionsMap,
          electivesMap: record.electivesMap,
        },
        { upsert: true }
      );
    }
  } catch (err) {
    console.warn('[FileStore] Warning syncing disk to database:', err);
  }
}
