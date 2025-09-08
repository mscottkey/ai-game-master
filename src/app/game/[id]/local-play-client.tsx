
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
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

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
      const storyInput: DynamicStoryTellingInput = {
        gameSetting: activeSystemSettings.gameSetting,
        playerActions: content,
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


  return (
    <div className="flex flex-col h-screen bg-background font-body">
      <Header gameId={gameId} />
      <main className="flex-1 flex flex-col overflow-hidden gap-4 p-4">
        <div className="flex-shrink-0 h-1/2">
            <VisualStoryBoard story={story} imageUrl={imageUrl} isLoading={isInitialLoading} />
        </div>
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden">
          <div className="lg:col-span-8 h-full">
            <ChatPanel messages={messages} onSendMessage={handleSendMessage} isLoading={isLoading} />
          </div>
          <div className="hidden lg:flex lg:col-span-4 h-full">
            <ActionTracker characterPrompt={characterPrompt} />
          </div>
        </div>
      </main>
    </div>
  );
}
