"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dices, Plus, Minus } from 'lucide-react';

// Using SVGs for Star Wars dice for better visual representation
const SvgDice = ({ type, className }: { type: string, className?: string }) => {
  const icons: { [key: string]: React.ReactNode } = {
    ability: <svg viewBox="0 0 100 100" className={className}><polygon points="50,5 95,35 95,85 50,115 5,85 5,35" fill="#90EE90" stroke="black" strokeWidth="2" /></svg>,
    proficiency: <svg viewBox="0 0 100 100" className={className}><polygon points="50,5 95,25 95,75 50,95 5,75 5,25" fill="#FFFF00" stroke="black" strokeWidth="2" /></svg>,
    difficulty: <svg viewBox="0 0 100 100" className={className}><polygon points="50,5 95,35 95,85 50,115 5,85 5,35" fill="#A020F0" stroke="black" strokeWidth="2" /></svg>,
    challenge: <svg viewBox="0 0 100 100" className={className}><polygon points="50,5 95,25 95,75 50,95 5,75 5,25" fill="#FF0000" stroke="black" strokeWidth="2" /></svg>,
    boost: <svg viewBox="0 0 100 100" className={className}><rect x="15" y="15" width="70" height="70" fill="#ADD8E6" stroke="black" strokeWidth="2" /></svg>,
    setback: <svg viewBox="0 0 100 100" className={className}><rect x="15" y="15" width="70" height="70" fill="#A9A9A9" stroke="black" strokeWidth="2" /></svg>,
  };
  return icons[type];
};

type DiceType = 'ability' | 'proficiency' | 'difficulty' | 'challenge' | 'boost' | 'setback';

export function DiceRollerStarWars() {
  const [dicePool, setDicePool] = useState<Record<DiceType, number>>({
    ability: 2, proficiency: 1, difficulty: 2, challenge: 0, boost: 0, setback: 1,
  });
  const [result, setResult] = useState<string | null>(null);

  const updatePool = (type: DiceType, amount: number) => {
    setDicePool(prev => ({
      ...prev,
      [type]: Math.max(0, prev[type] + amount),
    }));
  };
  
  const rollDice = () => {
    // This is a simplified representation. A real implementation
    // would need to map dice faces to symbols (success, advantage, etc.) and cancel them out.
    const successes = dicePool.ability + dicePool.proficiency + dicePool.boost;
    const failures = dicePool.difficulty + dicePool.challenge + dicePool.setback;
    const final = successes - failures;
    setResult(`${final >= 0 ? 'Success' : 'Failure'} with net ${Math.abs(final)} symbols.`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dices className="w-5 h-5" />
          Dice Pool (Star Wars FFG)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {Object.keys(dicePool).map(key => (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SvgDice type={key} className="w-6 h-6" />
                <span className="capitalize">{key}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => updatePool(key as DiceType, -1)}><Minus /></Button>
                <span className="w-4 text-center font-bold">{dicePool[key as DiceType]}</span>
                <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => updatePool(key as DiceType, 1)}><Plus /></Button>
              </div>
            </div>
          ))}
        </div>
        <Button onClick={rollDice} className="w-full">Roll Dice Pool</Button>
        {result && <div className="text-center p-2 bg-secondary rounded-md font-bold">{result}</div>}
      </CardContent>
    </Card>
  );
}
