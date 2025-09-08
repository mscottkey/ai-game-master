import { GameClient } from './game-client';

export default function GamePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { system?: string };
}) {
  return <GameClient gameId={params.id} system={searchParams.system || 'dnd5e'} />;
}
