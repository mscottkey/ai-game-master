
'use client';

import type { Message } from 'ai/react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '../ui/card';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

type MessageMode = 'in-character' | 'out-of-character';

type ChatPanelProps = {
  messages: Message[];
  onSendMessage: (content: string, mode: MessageMode, character?: string) => void;
  isLoading: boolean;
  characters?: string[];
  isLocalPlay?: boolean;
};

export function ChatPanel({ messages, onSendMessage, isLoading, characters = [], isLocalPlay = false }: ChatPanelProps) {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<MessageMode>('in-character');
  const [selectedCharacter, setSelectedCharacter] = useState<string>('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  useEffect(() => {
    // If a character is selected but no longer exists, reset it.
    if (selectedCharacter && !characters.includes(selectedCharacter)) {
      setSelectedCharacter('');
    }
    // If no character is selected and there are characters, select the first one.
    if (!selectedCharacter && characters.length > 0) {
      setSelectedCharacter(characters[0]);
    }
  }, [characters, selectedCharacter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      const characterToUse = isLocalPlay && mode === 'in-character' ? selectedCharacter : undefined;
      if (isLocalPlay && mode === 'in-character' && !characterToUse) {
        // Optionally, add a toast or alert to select a character first
        return;
      }
      onSendMessage(input.trim(), mode, characterToUse);
      setInput('');
    }
  };

  const showCharacterSelector = isLocalPlay && mode === 'in-character' && characters.length > 0;

  return (
    <Card className="flex flex-col flex-1 h-full">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                'flex items-start gap-3',
                m.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {m.role === 'assistant' && (
                <div className="p-2 bg-primary/20 rounded-full">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
              )}
              <div
                className={cn(
                  'p-3 rounded-lg max-w-lg',
                  m.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary'
                )}
              >
                <p className="text-sm leading-snug whitespace-pre-wrap">{m.content}</p>
              </div>
              {m.role === 'user' && (
                <div className="p-2 bg-accent/20 rounded-full">
                  <User className="w-5 h-5 text-accent" />
                </div>
              )}
            </div>
          ))}
          {isLoading && messages.length > 0 && messages[messages.length-1].role === 'user' && (
             <div className="flex items-start gap-3 justify-start">
               <div className="p-2 bg-primary/20 rounded-full">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div className="p-3 rounded-lg bg-secondary flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">The GM is thinking...</span>
                </div>
             </div>
          )}
        </div>
      </ScrollArea>
      <div className="p-4 border-t space-y-2">
        <div className="flex items-center justify-end space-x-2">
          <Label htmlFor="message-mode" className="text-sm text-muted-foreground">
            {mode === 'in-character' ? 'In-Character Action' : 'Out-of-Character Question'}
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Switch 
                  id="message-mode" 
                  checked={mode === 'out-of-character'}
                  onCheckedChange={(checked) => setMode(checked ? 'out-of-character' : 'in-character')}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle to ask the GM a question directly without your character taking an action.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          {showCharacterSelector && (
            <Select value={selectedCharacter} onValueChange={setSelectedCharacter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Character" />
              </SelectTrigger>
              <SelectContent>
                {characters.map(char => (
                  <SelectItem key={char} value={char}>{char}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'in-character' ? 'What do you do?' : 'Ask the GM anything...'}
            disabled={isLoading || (showCharacterSelector && !selectedCharacter)}
            autoComplete="off"
          />
          <Button type="submit" disabled={isLoading || !input.trim() || (showCharacterSelector && !selectedCharacter)} size="icon">
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </Card>
  );
}
