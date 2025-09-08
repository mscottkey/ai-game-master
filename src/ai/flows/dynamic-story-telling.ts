
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
  playerActions: z.string().describe('A description of the player actions or questions.'),
  campaignHistory: z.string().describe('A summary of the campaign history.'),
  messageType: z.enum(['in-character', 'out-of-character']).describe('The type of message from the player.'),
});
export type DynamicStoryTellingInput = z.infer<typeof DynamicStoryTellingInputSchema>;

const DynamicStoryTellingOutputSchema = z.object({
  narrative: z.string().describe('The generated narrative or response based on the game setting, player actions, and campaign history.'),
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

The campaign history so far is:
{{campaignHistory}}

{{#if messageType.in-character}}
The player takes the following action in-character:
"{{playerActions}}"

Generate a narrative that builds upon the setting, player actions, and campaign history, creating a compelling and unpredictable story for the players to experience. This should advance the plot.
{{/if}}
{{#if messageType.out-of-character}}
The player asks the following question out-of-character, as a player to the Game Master:
"{{playerActions}}"

Answer the player's question helpfully as the GM. Do not treat this as a character action and do not advance the main story narrative. You can clarify rules, describe the scene in more detail, or provide hints if appropriate.
{{/if}}
`,
});

const dynamicStoryTellingFlow = ai.defineFlow(
  {
    name: 'dynamicStoryTellingFlow',
    inputSchema: DynamicStoryTellingInputSchema,
    outputSchema: DynamicStoryTellingOutputSchema,
  },
  async (input) => {
    // Reshape the input to work with simple Handlebars #if blocks.
    const templatingInput = {
      ...input,
      messageType: {
        'in-character': input.messageType === 'in-character',
        'out-of-character': input.messageType === 'out-of-character',
      },
    };
    const {output} = await prompt(templatingInput);
    return output!;
  }
);
