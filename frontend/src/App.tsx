import { useState, useEffect } from "react";
import { Settings, BarChart2, Table, CheckSquare, ArrowLeft, Home, Loader2 } from "lucide-react";
import BubbleMenu from "./components/BubbleMenu";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import ProfilerTab from "./components/ProfilerTab";
import RemediatorTab from "./components/RemediatorTab";
import ReadinessReportTab from "./components/ReadinessReportTab";
import SettingsModal from "./components/SettingsModal";
const API_BASE = "http://localhost:8000";

export default function App() {
  const [currentPage, setCurrentPage] = useState<"landing" | "app">("landing");
  const [datasets, setDatasets] = useState<any[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(null);
  const [datasetDetails, setDatasetDetails] = useState<any | null>(null);
  const [tableData, setTableData] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "clean" | "score">("profile");

  const [loading, setLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Local storage properties
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("gemini_api_key") || "");
  const [weights, setWeights] = useState(() => {
    try {
      const stored = localStorage.getItem("dataset_weights");
      return stored ? JSON.parse(stored) : {
        completeness: 0.25,
        validity: 0.25,
        uniqueness: 0.20,
        consistency: 0.20,
        timeliness: 0.10
      };
    } catch {
      return {
        completeness: 0.25,
        validity: 0.25,
        uniqueness: 0.20,
        consistency: 0.20,
        timeliness: 0.10
      };
    }
  });

  // Fetch list of datasets on load
  const fetchDatasets = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/datasets`);
      if (res.ok) {
        const data = await res.json();
        setDatasets(data);
      }
    } catch (err) {
      console.error("Failed to fetch datasets list", err);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem("gemini_api_key", key);
  };

  const handleSaveWeights = (newWeights: any) => {
    setWeights(newWeights);
    localStorage.setItem("dataset_weights", JSON.stringify(newWeights));
  };

  // Fetch details and preview data of a dataset
  const selectDataset = async (id: string) => {
    setLoading(true);
    try {
      setSelectedDatasetId(id);

      const resDetails = await fetch(`${API_BASE}/api/datasets/${id}`);
      if (!resDetails.ok) throw new Error("Failed to load dataset details");
      const details = await resDetails.json();
      setDatasetDetails(details);

      const resData = await fetch(`${API_BASE}/api/datasets/${id}/data?page=1&page_size=50`);
      if (!resData.ok) throw new Error("Failed to load dataset rows");
      const rData = await resData.json();
      setTableData(rData);

      setActiveTab("profile");
    } catch (err: any) {
      alert(err.message || "Failed to load dataset");
      setSelectedDatasetId(null);
    } finally {
      setLoading(false);
    }
  };

  // Trigger file upload
  const handleUpload = async (file: File) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE}/api/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Upload failed");
      }

      const data = await res.json();
      await fetchDatasets();
      await selectDataset(data.id);
      setCurrentPage("app");
    } catch (err: any) {
      alert(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // Trigger demo registry
  const handleLoadDemo = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/datasets/demo`, {
        method: "POST"
      });

      if (!res.ok) throw new Error("Failed to load demo dataset");
      const data = await res.json();
      await fetchDatasets();
      await selectDataset(data.id);
      setCurrentPage("app");
    } catch (err: any) {
      alert(err.message || "Failed to load demo");
    } finally {
      setLoading(false);
    }
  };

  // Run a remediation fix
  const handleRemediate = async (payload: any) => {
    if (!selectedDatasetId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/datasets/${selectedDatasetId}/remediate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-gemini-key": apiKey
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Remediation failed");
      }

      // Reload dataset
      await selectDataset(selectedDatasetId);
    } catch (err: any) {
      alert(err.message || "Failed to apply fix");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Reset dataset
  const handleReset = async () => {
    if (!selectedDatasetId) return;
    if (!window.confirm("Are you sure you want to revert this dataset to its original uploaded state? This will delete all audit trail steps.")) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/datasets/${selectedDatasetId}/reset`, {
        method: "POST"
      });

      if (!res.ok) throw new Error("Failed to reset dataset");
      await selectDataset(selectedDatasetId);
    } catch (err: any) {
      alert(err.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  // Downloads
  const downloadCSV = () => {
    if (!selectedDatasetId) return;
    window.open(`${API_BASE}/api/datasets/${selectedDatasetId}/export`);
  };

  const downloadPDF = () => {
    if (!selectedDatasetId) return;
    window.open(`${API_BASE}/api/datasets/${selectedDatasetId}/report`);
  };

  return (
    <div className="min-h-screen bg-page-bg text-text font-body-lg flex flex-col antialiased overflow-x-hidden">
      {/* Floating BubbleMenu – Global Header */}
      <BubbleMenu
        useFixedPosition={true}
        logo={
          <div 
            onClick={() => {
              setSelectedDatasetId(null);
              setDatasetDetails(null);
              setTableData(null);
              setCurrentPage("landing");
            }}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <span className="font-bold text-lg leading-none font-mono">D</span>
            <span className="font-mono font-extrabold text-xs uppercase tracking-widest text-text">DATA.READY</span>
          </div>
        }
        items={[
          {
            label: 'home',
            href: '#',
            ariaLabel: 'Home',
            rotation: -8,
            hoverStyles: { bgColor: '#3b82f6', textColor: '#ffffff' },
            onClick: () => {
              setSelectedDatasetId(null);
              setDatasetDetails(null);
              setTableData(null);
              setCurrentPage("landing");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          },
          { 
            label: 'features', 
            href: '#features', 
            ariaLabel: 'Features', 
            rotation: 8, 
            hoverStyles: { bgColor: '#10b981', textColor: '#ffffff' },
            onClick: () => {
              if (currentPage !== "landing") {
                setCurrentPage("landing");
                setTimeout(() => {
                  const el = document.getElementById("features");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }, 200);
              } else {
                const el = document.getElementById("features");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }
            }
          },
          { 
            label: 'use cases', 
            href: '#usecases', 
            ariaLabel: 'Use Cases', 
            rotation: 8, 
            hoverStyles: { bgColor: '#f59e0b', textColor: '#ffffff' },
            onClick: () => {
              if (currentPage !== "landing") {
                setCurrentPage("landing");
                setTimeout(() => {
                  const el = document.getElementById("usecases");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }, 200);
              } else {
                const el = document.getElementById("usecases");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }
            }
          },
          {
            label: 'workspace',
            href: '#',
            ariaLabel: 'Workspace',
            rotation: 8,
            hoverStyles: { bgColor: '#ef4444', textColor: '#ffffff' },
            onClick: () => {
              setCurrentPage("app");
            }
          },
          {
            label: 'contact',
            href: '#contact-section',
            ariaLabel: 'Contact',
            rotation: -8,
            hoverStyles: { bgColor: '#8b5cf6', textColor: '#ffffff' },
            onClick: () => {
              if (currentPage !== "landing") {
                setCurrentPage("landing");
                setTimeout(() => {
                  const el = document.getElementById("contact-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }, 200);
              } else {
                const el = document.getElementById("contact-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }
            }
          },
        ]}
      />

      {/* Top Navbar */}
      {currentPage === "app" && (
        <header className="border-b border-line/30 py-4 px-4 sm:px-margin flex items-center justify-between sticky top-0 bg-white-card/85 backdrop-blur-md z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (selectedDatasetId) {
                  setSelectedDatasetId(null);
                  setDatasetDetails(null);
                  setTableData(null);
                  fetchDatasets();
                } else {
                  setCurrentPage("landing");
                }
              }}
              className="hover:bg-soft-card p-1 border border-line/50 transition-colors rounded-lg flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 text-text" />
            </button>

            <button
              onClick={() => {
                setSelectedDatasetId(null);
                setDatasetDetails(null);
                setTableData(null);
                setCurrentPage("landing");
              }}
              className="font-extrabold text-sm uppercase tracking-widest bg-black text-page-bg px-3 py-1 rounded-full select-none hover:opacity-85 font-mono"
            >
              DATA.READY
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => {
                setSelectedDatasetId(null);
                setDatasetDetails(null);
                setTableData(null);
                setCurrentPage("landing");
              }}
              className="flex items-center gap-2 border border-line hover:border-black hover:bg-soft-card-2 px-4 py-2 rounded-full text-xs font-label uppercase tracking-wider transition-colors shiny-border-light"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Home</span>
            </button>

            <button
              onClick={() => setSettingsOpen(true)}
              className="flex items-center gap-2 bg-black text-page-bg hover:bg-black/90 px-4 py-2 rounded-full text-xs font-label uppercase tracking-wider transition-colors shiny-border-dark"
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Settings</span>
            </button>
          </div>
        </header>
      )}

      {currentPage === "landing" ? (
        <LandingPage
          onGetStarted={() => setCurrentPage("app")}
          onLoadDemo={handleLoadDemo}
        />
      ) : (
        <main className="flex-1 max-w-[1728px] w-full mx-auto px-4 sm:px-margin py-8">
          <div className="space-y-6">
            {!selectedDatasetId ? (
              <Dashboard
                datasets={datasets}
                onUpload={handleUpload}
                onLoadDemo={handleLoadDemo}
                onSelectDataset={selectDataset}
                loading={loading}
              />
            ) : (
              <div className="space-y-6">
                {/* Selected Dataset Details Sub-Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-line pb-4">
                  <div>
                    <h1 className="text-xl font-extrabold uppercase font-mono tracking-tight text-text">
                      {datasetDetails?.filename}
                    </h1>
                    <div className="flex gap-4 text-xs text-muted font-mono mt-1">
                      <span>Rows: {datasetDetails?.row_count}</span>
                      <span>•</span>
                      <span>Columns: {datasetDetails?.col_count}</span>
                      <span>•</span>
                      <span>Readiness: {datasetDetails?.current_score}/100</span>
                    </div>
                  </div>

                  {/* View Selector Tabs */}
                  <div className="flex border border-line rounded-full bg-white-card p-1 shadow-sm overflow-x-auto scrollbar-none max-w-full shrink-0">
                    <button
                      onClick={() => setActiveTab("profile")}
                      className={`px-4 py-2 rounded-full text-xs font-label uppercase tracking-wider transition-colors flex items-center gap-2 shrink-0 ${activeTab === "profile"
                        ? "bg-black text-page-bg shadow"
                        : "text-text hover:bg-soft-card-2"
                        }`}
                    >
                      <BarChart2 className="w-3.5 h-3.5" />
                      Profile & Stats
                    </button>
                    <button
                      onClick={() => setActiveTab("clean")}
                      className={`px-4 py-2 rounded-full text-xs font-label uppercase tracking-wider transition-colors flex items-center gap-2 shrink-0 ${activeTab === "clean"
                        ? "bg-black text-page-bg shadow"
                        : "text-text hover:bg-soft-card-2"
                        }`}
                    >
                      <Table className="w-3.5 h-3.5" />
                      Remediation ({datasetDetails?.issues?.length || 0})
                    </button>
                    <button
                      onClick={() => setActiveTab("score")}
                      className={`px-4 py-2 rounded-full text-xs font-label uppercase tracking-wider transition-colors flex items-center gap-2 shrink-0 ${activeTab === "score"
                        ? "bg-black text-page-bg shadow"
                        : "text-text hover:bg-soft-card-2"
                        }`}
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      Readiness Report
                    </button>
                  </div>
                </div>

                {/* Selected Tab content */}
                {loading && !datasetDetails ? (
                  <div className="flex items-center justify-center p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-black" />
                  </div>
                ) : (
                  <>
                    {activeTab === "profile" && datasetDetails && (
                      <ProfilerTab profile={datasetDetails.profile} />
                    )}

                    {activeTab === "clean" && datasetDetails && (
                      <RemediatorTab
                        datasetId={selectedDatasetId}
                        issues={datasetDetails.issues}
                        onRemediate={handleRemediate}
                        onReset={handleReset}
                        tableData={tableData}
                        loading={loading}
                      />
                    )}

                    {activeTab === "score" && datasetDetails && (
                      <ReadinessReportTab
                        datasetId={selectedDatasetId}
                        score={datasetDetails.score}
                        lineage={datasetDetails.lineage}
                        auditLogs={datasetDetails.audit_logs}
                        onDownloadCSV={downloadCSV}
                        onDownloadPDF={downloadPDF}
                      />
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </main>
      )}

        {/* Global Footer */}
        <footer className="border-t border-line/20 py-6 text-center text-[10px] uppercase font-bold tracking-widest text-muted">
          Local-Only Sandbox • Zero Data Exposure Architecture
        </footer>

        {/* Settings Modal */}
        <SettingsModal
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          apiKey={apiKey}
          onSaveApiKey={handleSaveApiKey}
          weights={weights}
          onSaveWeights={handleSaveWeights}
        />
      </div>
      );
}
