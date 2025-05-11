'use client';

import { memo } from 'react';
import { InlineMath } from 'react-katex';
import type { MathInlineProps } from './types';

function MathInline({ content, className = '' }: MathInlineProps) {
  try {
    return (
      <span className={className}>
        <InlineMath math={content} />
      </span>
    );
  } catch (error) {
    console.error('Error rendering inline math:', error);
    return (
      <span className="text-red-700 bg-red-50 px-1 rounded">
        ${content}$
      </span>
    );
  }
}

export default memo(MathInline); 