import { Dices } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface LoadingStateProps {
  message: string;
}

export function LoadingState({ message }: LoadingStateProps) {
  return (
    <Card className="flex-1 flex flex-col items-center justify-center bg-transparent border-dashed">
      <CardContent className="text-center p-6">
        <Dices className="w-12 h-12 text-accent mx-auto mb-4 animate-shake" />
        <p className="text-lg font-semibold text-accent">{message}</p>
        <p className="text-sm text-muted-foreground">Please wait a moment...</p>
      </CardContent>
    </Card>
  );
}