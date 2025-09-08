'use server';

/**
 * @fileOverview Generates unique Non-Player Characters (NPCs) with distinct personalities, voices, and motivations.
 *
 * - generateNpcs - A function that handles the NPC generation process.
 * - GenerateNpcsInput - The input type for the generateNpcs function.
 * - GenerateNpcsOutput - The return type for the generateNpcs function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateNpcsInputSchema = z.object({
  settingDescription: z.string().describe('A description of the game setting.'),
  numNPCs: z.number().describe('The number of NPCs to generate.'),
});
export type GenerateNpcsInput = z.infer<typeof GenerateNpcsInputSchema>;

const NpcSchema = z.object({
  name: z.string().describe('The name of the NPC.'),
  personality: z.string().describe('A description of the NPC\'s personality.'),
  voice: z.string().describe('A description of the NPC\'s voice.'),
  motivation: z.string().describe('The NPC\'s primary motivation.'),
});

const GenerateNpcsOutputSchema = z.array(NpcSchema);
export type GenerateNpcsOutput = z.infer<typeof GenerateNpcsOutputSchema>;

export async function generateNpcs(input: GenerateNpcsInput): Promise<GenerateNpcsOutput> {
  return generateNpcsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateNpcsPrompt',
  input: {schema: GenerateNpcsInputSchema},
  output: {schema: GenerateNpcsOutputSchema},
  prompt: `You are a creative Game Master assistant. Your task is to generate a list of NPCs with distinct personalities, voices and motivations, based on the game setting.

Game Setting: {{{settingDescription}}}
Number of NPCs to generate: {{{numNPCs}}}

Each NPC should have a unique name, a detailed description of their personality, a description of their voice, and their primary motivation. Ensure that each NPC is distinct and adds flavor to the game setting.

Output the NPCs as a JSON array.
`,
});

const generateNpcsFlow = ai.defineFlow(
  {
    name: 'generateNpcsFlow',
    inputSchema: GenerateNpcsInputSchema,
    outputSchema: GenerateNpcsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
