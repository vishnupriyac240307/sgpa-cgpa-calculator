import React, { useState } from 'react';
import type { Semester } from '../types/curriculum';
import { SemesterTabs } from '../components/SemesterTabs';
import { SubjectTable } from '../components/SubjectTable';
import { SGPAResult } from '../components/SGPAResult';
import { calculateSGPA } from '../utils/calculation';
import { Save, CheckCircle2, ArrowLeft } from 'lucide-react';

interface MarksProps {
  semesters: Semester[];
  initialSemester?: number;
  onUpdateMark: (semNumber: number, subjectId: string, mark: number | null) => void;
  onToggleInclusion: (semNumber: number, subjectId: string, included: boolean) => void;
  onSelectElective?: (semNumber: number, subjectId: string, selected: string) => void;
  onSaveMarks: () => Promise<void>;
  isSaving: boolean;
  saveMessage: string | null;
  onNavigateToDashboard: () => void;
}

export const Marks: React.FC<MarksProps> = ({
  semesters,
  initialSemester = 1,
  onUpdateMark,
  onToggleInclusion,
  onSelectElective,
  onSaveMarks,
  isSaving,
  saveMessage,
  onNavigateToDashboard,
}) => {
  const [activeSemester, setActiveSemester] = useState<number>(initialSemester);

  const currentSemester = semesters.find((s) => s.number === activeSemester) || semesters[0];
  const semesterResults = semesters.map((s) => calculateSGPA(s.subjects, s.number));
  const currentResult = semesterResults.find((r) => r.semesterNumber === activeSemester) || semesterResults[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <button
            onClick={onNavigateToDashboard}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Enter / Edit Semester Marks
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pre-configured B.Sc. Computer Science with Data Analytics curriculum. Enter your marks to compute SGPA and CGPA.
          </p>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onSaveMarks}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving marks...' : 'Save Marks'}</span>
          </button>
        </div>
      </div>

      {/* Save Toast Feedback */}
      {saveMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Semester Selector Tabs */}
      <SemesterTabs
        activeSemester={activeSemester}
        onSelectSemester={(semNum) => setActiveSemester(semNum)}
        semesterResults={semesterResults}
      />

      {/* Active Semester SGPA Result Card */}
      <SGPAResult semesterResult={currentResult} />

      {/* Pre-configured Subject Table (User only enters marks) */}
      <SubjectTable
        subjects={currentSemester.subjects}
        onUpdateMark={(id, mark) => onUpdateMark(activeSemester, id, mark)}
        onToggleInclusion={(id, included) => onToggleInclusion(activeSemester, id, included)}
        onSelectElective={(id, selected) => onSelectElective?.(activeSemester, id, selected)}
      />

      {/* Bottom Save Reminder */}
      <div className="flex justify-end pt-4 border-t border-slate-200">
        <button
          onClick={onSaveMarks}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving marks...' : 'Save Marks'}</span>
        </button>
      </div>
    </div>
  );
};
