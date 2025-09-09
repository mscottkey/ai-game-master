
"use client";

import type { Npc } from '@/lib/types';
import type { Message } from 'ai/react';
import { useState, useEffect, useCallback } from 'react';
import {
  rulesAwareStoryTelling,
  RulesAwareStoryTellingInput,
} from '@/ai/flows/rules-aware-gm';
import { generateImage } from '@/ai/flows/ai-generated-images';
import { generateNpcs } from '@/ai/flows/generate-npcs';
import { generateCharacter } from '@/ai/flows/generate-character';
import type { 
  Dnd5eCharacter,
  FateCharacter,
  StarWarsCharacter,
} from '@/ai/flows/generate-character.types';

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
import { RulesPanel } from '@/components/game/rules-panel';

type GameSystem = 'dnd5e' | 'fate' | 'starwars-ffg';
type Character = Dnd5eCharacter | FateCharacter | StarWarsCharacter | null;
type MessageMode = 'in-character' | 'out-of-character';

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

export interface GameClientProps {
  gameId: string;
  system: GameSystem;
  campaignPrompt?: string;
  characterPrompt?: string;
}

export function GameClient({ gameId, system, campaignPrompt, characterPrompt }: GameClientProps) {
  const { toast } = useToast();
  const { speak, isSpeaking } = useTTS();

  const [messages, setMessages] = useState<Message[]>([]);
  const [story, setStory] = useState('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [npcs, setNpcs] = useState<Npc[]>([]);
  const [character, setCharacter] = useState<Character>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isNpcLoading, setIsNpcLoading] = useState(false);
  const [isInitialLoading, setisInitialLoading] = useState(true);

  const activeSystemSettings = systemSettings[system] || systemSettings['dnd5e'];

  const handleSendMessage = async (content: string, mode: MessageMode) => {
    if (isLoading) return;

    const newPlayerMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
    };
    setMessages((prev) => [...prev, newPlayerMessage]);
    setIsLoading(true);

    if (mode === 'in-character') {
      setStory((prev) => `${prev}\n\n> **Player:** ${content}`);
    }

    try {
      const storyInput: RulesAwareStoryTellingInput = {
        gameSetting: activeSystemSettings.gameSetting,
        playerActions: content,
        campaignHistory: messages.map(m => `${m.role}: ${m.content}`).join('\n'),
        messageType: mode,
        sessionId: gameId,
      };
      
      const storyResult = await rulesAwareStoryTelling(storyInput);
      
      const newAssistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: storyResult.narrative,
      };
      setMessages((prev) => [...prev, newAssistantMessage]);

      if (mode === 'in-character') {
        setStory((prev) => `${prev}\n\n**GM:** ${storyResult.narrative}`);

        // Generate image in parallel only for in-character actions that advance the story
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
      }
    } catch (error: any) {
      console.error("Story generation failed:", error);
      const errorMessage = error.message || '';
      let toastDescription = "Failed to get a response from the AI Game Master.";
      let chatContent = "The connection to the ethereal plane was lost. Please try again.";

      if (errorMessage.includes('503') || errorMessage.toLowerCase().includes('overloaded')) {
        toastDescription = "The AI Game Master is currently overloaded with requests. Please try again in a moment.";
        chatContent = "The AI seems to be pondering a great many things at once and needs a moment to catch its breath. Please ask again shortly.";
      }
      
      toast({
        title: "An Error Occurred",
        description: toastDescription,
        variant: "destructive"
      });
       const newErrorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: chatContent,
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

        const storyInput: RulesAwareStoryTellingInput = {
          gameSetting: activeSystemSettings.gameSetting,
          playerActions: initialPlayerActions,
          campaignHistory: 'This is the very beginning of the campaign.',
          messageType: 'in-character', // Initial story is always in-character
          sessionId: gameId,
        };
        return rulesAwareStoryTelling(storyInput);
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
      setStory(`**GM:** ${storyResult.narrative}`);
      
      const imageResult = await generateImage({ prompt: `${activeSystemSettings.imagePromptPrefix} adventurers meeting. ${storyResult.narrative}` });
      setImageUrl(imageResult.imageUrl);

    } catch (error) {
      console.error("Initial state generation failed:", error);
      toast({
        title: "Initialization Error",
        description: "The AI Game Master failed to set the scene. Using default.",
        variant: "destructive"
      });
      setStory("**GM:** Welcome, adventurers! Your journey begins now. Tell me, what do you do first?");
      setMessages([{ id: 'error-1', role: 'assistant', content: "The AI Game Master is currently asleep. Let's start with a default scenario." }]);
    } finally {
      setisInitialLoading(false);
    }
  }, [system, gameId, campaignPrompt, characterPrompt, toast, activeSystemSettings]);

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
        <div className="flex flex-col col-span-1 lg:col-span-6 h-full overflow-hidden gap-4">
           <VisualStoryBoard story={story} imageUrl={imageUrl} isLoading={isInitialLoading} />
           <ChatPanel messages={messages} onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>

        {/* Right Panel */}
        <div className="hidden lg:flex lg:flex-col lg:col-span-3 gap-4 overflow-y-auto">
          {renderDiceRoller()}
          <RulesPanel sessionId={gameId} />
        </div>
      </main>
    </div>
  );
}
