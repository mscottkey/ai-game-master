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

import { Header } from '@/components/game/header';
import { VisualStoryBoard } from '@/components/game/visual-story-board';
import { ChatPanel } from '@/components/game/chat-panel';
import { CharacterSheet } from '@/components/game/character-sheet';
import { DiceRoller } from '@/components/game/dice-roller';
import { NpcPanel } from '@/components/game/npc-panel';
import { useToast } from '@/hooks/use-toast';
import { useTTS } from '@/hooks/use-tts';

export function GameClient({ gameId }: { gameId: string }) {
  const { toast } = useToast();
  const { speak, isSpeaking } = useTTS();

  const [messages, setMessages] = useState<Message[]>([]);
  const [story, setStory] = useState('The adventure is about to begin...');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [npcs, setNpcs] = useState<Npc[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isNpcLoading, setIsNpcLoading] = useState(false);
  const [isInitialStoryLoading, setIsInitialStoryLoading] = useState(true);

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
        gameSetting: 'A high-fantasy world teetering on the brink of a magical war.',
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
      generateImage({ prompt: `Fantasy RPG illustration, cinematic, ${storyResult.narrative}` })
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
        settingDescription: 'A bustling fantasy city tavern called The Prancing Pony.',
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

  const generateInitialStory = useCallback(async () => {
    setIsInitialStoryLoading(true);
    try {
       const storyInput: DynamicStoryTellingInput = {
        gameSetting: 'A high-fantasy world named Eldoria. The players are in a tavern called The Sleeping Dragon.',
        playerActions: 'The players have just gathered for the first time, seeking fame and fortune.',
        campaignHistory: 'This is the very beginning of the campaign.',
      };
      
      const storyResult = await dynamicStoryTelling(storyInput);
      const initialMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: storyResult.narrative,
      };

      setMessages([initialMessage]);
      setStory(storyResult.narrative);
      
      const imageResult = await generateImage({ prompt: `Fantasy RPG tavern interior, cinematic, adventurers meeting. ${storyResult.narrative}` });
      setImageUrl(imageResult.imageUrl);

    } catch (error) {
      console.error("Initial story generation failed:", error);
      setStory("Welcome, adventurers! Your journey begins now. Tell me, what do you do first?");
      setMessages([{ id: 'error-1', role: 'assistant', content: "The AI Game Master is currently asleep. Let's start with a default scenario." }]);
    } finally {
      setIsInitialStoryLoading(false);
    }
  }, []);

  useEffect(() => {
    generateInitialStory();
  }, [generateInitialStory]);

  return (
    <div className="flex flex-col h-screen bg-background font-body">
      <Header gameId={gameId} />
      <main className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-4 p-4">
        {/* Left Panel */}
        <div className="hidden lg:flex lg:flex-col lg:col-span-3 gap-4 overflow-y-auto">
          <CharacterSheet />
          <NpcPanel npcs={npcs} onGenerateNpcs={handleGenerateNpcs} isLoading={isNpcLoading} speak={speak} />
        </div>

        {/* Center Panel */}
        <div className="flex flex-col col-span-1 lg:col-span-6 h-full overflow-hidden">
           <VisualStoryBoard story={story} imageUrl={imageUrl} isLoading={isInitialStoryLoading} />
           <ChatPanel messages={messages} onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>

        {/* Right Panel */}
        <div className="hidden lg:flex lg:flex-col lg:col-span-3 gap-4 overflow-y-auto">
          <DiceRoller />
        </div>
      </main>
    </div>
  );
}
