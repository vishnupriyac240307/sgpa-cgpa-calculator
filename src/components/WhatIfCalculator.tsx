import React from 'react';
import type { Semester, SemesterResult } from '../types/curriculum';
import { calculateWhatIfCGPA, format2Decimals } from '../utils/calculation';
import { Target, TrendingUp, Sparkles, RefreshCw } from 'lucide-react';

interface WhatIfCalculatorProps {
  semesters: Semester[];
  semesterResults: SemesterResult[];
  currentCGPA: number | null;
}

export const WhatIfCalculator: React.FC<WhatIfCalculatorProps> = ({
  semesters,
  semesterResults,
  currentCGPA,
}) => {
  const [projectedInputs, setProjectedInputs] = React.useState<Record<number, string>>({});

  const handleInputChange = (semNum: number, value: string) => {
    setProjectedInputs((prev) => ({
      ...prev,
      [semNum]: value,
    }));
  };

  const handleResetProjections = () => {
    setProjectedInputs({});
  };

  const numericProjectedMap: Record<number, number | null> = {};
  Object.keys(projectedInputs).forEach((key) => {
    const semNum = Number(key);
    const valStr = projectedInputs[semNum];
    if (valStr !== '' && !isNaN(Number(valStr))) {
      numericProjectedMap[semNum] = Number(valStr);
    }
  });

  const { projectedCGPA, totalProjectedCredits } = calculateWhatIfCGPA(semesters, numericProjectedMap);

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white rounded-2xl p-5 sm:p-7 shadow-lg border border-indigo-800/50 mb-8 no-print">
      <div className="flex items-center justify-between border-b border-indigo-800/80 pb-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg text-white flex items-center gap-2">
              What-If CGPA Projection Calculator
            </h3>
            <p className="text-xs text-indigo-200">
              Enter target SGPAs for remaining semesters to project your graduation CGPA.
            </p>
          </div>
        </div>

        {Object.keys(projectedInputs).length > 0 && (
          <button
            onClick={handleResetProjections}
            className="text-xs text-indigo-300 hover:text-white flex items-center gap-1 bg-white/10 px-2.5 py-1.5 rounded-lg"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Projections
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {semesterResults.map((sem) => {
          const isCompleted = sem.isComplete;
          const currentVal = projectedInputs[sem.semesterNumber] || '';

          return (
            <div
              key={sem.semesterNumber}
              className={`p-3 rounded-xl border text-center transition-all ${
                isCompleted
                  ? 'bg-emerald-950/40 border-emerald-500/30'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="text-xs font-semibold text-indigo-200 mb-1">
                Sem {sem.semesterNumber} ({sem.totalCredits} cr)
              </div>

              {isCompleted ? (
                <div className="py-1">
                  <span className="text-xs text-emerald-400 font-bold block">Actual SGPA</span>
                  <span className="text-base font-bold font-mono text-emerald-300">
                    {format2Decimals(sem.sgpa)}
                  </span>
                </div>
              ) : (
                <div className="mt-1">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    placeholder="Expected (e.g. 9.0)"
                    value={currentVal}
                    onChange={(e) => handleInputChange(sem.semesterNumber, e.target.value)}
                    className="w-full text-center text-xs font-bold font-mono px-2 py-1.5 rounded-lg border border-indigo-400/40 bg-indigo-950/80 text-white placeholder-indigo-400 focus:ring-2 focus:ring-indigo-400 focus:outline-hidden"
                  />
                  {sem.enteredSubjectCount > 0 && (
                    <span className="text-[10px] text-amber-300 block mt-0.5">
                      Cur: {format2Decimals(sem.sgpa)}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-5 border border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-emerald-400 shrink-0" />
          <div>
            <span className="text-xs text-indigo-200 uppercase tracking-wider font-semibold block">
              CGPA Comparison
            </span>
            <div className="flex items-center gap-3 text-sm sm:text-base font-medium mt-0.5">
              <span>Current: <strong className="text-white font-mono">{format2Decimals(currentCGPA)}</strong></span>
              <span className="text-indigo-400">→</span>
              <span>Projected: <strong className="text-emerald-300 font-mono text-lg sm:text-xl font-black">{format2Decimals(projectedCGPA)}</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-indigo-950/70 px-3 py-2 rounded-lg border border-indigo-800 text-xs text-indigo-200 font-mono">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Calculated over <strong>{totalProjectedCredits}</strong> total credits</span>
        </div>
      </div>
    </div>
  );
};
