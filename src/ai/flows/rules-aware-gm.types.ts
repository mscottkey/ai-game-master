/**
 * @fileOverview Defines the data structures and schemas for the rules-aware storytelling flow.
 */

import { z } from 'genkit';

export const RulesAwareStoryTellingInputSchema = z.object({
  gameSetting: z.string().describe('The setting for the game, including genre, theme, and world details.'),
  playerActions: z.string().describe('A description of the player actions or questions.'),
  campaignHistory: z.string().describe('A summary of the campaign history.'),
  messageType: z.enum(['in-character', 'out-of-character']).describe('The type of message from the player.'),
  sessionId: z.string().describe('The unique ID for the current game session.'),
  useMocks: z.boolean().optional().describe('Whether to use mock data instead of calling the AI.'),
});
export type RulesAwareStoryTellingInput = z.infer<typeof RulesAwareStoryTellingInputSchema>;

export const RulesAwareStoryTellingOutputSchema = z.object({
  narrative: z.string().describe('The generated narrative or response, taking into account the custom rulebooks.'),
});
export type RulesAwareStoryTellingOutput = z.infer<typeof RulesAwareStoryTellingOutputSchema>;
