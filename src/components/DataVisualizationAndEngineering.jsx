import React, { useEffect, useState, useContext } from "react";
import Plot from "react-plotly.js";
import { AppContext } from "../context/AppContext";

const BACKEND_URL = "https://manufacturing-copilot-backend.onrender.com";

const DataVisualizationAndEngineering = () => {
  const { uploadedFile } = useContext(AppContext);

  // Shared states
  const [columns, setColumns] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [plotData, setPlotData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch columns on mount
  useEffect(() => {
    const fetchColumns = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/get_columns`, {
          method: "GET",
        });
        if (!response.ok) {
          throw new Error("Failed to fetch columns");
        }
        const data = await response.json();
        if (data.columns) {
          setColumns(data.columns);
        } else {
          setError(data.error || "No columns found.");
        }
      } catch (err) {
        console.error(err);
        setError("Error fetching columns.");
      }
    };
    fetchColumns();
  }, []);

  // Handle column selection (checkbox toggle)
  const toggleColumn = (col) => {
    setSelectedColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  // Variability Analysis
  const runVariabilityAnalysis = async () => {
    if (selectedColumns.length === 0) {
      setError("Please select at least one column for analysis.");
      return;
    }

    setError("");
    setLoading(true);
    setPlotData(null);

    try {
      // For now, run analysis only for the first selected column
      const selectedCol = selectedColumns[0];
      const prompt = `Perform variability analysis where selected variable is ${selectedCol}`;

      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();

      if (result.type === "plot" && result.data) {
        setPlotData(result.data);
      } else {
        setError("Unexpected response from server.");
      }
    } catch (err) {
      console.error(err);
      setError("Error running variability analysis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full">
      {/* Left Panel */}
      <div className="w-1/3 p-4 space-y-4 overflow-y-auto border-r border-gray-300">
        {/* Variability Analysis Card */}
        <div className="border rounded-lg p-4 shadow bg-white">
          <h3 className="text-lg font-semibold mb-2">Variability Analysis</h3>

          {uploadedFile && uploadedFile.name && (
            <p className="mb-2 text-sm text-gray-600">
              <strong>File:</strong> {uploadedFile.name}
            </p>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}

          {columns.length > 0 ? (
            <>
              <p className="mb-1 text-sm font-medium">Select Columns:</p>
              <div className="max-h-48 overflow-y-auto border rounded p-2 mb-3">
                {columns.map((col) => (
                  <label
                    key={col}
                    className="flex items-center space-x-2 text-sm mb-1"
                  >
                    <input
                      type="checkbox"
                      checked={selectedColumns.includes(col)}
                      onChange={() => toggleColumn(col)}
                      className="form-checkbox"
                    />
                    <span>{col}</span>
                  </label>
                ))}
              </div>

              <button
                onClick={runVariabilityAnalysis}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Running..." : "Run Analysis"}
              </button>
            </>
          ) : (
            <p>No columns available. Please upload a file first.</p>
          )}
        </div>

        {/* More cards like Missing Value Analysis will go here */}
      </div>

      {/* Right Panel */}
      <div className="flex-1 p-4 overflow-y-auto">
        {plotData && (
          <div className="border rounded-lg p-4 shadow bg-white">
            <Plot
              data={plotData.data}
              layout={plotData.layout}
              config={{ responsive: true }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DataVisualizationAndEngineering;
