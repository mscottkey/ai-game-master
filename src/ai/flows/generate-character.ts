'use server';

/**
 * @fileOverview Generates a character sheet based on a prompt and game system.
 *
 * - generateCharacter - A function that handles the character generation process.
 * - GenerateCharacterInput - The input type for the generateCharacter function.
 * - GenerateCharacterOutput - The return type for the generateCharacter function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const GenerateCharacterInputSchema = z.object({
  characterPrompt: z.string().describe('A descriptive prompt for the character to be generated.'),
  gameSystem: z.enum(['dnd5e', 'fate', 'starwars-ffg']).describe('The tabletop RPG system to be used.'),
});
export type GenerateCharacterInput = z.infer<typeof GenerateCharacterInputSchema>;

export const Dnd5eCharacterSchema = z.object({
  name: z.string(),
  level: z.number(),
  class: z.string(),
  race: z.string(),
  hp: z.number(),
  ac: z.number(),
  stats: z.object({
    strength: z.number(),
    dexterity: z.number(),
    wisdom: z.number(),
    charisma: z.number(),
  }),
  inventory: z.array(z.string()),
  abilities: z.array(z.string()),
});
export type Dnd5eCharacter = z.infer<typeof Dnd5eCharacterSchema>;


export const FateCharacterSchema = z.object({
    name: z.string(),
    description: z.string(),
    fatePoints: z.number(),
    refresh: z.number(),
    aspects: z.array(z.object({
        type: z.string().describe("e.g., High Concept, Trouble"),
        name: z.string(),
    })),
    skills: z.array(z.object({
        name: z.string(),
        rank: z.number(),
    })),
});
export type FateCharacter = z.infer<typeof FateCharacterSchema>;

export const StarWarsCharacterSchema = z.object({
    name: z.string(),
    species: z.string(),
    career: z.string(),
    wounds: z.object({
        current: z.number(),
        threshold: z.number(),
    }),
    strain: z.object({
        current: z.number(),
        threshold: z.number(),
    }),
    characteristics: z.object({
        brawn: z.number(),
        agility: z.number(),
        intellect: z.number(),
        cunning: z.number(),
        willpower: z.number(),
        presence: z.number(),
    }),
    skills: z.array(z.string()),
    talents: z.array(z.string()),
    motivation: z.string(),
    obligation: z.string(),
});
export type StarWarsCharacter = z.infer<typeof StarWarsCharacterSchema>;


export const GenerateCharacterOutputSchema = z.union([
  Dnd5eCharacterSchema,
  FateCharacterSchema,
  StarWarsCharacterSchema,
]);
export type GenerateCharacterOutput = z.infer<typeof GenerateCharacterOutputSchema>;

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
