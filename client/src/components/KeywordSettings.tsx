import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Zap } from "lucide-react";

interface KeywordSettingsProps {
  primaryKeywords: string[];
  setPrimaryKeywords: (keywords: string[]) => void;
  secondaryKeywords: string[];
  setSecondaryKeywords: (keywords: string[]) => void;
  primaryFrequency: number;
  setPrimaryFrequency: (frequency: number) => void;
  secondaryFrequency: number;
  setSecondaryFrequency: (frequency: number) => void;
  onOptimize: () => void;
  isLoading: boolean;
}

export default function KeywordSettings({
  primaryKeywords,
  setPrimaryKeywords,
  secondaryKeywords,
  setSecondaryKeywords,
  primaryFrequency,
  setPrimaryFrequency,
  secondaryFrequency,
  setSecondaryFrequency,
  onOptimize,
  isLoading
}: KeywordSettingsProps) {
  
  const addPrimaryKeyword = () => {
    setPrimaryKeywords([...primaryKeywords, ""]);
  };

  const addSecondaryKeyword = () => {
    setSecondaryKeywords([...secondaryKeywords, ""]);
  };

  const removePrimaryKeyword = (index: number) => {
    if (primaryKeywords.length > 1) {
      setPrimaryKeywords(primaryKeywords.filter((_, i) => i !== index));
    }
  };

  const removeSecondaryKeyword = (index: number) => {
    if (secondaryKeywords.length > 1) {
      setSecondaryKeywords(secondaryKeywords.filter((_, i) => i !== index));
    }
  };

  const updatePrimaryKeyword = (index: number, value: string) => {
    const updated = [...primaryKeywords];
    updated[index] = value;
    setPrimaryKeywords(updated);
  };

  const updateSecondaryKeyword = (index: number, value: string) => {
    const updated = [...secondaryKeywords];
    updated[index] = value;
    setSecondaryKeywords(updated);
  };

  return (
    <Card className="glow-card overflow-hidden border-0">
      <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-4 gradient-heading">Keyword Strategy</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Primary Keywords */}
          <div className="glass-panel p-5">
            <div className="mb-3 flex items-center">
              <span className="inline-block w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 mr-2"></span>
              <label className="font-semibold text-slate-800">Primary Keywords</label>
              <span className="ml-auto text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800 font-medium">High Impact</span>
            </div>
            <div className="space-y-3">
              {primaryKeywords.map((keyword, index) => (
                <div key={`primary-${index}`} className="flex items-center gap-2 group">
                  <div className="relative flex-1">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-400 to-purple-600 rounded-md blur opacity-0 group-hover:opacity-20 transition-opacity"></div>
                    <Input
                      value={keyword}
                      onChange={(e) => updatePrimaryKeyword(index, e.target.value)}
                      placeholder="Enter primary keyword"
                      className="flex-1 relative border-purple-200 focus-visible:ring-purple-500/30"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removePrimaryKeyword(index)}
                    disabled={primaryKeywords.length <= 1}
                    className="text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              variant="link"
              size="sm"
              className="mt-3 text-purple-600 hover:text-purple-700 p-0 font-medium"
              onClick={addPrimaryKeyword}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add primary keyword
            </Button>
          </div>
          
          {/* Secondary Keywords */}
          <div className="glass-panel p-5">
            <div className="mb-3 flex items-center">
              <span className="inline-block w-3 h-3 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 mr-2"></span>
              <label className="font-semibold text-slate-800">Secondary Keywords</label>
              <span className="ml-auto text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-800 font-medium">Support</span>
            </div>
            <div className="space-y-3">
              {secondaryKeywords.map((keyword, index) => (
                <div key={`secondary-${index}`} className="flex items-center gap-2 group">
                  <div className="relative flex-1">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-md blur opacity-0 group-hover:opacity-20 transition-opacity"></div>
                    <Input
                      value={keyword}
                      onChange={(e) => updateSecondaryKeyword(index, e.target.value)}
                      placeholder="Enter secondary keyword"
                      className="flex-1 relative border-indigo-200 focus-visible:ring-indigo-500/30"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSecondaryKeyword(index)}
                    disabled={secondaryKeywords.length <= 1}
                    className="text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              variant="link"
              size="sm"
              className="mt-3 text-indigo-600 hover:text-indigo-700 p-0 font-medium"
              onClick={addSecondaryKeyword}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add secondary keyword
            </Button>
          </div>
        </div>
        
        {/* Frequency Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="glass-panel p-5">
            <label htmlFor="primaryFrequency" className="block mb-3 font-semibold text-slate-800 flex items-center">
              <span className="inline-block w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
              Primary Keyword Density
            </label>
            <div className="relative">
              <Input
                type="number"
                id="primaryFrequency"
                value={primaryFrequency}
                onChange={(e) => setPrimaryFrequency(parseFloat(e.target.value))}
                min={0.1}
                max={10}
                step={0.1}
                placeholder="e.g. 2.5"
                className="pr-10 border-purple-200"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-purple-600">%</div>
            </div>
            <div className="flex justify-between mt-2 text-sm text-slate-600">
              <span>Subtle</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">Recommended: 1.5-3%</span>
              <span>Aggressive</span>
            </div>
          </div>
          
          <div className="glass-panel p-5">
            <label htmlFor="secondaryFrequency" className="block mb-3 font-semibold text-slate-800 flex items-center">
              <span className="inline-block w-3 h-3 rounded-full bg-indigo-500 mr-2"></span>
              Secondary Keyword Density
            </label>
            <div className="relative">
              <Input
                type="number"
                id="secondaryFrequency"
                value={secondaryFrequency}
                onChange={(e) => setSecondaryFrequency(parseFloat(e.target.value))}
                min={0.1}
                max={5}
                step={0.1}
                placeholder="e.g. 1.0"
                className="pr-10 border-indigo-200"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-indigo-600">%</div>
            </div>
            <div className="flex justify-between mt-2 text-sm text-slate-600">
              <span>Subtle</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">Recommended: 0.5-1.5%</span>
              <span>Aggressive</span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center mt-10">
          <Button 
            onClick={onOptimize}
            disabled={isLoading}
            className="relative group overflow-hidden gradient-button py-3 px-8 rounded-full text-lg"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-600 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
            <span className="relative flex items-center justify-center">
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Optimizing...
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5 mr-2" />
                  Enhance Content
                </>
              )}
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
