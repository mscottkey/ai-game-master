import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LoadingState } from "./loading-state";

type VisualStoryBoardProps = {
  story: string;
  imageUrl: string;
  isLoading: boolean;
};

export function VisualStoryBoard({ story, imageUrl, isLoading }: VisualStoryBoardProps) {
  return (
    <Card className="flex-shrink-0 flex flex-col h-1/2">
      <div className="relative w-full h-3/5">
        {isLoading ? (
          <div className="w-full h-full bg-secondary rounded-t-lg flex items-center justify-center">
             <LoadingState message="Setting the scene..." />
          </div>
        ) : imageUrl ? (
          <Image
            src={imageUrl}
            alt="AI-generated scene"
            fill
            className="object-cover rounded-t-lg"
            data-ai-hint="fantasy scene"
          />
        ) : (
          <div className="w-full h-full bg-secondary rounded-t-lg flex items-center justify-center">
            <p className="text-muted-foreground">Waiting for the scene to unfold...</p>
          </div>
        )}
      </div>
      <CardContent className="p-4 flex-1">
        <ScrollArea className="h-full">
          <div className="text-sm text-foreground/90 leading-relaxed">
            {isLoading ? (
               <div className="text-center text-muted-foreground">The Game Master is weaving the opening narrative...</div>
            ) : story}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
