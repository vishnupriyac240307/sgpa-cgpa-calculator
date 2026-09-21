import React from 'react';
import confetti from 'canvas-confetti';
import { INITIAL_CURRICULUM } from './data/curriculum';
import type { Semester, StudentInfo } from './types/curriculum';
import { calculateSGPA, calculateCGPA } from './utils/calculation';
import { loadStateFromStorage, saveStateToStorage, clearStorageData } from './utils/storage';

import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { SemesterTabs } from './components/SemesterTabs';
import { SubjectTable } from './components/SubjectTable';
import { SGPAResult } from './components/SGPAResult';
import { SemesterSummary } from './components/SemesterSummary';
import { CalculationInfo } from './components/CalculationInfo';
import { WhatIfCalculator } from './components/WhatIfCalculator';
import { AcademicResultModal } from './components/AcademicResultModal';
import { StudentOnboardingModal } from './components/StudentOnboardingModal';
import { Footer } from './components/Footer';

export function App() {
  const [semesters, setSemesters] = React.useState<Semester[]>(INITIAL_CURRICULUM);
  const [activeSemesterNumber, setActiveSemesterNumber] = React.useState<number>(1);
  const [studentInfo, setStudentInfo] = React.useState<StudentInfo>({ name: '', registerNo: '' });
  const [isSaved, setIsSaved] = React.useState<boolean>(true);
  const [isResultModalOpen, setIsResultModalOpen] = React.useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = React.useState<boolean>(false);

  // Load saved state from LocalStorage on mount
  React.useEffect(() => {
    const saved = loadStateFromStorage();
    if (saved) {
      if (saved.studentInfo && saved.studentInfo.name) {
        setStudentInfo(saved.studentInfo);
        setIsOnboardingOpen(false);
      } else {
        setIsOnboardingOpen(true);
      }

      setSemesters((prevSemesters) =>
        prevSemesters.map((sem) => ({
          ...sem,
          subjects: sem.subjects.map((sub) => {
            const savedMark = saved.marksMap[sub.id];
            const savedInclusion = saved.inclusionsMap[sub.id];
            const savedElective = saved.electivesMap[sub.id];

            return {
              ...sub,
              marks: savedMark !== undefined ? savedMark : sub.marks,
              included: savedInclusion !== undefined ? savedInclusion : sub.included,
              selectedElective: savedElective !== undefined ? savedElective : sub.selectedElective,
            };
          }),
        }))
      );
    } else {
      // First time visiting link -> open onboarding modal to ask name and reg no
      setIsOnboardingOpen(true);
    }
  }, []);

  const triggerAutoSave = (updatedSemesters: Semester[], updatedStudentInfo: StudentInfo) => {
    const marksMap: Record<string, number | null> = {};
    const inclusionsMap: Record<string, boolean> = {};
    const electivesMap: Record<string, string> = {};

    updatedSemesters.forEach((sem) => {
      sem.subjects.forEach((sub) => {
        marksMap[sub.id] = sub.marks;
        inclusionsMap[sub.id] = sub.included;
        if (sub.selectedElective) {
          electivesMap[sub.id] = sub.selectedElective;
        }
      });
    });

    saveStateToStorage(marksMap, inclusionsMap, electivesMap, updatedStudentInfo);
    setIsSaved(true);
  };

  const handleOnboardingSubmit = (info: StudentInfo) => {
    setStudentInfo(info);
    setIsOnboardingOpen(false);
    triggerAutoSave(semesters, info);

    confetti({
      particleCount: 50,
      spread: 50,
      origin: { y: 0.6 },
    });
  };

  const handleUpdateMark = (subjectId: string, mark: number | null) => {
    setSemesters((prevSemesters) => {
      const nextSemesters = prevSemesters.map((sem) => ({
        ...sem,
        subjects: sem.subjects.map((sub) => {
          if (sub.id === subjectId) {
            return { ...sub, marks: mark };
          }
          return sub;
        }),
      }));

      const currentActiveSem = nextSemesters.find((s) => s.number === activeSemesterNumber);
      if (currentActiveSem) {
        const semResult = calculateSGPA(currentActiveSem.subjects, currentActiveSem.number);
        if (semResult.isComplete && mark !== null) {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.7 },
          });
        }
      }

      triggerAutoSave(nextSemesters, studentInfo);
      return nextSemesters;
    });
  };

  const handleToggleInclusion = (subjectId: string, included: boolean) => {
    setSemesters((prevSemesters) => {
      const nextSemesters = prevSemesters.map((sem) => ({
        ...sem,
        subjects: sem.subjects.map((sub) => {
          if (sub.id === subjectId) {
            return { ...sub, included };
          }
          return sub;
        }),
      }));

      triggerAutoSave(nextSemesters, studentInfo);
      return nextSemesters;
    });
  };

  const handleSelectElective = (subjectId: string, selected: string) => {
    setSemesters((prevSemesters) => {
      const nextSemesters = prevSemesters.map((sem) => ({
        ...sem,
        subjects: sem.subjects.map((sub) => {
          if (sub.id === subjectId) {
            return { ...sub, selectedElective: selected };
          }
          return sub;
        }),
      }));

      triggerAutoSave(nextSemesters, studentInfo);
      return nextSemesters;
    });
  };

  const handleUpdateStudentInfo = (info: StudentInfo) => {
    setStudentInfo(info);
    triggerAutoSave(semesters, info);
  };

  const handleResetSemester = () => {
    if (!window.confirm(`Are you sure you want to clear marks for Semester ${activeSemesterNumber}?`)) {
      return;
    }

    setSemesters((prevSemesters) => {
      const nextSemesters = prevSemesters.map((sem) => {
        if (sem.number === activeSemesterNumber) {
          return {
            ...sem,
            subjects: sem.subjects.map((sub) => ({ ...sub, marks: null })),
          };
        }
        return sem;
      });

      triggerAutoSave(nextSemesters, studentInfo);
      return nextSemesters;
    });
  };

  const handleResetAll = () => {
    if (!window.confirm('Are you sure you want to reset ALL 6 semesters and clear saved progress?')) {
      return;
    }

    clearStorageData();
    setStudentInfo({ name: '', registerNo: '' });
    setSemesters(INITIAL_CURRICULUM);
    setIsSaved(true);
    setIsOnboardingOpen(true);
  };

  const semesterResults = semesters.map((sem) => calculateSGPA(sem.subjects, sem.number));
  const cgpaResult = calculateCGPA(semesters);

  const activeSemester = semesters.find((s) => s.number === activeSemesterNumber) || semesters[0];
  const activeSemesterResult = semesterResults.find((r) => r.semesterNumber === activeSemesterNumber) || semesterResults[0];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-blue-500 selection:text-white">
      {/* Header Bar */}
      <Header
        studentInfo={studentInfo}
        onUpdateStudentInfo={handleUpdateStudentInfo}
        onResetSemester={handleResetSemester}
        onResetAll={handleResetAll}
        onOpenResultModal={() => setIsResultModalOpen(true)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        isSaved={isSaved}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs sm:text-sm font-medium flex items-center justify-between no-print shadow-2xs">
          <span>
            {studentInfo.name
              ? `Welcome ${studentInfo.name}! Enter your marks to calculate SGPA and CGPA automatically.`
              : "Enter your marks. We'll calculate your SGPA and CGPA automatically."}
          </span>
          <span className="hidden md:inline-block text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-md">
            Auto-Calculating
          </span>
        </div>

        <Dashboard
          cgpaResult={cgpaResult}
          semesterResults={semesterResults}
          activeSemester={activeSemesterNumber}
          onSelectSemester={setActiveSemesterNumber}
        />

        <SemesterTabs
          activeSemester={activeSemesterNumber}
          onSelectSemester={setActiveSemesterNumber}
          semesterResults={semesterResults}
        />

        <SGPAResult semesterResult={activeSemesterResult} />

        <SubjectTable
          subjects={activeSemester.subjects}
          onUpdateMark={handleUpdateMark}
          onToggleInclusion={handleToggleInclusion}
          onSelectElective={handleSelectElective}
        />

        <CalculationInfo subjects={activeSemester.subjects} />

        <WhatIfCalculator
          semesters={semesters}
          semesterResults={semesterResults}
          currentCGPA={cgpaResult.cgpa}
        />

        <SemesterSummary
          semesterResults={semesterResults}
          onSelectSemester={setActiveSemesterNumber}
          activeSemester={activeSemesterNumber}
        />
      </main>

      <Footer />

      {/* Onboarding Welcome Modal (Opens automatically on link launch if name/reg no not entered) */}
      <StudentOnboardingModal
        isOpen={isOnboardingOpen}
        onSubmit={handleOnboardingSubmit}
        initialInfo={studentInfo}
      />

      {/* Official Academic Result Transcript Modal */}
      <AcademicResultModal
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        semesters={semesters}
        semesterResults={semesterResults}
        cgpaResult={cgpaResult}
        studentInfo={studentInfo}
      />
    </div>
  );
}

export default App;
