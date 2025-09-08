import type { Npc } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, Plus, Volume2, Loader2 } from 'lucide-react';

type NpcPanelProps = {
  npcs: Npc[];
  onGenerateNpcs: () => void;
  isLoading: boolean;
  speak: (text: string) => void;
};

export function NpcPanel({ npcs, onGenerateNpcs, isLoading, speak }: NpcPanelProps) {
  return (
    <Card className="flex-1 flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Non-Player Characters
          </div>
          <Button size="sm" onClick={onGenerateNpcs} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            <span className="sr-only">Generate NPCs</span>
          </Button>
        </CardTitle>
        <CardDescription>Characters you meet on your journey.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="space-y-4">
            {npcs.length === 0 && !isLoading && (
              <div className="text-center text-sm text-muted-foreground py-8">
                <p>No other characters are here yet.</p>
                <p>Generate some to liven up the scene!</p>
              </div>
            )}
            {npcs.map((npc, index) => (
              <div key={index} className="p-3 bg-secondary rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-bold">{npc.name}</h5>
                    <p className="text-xs text-muted-foreground italic">&quot;{npc.voice}&quot;</p>
                  </div>
                  <Button size="icon" variant="ghost" className="w-8 h-8" onClick={() => speak(`My name is ${npc.name}. ${npc.motivation}`)}>
                    <Volume2 className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm mt-2">{npc.personality}</p>
              </div>
            ))}
             {isLoading && (
                <div className="text-center text-sm text-muted-foreground py-8 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <p>Summoning new characters...</p>
                </div>
              )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
