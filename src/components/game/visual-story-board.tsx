
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LoadingState } from "./loading-state";
import ReactMarkdown from 'react-markdown';
import { Button } from "../ui/button";
import { Volume2 } from "lucide-react";

type VisualStoryBoardProps = {
  story: string;
  imageUrl: string;
  isLoading: boolean;
  latestNarrative: string;
  onSpeak: (text: string) => void;
};

export function VisualStoryBoard({ story, imageUrl, isLoading, latestNarrative, onSpeak }: VisualStoryBoardProps) {
  return (
    <Card className="flex-shrink-0 flex flex-col h-full">
      <div className="relative w-full h-full">
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
      <CardContent className="p-4 flex-1 relative">
         {latestNarrative && (
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-4 right-4 z-10"
            onClick={() => onSpeak(latestNarrative)}
            aria-label="Read latest narrative aloud"
          >
            <Volume2 />
          </Button>
        )}
        <ScrollArea className="h-full">
          {isLoading ? (
            <div className="text-center text-muted-foreground">The Game Master is weaving the opening narrative...</div>
          ) : (
            <ReactMarkdown 
              className="prose prose-sm prose-invert max-w-none pr-10"
              components={{
                p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                strong: ({node, ...props}) => <strong className="font-bold text-foreground" {...props} />,
                em: ({node, ...props}) => <em className="italic text-foreground/90" {...props} />,
                blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-accent pl-4 italic text-muted-foreground" {...props} />,
              }}
            >
              {story}
            </ReactMarkdown>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
