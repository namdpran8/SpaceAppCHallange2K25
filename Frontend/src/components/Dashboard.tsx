import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ManualEntry } from "./dashboard/ManualEntry";
import { UploadDataset } from "./dashboard/UploadDataset";
import { ResultsDisplay } from "./dashboard/ResultsDisplay";

export type PredictionResult = {
  classification: "confirmed" | "candidate" | "false-positive";
  confidence: number;
  probabilities: {
    confirmed: number;
    candidate: number;
    falsePositive: number;
  };
  topFeatures: Array<{ name: string; importance: number }>;
};

export const Dashboard = () => {
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handlePrediction = async (data: any) => {
    setIsAnalyzing(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock prediction result
    const mockResult: PredictionResult = {
      classification: Math.random() > 0.3 ? "confirmed" : Math.random() > 0.5 ? "candidate" : "false-positive",
      confidence: Math.random() * 0.3 + 0.7,
      probabilities: {
        confirmed: Math.random() * 0.5 + 0.4,
        candidate: Math.random() * 0.3 + 0.2,
        falsePositive: Math.random() * 0.2 + 0.1,
      },
      topFeatures: [
        { name: "Transit Depth", importance: Math.random() * 0.3 + 0.7 },
        { name: "Orbital Period", importance: Math.random() * 0.3 + 0.5 },
        { name: "Planet Radius", importance: Math.random() * 0.3 + 0.4 },
        { name: "Transit Duration", importance: Math.random() * 0.2 + 0.3 },
      ],
    };

    setPredictionResult(mockResult);
    setIsAnalyzing(false);
  };

  return (
    <section id="dashboard" className="py-20 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Detection Dashboard
          </h2>
          <p className="text-muted-foreground text-lg">
            Upload data or enter parameters to detect exoplanets
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="glass-strong p-8 rounded-2xl border border-border/50 animate-fade-in-up">
            <Tabs defaultValue="manual" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                <TabsTrigger value="upload">Upload Dataset</TabsTrigger>
              </TabsList>
              <TabsContent value="manual">
                <ManualEntry onPredict={handlePrediction} isAnalyzing={isAnalyzing} />
              </TabsContent>
              <TabsContent value="upload">
                <UploadDataset onPredict={handlePrediction} isAnalyzing={isAnalyzing} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Results Section */}
          <div className="glass-strong p-8 rounded-2xl border border-border/50 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <ResultsDisplay result={predictionResult} isAnalyzing={isAnalyzing} />
          </div>
        </div>
      </div>
    </section>
  );
};
