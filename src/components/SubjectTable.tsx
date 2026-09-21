import React from 'react';
import type { Subject } from '../types/curriculum';
import { SubjectRow } from './SubjectRow';
import { calculateGradePoint, calculateWeightedPoint, format2Decimals } from '../utils/calculation';
import { validateMarks } from '../utils/validation';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface SubjectTableProps {
  subjects: Subject[];
  onUpdateMark: (id: string, mark: number | null) => void;
  onToggleInclusion: (id: string, included: boolean) => void;
  onSelectElective?: (id: string, selected: string) => void;
}

export const SubjectTable: React.FC<SubjectTableProps> = ({
  subjects,
  onUpdateMark,
  onToggleInclusion,
  onSelectElective,
}) => {
  const includedSubjects = subjects.filter((s) => s.included);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8 no-print">
      {/* DESKTOP TABLE VIEW */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
              <th className="py-3 px-4">Subject</th>
              <th className="py-3 px-4 text-center">Max Marks</th>
              <th className="py-3 px-4 text-center">Credits</th>
              <th className="py-3 px-4 text-center">Your Mark</th>
              <th className="py-3 px-4 text-center">Grade Point</th>
              <th className="py-3 px-4 text-center">Weighted Point</th>
            </tr>
          </thead>
          <tbody>
            {includedSubjects.map((subject) => (
              <SubjectRow
                key={subject.id}
                subject={subject}
                onUpdateMark={onUpdateMark}
                onToggleInclusion={onToggleInclusion}
                onSelectElective={onSelectElective}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARD VIEW */}
      <div className="md:hidden divide-y divide-slate-100">
        <div className="p-4 bg-slate-50/50">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-900 mb-3 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span>Subjects ({includedSubjects.length})</span>
          </div>

          <div className="space-y-3">
            {includedSubjects.map((subject) => (
              <MobileSubjectCard
                key={subject.id}
                subject={subject}
                onUpdateMark={onUpdateMark}
                onSelectElective={onSelectElective}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const MobileSubjectCard: React.FC<{
  subject: Subject;
  onUpdateMark: (id: string, mark: number | null) => void;
  onSelectElective?: (id: string, selected: string) => void;
}> = ({ subject, onUpdateMark, onSelectElective }) => {
  const [inputValue, setInputValue] = React.useState<string>(
    subject.marks !== null ? String(subject.marks) : ''
  );
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setInputValue(subject.marks !== null ? String(subject.marks) : '');
    setError(null);
  }, [subject.marks]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    const validation = validateMarks(val, subject.maxMarks);
    if (!validation.isValid) {
      setError(validation.error);
      onUpdateMark(subject.id, null);
    } else {
      setError(null);
      onUpdateMark(subject.id, validation.value);
    }
  };

  const gradePoint = subject.marks !== null ? calculateGradePoint(subject.marks, subject.maxMarks) : null;
  const weightedPoint =
    subject.marks !== null ? calculateWeightedPoint(subject.marks, subject.maxMarks, subject.credits) : null;

  return (
    <div className="p-4 rounded-xl border border-blue-100 bg-white shadow-2xs">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
            {subject.category}
          </span>
          <h4 className="font-bold text-slate-900 text-sm mt-1">
            {subject.name}
          </h4>
        </div>
      </div>

      {subject.isElective && subject.electiveOptions && (
        <div className="mb-2 text-xs">
          <select
            value={subject.selectedElective || subject.electiveOptions[0]}
            onChange={(e) => onSelectElective?.(subject.id, e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg px-2 py-1.5"
          >
            {subject.electiveOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 bg-slate-50 rounded-xl p-2.5 mt-3 border border-slate-100">
        <div>
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Max / Credits</span>
          <span className="text-xs font-mono font-bold text-slate-700">
            {subject.maxMarks}m / {subject.credits}cr
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Your Mark</span>
          <input
            type="number"
            min={0}
            max={subject.maxMarks}
            placeholder={`0-${subject.maxMarks}`}
            value={inputValue}
            onChange={handleChange}
            className={`w-full text-center text-xs font-mono font-bold py-1 rounded-md border ${
              error
                ? 'border-rose-500 bg-rose-50 text-rose-900'
                : subject.marks !== null
                ? 'border-blue-500 bg-blue-50 text-blue-900'
                : 'border-slate-300 bg-white'
            }`}
          />
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Grade / W.Pt</span>
          <span className="text-xs font-mono font-bold text-blue-700">
            {format2Decimals(gradePoint)} / {format2Decimals(weightedPoint)}
          </span>
        </div>
      </div>

      {error && (
        <div className="mt-2 text-xs text-rose-600 bg-rose-50 p-2 rounded-lg font-medium flex items-center gap-1">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
