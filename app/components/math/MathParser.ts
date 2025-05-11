import { MathContent, ParsedSolution } from './types';

export class MathParser {
  static parseSolution(text: string): ParsedSolution {
    try {
      if (!text) {
        return { blocks: [] };
      }

      const blocks: MathContent[] = [];
      const sections = text.split(/\n(?=STEPS:|FINAL:|VERIFY:)/);

      sections.forEach(section => {
        const [header, ...lines] = section.trim().split('\n');
        const content = lines.join('\n').trim();

        if (header.startsWith('STEPS:')) {
          // Add introduction text
          blocks.push({
            type: 'text',
            content: "Solution:"
          });

          // Convert steps to align* environment with proper formatting
          const equations = content.split('\n').map(line => line.trim()).filter(Boolean);
          const alignContent = equations.map((eq, index) => {
            // Format each equation step
            const parts = eq.split('=');
            if (parts.length === 2) {
              if (index === 0) {
                // First equation with given equation note
                return `${parts[0]} &= ${parts[1]} &&\\quad\\text{(given)}\\\\[0.5em]`;
              }
              // Add proper spacing and arrow for subsequent steps
              return `${parts[0]} &= ${parts[1]} &&\\quad\\text{${this.getStepExplanation(parts[0], equations[index-1])}}\\\\[0.5em]`;
            }
            return `&= ${eq}\\\\[0.5em]`;
          }).join('\n');

          blocks.push({
            type: 'align',
            content: alignContent
          });
        }
        else if (header.startsWith('FINAL:')) {
          blocks.push({
            type: 'text',
            content: '\nTherefore,'
          });
          blocks.push({
            type: 'inline',
            content: content.trim()
          });
          blocks.push({
            type: 'text',
            content: '.'
          });
        }
        else if (header.startsWith('VERIFY:')) {
          blocks.push({
            type: 'text',
            content: "\nVerification:"
          });

          // Convert verification steps to align* environment
          const verifySteps = content.split('\n').map(line => line.trim()).filter(Boolean);
          const verifyContent = verifySteps.map((step, index) => {
            if (index === 0) {
              // First verification step
              const parts = step.split('=');
              return `${parts[0]} &= ${parts[1]}\\\\[0.5em]`;
            }
            // Add proper spacing and formatting for subsequent steps
            return `&= ${step}${step.includes('=') ? '\\quad\\checkmark' : ''}\\\\[0.5em]`;
          }).join('\n');

          blocks.push({
            type: 'align',
            content: verifyContent
          });

          // Add conclusion
          blocks.push({
            type: 'text',
            content: `\nThe solution is verified.`
          });
        }
      });

      return { blocks };
    } catch (error) {
      console.error('Error parsing math solution:', error);
      return {
        blocks: [{
          type: 'text',
          content: text
        }],
        error: {
          message: error instanceof Error ? error.message : 'Failed to parse math content',
          originalContent: text
        }
      };
    }
  }

  private static getStepExplanation(current: string, previous: string): string {
    // Analyze the step and provide appropriate explanation
    if (current.includes('=')) {
      if (previous.includes('+') && !current.includes('+')) {
        return 'combine like terms';
      }
      if (previous.includes('-') && !current.includes('-')) {
        return 'subtract from both sides';
      }
      if (previous.includes('*') || previous.includes('×')) {
        return 'multiply';
      }
      if (previous.includes('/')) {
        return 'divide both sides';
      }
      if (current.includes('frac')) {
        return 'simplify';
      }
    }
    return 'simplify';
  }
} 