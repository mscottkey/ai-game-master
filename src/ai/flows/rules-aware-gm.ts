
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating dynamic storylines 
 * that are aware of custom, user-uploaded rulebooks.
 */

import { ai } from '@/ai/genkit';
import { findSessionRules } from '@/lib/document-processor';
import { z } from 'genkit';

// Define the tool for the AI to use to find relevant rules.
const rulebookLookupTool = ai.defineTool(
  {
    name: 'rulebookLookup',
    description: 'Looks up specific rules from the user-uploaded rulebooks for the current game session. Use this to answer questions about rules or to see how a character action should be resolved according to the provided game system.',
    inputSchema: z.object({
      query: z.string().describe('The player action or rule question you are trying to resolve. For example: "How does a grapple check work?" or "The character tries to cast a fireball spell."'),
      sessionId: z.string().describe('The unique ID for the current game session.'),
    }),
    outputSchema: z.string(),
  },
  async ({ query, sessionId }) => {
    return findSessionRules(query, sessionId);
  }
);


export const RulesAwareStoryTellingInputSchema = z.object({
  gameSetting: z.string().describe('The setting for the game, including genre, theme, and world details.'),
  playerActions: z.string().describe('A description of the player actions or questions.'),
  campaignHistory: z.string().describe('A summary of the campaign history.'),
  messageType: z.enum(['in-character', 'out-of-character']).describe('The type of message from the player.'),
  sessionId: z.string().describe('The unique ID for the current game session.'),
});
export type RulesAwareStoryTellingInput = z.infer<typeof RulesAwareStoryTellingInputSchema>;

export const RulesAwareStoryTellingOutputSchema = z.object({
  narrative: z.string().describe('The generated narrative or response, taking into account the custom rulebooks.'),
});
export type RulesAwareStoryTellingOutput = z.infer<typeof RulesAwareStoryTellingOutputSchema>;


export async function rulesAwareStoryTelling(input: RulesAwareStoryTellingInput): Promise<RulesAwareStoryTellingOutput> {
  return rulesAwareStoryTellingFlow(input);
}


const rulesAwareStoryTellingFlow = ai.defineFlow(
  {
    name: 'rulesAwareStoryTellingFlow',
    inputSchema: RulesAwareStoryTellingInputSchema,
    outputSchema: RulesAwareStoryTellingOutputSchema,
  },
  async (input) => {
    
    const prompt = `You are an AI Game Master. Your primary goal is to create a dynamic and engaging storyline.
    
When a player asks a question or performs an action that might be covered by the game's rules, you MUST use the 'rulebookLookup' tool to find the relevant rules from the user-uploaded documents for this session. Your response must be guided by the rules you find.
If no specific rules are found, you may use your general knowledge of tabletop RPGs.

Game Setting:
{{gameSetting}}

Campaign History:
{{campaignHistory}}

Current player input (session ID: {{sessionId}}): "{{playerActions}}"

Based on the context, and any rules you find using the tool, generate a response.
If the player's message is 'in-character', advance the plot.
If the message is 'out-of-character', answer their question helpfully as a GM.
`;

    const { output } = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      tools: [rulebookLookupTool],
      prompt: prompt,
      input: {
        ...input,
        // Pass sessionId to the tool through the prompt input
        playerActions: `(sessionId: ${input.sessionId}) ${input.playerActions}`,
      },
      config: {
        // Lower temperature for more rule-adherent responses
        temperature: 0.3,
      },
    });

    return { narrative: output.text! };
  }
);
