/**
 * @fileOverview Defines the data structures and schemas for character generation.
 */

import { z } from 'genkit';

export const GenerateCharacterInputSchema = z.object({
  characterPrompt: z.string().describe('A descriptive prompt for the character to be generated.'),
  gameSystem: z.enum(['dnd5e', 'fate', 'starwars-ffg']).describe('The tabletop RPG system to be used.'),
  useMocks: z.boolean().optional().describe('Whether to use mock data instead of calling the AI.'),
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
