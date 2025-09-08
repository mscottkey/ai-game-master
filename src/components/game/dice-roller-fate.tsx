"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dices, Minus, Plus, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

const FATE_SYMBOLS = {
  '-1': <Minus className="w-6 h-6 text-red-500" />,
  '0': <Square className="w-6 h-6 text-muted-foreground" />,
  '1': <Plus className="w-6 h-6 text-green-500" />,
};

type FateDie = keyof typeof FATE_SYMBOLS;

export function DiceRollerFate() {
  const [results, setResults] = useState<FateDie[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);

  const rollDice = () => {
    setRolling(true);
    setResults([]);
    setTotal(null);

    setTimeout(() => {
      let currentTotal = 0;
      const newResults: FateDie[] = [];
      for (let i = 0; i < 4; i++) {
        const roll = Math.floor(Math.random() * 3) - 1;
        currentTotal += roll;
        newResults.push(roll.toString() as FateDie);
      }
      setResults(newResults);
      setTotal(currentTotal);
      setRolling(false);
    }, 500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dices className="w-5 h-5" />
          FATE Dice
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="h-24 w-full bg-secondary rounded-lg flex items-center justify-center gap-2">
          {rolling ? (
            <span className="text-4xl font-bold animate-pulse">...</span>
          ) : results.length > 0 ? (
            <>
              <div className="flex gap-2">
                {results.map((res, i) => <span key={i}>{FATE_SYMBOLS[res]}</span>)}
              </div>
              <span className="text-4xl font-bold">=</span>
              <span className={cn("text-4xl font-bold", total !== null && total < 0 && 'text-red-500', total !== null && total > 0 && 'text-green-500')}>{total}</span>
            </>
          ) : (
             <span className="text-muted-foreground">Roll 4dF</span>
          )}
        </div>
        <Button
          className="w-full"
          size="lg"
          onClick={rollDice}
          disabled={rolling}
        >
          {rolling ? 'Rolling...' : 'Roll FATE Dice'}
        </Button>
      </CardContent>
    </Card>
  );
}
