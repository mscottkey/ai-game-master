import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Shield, Swords, Wand2, Heart, Star, Book } from "lucide-react";

const stats = [
  { name: 'Strength', value: 16, icon: <Swords className="w-4 h-4 text-red-400" /> },
  { name: 'Dexterity', value: 14, icon: <Book className="w-4 h-4 text-green-400" /> },
  { name: 'Wisdom', value: 12, icon: <Wand2 className="w-4 h-4 text-blue-400" /> },
  { name: 'Charisma', value: 18, icon: <Star className="w-4 h-4 text-yellow-400" /> },
];

const inventory = ["Health Potion", "Rope (50ft)", "Ancient Scroll"];
const abilities = ["Fireball", "Inspiring Word"];

export function CharacterSheet() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Kaelen, the Bold</CardTitle>
        <CardDescription>Level 5 Human Paladin</CardDescription>
        <div className="flex items-center gap-4 pt-2">
           <div className="flex items-center gap-2 text-red-400">
             <Heart className="w-4 h-4"/>
             <span>45 / 45 HP</span>
           </div>
           <div className="flex items-center gap-2 text-blue-400">
             <Shield className="w-4 h-4"/>
             <span>18 AC</span>
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
            {inventory.map(item => <li key={item}>{item}</li>)}
          </ul>
        </div>
        <Separator />
        <div>
          <h4 className="font-semibold mb-2">Abilities</h4>
          <div className="flex flex-wrap gap-2">
            {abilities.map(ability => (
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
