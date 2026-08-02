export const calculateCyclomaticComplexity = (code) => {
  const lines = code.split('\n');
  let complexity = 1; // Base complexity

  const controlFlowWords = /\b(if|else|for|while|case|catch|&&|\|\||\?)\b/g;

  for (const line of lines) {
    const trimmed = line.trim();
    // Ignore comments
    if (trimmed.startsWith('//') || trimmed.startsWith('#')) continue;

    const matches = trimmed.match(controlFlowWords);
    if (matches) {
      complexity += matches.length;
    }
  }

  return complexity;
};
