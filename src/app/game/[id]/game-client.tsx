
"use client";

import type { Npc } from '@/lib/types';
import type { Message } from 'ai/react';
import { useState, useEffect, useCallback } from 'react';
import {
  dynamicStoryTelling,
  DynamicStoryTellingInput,
} from '@/ai/flows/dynamic-story-telling';
import { generateImage } from '@/ai/flows/ai-generated-images';
import { generateNpcs } from '@/ai/flows/generate-npcs';
import { 
  generateCharacter,
  Dnd5eCharacter,
  FateCharacter,
  StarWarsCharacter,
} from '@/ai/flows/generate-character';

import { Header } from '@/components/game/header';
import { VisualStoryBoard } from '@/components/game/visual-story-board';
import { ChatPanel } from '@/components/game/chat-panel';
import { DiceRollerDnd5e } from '@/components/game/dice-roller-dnd5e';
import { DiceRollerFate } from '@/components/game/dice-roller-fate';
import { DiceRollerStarWars } from '@/components/game/dice-roller-starwars';
import { CharacterSheetDnd5e } from '@/components/game/character-sheet-dnd5e';
import { CharacterSheetFate } from '@/components/game/character-sheet-fate';
import { CharacterSheetStarWars } from '@/components/game/character-sheet-starwars';
import { NpcPanel } from '@/components/game/npc-panel';
import { useToast } from '@/hooks/use-toast';
import { useTTS } from '@/hooks/use-tts';

type GameSystem = 'dnd5e' | 'fate' | 'starwars-ffg';
type Character = Dnd5eCharacter | FateCharacter | StarWarsCharacter | null;

const systemSettings: Record<GameSystem, { gameSetting: string; settingDescription: string; imagePromptPrefix: string }> = {
  'dnd5e': {
    gameSetting: 'A high-fantasy world named Eldoria, governed by the rules of Dungeons & Dragons 5th Edition.',
    settingDescription: 'A bustling fantasy city tavern in Eldoria, filled with adventurers, merchants, and minstrels, adhering to D&D 5e lore.',
    imagePromptPrefix: 'Fantasy RPG illustration, cinematic,'
  },
  'fate': {
    gameSetting: 'A gritty noir city named Crescent Bay in the 1940s, using the FATE Core system.',
    settingDescription: 'A smoky, dimly lit 1940s noir jazz club in Crescent Bay, filled with femme fatales, gruff detectives, and shady informants, fitting a FATE Core narrative.',
    imagePromptPrefix: '1940s noir film illustration, cinematic,'
  },
  'starwars-ffg': {
    gameSetting: 'The Outer Rim of the Star Wars galaxy, using the Fantasy Flight Games (FFG) narrative dice system.',
    settingDescription: 'A classic Star Wars cantina on a dusty Outer Rim planet, bustling with aliens, bounty hunters, and smugglers, as seen in the FFG rule system.',
    imagePromptPrefix: 'Star Wars concept art, cinematic,'
  },
};

interface GameClientProps {
  gameId: string;
  system: GameSystem;
  campaignPrompt?: string;
  characterPrompt?: string;
}

