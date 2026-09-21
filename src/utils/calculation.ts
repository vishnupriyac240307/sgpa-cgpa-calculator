import type { Subject, Semester, SemesterResult, CGPAResult } from '../types/curriculum';

/**
 * Calculates grade point on a 10-point scale.
 * Grade Point = (Marks Obtained / Maximum Marks) * 10
 */
export function calculateGradePoint(mark: number, maxMarks: number): number {
  if (maxMarks <= 0) return 0;
  return (mark / maxMarks) * 10;
}

/**
 * Calculates weighted point for a subject.
 * Weighted Point = Grade Point * Credits
 */
export function calculateWeightedPoint(mark: number, maxMarks: number, credits: number): number {
  const gradePoint = calculateGradePoint(mark, maxMarks);
  return gradePoint * credits;
}

/**
 * Calculates SGPA and Semester Percentage for a single semester.
 */
export function calculateSGPA(subjects: Subject[], semesterNumber: number): SemesterResult {
  const includedSubjects = subjects.filter((s) => s.included);
  const totalIncludedSubjects = includedSubjects.length;
  const totalCredits = includedSubjects.reduce((sum, s) => sum + s.credits, 0);

  const enteredSubjects = includedSubjects.filter((s) => s.marks !== null && !isNaN(s.marks));
  const enteredSubjectCount = enteredSubjects.length;

  if (enteredSubjectCount === 0) {
    return {
      semesterNumber,
      sgpa: null,
      totalCredits,
      totalWeightedPoints: 0,
      completedCredits: 0,
      isComplete: false,
      enteredSubjectCount: 0,
      totalIncludedSubjects,
      totalObtainedMarks: 0,
      totalMaxMarks: 0,
      percentage: null,
    };
  }

  const completedCredits = enteredSubjects.reduce((sum, s) => sum + s.credits, 0);
  const totalWeightedPoints = enteredSubjects.reduce(
    (sum, s) => sum + calculateWeightedPoint(s.marks!, s.maxMarks, s.credits),
    0
  );

  const totalObtainedMarks = enteredSubjects.reduce((sum, s) => sum + s.marks!, 0);
  const totalMaxMarks = enteredSubjects.reduce((sum, s) => sum + s.maxMarks, 0);
  const percentage = totalMaxMarks > 0 ? (totalObtainedMarks / totalMaxMarks) * 100 : null;

  const sgpa = completedCredits > 0 ? totalWeightedPoints / completedCredits : null;
  const isComplete = enteredSubjectCount === totalIncludedSubjects && totalIncludedSubjects > 0;

  return {
    semesterNumber,
    sgpa,
    totalCredits,
    totalWeightedPoints,
    completedCredits,
    isComplete,
    enteredSubjectCount,
    totalIncludedSubjects,
    totalObtainedMarks,
    totalMaxMarks,
    percentage,
  };
}

/**
 * Calculates overall CGPA and Overall Percentage across all semesters.
 */
export function calculateCGPA(semesters: Semester[]): CGPAResult {
  let totalWeightedPoints = 0;
  let totalCompletedCredits = 0;
  let completedSemestersCount = 0;
  let totalObtainedMarks = 0;
  let totalMaxMarks = 0;

  for (const sem of semesters) {
    const semResult = calculateSGPA(sem.subjects, sem.number);
    if (semResult.isComplete) {
      completedSemestersCount++;
    }
    
    totalWeightedPoints += semResult.totalWeightedPoints;
    totalCompletedCredits += semResult.completedCredits;
    totalObtainedMarks += semResult.totalObtainedMarks;
    totalMaxMarks += semResult.totalMaxMarks;
  }

  const cgpa = totalCompletedCredits > 0 ? totalWeightedPoints / totalCompletedCredits : null;
  const overallPercentage = totalMaxMarks > 0 ? (totalObtainedMarks / totalMaxMarks) * 100 : null;
  const isFullyCompleted = completedSemestersCount === semesters.length && semesters.length > 0;

  return {
    cgpa,
    totalCredits: totalCompletedCredits,
    totalWeightedPoints,
    completedSemestersCount,
    isFullyCompleted,
    totalSemestersCount: semesters.length,
    totalObtainedMarks,
    totalMaxMarks,
    overallPercentage,
  };
}

/**
 * Calculates what-if projected CGPA based on actual marks for entered semesters
 * and expected SGPA for remaining semesters.
 */
export function calculateWhatIfCGPA(
  semesters: Semester[],
  projectedSemesters: Record<number, number | null>
): {
  projectedCGPA: number | null;
  totalProjectedCredits: number;
  totalProjectedWeightedPoints: number;
} {
  let totalProjectedWeightedPoints = 0;
  let totalProjectedCredits = 0;

  for (const sem of semesters) {
    const semResult = calculateSGPA(sem.subjects, sem.number);

    if (semResult.isComplete && semResult.sgpa !== null) {
      totalProjectedWeightedPoints += semResult.totalWeightedPoints;
      totalProjectedCredits += semResult.totalCredits;
    } else {
      const projectedSGPA = projectedSemesters[sem.number];
      if (projectedSGPA !== null && projectedSGPA !== undefined && !isNaN(projectedSGPA)) {
        const semCredits = semResult.totalCredits;
        totalProjectedWeightedPoints += projectedSGPA * semCredits;
        totalProjectedCredits += semCredits;
      } else if (semResult.completedCredits > 0) {
        totalProjectedWeightedPoints += semResult.totalWeightedPoints;
        totalProjectedCredits += semResult.completedCredits;
      }
    }
  }

  const projectedCGPA =
    totalProjectedCredits > 0 ? totalProjectedWeightedPoints / totalProjectedCredits : null;

  return {
    projectedCGPA,
    totalProjectedCredits,
    totalProjectedWeightedPoints,
  };
}

export function format2Decimals(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return '--';
  return (Math.round(val * 100) / 100).toFixed(2);
}
