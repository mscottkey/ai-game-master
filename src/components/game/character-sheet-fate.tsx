import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { FateCharacter } from "@/ai/flows/generate-character";

interface CharacterSheetFateProps {
  character: FateCharacter | null;
  isLoading: boolean;
}

export function CharacterSheetFate({ character, isLoading }: CharacterSheetFateProps) {
    if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="space-y-2">
             <Skeleton className="h-12 w-full" />
             <Skeleton className="h-12 w-full" />
           </div>
           <Separator />
           <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!character) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Character</CardTitle>
          <CardDescription>Character data could not be loaded.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{character.name}</CardTitle>
        <CardDescription>{character.description}</CardDescription>
        <div className="flex items-center gap-4 pt-2">
           <Badge>Fate Points: {character.fatePoints}</Badge>
           <Badge variant="secondary">Refresh: {character.refresh}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2">Aspects</h4>
          <div className="space-y-2 text-sm">
            {character.aspects.map(aspect => (
              <div key={aspect.name} className="p-2 bg-secondary rounded-md">
                <p className="font-medium text-primary">{aspect.type}</p>
                <p className="text-muted-foreground">{aspect.name}</p>
              </div>
            ))}
          </div>
        </div>
        <Separator />
        <div>
          <h4 className="font-semibold mb-2">Skills</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {character.skills.sort((a,b) => b.rank - a.rank).map(skill => (
              <div key={skill.name} className="flex justify-between p-2 bg-secondary rounded-md">
                <span className="font-medium">{skill.name}</span>
                <span className="font-bold text-accent">+{skill.rank}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
