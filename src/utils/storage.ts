import type { StudentInfo } from '../types/curriculum';

const MARKS_KEY = 'vishnu_sgpa_marks_v1';
const INCLUSIONS_KEY = 'vishnu_sgpa_inclusions_v1';
const STUDENT_KEY = 'vishnu_sgpa_student_v1';
const ELECTIVES_KEY = 'vishnu_sgpa_electives_v1';

export interface SavedState {
  marksMap: Record<string, number | null>;
  inclusionsMap: Record<string, boolean>;
  electivesMap: Record<string, string>;
  studentInfo: StudentInfo;
}

export function saveStateToStorage(
  marksMap: Record<string, number | null>,
  inclusionsMap: Record<string, boolean>,
  electivesMap: Record<string, string>,
  studentInfo: StudentInfo
): void {
  try {
    localStorage.setItem(MARKS_KEY, JSON.stringify(marksMap));
    localStorage.setItem(INCLUSIONS_KEY, JSON.stringify(inclusionsMap));
    localStorage.setItem(ELECTIVES_KEY, JSON.stringify(electivesMap));
    localStorage.setItem(STUDENT_KEY, JSON.stringify(studentInfo));
  } catch (err) {
    console.error('Failed to save state to localStorage', err);
  }
}

export function loadStateFromStorage(): SavedState | null {
  try {
    const marksRaw = localStorage.getItem(MARKS_KEY);
    const inclusionsRaw = localStorage.getItem(INCLUSIONS_KEY);
    const electivesRaw = localStorage.getItem(ELECTIVES_KEY);
    const studentRaw = localStorage.getItem(STUDENT_KEY);

    if (!marksRaw && !inclusionsRaw && !studentRaw) {
      return null;
    }

    return {
      marksMap: marksRaw ? JSON.parse(marksRaw) : {},
      inclusionsMap: inclusionsRaw ? JSON.parse(inclusionsRaw) : {},
      electivesMap: electivesRaw ? JSON.parse(electivesRaw) : {},
      studentInfo: studentRaw
        ? JSON.parse(studentRaw)
        : { name: '', registerNo: '' },
    };
  } catch (err) {
    console.error('Failed to load state from localStorage', err);
    return null;
  }
}

export function clearStorageData(): void {
  try {
    localStorage.removeItem(MARKS_KEY);
    localStorage.removeItem(INCLUSIONS_KEY);
    localStorage.removeItem(ELECTIVES_KEY);
    localStorage.removeItem(STUDENT_KEY);
  } catch (err) {
    console.error('Failed to clear localStorage', err);
  }
}
