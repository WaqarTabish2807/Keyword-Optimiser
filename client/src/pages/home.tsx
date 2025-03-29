import { useState } from "react";
import ContentForm from "@/components/ContentForm";
import KeywordSettings from "@/components/KeywordSettings";
import OptimizedResult from "@/components/OptimizedResult";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { OptimizationRequest, OptimizationResponse } from "@shared/schema";

export default function Home() {
  const { toast } = useToast();
  const [content, setContent] = useState<string>("");
  const [wordCount, setWordCount] = useState<number>(0);
  const [primaryKeywords, setPrimaryKeywords] = useState<string[]>([""]);
  const [secondaryKeywords, setSecondaryKeywords] = useState<string[]>([""]);
  const [primaryFrequency, setPrimaryFrequency] = useState<number>(2.5);
  const [secondaryFrequency, setSecondaryFrequency] = useState<number>(1.0);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResponse | null>(null);

  const optimizeMutation = useMutation({
    mutationFn: async (data: OptimizationRequest) => {
      const response = await apiRequest("POST", "/api/optimize", data);
      return response.json() as Promise<OptimizationResponse>;
    },
    onSuccess: (data) => {
      setOptimizationResult(data);
      toast({
        title: "Content optimized",
        description: "Your content has been successfully optimized.",
      });
      
      // Scroll to results
      setTimeout(() => {
        document.getElementById("result-section")?.scrollIntoView({
          behavior: "smooth"
        });
      }, 100);
    },
    onError: (error: Error) => {
      toast({
        title: "Optimization failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleOptimize = () => {
    // Validate inputs
    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please enter your content to optimize.",
        variant: "destructive"
      });
      return;
    }

    if (wordCount > 1000) {
      toast({
        title: "Word limit exceeded",
        description: "Please keep your content under 1000 words.",
        variant: "destructive"
      });
      return;
    }

    // Filter out empty keywords
    const filteredPrimaryKeywords = primaryKeywords.filter(k => k.trim() !== "");
    const filteredSecondaryKeywords = secondaryKeywords.filter(k => k.trim() !== "");

    if (filteredPrimaryKeywords.length === 0 && filteredSecondaryKeywords.length === 0) {
      toast({
        title: "Keywords required",
        description: "Please add at least one primary or secondary keyword.",
        variant: "destructive"
      });
      return;
    }

    // Submit data for optimization
    optimizeMutation.mutate({
      content,
      primaryKeywords: filteredPrimaryKeywords,
      secondaryKeywords: filteredSecondaryKeywords,
      primaryFrequency,
      secondaryFrequency
    });
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <header className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl gradient-heading mb-3">Keyword Optimizer Pro</h1>
        <p className="text-slate-600 text-lg max-w-2xl mx-auto">
          Enhance your content with intelligent keyword placement for better SEO performance
        </p>
      </header>

      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 -z-10"></div>

      <main className="space-y-10 relative">
        <div className="relative">
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-purple-300/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-300/20 rounded-full blur-3xl"></div>
          <ContentForm 
            content={content}
            setContent={setContent}
            wordCount={wordCount}
            setWordCount={setWordCount}
          />
        </div>
        
        <div className="relative">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-300/20 rounded-full blur-3xl"></div>
          <KeywordSettings
            primaryKeywords={primaryKeywords}
            setPrimaryKeywords={setPrimaryKeywords}
            secondaryKeywords={secondaryKeywords}
            setSecondaryKeywords={setSecondaryKeywords}
            primaryFrequency={primaryFrequency}
            setPrimaryFrequency={setPrimaryFrequency}
            secondaryFrequency={secondaryFrequency}
            setSecondaryFrequency={setSecondaryFrequency}
            onOptimize={handleOptimize}
            isLoading={optimizeMutation.isPending}
          />
        </div>
        
        {optimizationResult && (
          <div className="relative">
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-300/20 rounded-full blur-3xl"></div>
            <OptimizedResult result={optimizationResult} />
          </div>
        )}
      </main>
      
      <footer className="mt-16 text-center text-sm text-slate-500">
        <p>Keyword Optimizer Pro — Smart content enhancement for SEO professionals</p>
      </footer>
    </div>
  );
}
