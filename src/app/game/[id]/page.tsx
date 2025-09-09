
'use client';

import { useState, use } from 'react';
import { GameClient } from './game-client';
import { CharacterCreationClient } from './character-creation-client';
import { LocalPlayClient } from './local-play-client';

type GameState = 'character-creation' | 'in-progress';

// The 'params' and 'searchParams' objects are now Promises that need to be unwrapped
// This is a feature of the Next.js App Router
type GamePageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ 
    system?: string,
    campaign?: string,
    character?: string,
    local?: string,
    useMocks?: string,
  }>;
}

export default function GamePage({
  params: paramsPromise,
  searchParams: searchParamsPromise,
}: GamePageProps) {
  // We use React's `use` hook to unwrap the Promises
  const params = use(paramsPromise);
  const searchParams = use(searchParamsPromise);
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
    useMocks: searchParams.useMocks === 'true',
  };

  if (searchParams.local === 'true') {
    return <LocalPlayClient {...gameProps} />;
  }

  switch (gameState) {
    case 'character-creation':
      return <CharacterCreationClient {...gameProps} onCreationComplete={handleCreationComplete} />;
    case 'in-progress':
      return <GameClient {...gameProps} />;
    default:
      // You could have a loading spinner for 'initializing'
      return <CharacterCreationClient {...gameProps} onCreationComplete={handleCreationComplete} />;
  }
}