export function GameClient({ gameId, system, campaignPrompt, characterPrompt }: GameClientProps) {
  const { toast } = useToast();
  const { speak, isSpeaking } = useTTS();

  const [messages, setMessages] = useState<Message[]>([]);
  const [story, setStory] = useState('The adventure is about to begin...');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [npcs, setNpcs] = useState<Npc[]>([]);
  const [character, setCharacter] = useState<Character>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isNpcLoading, setIsNpcLoading] = useState(false);
  const [isInitialLoading, setisInitialLoading] = useState(true);

  const activeSystemSettings = systemSettings[system] || systemSettings['dnd5e'];

  const handleSendMessage = async (content: string) => {
    if (isLoading) return;

    const newPlayerMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
    };
    setMessages((prev) => [...prev, newPlayerMessage]);
    setIsLoading(true);

    try {
      const storyInput: DynamicStoryTellingInput = {
        gameSetting: activeSystemSettings.gameSetting,
        playerActions: content,
        campaignHistory: messages.map(m => `${m.role}: ${m.content}`).join('\n'),
      };
      
      const storyResult = await dynamicStoryTelling(storyInput);
      
      const newAssistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: storyResult.narrative,
      };
      setMessages((prev) => [...prev, newAssistantMessage]);
      setStory(storyResult.narrative);

      // Generate image in parallel
      generateImage({ prompt: `${activeSystemSettings.imagePromptPrefix} ${storyResult.narrative}` })
        .then(imageResult => setImageUrl(imageResult.imageUrl))
        .catch(err => {
          console.error("Image generation failed:", err);
          toast({
            title: "Image Generation Error",
            description: "Could not generate a new scene image.",
            variant: "destructive"
          });
        });

    } catch (error) {
      console.error("Story generation failed:", error);
      toast({
        title: "An Error Occurred",
        description: "Failed to get a response from the AI Game Master.",
        variant: "destructive"
      });
       const newErrorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: "The connection to the ethereal plane was lost. Please try again.",
      };
      setMessages((prev) => [...prev, newErrorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateNpcs = async () => {
    setIsNpcLoading(true);
    try {
      const newNpcs = await generateNpcs({
        settingDescription: activeSystemSettings.settingDescription,
        numNPCs: 3,
      });
      setNpcs((prev) => [...prev, ...newNpcs]);
       toast({
        title: "NPCs Arrived!",
        description: `${newNpcs.length} new characters have entered the scene.`,
      });
    } catch (error) {
      console.error("NPC generation failed:", error);
      toast({
        title: "NPC Generation Error",
        description: "Failed to generate new NPCs.",
        variant: "destructive"
      });
    } finally {
      setIsNpcLoading(false);
    }
  };

  const generateInitialState = useCallback(async () => {
    setisInitialLoading(true);
    try {
      // Generate character and story in parallel
      const characterPromise = characterPrompt 
        ? generateCharacter({ characterPrompt, gameSystem: system })
        : Promise.resolve(null);

      const storyPromise = (async () => {
        const initialPlayerActions = campaignPrompt 
          ? `The Game Master has set the scene: "${campaignPrompt}". The players' characters are present. One of them is described as: "${characterPrompt || 'A new adventurer'}". The players are ready to begin.`
          : 'The players have just gathered for the first time, seeking adventure.';

        const storyInput: DynamicStoryTellingInput = {
          gameSetting: activeSystemSettings.gameSetting,
          playerActions: initialPlayerActions,
          campaignHistory: 'This is the very beginning of the campaign.',
        };
        return dynamicStoryTelling(storyInput);
      })();

      const [characterResult, storyResult] = await Promise.all([characterPromise, storyPromise]);
      
      if (characterResult) {
        setCharacter(characterResult as Character);
      }

      const initialMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: storyResult.narrative,
      };

      setMessages([initialMessage]);
      setStory(storyResult.narrative);
      
      const imageResult = await generateImage({ prompt: `${activeSystemSettings.imagePromptPrefix} adventurers meeting. ${storyResult.narrative}` });
      setImageUrl(imageResult.imageUrl);

    } catch (error) {
      console.error("Initial state generation failed:", error);
      toast({
        title: "Initialization Error",
        description: "The AI Game Master failed to set the scene. Using default.",
        variant: "destructive"
      });
      setStory("Welcome, adventurers! Your journey begins now. Tell me, what do you do first?");
      setMessages([{ id: 'error-1', role: 'assistant', content: "The AI Game Master is currently asleep. Let's start with a default scenario." }]);
    } finally {
      setisInitialLoading(false);
    }
  }, [system, campaignPrompt, characterPrompt]);

  useEffect(() => {
    generateInitialState();
  }, [generateInitialState]);

  const renderCharacterSheet = () => {
    switch (system) {
      case 'dnd5e':
        return <CharacterSheetDnd5e character={character as Dnd5eCharacter | null} isLoading={isInitialLoading} />;
      case 'fate':
        return <CharacterSheetFate character={character as FateCharacter | null} isLoading={isInitialLoading} />;
      case 'starwars-ffg':
        return <CharacterSheetStarWars character={character as StarWarsCharacter | null} isLoading={isInitialLoading} />;
      default:
        return <CharacterSheetDnd5e character={character as Dnd5eCharacter | null} isLoading={isInitialLoading} />;
    }
  };

  const renderDiceRoller = () => {
    switch (system) {
      case 'dnd5e':
        return <DiceRollerDnd5e />;
      case 'fate':
        return <DiceRollerFate />;
      case 'starwars-ffg':
        return <DiceRollerStarWars />;
      default:
        return <DiceRollerDnd5e />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background font-body">
      <Header gameId={gameId} />
      <main className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-4 p-4">
        {/* Left Panel */}
        <div className="hidden lg:flex lg:flex-col lg:col-span-3 gap-4 overflow-y-auto">
          {renderCharacterSheet()}
          <NpcPanel npcs={npcs} onGenerateNpcs={handleGenerateNpcs} isLoading={isNpcLoading} speak={speak} />
        </div>

        {/* Center Panel */}
        <div className="flex flex-col col-span-1 lg:col-span-6 h-full overflow-hidden">
           <VisualStoryBoard story={story} imageUrl={imageUrl} isLoading={isInitialLoading} />
           <ChatPanel messages={messages} onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>

        {/* Right Panel */}
        <div className="hidden lg:flex lg:flex-col lg:col-span-3 gap-4 overflow-y-auto">
          {renderDiceRoller()}
        </div>
      </main>
    </div>
  );
}
