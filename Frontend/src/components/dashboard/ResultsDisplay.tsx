import { Download, Share2, Activity, Orbit } from "lucide-react";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { PredictionResult } from "../Dashboard";
import { OrbitVisualizer3D } from "../visualization/OrbitVisualizer3D";
import "../visualization/OrbitVisualizer3D.css";
import { toast } from "sonner";

type Props = {
  result: PredictionResult | null;
  isAnalyzing: boolean;
};

export const ResultsDisplay = ({ result, isAnalyzing }: Props) => {
  const handleExport = (format: string) => {
    toast.success(`Exporting as ${format.toUpperCase()}...`);
  };

  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
        <Activity className="h-16 w-16 text-primary animate-pulse mb-4" />
        <p className="text-lg font-medium">Analyzing data...</p>
        <p className="text-sm text-muted-foreground mt-2">
          Running AI models on your dataset
        </p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
        <div className="w-24 h-24 rounded-full glass border-2 border-dashed border-border/50 flex items-center justify-center mb-4">
          <Activity className="h-12 w-12 text-muted-foreground" />
        </div>
        <p className="text-lg font-medium mb-2">No results yet</p>
        <p className="text-sm text-muted-foreground max-w-xs">
          Enter data or upload a dataset to start detection
        </p>
      </div>
    );
  }

  const classificationConfig = {
    confirmed: {
      label: "Confirmed Exoplanet",
      color: "text-success",
      bgColor: "bg-success/20",
      borderColor: "border-success/50",
      glow: "glow-success",
    },
    candidate: {
      label: "Candidate",
      color: "text-warning",
      bgColor: "bg-warning/20",
      borderColor: "border-warning/50",
      glow: "shadow-[0_0_30px_hsl(38_92%_50%/0.4)]",
    },
    "false-positive": {
      label: "False Positive",
      color: "text-destructive",
      bgColor: "bg-destructive/20",
      borderColor: "border-destructive/50",
      glow: "shadow-[0_0_30px_hsl(0_72%_51%/0.4)]",
    },
  };

  const config = classificationConfig[result.classification];

  return (
    <Tabs defaultValue="results" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="results">
          <Activity className="h-4 w-4 mr-2" />
          Results
        </TabsTrigger>
        <TabsTrigger value="visualization">
          <Orbit className="h-4 w-4 mr-2" />
          3D Orbit
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="results" className="space-y-6">
        {/* Result Badge */}
        <div className={`p-8 rounded-2xl border-2 ${config.borderColor} ${config.bgColor} ${config.glow} text-center`}>
          <h3 className={`text-3xl font-bold mb-2 ${config.color}`}>
            {config.label}
          </h3>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Progress value={result.confidence * 100} className="w-32" />
            <span className="text-lg font-semibold">
              {(result.confidence * 100).toFixed(1)}%
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Confidence Level
          </p>
        </div>

        {/* Probability Breakdown */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Classification Probabilities</h4>
          {Object.entries(result.probabilities).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="capitalize">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </span>
                <span className="font-medium">{(value * 100).toFixed(1)}%</span>
              </div>
              <Progress value={value * 100} />
            </div>
          ))}
        </div>

        {/* Top Features */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Top Contributing Features</h4>
          {result.topFeatures.map((feature, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{feature.name}</span>
                <span className="font-medium text-primary">
                  {(feature.importance * 100).toFixed(0)}%
                </span>
              </div>
              <Progress value={feature.importance * 100} />
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={() => handleExport("pdf")}
            variant="outline"
            className="flex-1 glass border-border/50"
          >
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button
            onClick={() => handleExport("json")}
            variant="outline"
            className="flex-1 glass border-border/50"
          >
            <Download className="mr-2 h-4 w-4" />
            JSON
          </Button>
          <Button
            onClick={() => toast.success("Share link copied!")}
            variant="outline"
            className="glass border-border/50"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </TabsContent>
      
      <TabsContent value="visualization">
        <div className="space-y-4">
          <div className="text-center mb-4">
            <p className="text-sm text-muted-foreground">
              Interactive 3D visualization of the detected exoplanet system
            </p>
          </div>
          <OrbitVisualizer3D />
        </div>
      </TabsContent>
    </Tabs>
  );
};
