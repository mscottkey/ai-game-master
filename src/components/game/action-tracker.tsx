import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ListTodo } from "lucide-react";

export function ActionTracker() {
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
        <div className="text-center text-sm text-muted-foreground py-4">
          <p>The scene is being set...</p>
          <p>The Game Master will guide the action.</p>
        </div>
      </CardContent>
    </Card>
  );
}
