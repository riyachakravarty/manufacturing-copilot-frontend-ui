import React, { useEffect, useState, useContext } from "react";
import Plot from "react-plotly.js";
import { AppContext } from "../context/AppContext";

const BACKEND_URL = "https://manufacturing-copilot-backend.onrender.com";

const DataVisualizationAndEngineering = () => {
  const { uploadedFile } = useContext(AppContext);
  const [columns, setColumns] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [plotData, setPlotData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Get column names from backend
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

  // Run variability analysis
  const runAnalysis = async () => {
    if (!selectedColumn) {
      setError("Please select a column for analysis.");
      return;
    }

    setError("");
    setLoading(true);
    setPlotData(null);

    try {
      const prompt = `Perform variability analysis where selected variable is ${selectedColumn}`;
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
    <div className="card">
      <h2>Data Visualization & Engineering</h2>
      <div className="card">
        <h3>Variability Analysis</h3>

        {uploadedFile && uploadedFile.name && (
          <p>
            <strong>File:</strong> {uploadedFile.name}
          </p>
        )}

        {error && <p style={{ color: "red" }}>{error}</p>}

        {columns.length > 0 ? (
          <>
            <label>Select Column: </label>
            <select
              value={selectedColumn}
              onChange={(e) => setSelectedColumn(e.target.value)}
            >
              <option value="">--Select--</option>
              {columns.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>

            <button onClick={runAnalysis} disabled={loading}>
              {loading ? "Running..." : "Run Analysis"}
            </button>
          </>
        ) : (
          <p>No columns available. Please upload a file first.</p>
        )}

        {plotData && (
          <Plot
            data={plotData.data}
            layout={plotData.layout}
            config={{ responsive: true }}
          />
        )}
      </div>
    </div>
  );
};

export default DataVisualizationAndEngineering;
