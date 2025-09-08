import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Shield, Swords, Wand2, Heart, Star, Book } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Dnd5eCharacter } from "@/ai/flows/generate-character";

interface CharacterSheetDnd5eProps {
  character: Dnd5eCharacter | null;
  isLoading: boolean;
}

export function CharacterSheetDnd5e({ character, isLoading }: CharacterSheetDnd5eProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Separator />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
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
  
  const stats = [
    { name: 'Strength', value: character.stats.strength, icon: <Swords className="w-4 h-4 text-red-400" /> },
    { name: 'Dexterity', value: character.stats.dexterity, icon: <Book className="w-4 h-4 text-green-400" /> },
    { name: 'Wisdom', value: character.stats.wisdom, icon: <Wand2 className="w-4 h-4 text-blue-400" /> },
    { name: 'Charisma', value: character.stats.charisma, icon: <Star className="w-4 h-4 text-yellow-400" /> },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{character.name}</CardTitle>
        <CardDescription>Level {character.level} {character.race} {character.class}</CardDescription>
        <div className="flex items-center gap-4 pt-2">
           <div className="flex items-center gap-2 text-red-400">
             <Heart className="w-4 h-4"/>
             <span>{character.hp} / {character.hp} HP</span>
           </div>
           <div className="flex items-center gap-2 text-blue-400">
             <Shield className="w-4 h-4"/>
             <span>{character.ac} AC</span>
           </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2">Stats</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {stats.map(stat => (
              <div key={stat.name} className="flex items-center gap-2 p-2 bg-secondary rounded-md">
                {stat.icon}
                <span className="font-medium">{stat.name}:</span>
                <span>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
        <Separator />
        <div>
          <h4 className="font-semibold mb-2">Inventory</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            {character.inventory.map(item => <li key={item}>{item}</li>)}
          </ul>
        </div>
        <Separator />
        <div>
          <h4 className="font-semibold mb-2">Abilities</h4>
          <div className="flex flex-wrap gap-2">
            {character.abilities.map(ability => (
              <div key={ability} className="px-2 py-1 bg-primary/20 text-primary-foreground/80 text-xs rounded-full">
                {ability}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
