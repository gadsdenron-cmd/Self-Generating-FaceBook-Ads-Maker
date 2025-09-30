
import React from 'react';
import Card from './ui/Card';

interface ProblemSelectorProps {
  problems: string[];
  onSelect: (problem: string) => void;
  avatarDescription: string;
}

const ProblemSelector: React.FC<ProblemSelectorProps> = ({ problems, onSelect, avatarDescription }) => {
  return (
    <Card>
      <div className="p-8">
        <h2 className="text-2xl font-bold text-sky-400 mb-2">Step 2: Problem Discovery</h2>
        <p className="text-slate-400 mb-1">We've analyzed your ideal customer: <span className="font-semibold text-slate-300">"{avatarDescription}"</span></p>
        <p className="text-slate-400 mb-6">Which of these common problems are they willing to pay to solve?</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {problems.map((problem, index) => (
            <button
              key={index}
              onClick={() => onSelect(problem)}
              className="text-left p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:bg-sky-900/50 hover:border-sky-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sky-500 h-full"
            >
              <p className="font-semibold text-slate-200">{problem}</p>
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default ProblemSelector;
