import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const aspects = [
  { type: "High Concept", name: "Cynical Ex-Cop Turned Private Eye" },
  { type: "Trouble", name: "A Knack for Finding the Wrong Kind of Trouble" },
  { type: "Relationship", name: "Owes a Favor to the City's Biggest Crime Boss" },
];

const skills = [
  { name: "Investigate", rank: "+4" },
  { name: "Shoot", rank: "+3" },
  { name: "Deceive", rank: "+3" },
  { name: "Drive", rank: "+2" },
  { name: "Contacts", rank: "+2" },
  { name: "Will", rank: "+1" },
];

export function CharacterSheetFate() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Jax 'The Ghost' Riley</CardTitle>
        <CardDescription>Noir Detective (FATE Core)</CardDescription>
        <div className="flex items-center gap-4 pt-2">
           <Badge>Fate Points: 3</Badge>
           <Badge variant="secondary">Refresh: 3</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2">Aspects</h4>
          <div className="space-y-2 text-sm">
            {aspects.map(aspect => (
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
            {skills.map(skill => (
              <div key={skill.name} className="flex justify-between p-2 bg-secondary rounded-md">
                <span className="font-medium">{skill.name}</span>
                <span className="font-bold text-accent">{skill.rank}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
