import React from 'react';
import type { Subject } from '../types/curriculum';
import { calculateGradePoint, calculateWeightedPoint, format2Decimals } from '../utils/calculation';
import { validateMarks } from '../utils/validation';
import { Info, AlertTriangle, ToggleLeft, ToggleRight } from 'lucide-react';

interface SubjectRowProps {
  subject: Subject;
  onUpdateMark: (id: string, mark: number | null) => void;
  onToggleInclusion: (id: string, included: boolean) => void;
  onSelectElective?: (id: string, selected: string) => void;
}

export const SubjectRow: React.FC<SubjectRowProps> = ({
  subject,
  onUpdateMark,
  onToggleInclusion,
  onSelectElective,
}) => {
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

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'Core':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Core Lab':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Allied':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'Skill Based':
        return 'bg-violet-100 text-violet-800 border-violet-200';
      case 'Elective':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <tr className={`border-b border-slate-100 transition-colors ${!subject.included ? 'bg-slate-50/60 opacity-85' : 'hover:bg-slate-50/80'}`}>
      <td className="py-3.5 px-4 text-left">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getCategoryBadge(subject.category)}`}>
              {subject.category}
            </span>
            
            <span className="font-semibold text-slate-900 text-sm">
              {subject.name}
            </span>

            {!subject.included && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                <Info className="w-3 h-3 text-amber-500" /> Not included in SGPA
              </span>
            )}
          </div>

          {subject.isElective && subject.electiveOptions && (
            <div className="mt-1.5 flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Selected Course:</span>
              <select
                value={subject.selectedElective || subject.electiveOptions[0]}
                onChange={(e) => onSelectElective?.(subject.id, e.target.value)}
                className="bg-white border border-slate-300 text-slate-800 text-xs rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500"
              >
                {subject.electiveOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          )}

          {subject.exclusionReason && (
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
              <span>{subject.exclusionReason}</span>
              {subject.isElective && (
                <button
                  onClick={() => onToggleInclusion(subject.id, !subject.included)}
                  className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-medium underline"
                >
                  {subject.included ? (
                    <>
                      <ToggleRight className="w-4 h-4 text-blue-600" /> Exclude from SGPA
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-4 h-4 text-slate-400" /> Include in SGPA
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </td>

      <td className="py-3.5 px-4 text-center text-sm text-slate-600 font-mono font-medium">
        {subject.maxMarks}
      </td>

      <td className="py-3.5 px-4 text-center text-sm text-slate-700 font-mono font-semibold">
        {subject.credits}
      </td>

      <td className="py-3.5 px-4 text-center">
        <div className="relative inline-block w-28">
          <input
            type="number"
            min={0}
            max={subject.maxMarks}
            placeholder={`0 - ${subject.maxMarks}`}
            value={inputValue}
            onChange={handleChange}
            className={`w-full text-center text-sm font-semibold font-mono px-3 py-1.5 rounded-xl border transition-all focus:outline-hidden ${
              error
                ? 'border-rose-500 bg-rose-50 text-rose-900 focus:ring-2 focus:ring-rose-500/30'
                : subject.marks !== null
                ? 'border-blue-500 bg-blue-50/50 text-blue-900 font-bold focus:ring-2 focus:ring-blue-500/30'
                : 'border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500/30'
            }`}
          />
          {error && (
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 z-20 bg-rose-900 text-white text-[11px] font-medium px-2 py-1 rounded-md shadow-lg whitespace-nowrap flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-rose-300" />
              <span>{error}</span>
            </div>
          )}
          {!error && inputValue === '' && (
            <span className="text-[10px] text-slate-400 block mt-0.5">Enter marks</span>
          )}
        </div>
      </td>

      <td className="py-3.5 px-4 text-center text-sm font-mono font-semibold text-slate-800">
        {gradePoint !== null ? (
          <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md font-bold">
            {format2Decimals(gradePoint)}
          </span>
        ) : (
          <span className="text-slate-300">--</span>
        )}
      </td>

      <td className="py-3.5 px-4 text-center text-sm font-mono font-semibold text-slate-800">
        {weightedPoint !== null ? (
          <span className="text-slate-900 font-bold">
            {format2Decimals(weightedPoint)}
          </span>
        ) : (
          <span className="text-slate-300">--</span>
        )}
      </td>
    </tr>
  );
};
