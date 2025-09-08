import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Swords } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function Home() {
  const newGameId = `session-${Math.random().toString(36).substr(2, 9)}`;

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
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href={`/game/${newGameId}`}>
              <Swords className="mr-2" />
              Create New Campaign
            </Link>
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="lg">
                <BookOpen className="mr-2" />
                Join Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Join Existing Campaign</DialogTitle>
                <DialogDescription>
                  Enter the session code provided by your Game Master to join the adventure.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="session-code" className="text-right">
                    Session Code
                  </Label>
                  <Input id="session-code" placeholder="Enter code..." className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Join Session</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
      <footer className="z-10 mt-16 text-sm text-muted-foreground">
        <p>Powered by Genkit and Firebase.</p>
      </footer>
    </div>
  );
}
