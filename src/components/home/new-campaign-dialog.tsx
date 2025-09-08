
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
import { Textarea } from "@/components/ui/textarea";
import { Swords, ArrowRight, ArrowLeft, Dices } from "lucide-react";
import { generatePrompt, systemPlaceholders } from "@/lib/prompt-generator";

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

type Step = "system" | "setup";

export function NewCampaignDialog() {
  const [step, setStep] = useState<Step>("system");
  const [selectedSystem, setSelectedSystem] = useState<string>("dnd5e");
  const [campaignPrompt, setCampaignPrompt] = useState("");
  const [characterPrompt, setCharacterPrompt] = useState("");

  const newGameId = `session-${crypto.randomUUID().split('-')[0]}`;

  const handleNext = () => {
    if (step === "system") {
      setStep("setup");
    }
  };
  
  const handleBack = () => {
    if (step === "setup") {
      setStep("system");
    }
  }

  const handleRandomizeCampaign = () => {
    setCampaignPrompt(generatePrompt(selectedSystem, 'campaign'));
  }

  const handleRandomizeCharacter = () => {
    setCharacterPrompt(generatePrompt(selectedSystem, 'character'));
  }

  const getStartLink = () => {
    const params = new URLSearchParams();
    params.set("system", selectedSystem);
    if (campaignPrompt) {
      params.set("campaign", campaignPrompt);
    }
    if (characterPrompt) {
      params.set("character", characterPrompt);
    }
    return `/game/${newGameId}?${params.toString()}`;
  }


  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="lg">
          <Swords className="mr-2" />
          Create New Campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {step === "system" && (
          <>
            <DialogHeader>
              <DialogTitle>Step 1: Choose Your Game System</DialogTitle>
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
                  className="flex items-start space-x-4 rounded-md border p-4 hover:bg-accent/50 has-[:checked]:border-primary transition-colors"
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
              <Button onClick={handleNext}>
                Next <ArrowRight className="ml-2" />
              </Button>
            </DialogFooter>
          </>
        )}
        {step === "setup" && (
          <>
            <DialogHeader>
              <DialogTitle>Step 2: Setup Your Campaign</DialogTitle>
              <DialogDescription>
                Describe the starting scenario for your adventure and your character.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="campaign-prompt">Campaign Prompt</Label>
                  <Button variant="ghost" size="sm" onClick={handleRandomizeCampaign}>
                    <Dices className="mr-2 h-4 w-4" />
                    Randomize
                  </Button>
                </div>
                <Textarea
                  id="campaign-prompt"
                  value={campaignPrompt}
                  onChange={(e) => setCampaignPrompt(e.target.value)}
                  placeholder={systemPlaceholders[selectedSystem]?.campaign || "Describe the starting scene..."}
                />
              </div>
               <div className="space-y-2">
                 <div className="flex items-center justify-between">
                    <Label htmlFor="character-prompt">Your Character</Label>
                     <Button variant="ghost" size="sm" onClick={handleRandomizeCharacter}>
                      <Dices className="mr-2 h-4 w-4" />
                      Randomize
                    </Button>
                 </div>
                <Textarea
                  id="character-prompt"
                  value={characterPrompt}
                  onChange={(e) => setCharacterPrompt(e.target.value)}
                  placeholder={systemPlaceholders[selectedSystem]?.character || "Describe your character..."}
                />
              </div>
            </div>
            <DialogFooter className="flex justify-between w-full">
              <Button variant="outline" onClick={handleBack}>
                 <ArrowLeft className="mr-2" /> Back
              </Button>
              <Button asChild>
                <Link href={getStartLink()}>
                  Start Campaign
                </Link>
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
