import React, { useState, useEffect } from "react";
import { X, Eye, EyeOff } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  weights: {
    completeness: number;
    validity: number;
    uniqueness: number;
    consistency: number;
    timeliness: number;
  };
  onSaveWeights: (weights: any) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
  weights,
  onSaveWeights,
}: SettingsModalProps) {
  const [keyInput, setKeyInput] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [weightInputs, setWeightInputs] = useState(weights);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    setKeyInput(apiKey);
  }, [apiKey]);

  useEffect(() => {
    setWeightInputs(weights);
  }, [weights]);

  if (!isOpen) return null;

  const handleWeightChange = (field: string, value: string) => {
    const numericVal = parseFloat(value) || 0;
    const newWeights = { ...weightInputs, [field]: numericVal / 100 };
    setWeightInputs(newWeights);

    const sum = Object.values(newWeights).reduce((a, b) => a + b, 0);
    if (Math.abs(sum - 1.0) > 0.001) {
      setValidationError(`Weights must sum to 100%. Current sum: ${Math.round(sum * 100)}%`);
    } else {
      setValidationError("");
    }
  };

  const handleSave = () => {
    const sum = Object.values(weightInputs).reduce((a, b) => a + b, 0);
    if (Math.abs(sum - 1.0) > 0.001) {
      setValidationError("Cannot save. Weights must sum to exactly 100%.");
      return;
    }
    onSaveApiKey(keyInput);
    onSaveWeights(weightInputs);
    onClose();
  };

  const sumPercent = Math.round(
    Object.values(weightInputs).reduce((a, b) => a + b, 0) * 100
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white-card border border-line w-full max-w-lg p-6 rounded-[32px] shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 hover:bg-soft-card-2 p-1.5 text-text rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <h2 className="text-xl font-bold tracking-tight mb-6 uppercase border-b border-line/30 pb-3 text-text">
          Pipeline Settings
        </h2>

        {/* Gemini API Key */}
        <div className="mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted">
            Google Gemini API Key
          </label>
          <div className="relative border border-line focus-within:border-black rounded-xl bg-page-bg/40 flex items-center pr-3 overflow-hidden transition-colors">
            <input
              type={showKey ? "text" : "password"}
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="AI semantic cleaning requires a Gemini Key"
              className="w-full p-3 text-xs bg-transparent outline-none font-mono text-text"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="text-muted hover:text-black focus:outline-none"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-muted mt-1.5">
            Stored locally in your browser. Generous free tier rate limits apply on Gemini 1.5/2.0 Flash.
          </p>
        </div>

        {/* Dimension Weights */}
        <div className="mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider mb-3 text-muted">
            AI-Readiness Score Weights
          </label>
          <div className="space-y-3">
            {Object.entries(weightInputs).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wide text-text font-mono">
                  {key}
                </span>
                <div className="flex items-center w-24 border border-line focus-within:border-black rounded-lg bg-page-bg/40 overflow-hidden transition-colors">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={Math.round(val * 100)}
                    onChange={(e) => handleWeightChange(key, e.target.value)}
                    className="w-full p-2 text-right text-xs outline-none bg-transparent font-mono text-text"
                  />
                  <span className="text-xs pr-2 text-muted font-bold">%</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-line/30 flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-muted">Total Sum:</span>
            <span className={`text-sm font-mono font-bold ${validationError ? "text-[#FF4B2B]" : "text-text"}`}>
              {sumPercent}%
            </span>
          </div>

          {validationError && (
            <p className="text-xs font-bold border border-line p-3 mt-3 bg-soft-card-2 rounded-xl text-text shadow-sm">
              {validationError}
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-line/30">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-line hover:border-black bg-white-card hover:bg-soft-card-2 text-text rounded-full text-xs font-label uppercase tracking-wider transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-black hover:bg-black/90 text-page-bg rounded-full text-xs font-label uppercase tracking-wider transition-colors shadow"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
