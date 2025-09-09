
"use client";

import type { Message } from 'ai/react';
import { useState, useEffect, useCallback } from 'react';
import {
  rulesAwareStoryTelling,
} from '@/ai/flows/rules-aware-gm';
import type { RulesAwareStoryTellingInput } from '@/ai/flows/rules-aware-gm.types';
import { generateImage } from '@/ai/flows/ai-generated-images';
import { useToast } from '@/hooks/use-toast';
import type { GameClientProps } from './game-client';
import { Header } from '@/components/game/header';
import { VisualStoryBoard } from '@/components/game/visual-story-board';
import { ChatPanel } from '@/components/game/chat-panel';
import { ActionTracker } from '@/components/game/action-tracker';
import { RulesPanel } from '@/components/game/rules-panel';
import { generateCharacter } from '@/ai/flows/generate-character';
import type { 
  Dnd5eCharacter,
  FateCharacter,
  StarWarsCharacter,
} from '@/ai/flows/generate-character.types';
import { CharacterSheetDnd5e } from '@/components/game/character-sheet-dnd5e';
import { CharacterSheetFate } from '@/components/game/character-sheet-fate';
import { CharacterSheetStarWars } from '@/components/game/character-sheet-starwars';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTTS } from '@/hooks/use-tts';

type GameSystem = 'dnd5e' | 'fate' | 'starwars-ffg';
type Character = Dnd5eCharacter | FateCharacter | StarWarsCharacter;
type MessageMode = 'in-character' | 'out-of-character';

const systemSettings: Record<GameSystem, { gameSetting: string; imagePromptPrefix: string }> = {
  'dnd5e': {
    gameSetting: 'A high-fantasy world named Eldoria, governed by the rules of Dungeons & Dragons 5th Edition.',
    imagePromptPrefix: 'Fantasy RPG illustration, cinematic,'
  },
  'fate': {
    gameSetting: 'A gritty noir city named Crescent Bay in the 1940s, using the FATE Core system.',
    imagePromptPrefix: '1940s noir film illustration, cinematic,'
  },
  'starwars-ffg': {
    gameSetting: 'The Outer Rim of the Star Wars galaxy, using the Fantasy Flight Games (FFG) narrative dice system.',
    imagePromptPrefix: 'Star Wars concept art, cinematic,'
  },
};

