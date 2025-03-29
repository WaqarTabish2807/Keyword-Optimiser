import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect } from "react";

interface ContentFormProps {
  content: string;
  setContent: (content: string) => void;
  wordCount: number;
  setWordCount: (count: number) => void;
}

export default function ContentForm({ 
  content, 
  setContent, 
  wordCount, 
  setWordCount 
}: ContentFormProps) {
  
  const updateWordCount = (text: string) => {
    const count = text.trim() ? text.trim().split(/\s+/).length : 0;
    setWordCount(count);
  };

  useEffect(() => {
    updateWordCount(content);
  }, [content]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  return (
    <Card className="glow-card overflow-hidden border-0">
      <div className="h-2 bg-gradient-to-r from-purple-500 to-indigo-500"></div>
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-4 gradient-heading">Content Editor</h2>
        
        <div className="mb-6">
          <label htmlFor="content" className="block mb-3 font-medium text-slate-700 flex items-center">
            <span className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 px-3 py-1 rounded-md mr-2">
              Enter or paste your content below
            </span>
            <span className={`ml-auto rounded-full px-3 py-1 text-sm font-semibold ${
              wordCount > 1000 
                ? 'bg-red-100 text-red-700' 
                : wordCount > 750 
                  ? 'bg-amber-100 text-amber-700' 
                  : 'bg-emerald-100 text-emerald-700'
            }`}>
              {wordCount}/1000 words
            </span>
          </label>
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
            <Textarea
              id="content"
              className="w-full h-64 p-4 resize-none relative bg-white rounded-lg border-0 shadow-md"
              placeholder="Paste or type your content here to optimize with keywords..."
              value={content}
              onChange={handleContentChange}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
