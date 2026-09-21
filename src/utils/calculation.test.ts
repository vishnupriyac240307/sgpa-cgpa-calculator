import { describe, it, expect } from 'vitest';
import {
  calculateGradePoint,
  calculateWeightedPoint,
  calculateSGPA,
  calculateCGPA,
  format2Decimals,
  calculateWhatIfCGPA,
} from './calculation';
import { validateMarks } from './validation';
import type { Subject, Semester } from '../types/curriculum';

describe('Grade Point & Weighted Point Calculations', () => {
  it('correctly calculates Grade Point out of 10 for different max marks', () => {
    expect(calculateGradePoint(80, 100)).toBe(8.0);
    expect(calculateGradePoint(60, 75)).toBe(8.0);
    expect(calculateGradePoint(45, 50)).toBe(9.0);
    expect(calculateGradePoint(0, 100)).toBe(0.0);
    expect(calculateGradePoint(100, 100)).toBe(10.0);
  });

  it('correctly calculates Weighted Points', () => {
    expect(calculateWeightedPoint(80, 100, 4)).toBe(32.0); // 8 * 4
    expect(calculateWeightedPoint(60, 75, 3)).toBe(24.0);  // 8 * 3
    expect(calculateWeightedPoint(45, 50, 2)).toBe(18.0);  // 9 * 2
  });
});

describe('Semester SGPA Calculation (Requirement Example #17)', () => {
  it('calculates SGPA correctly for 100-mark, 75-mark, and 50-mark subjects', () => {
    const subjects: Subject[] = [
      {
        id: 's1',
        semester: 1,
        name: 'Subject A',
        category: 'Core',
        maxMarks: 100,
        credits: 4,
        included: true,
        marks: 80,
      },
      {
        id: 's2',
        semester: 1,
        name: 'Subject B',
        category: 'Skill Based',
        maxMarks: 75,
        credits: 3,
        included: true,
        marks: 60,
      },
      {
        id: 's3',
        semester: 1,
        name: 'Subject C',
        category: 'Core Lab',
        maxMarks: 50,
        credits: 2,
        included: true,
        marks: 45,
      },
      {
        id: 's4',
        semester: 1,
        name: 'Language - I',
        category: 'Language',
        maxMarks: 100,
        credits: 4,
        included: false, // EXCLUDED
        marks: 95, // High mark should NOT affect SGPA!
      },
    ];

    const result = calculateSGPA(subjects, 1);
    expect(result.totalCredits).toBe(9);
    expect(result.completedCredits).toBe(9);
    expect(result.totalWeightedPoints).toBe(74); // 32 + 24 + 18
    expect(result.sgpa).toBeCloseTo(74 / 9, 4); // 8.2222...
    expect(format2Decimals(result.sgpa)).toBe('8.22');
  });

  it('handles blank/unentered marks without treating them as zero', () => {
    const subjects: Subject[] = [
      {
        id: 's1',
        semester: 1,
        name: 'Subject A',
        category: 'Core',
        maxMarks: 100,
        credits: 4,
        included: true,
        marks: 80,
      },
      {
        id: 's2',
        semester: 1,
        name: 'Subject B',
        category: 'Core',
        maxMarks: 100,
        credits: 4,
        included: true,
        marks: null, // BLANK
      },
    ];

    const result = calculateSGPA(subjects, 1);
    expect(result.isComplete).toBe(false);
    expect(result.enteredSubjectCount).toBe(1);
    expect(result.completedCredits).toBe(4);
    expect(result.sgpa).toBe(8.0);
  });
});

describe('CGPA Calculation (Weighted vs Naive Average)', () => {
  it('calculates CGPA using total weighted points over total credits across semesters', () => {
    const sem1Subjects: Subject[] = [
      { id: '1', semester: 1, name: 'C1', category: 'Core', maxMarks: 100, credits: 16, included: true, marks: 80 },
    ];
    const sem2Subjects: Subject[] = [
      { id: '2', semester: 2, name: 'C2', category: 'Core', maxMarks: 100, credits: 12, included: true, marks: 90 },
    ];

    const semesters: Semester[] = [
      { number: 1, title: 'Sem 1', subjects: sem1Subjects },
      { number: 2, title: 'Sem 2', subjects: sem2Subjects },
    ];

    const cgpaResult = calculateCGPA(semesters);
    expect(cgpaResult.totalCredits).toBe(28);
    expect(cgpaResult.totalWeightedPoints).toBe(236);
    expect(cgpaResult.cgpa).toBeCloseTo(236 / 28, 4);
    expect(format2Decimals(cgpaResult.cgpa)).toBe('8.43');
    expect(cgpaResult.cgpa).not.toBe(8.5);
  });
});

describe('Mark Validation Rules', () => {
  it('validates bounds correctly', () => {
    expect(validateMarks('85', 100)).toEqual({ isValid: true, error: null, value: 85, isBlank: false });
    expect(validateMarks('0', 50)).toEqual({ isValid: true, error: null, value: 0, isBlank: false });
    expect(validateMarks('50', 50)).toEqual({ isValid: true, error: null, value: 50, isBlank: false });

    // Negative
    expect(validateMarks('-1', 100).isValid).toBe(false);
    expect(validateMarks('-1', 100).error).toBe('Marks cannot be negative');

    // Exceeds max
    expect(validateMarks('76', 75).isValid).toBe(false);
    expect(validateMarks('76', 75).error).toBe('Marks cannot exceed 75.');

    // Blank
    expect(validateMarks('', 100)).toEqual({ isValid: true, error: null, value: null, isBlank: true });
    expect(validateMarks(null, 100)).toEqual({ isValid: true, error: null, value: null, isBlank: true });
  });
});

describe('What-If Calculator Projections', () => {
  it('projects CGPA accurately when expected SGPAs are supplied for uncompleted semesters', () => {
    const sem1Subjects: Subject[] = [
      { id: '1', semester: 1, name: 'C1', category: 'Core', maxMarks: 100, credits: 16, included: true, marks: 80 },
    ];
    const sem2Subjects: Subject[] = [
      { id: '2', semester: 2, name: 'C2', category: 'Core', maxMarks: 100, credits: 12, included: true, marks: null },
    ];

    const semesters: Semester[] = [
      { number: 1, title: 'Sem 1', subjects: sem1Subjects },
      { number: 2, title: 'Sem 2', subjects: sem2Subjects },
    ];

    const projected = calculateWhatIfCGPA(semesters, { 2: 9.0 });
    expect(projected.totalProjectedCredits).toBe(28);
    expect(projected.totalProjectedWeightedPoints).toBe(236);
    expect(projected.projectedCGPA).toBeCloseTo(236 / 28, 4);
    expect(format2Decimals(projected.projectedCGPA)).toBe('8.43');
  });
});
