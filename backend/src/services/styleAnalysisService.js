import { generateSHA256 } from './hashService.js';

export const analyzeStyle = (code) => {
  const lines = code.split('\n');
  
  let indentation = { spaces: 0, tabs: 0, mixed: 0 };
  let bracketStyle = { sameLine: 0, nextLine: 0 };
  let totalCommentLines = 0;
  let totalLength = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Indentation analysis
    const leadingWhitespace = line.match(/^\s+/);
    if (leadingWhitespace) {
      if (leadingWhitespace[0].includes('\t')) {
        indentation.tabs++;
        if (leadingWhitespace[0].includes(' ')) indentation.mixed++;
      } else {
        indentation.spaces++;
      }
    }

    // Bracket style
    if (line.trim().endsWith('{')) {
      bracketStyle.sameLine++;
    } else if (line.trim() === '{') {
      bracketStyle.nextLine++;
    }

    // Comment density
    if (line.trim().startsWith('//') || line.trim().startsWith('#') || line.trim().startsWith('/*') || line.trim().startsWith('*')) {
      totalCommentLines++;
    }

    totalLength += line.trim().length;
  }

  // Generate style signature
  const styleSignature = `INDENT_S${indentation.spaces}_T${indentation.tabs}_M${indentation.mixed}_BRACKET_S${bracketStyle.sameLine}_N${bracketStyle.nextLine}`;
  const styleHash = generateSHA256(styleSignature);
  
  return {
    styleHash,
    commentDensity: lines.length > 0 ? (totalCommentLines / lines.length) : 0,
    averageLineLength: lines.length > 0 ? (totalLength / lines.length) : 0,
    indentation,
    bracketStyle
  };
};
