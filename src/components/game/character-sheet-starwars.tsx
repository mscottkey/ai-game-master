import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const characteristics = [
  { name: "Brawn", value: 3 },
  { name: "Agility", value: 4 },
  { name: "Intellect", value: 2 },
  { name: "Cunning", value: 3 },
  { name: "Willpower", value: 2 },
  { name: "Presence", value: 2 },
];

const skills = ["Gunnery", "Piloting (Space)", "Ranged (Heavy)"];
const talents = ["Expert Tracker", "Grit"];

export function CharacterSheetStarWars() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Zor-El</CardTitle>
        <CardDescription>Trandoshan Bounty Hunter (Star Wars FFG)</CardDescription>
        <div className="flex items-center gap-4 pt-2">
           <div className="flex items-center gap-2">
             <span>Wounds:</span>
             <Badge>8 / 14</Badge>
           </div>
           <div className="flex items-center gap-2">
             <span>Strain:</span>
             <Badge variant="secondary">5 / 12</Badge>
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
            {skills.map(item => <Badge key={item}>{item}</Badge>)}
            {talents.map(item => <Badge variant="outline" key={item}>{item}</Badge>)}
          </div>
        </div>
         <Separator />
        <div>
          <h4 className="font-semibold mb-2">Motivation & Obligation</h4>
          <p className="text-sm text-muted-foreground">
            <strong>Motivation:</strong> Fame <br />
            <strong>Obligation (10):</strong> Bounty
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
