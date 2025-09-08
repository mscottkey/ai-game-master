import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

type VisualStoryBoardProps = {
  story: string;
  imageUrl: string | null;
  isLoading: boolean;
};

export function VisualStoryBoard({ story, imageUrl, isLoading }: VisualStoryBoardProps) {
  return (
    <Card className="flex-shrink-0 flex flex-col h-1/2 border-b-0 rounded-b-none">
      <div className="relative w-full h-3/5">
        {isLoading ? (
           <Skeleton className="w-full h-full rounded-t-lg" />
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
          <p className="text-sm text-foreground/90 leading-relaxed">
            {isLoading ? <Skeleton className="h-4 w-3/4" /> : story}
          </p>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
