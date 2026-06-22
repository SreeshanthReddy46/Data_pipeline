import React, { useState, useRef } from "react";
import { Upload, Database, Loader2, FileText, ArrowRight } from "lucide-react";

interface DashboardProps {
  datasets: any[];
  onUpload: (file: File) => Promise<void>;
  onLoadDemo: () => Promise<void>;
  onSelectDataset: (id: string) => void;
  loading: boolean;
}

export default function Dashboard({
  datasets,
  onUpload,
  onLoadDemo,
  onSelectDataset,
  loading,
}: DashboardProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await onUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await onUpload(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-10">
      {/* Upload area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h1 className="text-3xl font-extrabold uppercase tracking-tight text-text leading-none">
              AI-Data Quality & Readiness Pipeline
            </h1>
            <p className="text-sm text-muted max-w-xl leading-relaxed">
              Profile, audit, and clean inconsistent enterprise datasets locally. Upload your CSV/Excel files to detect schema structure and calculate overall LLM readiness indexes.
            </p>
          </div>

          {/* Drag & drop */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border border-dashed p-10 rounded-[24px] flex flex-col items-center justify-center cursor-pointer transition-all duration-300 min-h-[220px] shadow-sm ${
              isDragActive
                ? "border-black bg-soft-card-2"
                : "border-line hover:border-black bg-white-card"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
            {loading ? (
              <div className="flex flex-col items-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-text" />
                <span className="text-xs uppercase font-extrabold tracking-wider text-text">
                  Uploading & Profiling...
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-3 text-center">
                <Upload className="w-8 h-8 text-text" />
                <div>
                  <p className="text-xs uppercase font-extrabold tracking-wider text-text">
                    Drag & Drop Dataset
                  </p>
                  <p className="text-[10px] text-muted mt-1 uppercase font-bold">
                    Supports .CSV, .XLSX up to 10MB
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preset demo triggers */}
        <div className="lg:col-span-4 border border-line rounded-[24px] p-6 bg-white-card flex flex-col justify-between min-h-[220px] shadow-sm">
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text border-b border-line/30 pb-2 mb-3">
              Simulate Messy Enterprise Data
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Don't have a dataset ready? Load our prebuilt Customer Registry featuring duplicate records, inconsistent phone configurations, casing variations, invalid revenues, and future timestamps.
            </p>
          </div>
          <button
            onClick={onLoadDemo}
            disabled={loading}
            className="w-full bg-black hover:bg-black/90 text-page-bg p-3.5 rounded-full text-xs font-label uppercase tracking-wider transition-colors flex items-center justify-center gap-2 mt-6 disabled:opacity-50 shadow"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Database className="w-4 h-4" />
            )}
            Load Simulated Registry
          </button>
        </div>
      </div>

      {/* Dataset history list */}
      <div className="border border-line rounded-[32px] bg-white-card p-6 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider border-b border-line/30 pb-3 mb-4 text-text">
          Local Ingested Datasets
        </h3>
        {datasets.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted font-mono bg-page-bg rounded-2xl border border-dashed border-line/50">
            No datasets indexed in local database yet. Upload a CSV to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {datasets.map((d) => (
              <div
                key={d.id}
                onClick={() => onSelectDataset(d.id)}
                className="border border-line hover:border-black p-5 rounded-2xl bg-page-bg/40 hover:bg-page-bg/90 cursor-pointer transition-all duration-300 flex justify-between items-center group shadow-inner"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-text" />
                    <h4 className="text-sm font-extrabold uppercase tracking-tight truncate max-w-[200px] text-text">
                      {d.filename}
                    </h4>
                  </div>
                  <div className="flex gap-3 text-[10px] uppercase font-bold text-muted font-mono">
                    <span>{d.row_count} Rows</span>
                    <span>•</span>
                    <span>{d.col_count} Columns</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] text-muted uppercase font-bold">Readiness Score</span>
                    <p className="text-lg font-bold font-mono leading-none text-text mt-1">
                      {d.current_score}/100
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full border border-line group-hover:border-black group-hover:bg-black group-hover:text-page-bg transition-all duration-300 flex items-center justify-center">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
