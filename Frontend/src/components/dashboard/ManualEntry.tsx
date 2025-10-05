import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Rocket, RotateCcw, Sparkles } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { toast } from "sonner";

type Props = {
  onPredict: (data: any) => void;
  isAnalyzing: boolean;
};

export const ManualEntry = ({ onPredict, isAnalyzing }: Props) => {
  const [formData, setFormData] = useState({
    orbitalPeriod: "",
    transitDuration: "",
    transitDepth: "",
    planetRadius: "",
    stellarTemp: "",
    stellarRadius: "",
    eqTemp: "",
    insolationFlux: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePredict = () => {
    // Validate inputs
    const hasEmptyFields = Object.values(formData).some((value) => !value);
    if (hasEmptyFields) {
      toast.error("Please fill in all fields");
      return;
    }

    onPredict(formData);
  };

  const handleReset = () => {
    setFormData({
      orbitalPeriod: "",
      transitDuration: "",
      transitDepth: "",
      planetRadius: "",
      stellarTemp: "",
      stellarRadius: "",
      eqTemp: "",
      insolationFlux: "",
    });
    toast.success("Form reset");
  };

  const handleUseExample = () => {
    setFormData({
      orbitalPeriod: "3.52",
      transitDuration: "2.8",
      transitDepth: "1200",
      planetRadius: "1.2",
      stellarTemp: "5800",
      stellarRadius: "1.0",
      eqTemp: "1500",
      insolationFlux: "150",
    });
    toast.success("Example data loaded");
  };

  const fields = [
    { key: "orbitalPeriod", label: "Orbital Period (days)", tooltip: "Time for one complete orbit around the star" },
    { key: "transitDuration", label: "Transit Duration (hours)", tooltip: "How long the planet blocks the star's light" },
    { key: "transitDepth", label: "Transit Depth (ppm)", tooltip: "Amount of light blocked during transit" },
    { key: "planetRadius", label: "Planet Radius (Earth radii)", tooltip: "Size of the planet relative to Earth" },
    { key: "stellarTemp", label: "Stellar Temperature (K)", tooltip: "Surface temperature of the host star" },
    { key: "stellarRadius", label: "Stellar Radius (Solar radii)", tooltip: "Size of the star relative to our Sun" },
    { key: "eqTemp", label: "Equilibrium Temperature (K)", tooltip: "Expected temperature of the planet" },
    { key: "insolationFlux", label: "Insolation Flux (Earth flux)", tooltip: "Amount of stellar energy received" },
  ];

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          {fields.map((field) => (
            <div key={field.key} className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor={field.key} className="text-sm">
                  {field.label}
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-muted-foreground hover:text-foreground">
                      <Sparkles className="h-3 w-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">{field.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                id={field.key}
                type="number"
                step="any"
                value={formData[field.key as keyof typeof formData]}
                onChange={(e) => handleInputChange(field.key, e.target.value)}
                className="glass border-border/50 focus:border-primary/50"
                placeholder="Enter value"
              />
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            onClick={handlePredict}
            disabled={isAnalyzing}
            className="flex-1 bg-primary hover:bg-primary/90 glow-primary"
          >
            <Rocket className="mr-2 h-4 w-4" />
            {isAnalyzing ? "Analyzing..." : "Predict"}
          </Button>
          <Button
            onClick={handleUseExample}
            variant="outline"
            className="glass border-border/50 hover:border-accent/50"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Example
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            className="glass border-border/50"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
};
