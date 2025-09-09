
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ListTodo, User, Plus, X, Pencil, FileText } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "@/lib/utils";
import type { 
  Dnd5eCharacter,
  FateCharacter,
  StarWarsCharacter,
} from "@/ai/flows/generate-character.types";

type Character = Dnd5eCharacter | FateCharacter | StarWarsCharacter;

interface ActionTrackerProps {
  characters: Character[];
  onAddCharacter: (prompt: string) => void;
  onRemoveCharacter: (name: string) => void;
  onEditCharacter: (oldName: string, newName: string) => void;
  onViewCharacter: (character: Character) => void;
}

export function ActionTracker({ characters, onAddCharacter, onRemoveCharacter, onEditCharacter, onViewCharacter }: ActionTrackerProps) {
  const [newCharacterName, setNewCharacterName] = useState("");
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editedValue, setEditedValue] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingName !== null && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingName]);

  const handleAddClick = () => {
    if (newCharacterName.trim()) {
      onAddCharacter(newCharacterName.trim());
      setNewCharacterName("");
    }
  };

  const handleAddKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddClick();
    }
  };
  
  const handleEditClick = (name: string) => {
    setEditingName(name);
    setEditedValue(name);
  };

  const handleEditSave = () => {
    if (editingName && editedValue.trim() && editingName !== editedValue.trim()) {
      onEditCharacter(editingName, editedValue.trim());
    }
    setEditingName(null);
    setEditedValue("");
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleEditSave();
    } else if (e.key === 'Escape') {
      setEditingName(null);
      setEditedValue("");
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
            placeholder="Describe a new character..."
            value={newCharacterName}
            onChange={(e) => setNewCharacterName(e.target.value)}
            onKeyPress={handleAddKeyPress}
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
                <div key={character.name} className="group flex items-center justify-between p-2 bg-secondary rounded-md text-sm">
                  <div className="flex items-center gap-2 w-full">
                    <User className="w-4 h-4 shrink-0" />
                    {editingName === character.name ? (
                       <Input 
                          ref={editInputRef}
                          value={editedValue}
                          onChange={(e) => setEditedValue(e.target.value)}
                          onBlur={handleEditSave}
                          onKeyDown={handleEditKeyDown}
                          className="h-7 text-sm"
                       />
                    ) : (
                      <span 
                        className="truncate cursor-pointer hover:text-accent"
                        onClick={() => handleEditClick(character.name)}
                      >
                        {character.name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => onViewCharacter(character)}>
                      <FileText className="w-3 h-3" />
                      <span className="sr-only">View {character.name}'s sheet</span>
                    </Button>
                    <Button variant="ghost" size="icon" className={cn("h-6 w-6 shrink-0", editingName === character.name ? "hidden": "")} onClick={() => handleEditClick(character.name)}>
                        <Pencil className="w-3 h-3" />
                        <span className="sr-only">Edit {character.name}</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => onRemoveCharacter(character.name)}>
                      <X className="w-4 h-4" />
                      <span className="sr-only">Remove {character.name}</span>
                    </Button>
                  </div>
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

    