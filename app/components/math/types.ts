export interface MathContent {
  type: 'inline' | 'block' | 'align' | 'text';
  content: string;
}

export interface MathError {
  message: string;
  originalContent: string;
}

export interface MathDisplayProps {
  onSolve: (problem: string) => Promise<void>;
  solution: string | null;
  isLoading: boolean;
}

export interface MathBlockProps {
  content: string;
  className?: string;
}

export interface MathInlineProps {
  content: string;
  className?: string;
}

export interface ParsedSolution {
  blocks: MathContent[];
  error?: MathError;
} 