import React from 'react';

const SimilarityChart = ({ astScore = 0, structureScore = 0, styleScore = 0, complexityScore = 0 }) => {
  const data = [
    { label: 'AST Similarity', score: astScore },
    { label: 'Directory Structure', score: structureScore },
    { label: 'Code Style', score: styleScore },
    { label: 'Cyclomatic Complexity', score: complexityScore },
  ];

  return (
    <div className="space-y-4">
      {data.map((item) => (
        <div key={item.label} className="space-y-1">
          <div className="flex justify-between text-xs font-medium text-dark-300">
            <span>{item.label}</span>
            <span>{item.score}%</span>
          </div>
          <div className="w-full h-2 bg-dark-700 rounded overflow-hidden">
            <div 
              className={`h-full rounded transition-all duration-1000 ease-out ${
                item.score >= 80 ? 'bg-red-500' : 
                item.score >= 60 ? 'bg-yellow-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${item.score}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SimilarityChart;
