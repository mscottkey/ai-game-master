import { Badge } from "@/components/ui/badge"
import Link from "next/link";

type HeaderProps = {
  gameId: string;
};

export function Header({ gameId }: HeaderProps) {
  return (
    <header className="flex items-center justify-between p-4 border-b border-border shadow-md shrink-0">
      <Link href="/">
        <h1 className="text-xl font-headline font-bold text-accent neon-glow">
          <span className="text-primary-foreground">Rolepl</span>AI
        </h1>
      </Link>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Session:</span>
        <Badge variant="outline">{gameId}</Badge>
      </div>
    </header>
  );
}
