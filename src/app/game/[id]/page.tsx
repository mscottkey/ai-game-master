
'use client';

import { useState } from 'react';
import { GameClient } from './game-client';
import { CharacterCreationClient } from './character-creation-client';

type GameState = 'initializing' | 'character-creation' | 'in-progress';

export default function GamePage({
  params: { id },
  searchParams,
}: {
  params: { id: string };
  searchParams: { 
    system?: string,
    campaign?: string,
    character?: string 
  };
}) {
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
