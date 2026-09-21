import React from 'react';
import type { SemesterResult } from '../types/curriculum';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface SemesterTabsProps {
  activeSemester: number;
  onSelectSemester: (semNumber: number) => void;
  semesterResults: SemesterResult[];
}

export const SemesterTabs: React.FC<SemesterTabsProps> = ({
  activeSemester,
  onSelectSemester,
  semesterResults,
}) => {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 mb-6 scrollbar-none no-print">
      {semesterResults.map((sem) => {
        const isActive = sem.semesterNumber === activeSemester;

        return (
          <button
            key={sem.semesterNumber}
            onClick={() => onSelectSemester(sem.semesterNumber)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm whitespace-nowrap transition-all ${
              isActive
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 hover:text-slate-900'
            }`}
          >
            <span>Semester {sem.semesterNumber}</span>
            
            {sem.isComplete ? (
              <CheckCircle2 className={`w-3.5 h-3.5 ${isActive ? 'text-blue-100' : 'text-emerald-500'}`} />
            ) : sem.enteredSubjectCount > 0 ? (
              <AlertCircle className={`w-3.5 h-3.5 ${isActive ? 'text-amber-200' : 'text-amber-500'}`} />
            ) : null}
          </button>
        );
      })}
    </div>
  );
};
