
import React from 'react';

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => {
  return (
    <div className="bg-slate-800/40 border border-slate-700 rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-sky-400 mb-4">{title}</h3>
      {children}
    </div>
  );
};

export default Section;
