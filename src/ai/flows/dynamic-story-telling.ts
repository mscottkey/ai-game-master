'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating dynamic storylines based on game settings.
 *
 * The flow takes game settings as input and generates a dynamic storyline. It leverages AI to create contextual
 * narratives based on player actions and campaign history. It exports the `dynamicStoryTelling` function,
 * the `DynamicStoryTellingInput` type, and the `DynamicStoryTellingOutput` type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DynamicStoryTellingInputSchema = z.object({
  gameSetting: z.string().describe('The setting for the game, including genre, theme, and world details.'),
  playerActions: z.string().describe('A description of the player actions.'),
  campaignHistory: z.string().describe('A summary of the campaign history.'),
});
export type DynamicStoryTellingInput = z.infer<typeof DynamicStoryTellingInputSchema>;

const DynamicStoryTellingOutputSchema = z.object({
  narrative: z.string().describe('The generated narrative based on the game setting, player actions, and campaign history.'),
});
export type DynamicStoryTellingOutput = z.infer<typeof DynamicStoryTellingOutputSchema>;

export async function dynamicStoryTelling(input: DynamicStoryTellingInput): Promise<DynamicStoryTellingOutput> {
  return dynamicStoryTellingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dynamicStoryTellingPrompt',
  input: {schema: DynamicStoryTellingInputSchema},
  output: {schema: DynamicStoryTellingOutputSchema},
  prompt: `You are an AI Game Master, tasked with generating a dynamic and engaging storyline for a tabletop RPG.

  The game is set in the following setting:
  {{gameSetting}}

  The players have taken the following actions:
  {{playerActions}}

  The campaign history so far is:
  {{campaignHistory}}

  Generate a narrative that builds upon the setting, player actions, and campaign history, creating a compelling and unpredictable story for the players to experience.`,
});

const dynamicStoryTellingFlow = ai.defineFlow(
  {
    name: 'dynamicStoryTellingFlow',
    inputSchema: DynamicStoryTellingInputSchema,
    outputSchema: DynamicStoryTellingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
