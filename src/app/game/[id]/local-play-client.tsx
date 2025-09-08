
"use client";

import type { Message } from 'ai/react';
import { useState, useEffect, useCallback } from 'react';
import {
  dynamicStoryTelling,
  DynamicStoryTellingInput,
} from '@/ai/flows/dynamic-story-telling';
import { generateImage } from '@/ai/flows/ai-generated-images';
import { useToast } from '@/hooks/use-toast';
import type { GameClientProps } from './game-client';
import { Header } from '@/components/game/header';
import { VisualStoryBoard } from '@/components/game/visual-story-board';
import { ChatPanel } from '@/components/game/chat-panel';
import { ActionTracker } from '@/components/game/action-tracker';

type GameSystem = 'dnd5e' | 'fate' | 'starwars-ffg';
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

export function LocalPlayClient({ gameId, system, campaignPrompt, characterPrompt }: GameClientProps) {
  const { toast } = useToast();

  const [messages, setMessages] = useState<Message[]>([]);
  const [story, setStory] = useState('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [characters, setCharacters] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    if (characterPrompt) {
      // Split by newline and filter out empty lines
      const initialCharacters = characterPrompt.split('\n').map(c => c.trim().replace(/^-/, '').trim()).filter(Boolean);
      setCharacters(initialCharacters);
    }
  }, [characterPrompt]);

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
      const storyInput: DynamicStoryTellingInput = {
        gameSetting: activeSystemSettings.gameSetting,
        playerActions: playerMessageContent, // Send combined content to AI
        campaignHistory: messages.map(m => `${m.role}: ${m.content}`).join('\n'),
        messageType: mode,
      };
      
      const storyResult = await dynamicStoryTelling(storyInput);
      
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
      const initialPlayerActions = campaignPrompt 
        ? `The Game Master has set the scene: "${campaignPrompt}". The players' characters are present. The party consists of: "${characterPrompt || 'A group of new adventurers'}". The players are ready to begin.`
        : `The players have just gathered for the first time, seeking adventure. The party consists of: "${characterPrompt || 'A group of new adventurers'}".`;

      const storyInput: DynamicStoryTellingInput = {
        gameSetting: activeSystemSettings.gameSetting,
        playerActions: initialPlayerActions,
        campaignHistory: 'This is the very beginning of the campaign.',
        messageType: 'in-character',
      };
      
      const storyResult = await dynamicStoryTelling(storyInput);

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
  }, [system, campaignPrompt, characterPrompt, toast, activeSystemSettings]);

  useEffect(() => {
    generateInitialState();
  }, [generateInitialState]);

  const handleAddCharacter = (name: string) => {
    if (name && !characters.includes(name)) {
      setCharacters(prev => [...prev, name]);
    }
  };

  const handleRemoveCharacter = (name: string) => {
    setCharacters(prev => prev.filter(c => c !== name));
  };

  return (
    <div className="flex flex-col h-screen bg-background font-body">
      <Header gameId={gameId} />
      <main className="flex-1 flex flex-col overflow-hidden gap-4 p-4">
        <div className="flex-[2_2_0%]">
            <VisualStoryBoard story={story} imageUrl={imageUrl} isLoading={isInitialLoading} />
        </div>
        <div className="flex-[1_1_0%] grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden">
          <div className="lg:col-span-8 h-full">
            <ChatPanel messages={messages} onSendMessage={handleSendMessage} isLoading={isLoading} characters={characters} isLocalPlay={true} />
          </div>
          <div className="hidden lg:flex lg:col-span-4 h-full">
            <ActionTracker 
              characters={characters}
              onAddCharacter={handleAddCharacter}
              onRemoveCharacter={handleRemoveCharacter}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
