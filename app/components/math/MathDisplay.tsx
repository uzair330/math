'use client';

import { useState, useCallback, useMemo } from 'react';
import 'katex/dist/katex.min.css';
import { MathParser } from './MathParser';
import MathBlock from './MathBlock';
import MathInline from './MathInline';
import type { MathDisplayProps, MathContent } from './types';

export default function MathDisplay({ onSolve, solution, isLoading: parentIsLoading }: MathDisplayProps) {
  const [problem, setProblem] = useState('');
  const [localIsLoading, setLocalIsLoading] = useState(false);
  const isLoading = localIsLoading || parentIsLoading;

  // Add debugging log for solution prop
  console.log('MathDisplay received solution:', solution);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting problem:', problem);
    
    try {
      setLocalIsLoading(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch('/api/py/solve-math', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ problem }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 504) {
          throw new Error('The request timed out. Please try again.');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to solve math problem');
      }

      const data = await response.json();
      console.log('API Response data:', data);
      
      if (!data.solution) {
        throw new Error('No solution received from API');
      }

      await onSolve(problem);
      console.log('Solution set successfully');
      
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : error instanceof DOMException && error.name === 'AbortError'
          ? 'Request timed out. Please try again.'
          : 'An unexpected error occurred';
      alert(errorMessage);
    } finally {
      setLocalIsLoading(false);
    }
  }, [problem, onSolve]);

  const parsedSolution = useMemo(() => {
    if (!solution) return null;
    console.log('Parsing solution text:', solution);
    const parsed = MathParser.parseSolution(solution);
    console.log('Parsed solution:', parsed);
    return parsed;
  }, [solution]);

  const renderMathContent = useCallback((block: MathContent) => {
    console.log('Rendering math content block:', block);
    switch (block.type) {
      case 'align':
        return (
          <MathBlock
            content={block.content}
            className="my-6"
          />
        );
      case 'inline':
        return (
          <span className="mx-1">
            <MathInline content={block.content} />
          </span>
        );
      case 'text':
        return (
          <div className="text-gray-900 text-lg font-serif my-4">
            {block.content}
          </div>
        );
      default:
        return null;
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <form onSubmit={handleSubmit} className="mb-12">
        <div className="mb-6">
          <label htmlFor="problem" className="block text-lg font-serif text-gray-900 dark:text-gray-100 mb-3">
            Enter your mathematical problem
          </label>
          <textarea
            id="problem"
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 font-serif text-lg"
            rows={3}
            placeholder="Enter your problem here (e.g., 'Solve for x: 2x + 5 = 13')"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !problem.trim()}
          className={`w-full py-3 px-6 text-lg font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
            (isLoading || !problem.trim()) ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Solving...' : 'Solve Problem'}
        </button>
      </form>

      {solution && !parsedSolution && (
        <div className="mt-8 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400">Raw solution received but parsing failed</p>
          <pre className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded overflow-x-auto text-gray-900 dark:text-gray-100">
            {solution}
          </pre>
        </div>
      )}

      {parsedSolution && (
        <div className="mt-8 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {parsedSolution.error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-700 dark:text-red-400">
                  Error parsing solution: {parsedSolution.error.message}
                </p>
                <pre className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded overflow-x-auto text-gray-900 dark:text-gray-100">
                  {parsedSolution.error.originalContent}
                </pre>
              </div>
            )}
            <div className="space-y-4">
              {parsedSolution.blocks.map((block, index) => (
                <div key={index} className="border-b border-gray-100 dark:border-gray-700 last:border-b-0 py-4">
                  {renderMathContent(block)}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 