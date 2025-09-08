import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { StarWarsCharacter } from "@/ai/flows/generate-character";

interface CharacterSheetStarWarsProps {
  character: StarWarsCharacter | null;
  isLoading: boolean;
}

export function CharacterSheetStarWars({ character, isLoading }: CharacterSheetStarWarsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
           <Separator />
           <Skeleton className="h-10 w-full" />
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

  const characteristics = [
      { name: "Brawn", value: character.characteristics.brawn },
      { name: "Agility", value: character.characteristics.agility },
      { name: "Intellect", value: character.characteristics.intellect },
      { name: "Cunning", value: character.characteristics.cunning },
      { name: "Willpower", value: character.characteristics.willpower },
      { name: "Presence", value: character.characteristics.presence },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{character.name}</CardTitle>
        <CardDescription>{character.species} {character.career}</CardDescription>
        <div className="flex items-center gap-4 pt-2">
           <div className="flex items-center gap-2">
             <span>Wounds:</span>
             <Badge>{character.wounds.current} / {character.wounds.threshold}</Badge>
           </div>
           <div className="flex items-center gap-2">
             <span>Strain:</span>
             <Badge variant="secondary">{character.strain.current} / {character.strain.threshold}</Badge>
           </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2">Characteristics</h4>
          <div className="grid grid-cols-3 gap-2 text-sm">
            {characteristics.map(stat => (
              <div key={stat.name} className="flex flex-col items-center justify-center p-2 bg-secondary rounded-md">
                <span className="font-medium">{stat.name}</span>
                <span className="text-2xl font-bold text-yellow-400">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
        <Separator />
        <div>
          <h4 className="font-semibold mb-2">Skills & Talents</h4>
          <div className="flex flex-wrap gap-2">
            {character.skills.map(item => <Badge key={item}>{item}</Badge>)}
            {character.talents.map(item => <Badge variant="outline" key={item}>{item}</Badge>)}
          </div>
        </div>
         <Separator />
        <div>
          <h4 className="font-semibold mb-2">Motivation & Obligation</h4>
          <p className="text-sm text-muted-foreground">
            <strong>Motivation:</strong> {character.motivation} <br />
            <strong>Obligation:</strong> {character.obligation}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
