import { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { INITIAL_CURRICULUM } from './data/curriculum';
import type { Semester, StudentInfo } from './types/curriculum';
import type { UserProfile } from './types/auth';
import { calculateSGPA, calculateCGPA } from './utils/calculation';
import {
  getMeApi,
  logoutApi,
  getAcademicDataApi,
  saveAcademicDataApi,
} from './services/api';
import {
  getCurrentUser as getCachedUser,
  setCurrentUser as setCachedUser,
  getUserAcademicData as getCachedAcademicData,
  saveUserAcademicData as saveCachedAcademicData,
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
import { ProfileModal } from './components/ProfileModal';
import { Footer } from './components/Footer';

export function App() {
  const [currentUser, setCurrentUserState] = useState<UserProfile | null>(() => getCachedUser());
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [semesters, setSemesters] = useState<Semester[]>(INITIAL_CURRICULUM);
  const [activeSemesterNumber, setActiveSemesterNumber] = useState<number>(1);
  const [studentInfo, setStudentInfo] = useState<StudentInfo>({
    name: currentUser?.name || '',
    registerNo: currentUser?.registerNo || '',
  });
  const [isSaved, setIsSaved] = useState<boolean>(true);
  const [isResultModalOpen, setIsResultModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  // Timer ref for debounced autosave
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check existing session on mount
  useEffect(() => {
    let isMounted = true;
    async function checkSession() {
      try {
        const user = await getMeApi();
        if (isMounted) {
          if (user) {
            setCurrentUserState(user);
            setCachedUser(user);
          } else if (!getCachedUser()) {
            setCurrentUserState(null);
          }
        }
      } catch {
        // Fall back to cached user if offline
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    }
    checkSession();
    return () => {
      isMounted = false;
    };
  }, []);

  // Load user-isolated state whenever currentUser changes
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

    // Fetch student marks from backend database
    async function loadAcademicMarks() {
      if (!currentUser) return;

      // 1. Check local cache first for instant render
      const cached = getCachedAcademicData(currentUser.id);
      if (cached && cached.marksMap) {
        populateSemestersWithMarks(cached.marksMap, cached.inclusionsMap, cached.electivesMap);
      }

      // 2. Fetch fresh persistent records from backend
      try {
        const remoteData = await getAcademicDataApi();
        if (remoteData && remoteData.marksMap) {
          populateSemestersWithMarks(
            remoteData.marksMap,
            remoteData.inclusionsMap,
            remoteData.electivesMap
          );
          // Sync local cache
          saveCachedAcademicData(currentUser.id, {
            marksMap: remoteData.marksMap,
            inclusionsMap: remoteData.inclusionsMap,
            electivesMap: remoteData.electivesMap,
            studentInfo: {
              name: currentUser.name,
              registerNo: currentUser.registerNo,
            },
          });
        }
      } catch (err) {
        console.warn('Could not load remote academic data, using cache:', err);
      }
    }

    loadAcademicMarks();
  }, [currentUser?.id]);

  function populateSemestersWithMarks(
    marksMap: Record<string, number | null>,
    inclusionsMap?: Record<string, boolean>,
    electivesMap?: Record<string, string>
  ) {
    setSemesters(
      INITIAL_CURRICULUM.map((sem) => ({
        ...sem,
        subjects: sem.subjects.map((sub) => {
          const savedMark = marksMap[sub.id];
          const savedInclusion = inclusionsMap?.[sub.id];
          const savedElective = electivesMap?.[sub.id];

          return {
            ...sub,
            marks: savedMark !== undefined ? savedMark : sub.marks,
            included: savedInclusion !== undefined ? savedInclusion : sub.included,
            selectedElective: savedElective !== undefined ? savedElective : sub.selectedElective,
          };
        }),
      }))
    );
  }

  // Trigger autosave to backend and local storage
  const triggerAutoSave = (
    updatedSemesters: Semester[],
    updatedStudentInfo: StudentInfo,
    activeUser: UserProfile | null
  ) => {
    if (!activeUser) return;
    setIsSaved(false);

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

    // Save locally
    saveCachedAcademicData(activeUser.id, {
      marksMap,
      inclusionsMap,
      electivesMap,
      studentInfo: updatedStudentInfo,
    });

    // Debounce save to database
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await saveAcademicDataApi({
          marksMap,
          inclusionsMap,
          electivesMap,
        });
        setIsSaved(true);
      } catch (err) {
        console.error('Failed to sync marks to server database:', err);
        // Still marked saved locally
        setIsSaved(true);
      }
    }, 600);
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCachedUser(user);
    setCurrentUserState(user);
    setStudentInfo({
      name: user.name,
      registerNo: user.registerNo,
    });
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  const handleLogout = async () => {
    await logoutApi();
    setCachedUser(null);
    setCurrentUserState(null);
    setSemesters(INITIAL_CURRICULUM);
    setStudentInfo({ name: '', registerNo: '' });
  };

  const handleProfileUpdated = (updatedUser: UserProfile) => {
    setCurrentUserState(updatedUser);
    setCachedUser(updatedUser);
    setStudentInfo({
      name: updatedUser.name,
      registerNo: updatedUser.registerNo,
    });
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

  // If initial auth session is being checked, show brief loading screen
  if (isInitializing && !currentUser) {
    return (
      <div className="min-h-screen bg-[#f6f9f6] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-600">Loading calculator...</p>
        </div>
      </div>
    );
  }

  // If user is not logged in, show the Login / Sign Up portal
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
      {/* Header Bar */}
      <Header
        studentInfo={studentInfo}
        currentUser={currentUser}
        onResetSemester={handleResetSemester}
        onResetAll={handleResetAll}
        onOpenResultModal={() => setIsResultModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onLogout={handleLogout}
        isSaved={isSaved}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-medium flex items-center justify-between no-print shadow-2xs">
          <span>
            Welcome, <strong>{studentInfo.name || currentUser.name}</strong> ({studentInfo.registerNo || currentUser.registerNo})! Enter your semester marks below to calculate your SGPA and CGPA automatically.
          </span>
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="text-xs font-bold text-[#15803d] hover:text-[#166534] bg-white px-2.5 py-1 rounded-md border border-emerald-200 hover:bg-emerald-50 transition cursor-pointer"
          >
            My Profile
          </button>
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

      {/* Profile & Password Management Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        onProfileUpdated={handleProfileUpdated}
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
