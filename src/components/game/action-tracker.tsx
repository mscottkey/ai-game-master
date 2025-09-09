
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ListTodo, User, Plus, X } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";

interface ActionTrackerProps {
  characters: string[];
  onAddCharacter: (name: string) => void;
  onRemoveCharacter: (name: string) => void;
}

export function ActionTracker({ characters, onAddCharacter, onRemoveCharacter }: ActionTrackerProps) {
  const [newCharacterName, setNewCharacterName] = useState("");

  const handleAddClick = () => {
    if (newCharacterName.trim()) {
      onAddCharacter(newCharacterName.trim());
      setNewCharacterName("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddClick();
    }
  };

  return (
    <Card className="flex flex-col w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListTodo className="w-5 h-5" />
          Action Tracker
        </CardTitle>
        <CardDescription>
          The characters in the current scene.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 min-h-0">
        <div className="flex gap-2">
          <Input
            placeholder="New character name..."
            value={newCharacterName}
            onChange={(e) => setNewCharacterName(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <Button onClick={handleAddClick} size="icon">
            <Plus />
            <span className="sr-only">Add Character</span>
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="space-y-2 pr-2">
            {characters.length > 0 ? (
              characters.map(character => (
                <div key={character} className="flex items-center justify-between p-2 bg-secondary rounded-md text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{character}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onRemoveCharacter(character)}>
                    <X className="w-4 h-4" />
                    <span className="sr-only">Remove {character}</span>
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center text-sm text-muted-foreground py-4">
                <p>No characters in the scene.</p>
                <p>Add some characters to get started!</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
