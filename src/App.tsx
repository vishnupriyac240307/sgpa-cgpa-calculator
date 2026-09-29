import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { INITIAL_CURRICULUM } from './data/curriculum';
import type { Semester } from './types/curriculum';
import { calculateSGPA, calculateCGPA } from './utils/calculation';
import { getAcademicDataApi, saveAcademicDataApi } from './services/api';

import { AuthProvider, useAuth } from './context/AuthContext';
import { Header, type PageView } from './components/Header';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Marks } from './pages/Marks';
import { Profile } from './pages/Profile';
import { AcademicResultModal } from './components/AcademicResultModal';
import { Footer } from './components/Footer';
import { GraduationCap } from 'lucide-react';

function AppContent() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [activeView, setActiveView] = useState<PageView>('dashboard');
  const [initialMarksSem, setInitialMarksSem] = useState<number>(1);

  const [semesters, setSemesters] = useState<Semester[]>(INITIAL_CURRICULUM);
  const [isSavingMarks, setIsSavingMarks] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState<boolean>(false);

  // Fetch academic data from MongoDB when user is logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      getAcademicDataApi()
        .then((storedMarks) => {
          if (storedMarks && typeof storedMarks === 'object') {
            setSemesters((prevSemesters) =>
              prevSemesters.map((sem) => {
                const semMarks = storedMarks[sem.number] || storedMarks[String(sem.number)] || {};
                return {
                  ...sem,
                  subjects: sem.subjects.map((sub) => {
                    const savedMark = semMarks[sub.id];
                    return {
                      ...sub,
                      marks: savedMark !== undefined ? savedMark : sub.marks,
                    };
                  }),
                };
              })
            );
          }
        })
        .catch((err) => {
          console.error('Failed to load user academic data:', err);
        });
    } else {
      // Reset semesters to default template when logged out
      setSemesters(INITIAL_CURRICULUM);
      setActiveView('dashboard');
    }
  }, [isAuthenticated, user]);

  const handleUpdateMark = (semNumber: number, subjectId: string, mark: number | null) => {
    setSemesters((prevSemesters) =>
      prevSemesters.map((sem) => {
        if (sem.number === semNumber) {
          const updatedSubjects = sem.subjects.map((sub) => {
            if (sub.id === subjectId) {
              return { ...sub, marks: mark };
            }
            return sub;
          });

          // Trigger celebratory confetti if semester becomes complete
          const semResult = calculateSGPA(updatedSubjects, sem.number);
          if (semResult.isComplete && mark !== null) {
            confetti({
              particleCount: 60,
              spread: 60,
              origin: { y: 0.7 },
            });
          }

          return { ...sem, subjects: updatedSubjects };
        }
        return sem;
      })
    );
  };

  const handleToggleInclusion = (semNumber: number, subjectId: string, included: boolean) => {
    setSemesters((prevSemesters) =>
      prevSemesters.map((sem) => {
        if (sem.number === semNumber) {
          return {
            ...sem,
            subjects: sem.subjects.map((sub) => {
              if (sub.id === subjectId) {
                return { ...sub, included };
              }
              return sub;
            }),
          };
        }
        return sem;
      })
    );
  };

  const handleSelectElective = (semNumber: number, subjectId: string, selected: string) => {
    setSemesters((prevSemesters) =>
      prevSemesters.map((sem) => {
        if (sem.number === semNumber) {
          return {
            ...sem,
            subjects: sem.subjects.map((sub) => {
              if (sub.id === subjectId) {
                return { ...sub, selectedElective: selected };
              }
              return sub;
            }),
          };
        }
        return sem;
      })
    );
  };

  const handleSaveMarks = async () => {
    setIsSavingMarks(true);
    setSaveMessage(null);

    // Build marks structure: { [semesterNumber]: { [subjectId]: mark } }
    const marksData: Record<string, Record<string, number | null>> = {};
    semesters.forEach((sem) => {
      marksData[sem.number] = {};
      sem.subjects.forEach((sub) => {
        marksData[sem.number][sub.id] = sub.marks;
      });
    });

    try {
      await saveAcademicDataApi(marksData);
      setSaveMessage('Marks saved successfully.');
      setTimeout(() => setSaveMessage(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to save marks.');
    } finally {
      setIsSavingMarks(false);
    }
  };

  const handleNavigateToMarks = (semNumber: number = 1) => {
    setInitialMarksSem(semNumber);
    setActiveView('marks');
  };

  // Loading Screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-700 animate-pulse">
          Loading your academic data...
        </p>
      </div>
    );
  }

  // Unauthenticated Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans text-slate-900">
        <header className="bg-white border-b border-slate-200 py-4 px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="font-bold text-lg text-slate-900">
                SGPA & CGPA Calculator
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1">
          {authView === 'login' ? (
            <Login onSwitchToRegister={() => setAuthView('register')} />
          ) : (
            <Register onSwitchToLogin={() => setAuthView('login')} />
          )}
        </main>

        <Footer />
      </div>
    );
  }

  // Authenticated Application Screens
  const semesterResults = semesters.map((sem) => calculateSGPA(sem.subjects, sem.number));
  const cgpaResult = calculateCGPA(semesters);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-blue-500 selection:text-white">
      <Header
        activeView={activeView}
        onNavigate={setActiveView}
        onOpenTranscript={() => setIsTranscriptOpen(true)}
      />

      <main className="flex-1">
        {activeView === 'dashboard' && (
          <Dashboard
            semesters={semesters}
            onNavigateToMarks={handleNavigateToMarks}
            onOpenTranscript={() => setIsTranscriptOpen(true)}
          />
        )}

        {activeView === 'marks' && (
          <Marks
            semesters={semesters}
            initialSemester={initialMarksSem}
            onUpdateMark={handleUpdateMark}
            onToggleInclusion={handleToggleInclusion}
            onSelectElective={handleSelectElective}
            onSaveMarks={handleSaveMarks}
            isSaving={isSavingMarks}
            saveMessage={saveMessage}
            onNavigateToDashboard={() => setActiveView('dashboard')}
          />
        )}

        {activeView === 'profile' && (
          <Profile onNavigateToDashboard={() => setActiveView('dashboard')} />
        )}
      </main>

      <Footer />

      {/* Official Academic Result Transcript Modal */}
      <AcademicResultModal
        isOpen={isTranscriptOpen}
        onClose={() => setIsTranscriptOpen(false)}
        semesters={semesters}
        semesterResults={semesterResults}
        cgpaResult={cgpaResult}
        studentInfo={{
          name: user?.username || 'Student',
          registerNo: 'CS-DA-' + (user?._id?.substring(0, 6) || '001'),
        }}
      />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
