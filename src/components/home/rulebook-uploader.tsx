
"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { processRulebook } from "@/lib/document-processor";
import { UploadCloud, Loader2, FileText } from "lucide-react";

export function RulebookUploader({ sessionId }: { sessionId: string }) {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const { toast } = useToast();

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);

    const newFiles: string[] = [];

    for (const file of Array.from(files)) {
      if (file.type === 'application/pdf' || file.type === 'text/plain') {
        try {
          await processRulebook(file, sessionId);
          newFiles.push(file.name);
           toast({
            title: "Rulebook Added!",
            description: `${file.name} is now available to your AI GM.`
          });
        } catch (error) {
          console.error("Upload failed for", file.name, error);
          toast({
            title: "Upload Failed",
            description: `Could not process ${file.name}.`,
            variant: "destructive",
          });
        }
      } else {
         toast({
          title: "Invalid File Type",
          description: `${file.name} is not a supported file type (PDF or TXT).`,
          variant: "destructive",
        });
      }
    }
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    setUploading(false);
  };

  return (
    <div className="space-y-4">
       <label
        htmlFor="rulebook-upload"
        className="relative block w-full border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
      >
        <div className="flex flex-col items-center justify-center">
            {uploading ? (
                <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
            ) : (
                <UploadCloud className="h-8 w-8 text-muted-foreground" />
            )}
            <span className="mt-2 text-sm font-semibold text-foreground">
                Click to upload or drag and drop
            </span>
            <span className="text-xs text-muted-foreground">
                PDF or TXT files
            </span>
        </div>
        <input 
            id="rulebook-upload"
            name="rulebook-upload"
            type="file" 
            multiple 
            accept=".pdf,.txt"
            onChange={e => handleUpload(e.target.files)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={uploading}
        />
      </label>
      {uploadedFiles.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Uploaded Rulebooks:</h4>
          <div className="space-y-2">
            {uploadedFiles.map((name, index) => (
              <div key={index} className="flex items-center gap-2 bg-secondary p-2 rounded-md">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-secondary-foreground truncate">{name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
