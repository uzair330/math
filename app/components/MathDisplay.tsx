'use client';

import { useState } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface MathDisplayProps {
  onSolve: (problem: string) => Promise<void>;
  solution: string | null;
  isLoading: boolean;
}

export default function MathDisplay({ onSolve, solution, isLoading }: MathDisplayProps) {
  const [problem, setProblem] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting problem:', problem);
    await onSolve(problem);
  };

  const formatSolution = (text: string) => {
    console.log('Formatting solution text:', text);
    
    if (!text) {
      console.warn('Empty solution text received');
      return null;
    }

    // Split the solution into lines
    const lines = text.split('\n');
    console.log('Split into lines:', lines.length, 'lines');

    return lines.map((line, index) => {
      // Check if line contains LaTeX-like content (e.g., equations between $ signs)
      const hasLatex = line.includes('$');
      console.log(`Line ${index + 1}:`, { line, hasLatex });

      if (hasLatex) {
        try {
          // Extract LaTeX content between $ signs
          const parts = line.split('$');
          console.log(`Line ${index + 1} parts:`, parts);

          return (
            <div key={index} className="my-2">
              {parts.map((part, i) => {
                if (i % 2 === 0) {
                  return <span key={i}>{part}</span>;
                } else {
                  try {
                    return <InlineMath key={i} math={part} />;
                  } catch (error) {
                    console.error(`Error rendering LaTeX for part: ${part}`, error);
                    return <span key={i} className="text-red-500">{`[LaTeX Error: ${part}]`}</span>;
                  }
                }
              })}
            </div>
          );
        } catch (error) {
          console.error(`Error processing line ${index + 1}:`, error);
          return <div key={index} className="my-2 text-red-500">{line}</div>;
        }
      }
      return <div key={index} className="my-2">{line}</div>;
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <label htmlFor="problem" className="block text-sm font-medium text-gray-700 mb-2">
            Enter your math problem
          </label>
          <textarea
            id="problem"
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            rows={3}
            placeholder="Enter your math problem here (e.g., 'Solve for x: 2x + 5 = 13')"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !problem.trim()}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            (isLoading || !problem.trim()) ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Solving...' : 'Solve Problem'}
        </button>
      </form>

      {solution && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Solution:</h3>
          <div className="prose max-w-none text-gray-900">
            {formatSolution(solution)}
          </div>
        </div>
      )}
    </div>
  );
} 