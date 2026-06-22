import { useState } from "react";
import { Play, RotateCcw, CheckCircle, Loader2 } from "lucide-react";

interface RemediatorTabProps {
  datasetId: string;
  issues: any[];
  onRemediate: (payload: any) => Promise<void>;
  onReset: () => Promise<void>;
  tableData: any; // columns, rows
  loading: boolean;
}

export default function RemediatorTab({
  issues,
  onRemediate,
  onReset,
  tableData,
  loading: parentLoading
}: RemediatorTabProps) {
  const [cleaningConfigs, setCleaningConfigs] = useState<Record<string, any>>({});
  const [runningFix, setRunningFix] = useState<string | null>(null);
  const [customValue, setCustomValue] = useState<Record<string, string>>({});
  const [activeDataView, setActiveDataView] = useState<"working" | "original">("working");

  const handleFixSubmit = async (issueId: string, issue: any) => {
    setRunningFix(issueId);
    try {
      const config = cleaningConfigs[issueId] || {};
      let payload: any = {
        column: issue.column,
      };

      if (issue.allow_llm_fix && config.strategy === "llm") {
        payload.rule_type = "llm_clean";
        payload.parameters = { fix_type: "standardize" };
      } else {
        if (issue.dimension === "completeness") {
          payload.rule_type = "fill_nulls";
          payload.parameters = {
            strategy: config.strategy || "custom",
            value: customValue[issueId] || ""
          };
        } else if (issue.dimension === "uniqueness") {
          payload.rule_type = "drop_duplicates";
        } else if (issue.dimension === "validity" && issue.description.includes("outliers")) {
          payload.rule_type = "clip_outliers";
        } else if (issue.dimension === "consistency" && issue.description.includes("casing")) {
          payload.rule_type = "standardize_casing";
          payload.parameters = { style: config.strategy || "title" };
        } else {
          payload.rule_type = "fill_nulls";
          payload.parameters = { strategy: "mode" };
        }
      }

      await onRemediate(payload);
    } catch (err: any) {
      alert(err.message || "Failed to run cleaning step");
    } finally {
      setRunningFix(null);
    }
  };

  const handleConfigChange = (issueId: string, strategy: string) => {
    setCleaningConfigs({
      ...cleaningConfigs,
      [issueId]: { ...cleaningConfigs[issueId], strategy }
    });
  };

  const getSeverityClass = (sev: string) => {
    switch (sev.toLowerCase()) {
      case "high":
        return "border-black font-extrabold text-[9px] uppercase tracking-wider border bg-black text-page-bg px-2.5 py-0.5 rounded-full";
      case "medium":
        return "border-muted text-muted text-[9px] uppercase tracking-wider border px-2.5 py-0.5 rounded-full bg-soft-card-2";
      default:
        return "border-line text-muted-light text-[9px] uppercase tracking-wider border px-2.5 py-0.5 rounded-full bg-white-card";
    }
  };

  return (
    <div className="space-y-8">
      {/* Control Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-line pb-4 gap-4">
        <div>
          <h2 className="text-lg font-bold uppercase tracking-tight text-text">Anomalies & Remediation Workspace</h2>
          <p className="text-xs text-muted mt-1">
            Apply safe rule-based transforms or trigger the Gemini API semantic parser.
          </p>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-2 border border-line hover:border-black bg-white-card hover:bg-soft-card-2 text-text px-4 py-2.5 rounded-full text-xs font-label uppercase tracking-wider transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Revert Dataset
        </button>
      </div>

      {/* Issues List */}
      <div className="space-y-4">
        {issues.length === 0 ? (
          <div className="border border-line rounded-[24px] p-8 bg-white-card flex items-center justify-center gap-3 shadow-sm">
            <CheckCircle className="w-5 h-5 text-text" />
            <span className="text-sm font-bold uppercase tracking-wider text-text">
              Zero anomalies detected. This dataset is AI-Ready.
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {issues.map((issue, idx) => {
              const issueId = `${issue.column}-${issue.dimension}-${idx}`;
              const selectedStrategy = cleaningConfigs[issueId]?.strategy || "";
              const isRunning = runningFix === issueId;

              return (
                <div key={issueId} className="border border-line rounded-[24px] bg-white-card p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-sm hover:border-muted transition-colors duration-250">
                  {/* Issue Info */}
                  <div className="flex-1 space-y-2.5 text-left">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold text-text">{issue.column}</span>
                      <span className={getSeverityClass(issue.severity)}>{issue.severity}</span>
                      <span className="text-[10px] uppercase font-mono border border-line px-2 py-0.5 rounded-md text-muted bg-[#F8F7F3]">
                        {issue.dimension}
                      </span>
                    </div>
                    <p className="text-sm text-text leading-relaxed">{issue.description}</p>
                    <p className="text-xs text-muted font-mono bg-page-bg/40 px-2 py-1 rounded w-fit border border-line/10">Suggested Fix: {issue.suggested_fix}</p>
                  </div>

                  {/* Clean Form Options */}
                  <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap shrink-0">
                    
                    {/* Strategy Selector */}
                    {issue.dimension === "completeness" && (
                      <>
                        <select
                          value={selectedStrategy}
                          onChange={(e) => handleConfigChange(issueId, e.target.value)}
                          className="border border-line p-2 rounded-lg text-xs font-semibold uppercase tracking-wider outline-none bg-page-bg hover:border-black transition-colors"
                        >
                          <option value="custom">Custom Value</option>
                          <option value="mode">Impute Mode</option>
                          {issue.column_type === "numeric" && (
                            <>
                              <option value="mean">Impute Mean</option>
                              <option value="median">Impute Median</option>
                            </>
                          )}
                          {issue.allow_llm_fix && <option value="llm">Gemini AI Clean</option>}
                        </select>
                        {(!selectedStrategy || selectedStrategy === "custom") && (
                          <input
                            type="text"
                            placeholder="Enter replacement"
                            value={customValue[issueId] || ""}
                            onChange={(e) => setCustomValue({ ...customValue, [issueId]: e.target.value })}
                            className="border border-line p-2 rounded-lg text-xs font-mono outline-none w-32 bg-page-bg focus:border-black transition-colors"
                          />
                        )}
                      </>
                    )}

                    {issue.dimension === "consistency" && issue.description.includes("casing") && (
                      <select
                        value={selectedStrategy}
                        onChange={(e) => handleConfigChange(issueId, e.target.value)}
                        className="border border-line p-2 rounded-lg text-xs font-semibold uppercase tracking-wider outline-none bg-page-bg hover:border-black transition-colors"
                      >
                        <option value="title">Title Case</option>
                        <option value="lower">lower case</option>
                        <option value="upper">UPPER CASE</option>
                      </select>
                    )}

                    {issue.allow_llm_fix && issue.dimension !== "completeness" && (
                      <select
                        value={selectedStrategy}
                        onChange={(e) => handleConfigChange(issueId, e.target.value)}
                        className="border border-line p-2 rounded-lg text-xs font-semibold uppercase tracking-wider outline-none bg-page-bg hover:border-black transition-colors"
                      >
                        <option value="llm">Gemini AI Clean</option>
                        <option value="mode">Standard Mode Impute</option>
                      </select>
                    )}

                    {/* Trigger Button */}
                    <button
                      onClick={() => handleFixSubmit(issueId, issue)}
                      disabled={isRunning || parentLoading}
                      className="flex items-center gap-2 bg-black hover:bg-black/90 text-page-bg px-5 py-2.5 rounded-full text-xs font-label uppercase tracking-wider transition-colors disabled:opacity-50 shadow"
                    >
                      {isRunning ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Play className="w-3.5 h-3.5" />
                      )}
                      {isRunning ? "Fixing..." : "Apply Fix"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Preview Tabular Workspace */}
      <div className="border border-line rounded-[32px] bg-white-card p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-line/30 pb-3 mb-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text">
            Dataset Preview Workspace
          </h3>
          <div className="flex border border-line rounded-full overflow-hidden p-0.5 bg-page-bg/50">
            <button
              onClick={() => setActiveDataView("working")}
              className={`px-4 py-1 rounded-full text-xs font-label uppercase tracking-wider transition-colors ${
                activeDataView === "working" ? "bg-black text-page-bg shadow" : "text-text hover:bg-soft-card-2"
              }`}
            >
              Working Data (Cleaned)
            </button>
          </div>
        </div>

        {tableData && tableData.rows && tableData.rows.length > 0 ? (
          <div className="overflow-x-auto max-h-[400px] border border-line/60 rounded-xl">
            <table className="w-full text-xs font-mono text-left">
              <thead className="bg-soft-card-2 sticky top-0 z-10">
                <tr className="border-b border-line">
                  <th className="p-3 border-r border-line bg-soft-card font-bold text-text text-[9px] uppercase tracking-wider">#</th>
                  {tableData.columns.map((col: string) => (
                    <th key={col} className="p-3 border-r border-line bg-soft-card font-bold text-text text-[9px] uppercase tracking-wider truncate max-w-[150px]">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.rows.slice(0, 50).map((row: any, rIdx: number) => (
                  <tr key={rIdx} className="hover:bg-page-bg/30 border-b border-line/25">
                    <td className="p-3 border-r border-line/30 bg-soft-card-2/20 text-muted font-bold">{rIdx + 1}</td>
                    {tableData.columns.map((col: string) => {
                      const val = row[col];
                      const isNull = val === null || val === undefined || val === "";
                      return (
                        <td
                          key={col}
                          title={isNull ? undefined : "Hover to reveal sensitive data"}
                          className={`p-3 border-r border-line/20 truncate max-w-[150px] ${
                            isNull ? "bg-page-bg/10 text-muted-light italic" : "text-text blur-[5px] hover:blur-none select-none transition-all duration-300 cursor-pointer"
                          }`}
                        >
                          {isNull ? "null" : String(val)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 border border-line bg-page-bg/30 text-center text-xs text-muted font-mono rounded-xl">
            No rows loaded. Ingest a dataset first.
          </div>
        )}
        <div className="mt-3 text-right">
          <span className="text-[10px] uppercase font-bold text-muted">
            Showing first {tableData?.rows?.length || 0} rows. All operations affect the entire dataset.
          </span>
        </div>
      </div>
    </div>
  );
}
