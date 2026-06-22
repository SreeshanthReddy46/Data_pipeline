import React from "react";
import { Download, FileText, ArrowRight } from "lucide-react";

interface ReadinessReportTabProps {
  datasetId: string;
  score: any; // overall, dimensions, weights
  lineage: any[];
  auditLogs: any[];
  onDownloadCSV: () => void;
  onDownloadPDF: () => void;
}

export default function ReadinessReportTab({
  datasetId,
  score,
  lineage,
  auditLogs,
  onDownloadCSV,
  onDownloadPDF,
}: ReadinessReportTabProps) {
  const overall = score?.overall || 0;
  const dimensions = score?.dimensions || {
    completeness: 0,
    validity: 0,
    uniqueness: 0,
    consistency: 0,
    timeliness: 0,
  };

  const getReadinessLabel = (val: number) => {
    if (val >= 90) return "Production Ready (Highly Optimized)";
    if (val >= 70) return "AI-Ready (Minor issues remaining)";
    if (val >= 40) return "Requires Remediation (Unreliable for AI training)";
    return "Critical: Raw / Unstructured (AI-Unready)";
  };

  const radius = 60;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overall / 100) * circumference;

  return (
    <div className="space-y-8 text-left">
      {/* Summary Score Panel */}
      <div className="border border-line rounded-[32px] p-6 bg-white-card grid grid-cols-1 md:grid-cols-12 gap-8 items-center shadow-sm">
        
        {/* Score Gauge */}
        <div className="md:col-span-4 flex flex-col items-center justify-center">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r={radius}
                className="stroke-soft-card"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r={radius}
                className="stroke-black transition-all duration-500 ease-in-out"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="square"
                fill="transparent"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-3xl font-extrabold font-mono tracking-tighter text-text">
                {overall}
              </span>
              <span className="text-[10px] font-bold text-muted block uppercase font-mono mt-0.5">
                / 100
              </span>
            </div>
          </div>
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-text mt-3">
            AI-Readiness Index
          </span>
        </div>

        {/* Narrative & Exports */}
        <div className="md:col-span-8 space-y-4">
          <div>
            <h3 className="text-md font-bold uppercase tracking-tight text-text">
              {getReadinessLabel(overall)}
            </h3>
            <p className="text-sm text-muted mt-2 leading-relaxed">
              This index represents the dataset's structural alignment with LLM fine-tuning, retrieval augmentation (RAG), and standard predictive modeling tasks.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={onDownloadCSV}
              className="flex items-center gap-2 bg-black hover:bg-black/90 text-page-bg px-5 py-2.5 rounded-full text-xs font-label uppercase tracking-wider transition-colors shadow"
            >
              <Download className="w-3.5 h-3.5" />
              Download Dataset (.CSV)
            </button>
            <button
              onClick={onDownloadPDF}
              className="flex items-center gap-2 border border-line hover:border-black bg-white-card hover:bg-soft-card-2 text-text px-5 py-2.5 rounded-full text-xs font-label uppercase tracking-wider transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              Export Audit PDF
            </button>
          </div>
        </div>
      </div>

      {/* Dimensional Details & Weightings */}
      <div className="border border-line rounded-[32px] bg-white-card p-6 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider border-b border-line/30 pb-3 mb-4 text-text">
          Dimensional Metrics Breakdown
        </h3>
        <div className="space-y-4">
          {Object.entries(dimensions).map(([dimension, val]: [string, any]) => {
            const percentage = val;
            return (
              <div key={dimension} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold uppercase tracking-wide">
                  <span className="text-muted">{dimension}</span>
                  <span className="font-mono text-text font-bold">{percentage}/100</span>
                </div>
                {/* Horizontal track bar */}
                <div className="h-4 border border-line bg-page-bg/50 rounded-full overflow-hidden p-[2px]">
                  <div
                    className="h-full bg-black rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visual Lineage Flowchart */}
      <div className="border border-line rounded-[32px] bg-white-card p-6 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider border-b border-line/30 pb-3 mb-4 text-text">
          Data Pipeline Lineage Flow
        </h3>
        {lineage && lineage.length > 0 ? (
          <div className="overflow-x-auto pb-4 scrollbar-thin">
            <div className="flex items-center min-w-max space-x-4 px-2 py-4">
              {lineage.map((step, idx) => (
                <React.Fragment key={idx}>
                  {/* Step Box */}
                  <div className="border border-line/80 rounded-[24px] p-5 w-56 bg-page-bg/40 flex flex-col justify-between h-36 relative shadow-inner">
                    <span className="absolute top-3 right-3 font-mono text-[9px] font-bold border border-black bg-black text-page-bg px-2 py-0.5 rounded-full">
                      v{step.step_index}
                    </span>
                    <div>
                      <h4 className="text-xs font-extrabold uppercase tracking-tight truncate pr-10 text-text">
                        {step.name}
                      </h4>
                      <p className="text-[10px] text-muted mt-1.5 line-clamp-2 leading-normal">
                        {step.description}
                      </p>
                    </div>
                    <div className="border-t border-line/20 pt-2 mt-2 flex justify-between items-center text-xs font-mono">
                      <span className="text-muted-light font-bold uppercase text-[9px]">Score:</span>
                      <span className="font-bold text-text">
                        {step.score_before} → {step.score_after}
                      </span>
                    </div>
                  </div>

                  {/* Connecting Arrow */}
                  {idx < lineage.length - 1 && (
                    <div className="flex items-center text-muted">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-8 border border-line bg-page-bg/30 text-center text-xs text-muted font-mono rounded-xl">
            No lineage transforms recorded.
          </div>
        )}
      </div>

      {/* Chronological Audit Logs */}
      <div className="border border-line rounded-[32px] bg-white-card p-6 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider border-b border-line/30 pb-3 mb-4 text-text">
          Chronological Pipeline Audit Trail
        </h3>
        {auditLogs && auditLogs.length > 0 ? (
          <div className="overflow-x-auto max-h-[300px] border border-line/60 rounded-xl">
            <table className="w-full text-xs font-mono text-left">
              <thead className="bg-soft-card-2 sticky top-0 z-10">
                <tr className="border-b border-line">
                  <th className="p-3 border-r border-line bg-soft-card font-bold text-text text-[9px] uppercase tracking-wider">Timestamp</th>
                  <th className="p-3 border-r border-line bg-soft-card font-bold text-text text-[9px] uppercase tracking-wider">Action</th>
                  <th className="p-3 border-r border-line bg-soft-card font-bold text-text text-[9px] uppercase tracking-wider">Col Affected</th>
                  <th className="p-3 border-r border-line bg-soft-card font-bold text-text text-[9px] uppercase tracking-wider">Rows Affected</th>
                  <th className="p-3 border-r border-line bg-soft-card font-bold text-text text-[9px] uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-page-bg/30 border-b border-line/25">
                    <td className="p-3 border-r border-line/30 text-[10px] text-muted">
                      {log.timestamp.replace("T", " ").substring(0, 19)}
                    </td>
                    <td className="p-3 border-r border-line/30 font-bold text-text">{log.action}</td>
                    <td className="p-3 border-r border-line/30 text-text">{log.target_column || "-"}</td>
                    <td className="p-3 border-r border-line/30 text-right font-bold text-text">{log.rows_affected}</td>
                    <td className="p-3 max-w-[250px] truncate text-text" title={log.details}>
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 border border-line bg-page-bg/30 text-center text-xs text-muted font-mono rounded-xl">
            No audit records created.
          </div>
        )}
      </div>
    </div>
  );
}
