// EmbedComponent.tsx
import React, { useEffect, useRef, useState } from "react";
import { Paper, Alert, Loader } from "@mantine/core";

interface EmbedConfig {
  width?: string;
  height?: string;
  allowFullscreen?: boolean;
  allowScripts?: boolean;
  sandboxRules?: string[];
  customAttributes?: Record<string, string | number | boolean>;
  showLoader?: boolean;
  errorFallback?: boolean;
  className?: string;
}

interface EmbedComponentProps {
  embed_url: string;
  config?: EmbedConfig;
}

const defaultConfig: EmbedConfig = {
  width: "100%",
  height: "100%",
  allowFullscreen: true,
  allowScripts: true,
  sandboxRules: [
    "allow-same-origin",
    "allow-scripts",
    "allow-popups",
    "allow-forms",
    "allow-downloads",
  ],
  customAttributes: {},
  showLoader: true,
  errorFallback: true,
  className: "",
};

const EmbedComponent: React.FC<EmbedComponentProps> = ({
  embed_url,
  config = {},
}) => {
  const mergedConfig = { ...defaultConfig, ...config };
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    width,
    height,
    allowFullscreen,
    allowScripts,
    sandboxRules,
    customAttributes,
    showLoader,
    errorFallback,
    className,
  } = mergedConfig;

  useEffect(() => {
    if (!embed_url) {
      setError("Embed URL is required");
      setIsLoading(false);
      return;
    }

    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      setIsLoading(false);
      setError(null);
    };

    const handleError = () => {
      setError("Failed to load embedded content");
      setIsLoading(false);
    };

    iframe.addEventListener("load", handleLoad);
    iframe.addEventListener("error", handleError);

    return () => {
      iframe.removeEventListener("load", handleLoad);
      iframe.removeEventListener("error", handleError);
    };
  }, [embed_url]);

  const iframeProps: React.IframeHTMLAttributes<HTMLIFrameElement> &
    Record<string, any> = {
    ref: iframeRef,
    src: embed_url,
    width,
    height,
    className: `border-0 ${className}`,
    allow: allowScripts ? "autoplay; encrypted-media; picture-in-picture" : "",
    allowFullScreen: allowFullscreen,
    sandbox: sandboxRules?.join(" "),
    ...customAttributes,
  };

  return (
    <Paper shadow="sm" radius="md" className="w-full p-4">
      <div className="relative w-full" style={{ minHeight: height }}>
        {isLoading && showLoader && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <Loader size="lg" variant="dots" />
          </div>
        )}

        {error && errorFallback ? (
          <Alert color="red" title="Error" className="mb-4">
            {error}
          </Alert>
        ) : (
          <iframe {...iframeProps} />
        )}
      </div>
    </Paper>
  );
};

export default EmbedComponent;
