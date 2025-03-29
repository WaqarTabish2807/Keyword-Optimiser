import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clipboard, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { OptimizationResponse, KeywordOccurrence } from "@shared/schema";

interface OptimizedResultProps {
  result: OptimizationResponse;
}

export default function OptimizedResult({ result }: OptimizedResultProps) {
  const { toast } = useToast();
  const contentRef = useRef<HTMLDivElement>(null);
  
  const copyToClipboard = () => {
    if (!contentRef.current) return;
    
    // Get text content without HTML formatting
    const content = result.optimizedContent;
    
    navigator.clipboard.writeText(content)
      .then(() => {
        toast({
          title: "Copied!",
          description: "Content copied to clipboard",
        });
      })
      .catch(() => {
        toast({
          title: "Failed to copy",
          description: "Please try again or copy manually",
          variant: "destructive"
        });
      });
  };

  const downloadContent = () => {
    const content = result.optimizedContent;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "optimized-content.txt";
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // Function to highlight keywords in content
  const highlightKeywords = (content: string, primaryKeywords: string[], secondaryKeywords: string[]) => {
    let highlightedContent = content;
    
    // Create a regex pattern for primary keywords with word boundaries
    primaryKeywords.forEach(keyword => {
      if (keyword.trim()) {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        highlightedContent = highlightedContent.replace(
          regex, 
          `<mark class="bg-gradient-to-r from-purple-100 to-purple-50 text-purple-900 px-0.5 rounded">$&</mark>`
        );
      }
    });
    
    // Create a regex pattern for secondary keywords with word boundaries
    secondaryKeywords.forEach(keyword => {
      if (keyword.trim()) {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        highlightedContent = highlightedContent.replace(
          regex, 
          `<mark class="bg-gradient-to-r from-indigo-100 to-indigo-50 text-indigo-900 px-0.5 rounded">$&</mark>`
        );
      }
    });
    
    return highlightedContent;
  };

  const renderKeywordList = (keywords: KeywordOccurrence[]) => {
    return (
      <ul className="list-disc list-inside text-slate-600 mt-1">
        {keywords.filter(k => k.keyword.trim() !== "").map((item, index) => (
          <li key={index}>
            {item.keyword} ({item.occurrences} occurrence{item.occurrences !== 1 ? 's' : ''})
          </li>
        ))}
      </ul>
    );
  };

  // Get primary and secondary keywords
  const primaryKeywords = result.primaryKeywordStats.map(stat => stat.keyword);
  const secondaryKeywords = result.secondaryKeywordStats.map(stat => stat.keyword);

  // Highlight keywords in content
  const highlightedContent = highlightKeywords(
    result.optimizedContent, 
    primaryKeywords, 
    secondaryKeywords
  );

  return (
    <Card id="result-section" className="glow-card overflow-hidden border-0">
      <div className="h-2 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500"></div>
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-6 gradient-heading flex items-center">
          <span>Enhanced Content</span>
          <span className="ml-auto text-sm bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 py-1 px-4 rounded-full font-medium shadow-sm">
            Keywords Integrated
          </span>
        </h2>
        
        <div className="mb-6 glass-panel p-5 relative">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-indigo-300/10 rounded-full blur-2xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            <div>
              <span className="font-semibold block text-slate-800 flex items-center mb-2">
                <span className="inline-block w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
                Primary Keywords:
              </span>
              <div className="flex flex-wrap gap-2">
                {result.primaryKeywordStats.filter(k => k.keyword.trim() !== "").map((item, index) => (
                  <div key={index} className="primary-keyword-badge">
                    <span className="font-semibold">{item.keyword}</span>
                    <span className="ml-1.5 font-normal opacity-80">{item.occurrences}×</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <span className="font-semibold block text-slate-800 flex items-center mb-2">
                <span className="inline-block w-3 h-3 rounded-full bg-indigo-500 mr-2"></span>
                Secondary Keywords:
              </span>
              <div className="flex flex-wrap gap-2">
                {result.secondaryKeywordStats.filter(k => k.keyword.trim() !== "").map((item, index) => (
                  <div key={index} className="secondary-keyword-badge">
                    <span className="font-semibold">{item.keyword}</span>
                    <span className="ml-1.5 font-normal opacity-80">{item.occurrences}×</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="relative group mb-6">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/30 to-indigo-500/30 rounded-xl blur opacity-25"></div>
          <div 
            ref={contentRef}
            className="prose prose-slate max-w-none p-5 bg-white rounded-lg border border-slate-100 shadow-sm relative"
            dangerouslySetInnerHTML={{ __html: highlightedContent }}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between mt-8 gap-4">
          <Button 
            variant="outline"
            className="text-slate-700 hover:text-slate-800 border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-colors"
            onClick={copyToClipboard}
          >
            <Clipboard className="h-5 w-5 mr-2" />
            Copy to Clipboard
          </Button>
          
          <Button 
            onClick={downloadContent}
            className="gradient-button rounded-lg py-2 px-5"
          >
            <Download className="h-5 w-5 mr-2" />
            Download Result
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
