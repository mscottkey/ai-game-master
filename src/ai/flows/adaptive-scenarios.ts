'use server';

/**
 * @fileOverview An AI agent that modifies the story direction based on player choices and group dynamics.
 *
 * - adaptScenario - A function that modifies the story direction based on player choices.
 * - AdaptScenarioInput - The input type for the adaptScenario function.
 * - AdaptScenarioOutput - The return type for the adaptScenario function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdaptScenarioInputSchema = z.object({
  campaignState: z
    .string()
    .describe('The current state of the campaign, including recent player actions and decisions.'),
  playerChoices: z
    .string()
    .describe('A description of the choices the players have made in the current scenario.'),
  groupDynamics: z
    .string()
    .describe('A summary of the group dynamics and relationships between players.'),
});
export type AdaptScenarioInput = z.infer<typeof AdaptScenarioInputSchema>;

const AdaptScenarioOutputSchema = z.object({
  newScenarioDirection: z
    .string()
    .describe('A description of the new direction for the scenario, incorporating player choices and group dynamics.'),
});
export type AdaptScenarioOutput = z.infer<typeof AdaptScenarioOutputSchema>;

export async function adaptScenario(input: AdaptScenarioInput): Promise<AdaptScenarioOutput> {
  return adaptScenarioFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adaptScenarioPrompt',
  input: {schema: AdaptScenarioInputSchema},
  output: {schema: AdaptScenarioOutputSchema},
  prompt: `You are an AI Game Master adapting a tabletop RPG campaign based on player choices and group dynamics.

The current state of the campaign is:
{{{campaignState}}}

The players have made the following choices:
{{{playerChoices}}}

The group dynamics can be summarized as:
{{{groupDynamics}}}

Based on this information, adapt the scenario to create a new, engaging direction for the story.  The response should describe the new direction for the scenario, incorporating player choices and group dynamics. Focus on crafting a compelling narrative that responds to the players' actions and enhances the overall game experience. Make sure the response is suitable as a high level description to set the stage for the next phase of the game.

New Scenario Direction:`,
});

const adaptScenarioFlow = ai.defineFlow(
  {
    name: 'adaptScenarioFlow',
    inputSchema: AdaptScenarioInputSchema,
    outputSchema: AdaptScenarioOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
