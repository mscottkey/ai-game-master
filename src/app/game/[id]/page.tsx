
'use client';

import { useState, use } from 'react';
import { GameClient } from './game-client';
import { CharacterCreationClient } from './character-creation-client';

type GameState = 'initializing' | 'character-creation' | 'in-progress';

// The 'params' object is now a Promise that needs to be unwrapped
// This is a feature of the Next.js App Router
type GamePageProps = {
  params: Promise<{ id: string }>;
  searchParams: { 
    system?: string,
    campaign?: string,
    character?: string 
  };
}

export default function GamePage({
  params: paramsPromise,
  searchParams,
}: GamePageProps) {
  // We use React's `use` hook to unwrap the Promise
  const params = use(paramsPromise);
  const { id } = params;
  
  const [gameState, setGameState] = useState<GameState>('character-creation');

  // For now, we'll just have a simple button to move from creation to gameplay
  // This will be replaced with more complex logic later.
  const handleCreationComplete = () => {
    setGameState('in-progress');
  };

  const gameProps = {
    gameId: id,
    system: searchParams.system || 'dnd5e',
    campaignPrompt: searchParams.campaign,
    characterPrompt: searchParams.character,
  };

  switch (gameState) {
    case 'character-creation':
      return <CharacterCreationClient {...gameProps} onCreationComplete={handleCreationComplete} />;
    case 'in-progress':
      return <GameClient {...gameProps} />;
    default:
      // You could have a loading spinner for 'initializing'
      return <div>Loading...</div>;
  }
}
