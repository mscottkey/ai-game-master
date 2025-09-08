
'use client';

import { Button } from "@/components/ui/button";
import { Header } from "@/components/game/header";
import type { GameClientProps } from "./game-client";

interface CharacterCreationClientProps extends GameClientProps {
  onCreationComplete: () => void;
}

export function CharacterCreationClient({ gameId, system, onCreationComplete }: CharacterCreationClientProps) {
  return (
    <div className="flex flex-col h-screen bg-background font-body">
      <Header gameId={gameId} />
      <main className="flex-1 flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-4xl font-headline font-bold mb-4">Character Creation</h1>
        <p className="text-muted-foreground mb-8">System: {system}</p>
        <p className="mb-8 max-w-lg">
          This is where the collaborative character creation process will happen. 
          Players will be able to join, discuss their party composition, and generate their characters together.
        </p>
        <Button onClick={onCreationComplete} size="lg">
          Start The Adventure!
        </Button>
      </main>
    </div>
  );
}
