/**
 * Counts the number of words in a string
 */
export function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

/**
 * Calculates the optimal number of occurrences for a keyword based on frequency
 */
export function calculateTargetOccurrences(
  totalWords: number, 
  frequencyPercentage: number
): number {
  return Math.max(1, Math.round((totalWords * frequencyPercentage) / 100));
}

/**
 * Checks if a keyword already exists in content (case insensitive)
 */
export function countKeywordOccurrences(content: string, keyword: string): number {
  if (!keyword.trim()) return 0;
  
  const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'gi');
  const matches = content.match(regex);
  return matches ? matches.length : 0;
}

/**
 * Shuffles an array randomly (Fisher-Yates algorithm)
 */
export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}
