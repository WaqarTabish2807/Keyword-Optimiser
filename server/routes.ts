import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { optimizationRequest, optimizationResponse } from "@shared/schema";

function countWords(text: string): number {
  return text.trim().split(/\s+/).length;
}

function insertKeywords(
  content: string,
  keywords: string[],
  frequency: number
): { text: string; occurrences: { [key: string]: number } } {
  // Filter out empty keywords
  keywords = keywords.filter((k) => k.trim() !== "");
  if (keywords.length === 0) {
    return { text: content, occurrences: {} };
  }

  const words = content.trim().split(/\s+/);
  const totalWords = words.length;
  
  // Calculate how many times each keyword should appear based on frequency percentage
  const targetOccurrences = Math.max(1, Math.round((totalWords * frequency) / 100));
  const keywordOccurrences: { [key: string]: number } = {};
  
  // Initialize keyword occurrences
  keywords.forEach(keyword => {
    keywordOccurrences[keyword] = 0;
  });
  
  // Check if keywords already exist in content
  const lowerContent = content.toLowerCase();
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'g');
    const matches = lowerContent.match(regex);
    if (matches) {
      keywordOccurrences[keyword] = matches.length;
    }
  });
  
  // Split content into sentences for more natural insertion
  const sentences = content.split(/(?<=[.!?])\s+/);
  
  // Create a map of semantic areas to help with context-appropriate insertion
  const semanticAreas: { [key: string]: number[] } = {};
  keywords.forEach(keyword => {
    semanticAreas[keyword] = findRelevantSentences(sentences, keyword);
  });
  
  // Randomize the keyword order but prioritize based on target occurrences
  const keywordQueue = [...keywords].sort((a, b) => {
    // Calculate what percentage of target has been achieved
    const aPercentage = keywordOccurrences[a] / targetOccurrences;
    const bPercentage = keywordOccurrences[b] / targetOccurrences;
    // Sort by lowest percentage first (prioritize keywords with fewer occurrences)
    return aPercentage - bPercentage;
  });
  
  // Track which sentences have been modified to avoid over-optimization
  const modifiedSentences = new Set<number>();
  
  // Process each keyword to reach target occurrences if possible
  while (keywordQueue.length > 0) {
    const currentKeyword = keywordQueue[0];
    
    // Skip if we've reached target occurrences for this keyword
    if (keywordOccurrences[currentKeyword] >= targetOccurrences) {
      keywordQueue.shift();
      continue;
    }
    
    // Find best sentences for insertion based on semantic relevance
    let candidateSentences = semanticAreas[currentKeyword];
    
    // Filter out sentences that already contain the keyword or have been modified
    candidateSentences = candidateSentences.filter(idx => {
      return !sentences[idx].toLowerCase().includes(currentKeyword.toLowerCase()) &&
             !modifiedSentences.has(idx);
    });
    
    if (candidateSentences.length === 0) {
      // If no good candidates found, look for any unmodified sentence of sufficient length
      candidateSentences = [];
      for (let i = 0; i < sentences.length; i++) {
        if (!modifiedSentences.has(i) && 
            !sentences[i].toLowerCase().includes(currentKeyword.toLowerCase()) &&
            sentences[i].split(/\s+/).length >= 5) {
          candidateSentences.push(i);
        }
      }
      
      // If still no candidates, move this keyword to the end of the queue
      if (candidateSentences.length === 0) {
        // Move to end of queue with a small chance of removal to avoid infinite loops
        if (Math.random() < 0.2) {
          keywordQueue.shift();
        } else {
          keywordQueue.push(keywordQueue.shift()!);
        }
        continue;
      }
    }
    
    // Choose a random sentence from the candidates
    const sentenceIndex = candidateSentences[Math.floor(Math.random() * candidateSentences.length)];
    const sentenceWords = sentences[sentenceIndex].split(/\s+/);
    
    // Only insert in sentences with enough words
    if (sentenceWords.length >= 5) {
      // Create more natural insertion by considering sentence structure
      const insertPosition = getOptimalInsertPosition(sentenceWords, currentKeyword);
      
      // Insert the keyword at the determined position
      sentenceWords.splice(insertPosition, 0, currentKeyword);
      sentences[sentenceIndex] = sentenceWords.join(' ');
      
      // Mark as modified and update occurrence count
      modifiedSentences.add(sentenceIndex);
      keywordOccurrences[currentKeyword]++;
    }
    
    // Move this keyword to the end of the queue to give others a chance
    keywordQueue.push(keywordQueue.shift()!);
    
    // Break if we're struggling to place keywords to avoid infinite loop
    if (modifiedSentences.size > Math.min(sentences.length * 0.5, 20)) {
      break;
    }
  }
  
  return { 
    text: sentences.join(' '), 
    occurrences: keywordOccurrences 
  };
}

