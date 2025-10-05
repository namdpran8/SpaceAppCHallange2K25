import { useState } from "react";
import { Button } from "../ui/button";
import { Upload, FileText } from "lucide-react";
import { toast } from "sonner";

type Props = {
  onPredict: (data: any) => void;
  isAnalyzing: boolean;
};

export const UploadDataset = ({ onPredict, isAnalyzing }: Props) => {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const validTypes = ["text/csv", "application/fits"];
    if (!file.name.endsWith(".csv") && !file.name.endsWith(".fits")) {
      toast.error("Please upload a CSV or FITS file");
      return;
    }

    setFile(file);
    toast.success(`File "${file.name}" uploaded successfully`);
  };

  const handleAnalyze = () => {
    if (!file) {
      toast.error("Please upload a file first");
      return;
    }

    // Mock batch analysis
    onPredict({ file: file.name, type: "batch" });
  };

  return (
    <div className="space-y-6">
      <div
        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all ${
          dragActive
            ? "border-primary bg-primary/5"
            : "border-border/50 hover:border-primary/50"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept=".csv,.fits"
          onChange={handleChange}
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium mb-2">
            {file ? file.name : "Drop your dataset here"}
          </p>
          <p className="text-sm text-muted-foreground">
            or click to browse
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Supports CSV and FITS files
          </p>
        </label>
      </div>

      {file && (
        <div className="glass p-4 rounded-lg border border-border/50">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-accent" />
            <div>
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Expected columns: orbital_period, transit_duration, transit_depth,
          planet_radius, stellar_temperature, stellar_radius, equilibrium_temp,
          insolation_flux
        </p>

        <Button
          onClick={handleAnalyze}
          disabled={!file || isAnalyzing}
          className="w-full bg-primary hover:bg-primary/90 glow-primary"
        >
          {isAnalyzing ? "Analyzing Batch..." : "Analyze Batch"}
        </Button>
      </div>
    </div>
  );
};
