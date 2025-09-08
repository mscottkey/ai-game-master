import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ListTodo, User } from "lucide-react";

interface ActionTrackerProps {
  characterPrompt?: string;
}

export function ActionTracker({ characterPrompt }: ActionTrackerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListTodo className="w-5 h-5" />
          Action Tracker
        </CardTitle>
        <CardDescription>
          What's happening and who's next.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {characterPrompt ? (
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2"><User className="w-4 h-4" /> Player Characters</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-secondary p-3 rounded-md">{characterPrompt}</p>
          </div>
        ) : (
          <div className="text-center text-sm text-muted-foreground py-4">
            <p>The scene is being set...</p>
            <p>The Game Master will guide the action.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
