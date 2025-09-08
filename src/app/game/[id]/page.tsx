import { GameClient } from './game-client';

export default function GamePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { 
    system?: string,
    campaign?: string,
    character?: string 
  };
}) {
  return <GameClient 
    gameId={params.id} 
    system={searchParams.system || 'dnd5e'}
    campaignPrompt={searchParams.campaign}
    characterPrompt={searchParams.character}
  />;
}
