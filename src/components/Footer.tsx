import React from 'react';
import { Award, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-12 py-6 no-print text-center text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 font-medium text-slate-700">
          <Award className="w-4 h-4 text-blue-600" />
          <span>Built for 6-Semester B.Sc. Computer Science with Data Analytics</span>
        </div>

        <div className="flex items-center gap-1">
          <span>Designed with precision for students</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
        </div>
      </div>
    </footer>
  );
};
