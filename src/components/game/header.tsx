import { Badge } from "@/components/ui/badge"

type HeaderProps = {
  gameId: string;
};

export function Header({ gameId }: HeaderProps) {
  return (
    <header className="flex items-center justify-between p-4 border-b border-border shadow-md shrink-0">
      <h1 className="text-xl font-headline font-bold text-accent neon-glow">
        AI Dungeon Master
      </h1>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Session:</span>
        <Badge variant="outline">{gameId}</Badge>
      </div>
    </header>
  );
}
