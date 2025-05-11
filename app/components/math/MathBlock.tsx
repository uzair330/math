'use client';

import { memo } from 'react';
import { BlockMath } from 'react-katex';
import type { MathBlockProps } from './types';

function MathBlock({ content, className = '' }: MathBlockProps) {
  try {
    return (
      <div className={`my-6 py-4 px-6 overflow-x-auto bg-gray-50 dark:bg-gray-800/50 rounded-lg ${className}`}>
        <div className="flex justify-center min-w-full">
          <BlockMath
            math={`\\begin{align*}\n${content}\n\\end{align*}`}
            errorColor="#EF4444"
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error rendering block math:', error);
    return (
      <div className="my-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800">
        Failed to render equation: {content}
      </div>
    );
  }
}

export default memo(MathBlock); 