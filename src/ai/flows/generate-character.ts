'use server';

/**
 * @fileOverview Generates a character sheet based on a prompt and game system.
 *
 * - generateCharacter - A function that handles the character generation process.
 */

import { ai } from '@/ai/genkit';
import {
  GenerateCharacterInputSchema,
  GenerateCharacterOutputSchema,
  Dnd5eCharacterSchema,
  FateCharacterSchema,
  StarWarsCharacterSchema,
  type GenerateCharacterInput,
  type GenerateCharacterOutput,
} from './generate-character.types';


export async function generateCharacter(input: GenerateCharacterInput): Promise<GenerateCharacterOutput> {
  return generateCharacterFlow(input);
}

const dndPrompt = ai.definePrompt({
  name: 'generateDndCharacterPrompt',
  input: { schema: GenerateCharacterInputSchema },
  output: { schema: Dnd5eCharacterSchema },
  prompt: `You are a creative Dungeons & Dragons 5e expert. Generate a complete character sheet based on the user's prompt.

Character Prompt: {{{characterPrompt}}}

Create a compelling character with a name, class, race, level, HP, AC, stats (Strength, Dexterity, Wisdom, Charisma), a few inventory items, and a couple of interesting abilities. The character should be around level 5.
`,
});

const fatePrompt = ai.definePrompt({
    name: 'generateFateCharacterPrompt',
    input: { schema: GenerateCharacterInputSchema },
    output: { schema: FateCharacterSchema },
    prompt: `You are a creative FATE Core expert. Generate a complete character sheet based on the user's prompt.

Character Prompt: {{{characterPrompt}}}

Create a compelling character with a name, description, Fate Points, Refresh, a High Concept aspect, a Trouble aspect, and at least one other aspect. Also provide a list of their top skills with ranks.
`,
});

const starwarsPrompt = ai.definePrompt({
    name: 'generateStarWarsCharacterPrompt',
    input: { schema: GenerateCharacterInputSchema },
    output: { schema: StarWarsCharacterSchema },
    prompt: `You are a creative Star Wars FFG expert. Generate a complete character sheet based on the user's prompt.

Character Prompt: {{{characterPrompt}}}

Create a compelling character with a name, species, career, wounds, strain, characteristics (Brawn, Agility, etc.), a few key skills and talents, and a motivation/obligation.
`,
});


const generateCharacterFlow = ai.defineFlow(
  {
    name: 'generateCharacterFlow',
    inputSchema: GenerateCharacterInputSchema,
    outputSchema: GenerateCharacterOutputSchema,
  },
  async (input) => {
    switch (input.gameSystem) {
      case 'dnd5e':
        const { output: dndOutput } = await dndPrompt(input);
        return dndOutput!;
      case 'fate':
        const { output: fateOutput } = await fatePrompt(input);
        return fateOutput!;
      case 'starwars-ffg':
        const { output: starwarsOutput } = await starwarsPrompt(input);
        return starwarsOutput!;
      default:
        throw new Error(`Unsupported game system: ${input.gameSystem}`);
    }
  }
);
