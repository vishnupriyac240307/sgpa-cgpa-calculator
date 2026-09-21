export type SubjectCategory = 
  | 'Core' 
  | 'Core Lab' 
  | 'Allied' 
  | 'Skill Based' 
  | 'Language' 
  | 'English' 
  | 'Elective' 
  | 'General';

export interface Subject {
  id: string;
  semester: number;
  name: string;
  category: SubjectCategory;
  maxMarks: number;
  credits: number;
  included: boolean; // whether this subject is included in SGPA/CGPA calculation
  marks: number | null; // null if student hasn't entered a mark
  isElective?: boolean;
  electiveOptions?: string[];
  selectedElective?: string;
  exclusionReason?: string;
}

export interface Semester {
  number: number;
  title: string;
  subjects: Subject[];
}

export interface SemesterResult {
  semesterNumber: number;
  sgpa: number | null;
  totalCredits: number; // total credits of included subjects
  totalWeightedPoints: number;
  completedCredits: number; // credits from subjects with marks entered
  isComplete: boolean;
  enteredSubjectCount: number;
  totalIncludedSubjects: number;
}

export interface CGPAResult {
  cgpa: number | null;
  totalCredits: number;
  totalWeightedPoints: number;
  completedSemestersCount: number;
  isFullyCompleted: boolean;
  totalSemestersCount: number;
}

export interface StudentInfo {
  name: string;
  registerNo: string;
}

export interface WhatIfState {
  enabled: boolean;
  projectedSemesters: Record<number, number | null>; // semester number -> projected SGPA
}
