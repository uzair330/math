'use client';

import { useState } from 'react';
import MathDisplay from './components/math/MathDisplay';
import ThemeToggle from './components/ThemeToggle';

export default function Home() {
  const [solution, setSolution] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSolveMath = async (problem: string) => {
    console.log('Attempting to solve math problem:', problem);
    setError(null);
    setSolution(null);
    
    try {
      setIsLoading(true);
      console.log('Making API request...');
      
      const response = await fetch('/api/py/solve-math', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ problem }),
      });

      console.log('API Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(errorData.detail || 'Failed to solve math problem');
      }

      const data = await response.json();
      console.log('API Response data:', data);
      
      if (!data.solution) {
        throw new Error('No solution received from API');
      }

      console.log('Setting solution state with:', data.solution);
      setSolution(data.solution);
      console.log('Solution state set successfully');
      
    } catch (error) {
      console.error('Error in handleSolveMath:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      setSolution(null);
    } finally {
      setIsLoading(false);
      console.log('Request completed, loading state:', false);
    }
  };

  console.log('Current state:', { solution, isLoading, error });

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <ThemeToggle />
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Math Problem Solver
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Enter your math problem below and get a step-by-step solution with LaTeX formatting
          </p>
        </div>
        
        {error && (
          <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-400 dark:border-red-800 rounded-md">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}
        
        <MathDisplay
          onSolve={handleSolveMath}
          solution={solution}
          isLoading={isLoading}
        />
      </div>
    </main>
  );
}
