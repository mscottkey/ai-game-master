"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dices } from 'lucide-react';
import { cn } from '@/lib/utils';

const diceTypes = [4, 6, 8, 10, 12, 20];

export function DiceRoller() {
  const [result, setResult] = useState<number | null>(null);
  const [dice, setDice] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);

  const rollDice = (sides: number) => {
    setRolling(true);
    setDice(sides);
    setResult(null);

    setTimeout(() => {
      const roll = Math.floor(Math.random() * sides) + 1;
      setResult(roll);
      setRolling(false);
    }, 500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dices className="w-5 h-5" />
          Dice Roller
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="h-24 w-24 bg-secondary rounded-lg flex items-center justify-center">
          <span
            className={cn(
              "text-4xl font-bold transition-transform duration-500",
              rolling ? 'animate-spin' : '',
              result !== null && result <= 1 && 'text-red-500',
              result !== null && dice !== null && result >= dice && 'text-green-500'
            )}
          >
            {result ?? '?'}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 w-full">
          {diceTypes.map((sides) => (
            <Button
              key={sides}
              variant="outline"
              onClick={() => rollDice(sides)}
              disabled={rolling}
            >
              d{sides}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