// Helper function to find semantically relevant sentences for a keyword
function findRelevantSentences(sentences: string[], keyword: string): number[] {
  const relevantIndices: number[] = [];
  const keywordWords = keyword.toLowerCase().split(/\s+/);
  
  // Look for sentences containing similar words or phrases
  sentences.forEach((sentence, index) => {
    const lowerSentence = sentence.toLowerCase();
    let relevanceScore = 0;
    
    // Check for word similarity
    keywordWords.forEach(word => {
      if (word.length > 3 && lowerSentence.includes(word)) {
        relevanceScore += 2;
      }
    });
    
    // Check for related terms (simple heuristic)
    const words = lowerSentence.split(/\s+/);
    if (words.some(word => keywordWords.some(kw => word.includes(kw) || kw.includes(word)))) {
      relevanceScore += 1;
    }
    
    // Sentence length factor (prefer medium-length sentences)
    const wordCount = words.length;
    if (wordCount >= 5 && wordCount <= 20) {
      relevanceScore += 1;
    }
    
    // Avoid sentences with questions or exclamations for most keywords
    if (sentence.includes('?') || sentence.includes('!')) {
      relevanceScore -= 1;
    }
    
    // If sentence has decent relevance, add to candidates
    if (relevanceScore > 0) {
      relevantIndices.push(index);
    }
  });
  
  // If no relevant sentences found, return a few random ones
  if (relevantIndices.length === 0) {
    return Array.from({ length: Math.min(sentences.length, 5) }, 
      () => Math.floor(Math.random() * sentences.length));
  }
  
  return relevantIndices;
}

// Helper function to determine the optimal position to insert a keyword in a sentence
function getOptimalInsertPosition(words: string[], keyword: string): number {
  // Avoid inserting at the very beginning or end
  if (words.length <= 5) {
    return Math.floor(words.length / 2);
  }
  
  // Check for optimal insertion points
  const punctuation = [',', ';', ':', '-'];
  
  // Look for positions after punctuation for natural flow
  for (let i = 1; i < words.length - 1; i++) {
    if (punctuation.some(p => words[i-1].endsWith(p))) {
      return i;
    }
  }
  
  // Look for positions before coordinating conjunctions
  const conjunctions = ['and', 'or', 'but', 'so', 'because', 'while', 'although'];
  for (let i = 0; i < words.length - 1; i++) {
    if (conjunctions.includes(words[i].toLowerCase())) {
      return i;
    }
  }
  
  // Default to a position slightly before the middle for natural reading
  return Math.floor(words.length / 2.5);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoint to optimize content with keywords
  app.post("/api/optimize", async (req, res) => {
    try {
      const validatedData = optimizationRequest.parse(req.body);
      
      const { 
        content, 
        primaryKeywords, 
        secondaryKeywords, 
        primaryFrequency, 
        secondaryFrequency 
      } = validatedData;
      
      // Check if content exceeds word limit
      if (countWords(content) > 1000) {
        return res.status(400).json({ 
          message: "Content exceeds the 1000 word limit" 
        });
      }
      
      // Insert primary keywords first
      const primaryResult = insertKeywords(
        content, 
        primaryKeywords, 
        primaryFrequency
      );
      
      // Then insert secondary keywords
      const finalResult = insertKeywords(
        primaryResult.text, 
        secondaryKeywords, 
        secondaryFrequency
      );
      
      // Prepare the response
      const response = {
        optimizedContent: finalResult.text,
        primaryKeywordStats: primaryKeywords.map(keyword => ({
          keyword,
          occurrences: primaryResult.occurrences[keyword] || 0
        })),
        secondaryKeywordStats: secondaryKeywords.map(keyword => ({
          keyword,
          occurrences: finalResult.occurrences[keyword] || 0
        })),
        totalWords: countWords(finalResult.text),
        wordCount: countWords(finalResult.text)  // Adding wordCount to match front-end expectations
      };
      
      return res.status(200).json(response);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "An unexpected error occurred" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
