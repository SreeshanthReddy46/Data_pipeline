import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface ProfilerTabProps {
  profile: any;
}

export default function ProfilerTab({ profile }: ProfilerTabProps) {
  const columns = Object.keys(profile.columns);
  const [selectedCol, setSelectedCol] = useState<string>(columns[0] || "");
  const [heatmapType, setHeatmapType] = useState<"missing" | "correlation">("missing");

  const colProfile = profile.columns[selectedCol];
  const correlationMatrix = profile.correlation_matrix || [];
  const missingMatrix = profile.missing_matrix || [];

  const sampleSize = 50;
  const uniqueCols = columns;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white-card border border-line p-2 text-xs font-mono rounded-lg shadow-md">
          <p className="font-bold text-text">{payload[0].name === "count" ? "Count" : payload[0].name}: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  const getCorrelationColor = (val: number) => {
    const absVal = Math.abs(val);
    if (absVal >= 0.8) return "bg-black text-page-bg";
    if (absVal >= 0.6) return "bg-muted text-page-bg";
    if (absVal >= 0.4) return "bg-soft-card text-text";
    if (absVal >= 0.2) return "bg-soft-card-2 text-text";
    if (absVal >= 0.05) return "bg-[#F9F8F6] text-muted";
    return "bg-white-card text-muted-light";
  };

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Rows", value: profile.row_count },
          { label: "Total Columns", value: profile.col_count },
          { label: "Duplicate Rows", value: `${profile.duplicate_rows} (${profile.duplicate_percentage}%)` },
          { label: "Total Cells", value: profile.row_count * profile.col_count }
        ].map((item, idx) => (
          <div key={idx} className="border border-line rounded-2xl p-5 bg-white-card flex flex-col justify-between shadow-sm">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-muted">{item.label}</span>
            <span className="text-2xl font-bold font-mono mt-2 text-text">{item.value}</span>
          </div>
        ))}
      </div>

      {/* Main Profiler Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column Selector */}
        <div className="lg:col-span-4 border border-line rounded-[24px] p-5 bg-white-card flex flex-col h-[520px] shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider pb-3 border-b border-line/30 mb-3 text-text">
            Dataset Schema ({columns.length} Columns)
          </h3>
          <div className="overflow-y-auto flex-1 space-y-2 pr-2 scrollbar-thin">
            {columns.map((col) => {
              const info = profile.columns[col];
              const isSelected = selectedCol === col;
              return (
                <button
                  key={col}
                  onClick={() => setSelectedCol(col)}
                  className={`w-full text-left p-3.5 border transition-all duration-200 flex items-center justify-between text-sm rounded-xl ${
                    isSelected
                      ? "bg-black border-black text-page-bg font-semibold shadow"
                      : "bg-page-bg/40 border-line/45 hover:border-black text-text"
                  }`}
                >
                  <div className="truncate pr-2">
                    <p className="truncate font-mono text-xs">{col}</p>
                    <span className={`text-[10px] uppercase font-extrabold ${isSelected ? "text-muted-light" : "text-muted"}`}>
                      {info.type}
                    </span>
                  </div>
                  <span className={`text-xs font-mono ${isSelected ? "text-page-bg/85" : "text-muted"}`}>
                    {info.null_count > 0 ? `${info.null_percentage}% null` : "clean"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column Stats & Chart */}
        <div className="lg:col-span-8 border border-line rounded-[24px] p-6 bg-white-card h-[520px] flex flex-col justify-between shadow-sm">
          {colProfile ? (
            <div className="flex-1 flex flex-col h-full justify-between">
              
              {/* Header */}
              <div className="border-b border-line/30 pb-3 mb-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold font-mono text-text">{selectedCol}</h3>
                  <span className="bg-black text-page-bg px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono">
                    {colProfile.type}
                  </span>
                </div>
                <div className="flex gap-4 mt-2 text-xs text-muted">
                  <p>Missing: <span className="font-mono text-text font-semibold">{colProfile.null_count} ({colProfile.null_percentage}%)</span></p>
                  <p>Unique Values: <span className="font-mono text-text font-semibold">{colProfile.unique_count}</span></p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 overflow-hidden">
                {/* Stats Table */}
                <div className="md:col-span-5 overflow-y-auto pr-2 scrollbar-thin">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider mb-2 text-muted">Column Statistics</h4>
                  <table className="w-full text-xs font-mono border border-line/50 rounded-lg overflow-hidden">
                    <tbody>
                      <tr className="border-b border-line/50 bg-soft-card-2">
                        <td className="p-2 font-bold uppercase text-[9px] text-text">Metric</td>
                        <td className="p-2 text-right font-bold uppercase text-[9px] text-text">Value</td>
                      </tr>
                      {colProfile.type === "numeric" ? (
                        <>
                          <tr className="border-b border-line/20 bg-page-bg/10">
                            <td className="p-2 text-muted text-[11px]">Minimum</td>
                            <td className="p-2 text-right text-text">{colProfile.min !== null ? colProfile.min : "N/A"}</td>
                          </tr>
                          <tr className="border-b border-line/20 bg-page-bg/10">
                            <td className="p-2 text-muted text-[11px]">Maximum</td>
                            <td className="p-2 text-right text-text">{colProfile.max !== null ? colProfile.max : "N/A"}</td>
                          </tr>
                          <tr className="border-b border-line/20 bg-page-bg/10">
                            <td className="p-2 text-muted text-[11px]">Mean</td>
                            <td className="p-2 text-right text-text">{colProfile.mean !== null ? roundVal(colProfile.mean) : "N/A"}</td>
                          </tr>
                          <tr className="border-b border-line/20 bg-page-bg/10">
                            <td className="p-2 text-muted text-[11px]">Median</td>
                            <td className="p-2 text-right text-text">{colProfile.median !== null ? roundVal(colProfile.median) : "N/A"}</td>
                          </tr>
                          <tr className="border-b border-line/20 bg-page-bg/10">
                            <td className="p-2 text-muted text-[11px]">Std Deviation</td>
                            <td className="p-2 text-right text-text">{colProfile.std !== null ? roundVal(colProfile.std) : "N/A"}</td>
                          </tr>
                          <tr className="border-b border-line/20 bg-page-bg/10">
                            <td className="p-2 text-muted text-[11px]">Outliers (IQR)</td>
                            <td className="p-2 text-right font-bold text-text">{colProfile.outlier_count || 0}</td>
                          </tr>
                        </>
                      ) : colProfile.type === "datetime" ? (
                        <>
                          <tr className="border-b border-line/20 bg-page-bg/10">
                            <td className="p-2 text-muted text-[11px]">Earliest Date</td>
                            <td className="p-2 text-right truncate max-w-[120px] text-text">{colProfile.min ? formatDate(colProfile.min) : "N/A"}</td>
                          </tr>
                          <tr className="border-b border-line/20 bg-page-bg/10">
                            <td className="p-2 text-muted text-[11px]">Latest Date</td>
                            <td className="p-2 text-right truncate max-w-[120px] text-text">{colProfile.max ? formatDate(colProfile.max) : "N/A"}</td>
                          </tr>
                        </>
                      ) : (
                        <>
                          <tr className="border-b border-line/20 bg-page-bg/10">
                            <td className="p-2 text-muted text-[11px]">Distinct labels</td>
                            <td className="p-2 text-right text-text">{colProfile.unique_count}</td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Distribution Chart */}
                <div className="md:col-span-7 flex flex-col h-full min-h-[220px]">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider mb-2 text-muted">Value Distribution</h4>
                  {colProfile.distribution && colProfile.distribution.length > 0 ? (
                    <div className="w-full flex-1 border border-line rounded-xl p-3 bg-page-bg/40">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={colProfile.distribution}
                          margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                        >
                          <XAxis
                            dataKey={colProfile.type === "numeric" ? "bin" : "value"}
                            tick={{ fontSize: 9, fontFamily: "monospace", fill: "#8C8880" }}
                            axisLine={{ stroke: "#D9D7D0" }}
                            tickLine={{ stroke: "#D9D7D0" }}
                          />
                          <YAxis
                            tick={{ fontSize: 9, fontFamily: "monospace", fill: "#8C8880" }}
                            axisLine={{ stroke: "#D9D7D0" }}
                            tickLine={{ stroke: "#D9D7D0" }}
                          />
                          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(27, 27, 27, 0.03)" }} />
                          <Bar
                            dataKey="count"
                            fill="#1B1B1B"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="w-full flex-1 border border-line rounded-xl bg-page-bg/30 flex items-center justify-center text-xs text-muted font-mono">
                      No distribution data available
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-sm font-mono text-muted">
              Select a column to view profile statistics.
            </div>
          )}
        </div>
      </div>

      {/* Heatmaps & Matrices Section */}
      <div className="border border-line rounded-[32px] bg-white-card p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-line/30 pb-3 mb-4 gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text">
            Dataset Structural Matrix
          </h3>
          <div className="flex border border-line rounded-full overflow-hidden p-0.5 bg-page-bg/50">
            <button
              onClick={() => setHeatmapType("missing")}
              className={`px-4 py-1.5 rounded-full text-xs font-label uppercase tracking-wider transition-colors ${
                heatmapType === "missing" ? "bg-black text-page-bg shadow" : "text-text hover:bg-soft-card-2"
              }`}
            >
              Missing Values Matrix
            </button>
            <button
              onClick={() => setHeatmapType("correlation")}
              className={`px-4 py-1.5 rounded-full text-xs font-label uppercase tracking-wider transition-colors ${
                heatmapType === "correlation" ? "bg-black text-page-bg shadow" : "text-text hover:bg-soft-card-2"
              }`}
            >
              Correlation Heatmap
            </button>
          </div>
        </div>

        {heatmapType === "missing" ? (
          <div className="space-y-4">
            <p className="text-xs text-muted leading-relaxed font-sans">
              Visualizes cells downsampled over the dataset. 
              <span className="font-bold text-text border border-line px-2 py-0.5 ml-2 mr-1 bg-black text-page-bg rounded-md">Solid black</span> cell denotes a missing (NULL) value. 
              <span className="font-bold text-muted border border-line px-2 py-0.5 mr-1 bg-[#FFFDF8] rounded-md">Cream cell</span> denotes valid present data.
            </p>
            {missingMatrix.length > 0 ? (
              <div
                className="grid gap-[1px] border border-line/40 bg-line/20 p-[1px] overflow-x-auto rounded-xl"
                style={{
                  gridTemplateColumns: `repeat(${uniqueCols.length}, minmax(100px, 1fr))`,
                }}
              >
                {/* Column Headers */}
                {uniqueCols.map((col) => (
                  <div key={col} className="bg-white-card p-2 text-[10px] font-mono font-bold truncate text-center text-text select-none border-b border-line/30">
                    {col}
                  </div>
                ))}

                {/* Matrix grid cells */}
                {Array.from({ length: sampleSize }).map((_, rIdx) => {
                  return uniqueCols.map((col) => {
                    const cell = missingMatrix.find(
                      (m: any) => m.sample_idx === rIdx && m.column === col
                    );
                    const isMissing = cell ? cell.is_missing === 1 : false;
                    return (
                      <div
                        key={`${rIdx}-${col}`}
                        className={`h-4 border-[0.5px] border-line/10 ${
                          isMissing ? "bg-black" : "bg-[#FFFDF8]"
                        }`}
                        title={`Row index: ~${Math.round(
                          (profile.row_count / sampleSize) * rIdx
                        )}, Column: ${col}, Status: ${isMissing ? "Missing" : "Valid"}`}
                      />
                    );
                  });
                })}
              </div>
            ) : (
              <div className="p-8 border border-line bg-page-bg/30 text-center text-xs text-muted font-mono rounded-xl">
                No matrix data computed.
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-muted leading-relaxed font-sans">
              Shows Pearson correlation coefficient between numerical fields. 
              Darker cells represent stronger positive/negative linear relationships (|r| close to 1).
            </p>
            {correlationMatrix.length > 0 ? (
              <div className="overflow-x-auto rounded-2xl border border-line">
                <table className="border-collapse w-full font-mono text-xs text-left">
                  <thead>
                    <tr className="bg-soft-card-2 border-b border-line">
                      <th className="p-3 font-bold text-text border-r border-line"></th>
                      {Array.from(new Set(correlationMatrix.map((m: any) => m.col1))).map((col: any) => (
                        <th key={col} className="p-3 font-bold text-text border-r border-line text-center">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from(new Set(correlationMatrix.map((m: any) => m.col1))).map((col1: any) => (
                      <tr key={col1} className="border-b border-line hover:bg-page-bg/30">
                        <td className="p-3 font-bold text-text bg-soft-card-2/40 border-r border-line">{col1}</td>
                        {Array.from(new Set(correlationMatrix.map((m: any) => m.col2))).map((col2: any) => {
                          const item = correlationMatrix.find(
                            (m: any) => m.col1 === col1 && m.col2 === col2
                          );
                          const value = item ? item.correlation : 0;
                          return (
                            <td
                              key={col2}
                              className={`p-3 text-center select-none font-bold border-r border-line ${getCorrelationColor(
                                value
                              )}`}
                              title={`Correlation between ${col1} and ${col2}: ${value}`}
                            >
                              {value.toFixed(2)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 border border-line bg-page-bg/30 text-center text-xs text-muted font-mono rounded-xl">
                Requires at least 2 numerical columns to compute correlations.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Helpers
function roundVal(num: number): string {
  return parseFloat(num.toFixed(2)).toLocaleString();
}

function formatDate(isoStr: string): string {
  try {
    return isoStr.substring(0, 10);
  } catch {
    return isoStr;
  }
}
