import { GameClient } from './game-client';

export default function GamePage({ params }: { params: { id: string } }) {
  return <GameClient gameId={params.id} />;
}
