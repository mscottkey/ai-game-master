
import { AuthGate } from "@/components/home/auth-gate";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      <main className="z-10 flex flex-col items-center text-center">
        <h1 className="text-5xl md:text-7xl font-headline font-bold text-accent neon-glow mb-4">
          AI Dungeon Master
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8">
          Your personal AI-powered Game Master for limitless tabletop RPG adventures. Create dynamic campaigns, generate unique worlds, and play with friends in real-time.
        </p>
        <AuthGate />
      </main>
      <footer className="z-10 mt-16 text-sm text-muted-foreground">
        <p>Powered by Genkit and Firebase.</p>
      </footer>
    </div>
  );
}
