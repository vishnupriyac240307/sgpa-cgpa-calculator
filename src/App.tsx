import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { INITIAL_CURRICULUM } from './data/curriculum';
import type { Semester, StudentInfo } from './types/curriculum';
import type { StarUser } from './types/auth';
import { calculateSGPA, calculateCGPA } from './utils/calculation';
import {
  getCurrentUser,
  setCurrentUser,
  logoutUser,
  getUserAcademicData,
  saveUserAcademicData,
} from './utils/authStorage';

import { StarFrameworkAuth } from './components/StarFrameworkAuth';
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
  const [currentUser, setLoggedInUser] = useState<StarUser | null>(() => getCurrentUser());
  const [semesters, setSemesters] = useState<Semester[]>(INITIAL_CURRICULUM);
  const [activeSemesterNumber, setActiveSemesterNumber] = useState<number>(1);
  const [studentInfo, setStudentInfo] = useState<StudentInfo>({ name: '', registerNo: '' });
  const [isSaved, setIsSaved] = useState<boolean>(true);
  const [isResultModalOpen, setIsResultModalOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);

  // Load user-isolated state whenever the logged-in user changes
  useEffect(() => {
    if (!currentUser) {
      setSemesters(INITIAL_CURRICULUM);
      setStudentInfo({ name: '', registerNo: '' });
      return;
    }

    setStudentInfo({
      name: currentUser.name,
      registerNo: currentUser.registerNo,
    });

    const userSaved = getUserAcademicData(currentUser.id);
    if (userSaved && userSaved.marksMap) {
      setSemesters(
        INITIAL_CURRICULUM.map((sem) => ({
          ...sem,
          subjects: sem.subjects.map((sub) => {
            const savedMark = userSaved.marksMap[sub.id];
            const savedInclusion = userSaved.inclusionsMap?.[sub.id];
            const savedElective = userSaved.electivesMap?.[sub.id];

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
      setSemesters(INITIAL_CURRICULUM);
    }
  }, [currentUser]);

  const triggerAutoSave = (
    updatedSemesters: Semester[],
    updatedStudentInfo: StudentInfo,
    activeUser: StarUser | null
  ) => {
    if (!activeUser) return;

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

    saveUserAcademicData(activeUser.id, {
      marksMap,
      inclusionsMap,
      electivesMap,
      studentInfo: updatedStudentInfo,
    });
    setIsSaved(true);
  };

  const handleLoginSuccess = (user: StarUser) => {
    setCurrentUser(user);
    setLoggedInUser(user);
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  const handleLogout = () => {
    logoutUser();
    setLoggedInUser(null);
  };

  const handleOnboardingSubmit = (info: StudentInfo) => {
    setStudentInfo(info);
    setIsOnboardingOpen(false);

    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        name: info.name,
        registerNo: info.registerNo,
      };
      setCurrentUser(updatedUser);
      setLoggedInUser(updatedUser);
      triggerAutoSave(semesters, info, updatedUser);
    }

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

      triggerAutoSave(nextSemesters, studentInfo, currentUser);
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

      triggerAutoSave(nextSemesters, studentInfo, currentUser);
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

      triggerAutoSave(nextSemesters, studentInfo, currentUser);
      return nextSemesters;
    });
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

      triggerAutoSave(nextSemesters, studentInfo, currentUser);
      return nextSemesters;
    });
  };

  const handleResetAll = () => {
    if (!window.confirm('Are you sure you want to reset ALL 6 semesters and clear saved progress?')) {
      return;
    }

    setSemesters(INITIAL_CURRICULUM);
    if (currentUser) {
      triggerAutoSave(INITIAL_CURRICULUM, studentInfo, currentUser);
    }
    setIsSaved(true);
  };

  // If user is not logged in, show the STAR Framework Login / Sign up portal
  if (!currentUser) {
    return <StarFrameworkAuth onLoginSuccess={handleLoginSuccess} />;
  }

  const semesterResults = semesters.map((sem) => calculateSGPA(sem.subjects, sem.number));
  const cgpaResult = calculateCGPA(semesters);

  const activeSemester = semesters.find((s) => s.number === activeSemesterNumber) || semesters[0];
  const activeSemesterResult =
    semesterResults.find((r) => r.semesterNumber === activeSemesterNumber) || semesterResults[0];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* Header Bar with STAR Framework & KPRCAS branding */}
      <Header
        studentInfo={studentInfo}
        currentUser={currentUser}
        onResetSemester={handleResetSemester}
        onResetAll={handleResetAll}
        onOpenResultModal={() => setIsResultModalOpen(true)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onLogout={handleLogout}
        isSaved={isSaved}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-medium flex items-center justify-between no-print shadow-2xs">
          <span>
            Welcome, <strong>{studentInfo.name || currentUser.name}</strong> ({currentUser.registerNo})! Enter your semester marks below to calculate your SGPA and CGPA automatically.
          </span>
          <span className="hidden md:inline-block text-xs font-bold text-[#15803d] bg-white px-2.5 py-1 rounded-md border border-emerald-200">
            STAR FRAMEWORK &bull; Auto-Calculating
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

      {/* Edit Student Details Modal */}
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