export function LocalPlayClient({ gameId, system, campaignPrompt, characterPrompt, useMocks = true }: GameClientProps) {
  const { toast } = useToast();
  const { speak } = useTTS();

  const [messages, setMessages] = useState<Message[]>([]);
  const [story, setStory] = useState('');
  const [latestNarrative, setLatestNarrative] = useState('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [selectedCharacterSheet, setSelectedCharacterSheet] = useState<Character | null>(null);

  const activeSystemSettings = systemSettings[system] || systemSettings['dnd5e'];

  const handleSendMessage = async (content: string, mode: MessageMode, character?: string) => {
    if (isLoading) return;

    const playerMessageContent = character ? `${character}: ${content}` : content;

    const newPlayerMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: playerMessageContent,
    };
    setMessages((prev) => [...prev, newPlayerMessage]);
    setIsLoading(true);

    if (mode === 'in-character') {
      const storyUpdate = character ? `> **${playerMessageContent}**` : `> **Player:** ${content}`;
      setStory((prev) => `${prev}\n\n${storyUpdate}`);
    }

    try {
      const storyInput: RulesAwareStoryTellingInput = {
        gameSetting: activeSystemSettings.gameSetting,
        playerActions: playerMessageContent, // Send combined content to AI
        campaignHistory: messages.map(m => `${m.role}: ${m.content}`).join('\n'),
        messageType: mode,
        sessionId: gameId,
        useMocks: useMocks && messages.length < 2, // Only use mocks for the very first real interaction if enabled
      };
      
      const storyResult = await rulesAwareStoryTelling(storyInput);
      setLatestNarrative(storyResult.narrative);
      
      const newAssistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: storyResult.narrative,
      };
      setMessages((prev) => [...prev, newAssistantMessage]);

      if (mode === 'in-character') {
        setStory((prev) => `${prev}\n\n**GM:** ${storyResult.narrative}`);

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

  const generateInitialState = useCallback(async () => {
    setIsInitialLoading(true);
    try {
      // Generate character sheets in parallel
      const characterPrompts = characterPrompt?.split('\n').map(c => c.trim().replace(/^-/, '').trim()).filter(Boolean) || [];
      const characterPromises = characterPrompts.map(prompt => 
        generateCharacter({ characterPrompt: prompt, gameSystem: system, useMocks })
      );
      
      const characterResults = await Promise.all(characterPromises);
      setCharacters(characterResults as Character[]);

      const initialPlayerActions = campaignPrompt 
        ? `The Game Master has set the scene: "${campaignPrompt}". The players' characters are present. The party consists of: "${characterPrompt || 'A group of new adventurers'}". The players are ready to begin.`
        : `The players have just gathered for the first time, seeking adventure. The party consists of: "${characterPrompt || 'A group of new adventurers'}".`;

      const storyInput: RulesAwareStoryTellingInput = {
        gameSetting: activeSystemSettings.gameSetting,
        playerActions: initialPlayerActions,
        campaignHistory: 'This is the very beginning of the campaign.',
        messageType: 'in-character',
        sessionId: gameId,
        useMocks: useMocks,
      };
      
      const storyResult = await rulesAwareStoryTelling(storyInput);
      
      setLatestNarrative(storyResult.narrative);

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
      setIsInitialLoading(false);
    }
  }, [gameId, system, campaignPrompt, characterPrompt, toast, activeSystemSettings, useMocks]);

  useEffect(() => {
    generateInitialState();
  }, [generateInitialState]);

  const handleAddCharacter = async (name: string) => {
    if (name && !characters.some(c => c.name === name)) {
      try {
        const newCharacter = await generateCharacter({ characterPrompt: name, gameSystem: system, useMocks: false });
        setCharacters(prev => [...prev, newCharacter as Character]);
      } catch (e) {
         toast({ title: "Error", description: "Could not generate new character.", variant: "destructive"});
      }
    }
  };

  const handleRemoveCharacter = (name: string) => {
    setCharacters(prev => prev.filter(c => c.name !== name));
  };
  
  const handleEditCharacter = (oldName: string, newName: string) => {
    setCharacters(prev => prev.map(c => (c.name === oldName ? { ...c, name: newName } : c)));
  };

  const handleViewCharacter = (character: Character) => {
    setSelectedCharacterSheet(character);
  };

  const renderCharacterSheet = (character: Character) => {
    switch (system) {
      case 'dnd5e':
        return <CharacterSheetDnd5e character={character as Dnd5eCharacter | null} isLoading={false} />;
      case 'fate':
        return <CharacterSheetFate character={character as FateCharacter | null} isLoading={false} />;
      case 'starwars-ffg':
        return <CharacterSheetStarWars character={character as StarWarsCharacter | null} isLoading={false} />;
      default:
        return null;
    }
  }

  return (
    <div className="flex flex-col h-screen bg-background font-body">
      <Header gameId={gameId} />
      <main className="grid flex-1 grid-cols-1 gap-4 p-4 overflow-hidden lg:grid-cols-12">
        <div className="flex flex-col h-full col-span-1 gap-4 lg:col-span-8">
          <VisualStoryBoard story={story} imageUrl={imageUrl} isLoading={isInitialLoading} latestNarrative={latestNarrative} onSpeak={speak} />
        </div>
        <div className="flex flex-col h-full col-span-1 gap-4 overflow-hidden lg:col-span-4">
           <div className="flex-1 min-h-0">
             <ChatPanel messages={messages} onSendMessage={handleSendMessage} isLoading={isLoading} characters={characters.map(c => c.name)} isLocalPlay={true} />
          </div>
          <div className="flex flex-col flex-1 gap-4 min-h-0">
             <ActionTracker 
              characters={characters}
              onAddCharacter={handleAddCharacter}
              onRemoveCharacter={handleRemoveCharacter}
              onEditCharacter={handleEditCharacter}
              onViewCharacter={handleViewCharacter}
            />
            <RulesPanel sessionId={gameId} />
          </div>
        </div>
      </main>

      <Dialog open={!!selectedCharacterSheet} onOpenChange={(isOpen) => !isOpen && setSelectedCharacterSheet(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Character Sheet</DialogTitle>
          </DialogHeader>
          <div className="max-h-[80vh] overflow-y-auto pr-4">
            {selectedCharacterSheet && renderCharacterSheet(selectedCharacterSheet)}
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
