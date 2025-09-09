
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { getUploadedRulebooks } from "@/lib/document-processor";

export function RulesPanel({ sessionId }: { sessionId: string }) {
  const [uploadedBooks, setUploadedBooks] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadBooks() {
      setIsLoading(true);
      const books = await getUploadedRulebooks(sessionId);
      setUploadedBooks(books);
      setIsLoading(false);
    }
    
    if (sessionId) {
      loadBooks();
    }
  }, [sessionId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Session Rulebooks
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading rulebooks...</span>
          </div>
        ) : uploadedBooks.length > 0 ? (
          <ul className="space-y-2">
            {uploadedBooks.map(book => (
              <li key={book} className="flex items-center gap-2 p-2 bg-secondary rounded-md">
                <span className="text-sm truncate">{book}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No rulebooks were uploaded for this session.</p>
        )}
      </CardContent>
    </Card>
  );
}
