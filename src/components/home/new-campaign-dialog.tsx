
"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Swords } from "lucide-react";

const gameSystems = [
  {
    id: "dnd5e",
    name: "Dungeons & Dragons 5e",
    description: "The classic fantasy role-playing game of swords and sorcery.",
  },
  {
    id: "fate",
    name: "FATE Core",
    description: "A flexible system for creating narrative-driven, proactive stories.",
  },
  {
    id: "starwars-ffg",
    name: "Star Wars (FFG)",
    description: "Adventure in a galaxy far, far away with narrative dice mechanics.",
  },
];

export function NewCampaignDialog() {
  const [selectedSystem, setSelectedSystem] = useState<string>("dnd5e");
  const newGameId = `session-${crypto.randomUUID().split('-')[0]}`;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="lg">
          <Swords className="mr-2" />
          Create New Campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose Your Game System</DialogTitle>
          <DialogDescription>
            Select a rule system to base your new campaign on.
          </DialogDescription>
        </DialogHeader>
        <RadioGroup
          value={selectedSystem}
          onValueChange={setSelectedSystem}
          className="space-y-3 pt-4"
        >
          {gameSystems.map((system) => (
            <Label
              key={system.id}
              htmlFor={system.id}
              className="flex items-start space-x-4 rounded-md border p-4 hover:bg-accent/50 has-[:checked]:border-primary"
            >
              <RadioGroupItem value={system.id} id={system.id} />
              <div className="grid gap-1.5">
                <span className="font-semibold">{system.name}</span>
                <span className="text-sm text-muted-foreground">
                  {system.description}
                </span>
              </div>
            </Label>
          ))}
        </RadioGroup>
        <DialogFooter>
          <Button asChild>
            <Link href={`/game/${newGameId}?system=${selectedSystem}`}>
              Start Campaign
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
