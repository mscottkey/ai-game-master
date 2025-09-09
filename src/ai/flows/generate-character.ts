
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
  Dnd5eCharacter,
  FateCharacter,
  StarWarsCharacter,
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

// --- MOCK DATA ---
const mockDndCharacter: Dnd5eCharacter = {
  name: 'Kaelen',
  level: 5,
  class: 'Ranger',
  race: 'Wood Elf',
  hp: 42,
  ac: 16,
  stats: { strength: 12, dexterity: 18, wisdom: 16, charisma: 10 },
  inventory: ['Longbow', 'Quiver of 20 arrows', 'Leather armor', 'Dagger', 'Explorer\'s pack'],
  abilities: ['Fey Ancestry', 'Sharpshooter', 'Hunter\'s Mark'],
};

const mockFateCharacter: FateCharacter = {
  name: 'Silas "Sly" Vance',
  description: 'A sharp-witted private eye with a rumpled trench coat and a past that\'s even messier.',
  fatePoints: 3,
  refresh: 3,
  aspects: [
    { type: 'High Concept', name: 'Hardboiled Detective with a Conscience' },
    { type: 'Trouble', name: 'Owes a Debt to the Blackwood Gang' },
    { type: 'Other', name: 'Never forgets a Face' },
  ],
  skills: [
    { name: 'Investigate', rank: 4 },
    { name: 'Shoot', rank: 3 },
    { name: 'Contacts', rank: 3 },
    { name: 'Deceive', rank: 2 },
  ],
};

const mockStarWarsCharacter: StarWarsCharacter = {
  name: 'Zorii Vex',
  species: 'Twi\'lek',
  career: 'Smuggler',
  wounds: { current: 0, threshold: 14 },
  strain: { current: 0, threshold: 12 },
  characteristics: { brawn: 2, agility: 4, intellect: 3, cunning: 3, willpower: 2, presence: 2 },
  skills: ['Piloting (Space)', 'Ranged (Light)', 'Skulduggery'],
  talents: ['Galaxy Mapper', 'Grit'],
  motivation: 'Freedom',
  obligation: 'Debt (5)',
};
// --- END MOCK DATA ---


const generateCharacterFlow = ai.defineFlow(
  {
    name: 'generateCharacterFlow',
    inputSchema: GenerateCharacterInputSchema,
    outputSchema: GenerateCharacterOutputSchema,
  },
  async (input) => {
    // Return mock data if the character prompt indicates it's the start of the game.
    // This avoids using the AI for the initial setup, saving API calls during UI development.
    if (input.useMocks) {
      console.log('Returning mock character data because useMocks is true.');
      const suffix = Math.floor(Math.random() * 1000);
      switch (input.gameSystem) {
        case 'dnd5e': return { ...mockDndCharacter, name: `${mockDndCharacter.name} ${suffix}` };
        case 'fate': return { ...mockFateCharacter, name: `${mockFateCharacter.name} ${suffix}` };
        case 'starwars-ffg': return { ...mockStarWarsCharacter, name: `${mockStarWarsCharacter.name} ${suffix}` };
        default: break;
      }
    }

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
