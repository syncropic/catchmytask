// PythonRunner.tsx
"use client";

import MonacoEditor from "@components/MonacoEditor";
import { useParsed } from "@refinedev/core";
import { IconAlertTriangle, IconClock } from "@tabler/icons-react";
import React, { useEffect, useRef, useState } from "react";
import { useAppStore } from "src/store";

// Types
interface ExecutionMetrics {
  executionTime?: number;
  error?: string;
}

interface PythonRunnerProps {
  code: string;
  className?: string;
  onExecutionComplete?: (result: string, metrics: ExecutionMetrics) => void;
}

declare global {
  interface Window {
    loadPyodide: (config: { indexURL: string }) => Promise<any>;
  }
}

const PythonRunner: React.FC<PythonRunnerProps> = ({
  code,
  className = "",
  onExecutionComplete,
}) => {
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pyodideRef = useRef<any>(null);
  const scriptLoadedRef = useRef<boolean>(false);

  useEffect(() => {
    const loadPyodideScript = () => {
      return new Promise<void>((resolve, reject) => {
        if (scriptLoadedRef.current) {
          resolve();
          return;
        }

        const existingScript = document.querySelector(
          'script[src*="pyodide.js"]'
        );
        if (existingScript) {
          scriptLoadedRef.current = true;
          resolve();
          return;
        }

        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js";
        script.async = true;

        script.onload = () => {
          scriptLoadedRef.current = true;
          resolve();
        };

        script.onerror = () => {
          reject(new Error("Failed to load Pyodide script"));
        };

        document.body.appendChild(script);
      });
    };

    const initPyodide = async () => {
      try {
        await loadPyodideScript();

        if (!pyodideRef.current) {
          pyodideRef.current = await window.loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/",
          });

          // Set up IO capturing
          await pyodideRef.current.runPythonAsync(`
            import sys
            from io import StringIO
            sys.stdout = StringIO()
            sys.stderr = StringIO()
          `);
        }

        setIsLoading(false);
      } catch (err) {
        setError("Failed to initialize Python environment");
        setIsLoading(false);
      }
    };

    initPyodide();

    // Cleanup function - don't remove the script as it might be needed by other instances
    return () => {
      pyodideRef.current = null;
    };
  }, []);

  useEffect(() => {
    const runCode = async () => {
      if (!pyodideRef.current || isLoading) return;

      try {
        // Reset output buffers
        await pyodideRef.current.runPythonAsync(`
          sys.stdout.seek(0)
          sys.stdout.truncate(0)
          sys.stderr.seek(0)
          sys.stderr.truncate(0)
        `);

        const startTime = performance.now();

        // Run the code
        await pyodideRef.current.runPythonAsync(code);

        // Get output
        const stdout = await pyodideRef.current.runPythonAsync(
          "sys.stdout.getvalue()"
        );
        const stderr = await pyodideRef.current.runPythonAsync(
          "sys.stderr.getvalue()"
        );

        const execTime = Math.round(performance.now() - startTime);

        setOutput(stdout + stderr);
        setExecutionTime(execTime);
        setError("");

        onExecutionComplete?.(stdout + stderr, { executionTime: execTime });
      } catch (err: any) {
        setError(err.message || "An error occurred");
        setOutput("");
        onExecutionComplete?.("", { error: err.message });
      }
    };

    runCode();
  }, [code, isLoading, onExecutionComplete]);

  return (
    <div className={className}>
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-4 text-sm text-gray-500">
            Loading Python environment...
          </div>
        ) : (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">Results</h3>
              {executionTime && (
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <IconClock size={14} />
                  {executionTime}ms
                </span>
              )}
            </div>

            {error ? (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex gap-2">
                  <IconAlertTriangle
                    className="text-red-500 mt-0.5"
                    size={16}
                  />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-red-800">
                      Execution Error
                    </p>
                    <pre className="text-xs text-red-700 whitespace-pre-wrap font-mono">
                      {error}
                    </pre>
                  </div>
                </div>
              </div>
            ) : output ? (
              <div className="bg-gray-50 border border-gray-200 rounded-md">
                <pre className="p-3 text-sm text-gray-700 whitespace-pre-wrap font-mono overflow-auto max-h-64">
                  {output}
                </pre>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                <p className="text-sm text-gray-500 text-center">
                  No output to display
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PythonRunner;
