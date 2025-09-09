
'use server';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, limit } from 'firebase/firestore';

interface RuleChunk {
  text: string;
  section: string | null;
  page: number | null;
}

// A simple text extractor for .txt files. PDF extraction is more complex
// and would require a library like pdf-parse on the server.
async function extractText(file: File): Promise<string> {
  if (file.type === 'application/pdf') {
    console.warn('PDF parsing is not implemented in this version. Treating as text.');
    // In a real scenario, you would use a library like pdfjs-dist or pdf-parse
    // For now, we'll just read it as text, which might not work for all PDFs.
    return file.text();
  }
  return file.text();
}


// Simple chunking strategy. A more advanced version would use NLP to find logical breaks.
async function chunkRulebook(text: string): Promise<RuleChunk[]> {
  // Split by double newline to get paragraphs, then filter out empty ones
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 10);
  return paragraphs.map(p => ({
    text: p.trim(),
    section: null, // Advanced chunking could identify sections
    page: null,    // Advanced chunking/PDF parsing could get page numbers
  }));
}

function extractKeywords(text: string): string[] {
  // Simple keyword extraction: lowercase, remove punctuation, split by space, filter out common words.
  const commonWords = new Set(['the', 'a', 'an', 'is', 'are', 'to', 'of', 'in', 'it', 'and', 'or', 'but']);
  const keywords = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.has(word));
  
  return [...new Set(keywords)]; // Return unique keywords
}

/**
 * Processes an uploaded rulebook file, chunks it, and stores it in Firestore.
 * @param file The rulebook file to process.
 * @param sessionId The ID of the game session.
 */
export async function processRulebook(file: File, sessionId: string) {
  console.log(`Processing rulebook ${file.name} for session ${sessionId}`);
  try {
    const text = await extractText(file);
    const chunks = await chunkRulebook(text);
    
    const sessionRulesCollection = collection(db, 'sessions', sessionId, 'rulebooks');
    const filenameCollection = collection(db, 'sessions', sessionId, 'uploaded_files');
    
    // Batch write all chunks to Firestore
    await Promise.all(chunks.map(chunk => 
      addDoc(sessionRulesCollection, {
        content: chunk.text,
        section: chunk.section,
        pageNumber: chunk.page,
        filename: file.name,
        keywords: extractKeywords(chunk.text),
        timestamp: new Date()
      })
    ));

    // Add filename to a separate collection to track uploaded books
    await addDoc(filenameCollection, {
      name: file.name,
      timestamp: new Date(),
    });

    console.log(`Successfully processed and stored ${chunks.length} chunks for ${file.name}`);

  } catch (error) {
    console.error("Error processing rulebook:", error);
    throw new Error("Failed to process the rulebook file.");
  }
}

/**
 * Finds relevant rule snippets from Firestore for a given session and query.
 * @param query The player's action or question.
 * @param sessionId The ID of the game session.
 * @returns A string containing the most relevant rule snippets.
 */
export async function findSessionRules(query: string, sessionId: string): Promise<string> {
  try {
    const keywords = extractKeywords(query);
    if (keywords.length === 0) {
      return "No relevant keywords found in query.";
    }

    const rulesCollection = collection(db, 'sessions', sessionId, 'rulebooks');
    // Firestore's array-contains-any is limited to 10 keywords.
    const q = query(rulesCollection, where('keywords', 'array-contains-any', keywords.slice(0, 10)), limit(3));
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return "No specific rules found for this action. Use general knowledge.";
    }

    const rulesText = snapshot.docs.map(doc => doc.data().content).join('\n\n---\n\n');
    return `Relevant Rules Found:\n${rulesText}`;

  } catch (error) {
    console.error("Error finding session rules:", error);
    // Return a message that the AI can use.
    return "An error occurred while fetching session-specific rules. Please rely on general knowledge.";
  }
}


export async function getUploadedRulebooks(sessionId: string): Promise<string[]> {
  try {
    const filesCollection = collection(db, 'sessions', sessionId, 'uploaded_files');
    const snapshot = await getDocs(filesCollection);
    const filenames = snapshot.docs.map(doc => doc.data().name as string);
    return [...new Set(filenames)]; // Return unique filenames
  } catch (error) {
    console.error("Error fetching uploaded rulebooks:", error);
    return [];
  }
}
