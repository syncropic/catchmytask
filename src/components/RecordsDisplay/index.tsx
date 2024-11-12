"use client";

import {
  SummariesDisplayComponentProps,
  ResultsComponentProps,
} from "@components/interfaces";
import { useParsed } from "@refinedev/core";
import React, { lazy, Suspense } from "react";
import { useAppStore } from "src/store";

// Define interfaces for the component types
interface DynamicComponent {
  default: React.ComponentType<any>;
}

interface ComponentMapType {
  [key: string]: () => Promise<DynamicComponent>;
}

interface CustomComponent {
  metadata: {
    component_name: string;
  };
  [key: string]: any;
}

interface DynamicComponentLoaderProps {
  componentName: string;
  props?: Record<string, any>;
}

interface SummariesDisplayProps {
  display_mode?: string;
  data_items?: any[];
}

// Type the component map
const componentMap: ComponentMapType = {
  MonacoEditor: () => import("@components/MonacoEditor"),
  EmbedComponent: () => import("@components/EmbedComponent"),
};

const DynamicComponentLoader: React.FC<DynamicComponentLoaderProps> = ({
  componentName,
  props = {},
}) => {
  const [Component, setComponent] =
    React.useState<React.ComponentType<any> | null>(null);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const loadComponent = async () => {
      try {
        if (!componentMap[componentName]) {
          throw new Error(`Component ${componentName} not found`);
        }

        const module = await componentMap[componentName]();
        setComponent(() => module.default || module);
      } catch (err) {
        console.error("Error loading component:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    };

    loadComponent();
  }, [componentName]);

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error loading component: {error.message}
      </div>
    );
  }

  if (!Component) {
    return (
      <div className="p-4">
        <div className="animate-pulse bg-gray-200 h-8 w-full rounded"></div>
      </div>
    );
  }

  return <Component {...props} />;
};

const RecordsDisplay: React.FC<SummariesDisplayProps> = ({
  display_mode,
  data_items,
}) => {
  const { activeRecordCustomComponents, activeView, activeRecord } =
    useAppStore();
  const { params } = useParsed();
  let view_id = params?.view_id || activeView?.id;

  // Check if there are custom components for the current view
  const hasCustomComponents =
    activeRecordCustomComponents?.[view_id]?.length > 0;

  // Render default MonacoEditor if no custom components are available
  if (!hasCustomComponents && activeRecord) {
    return (
      <DynamicComponentLoader
        componentName="MonacoEditor"
        props={{
          value: activeRecord,
          height: "50vh",
          readOnly: true,
        }}
      />
    );
  }

  return (
    <>
      {activeRecordCustomComponents && activeRecord && (
        <Suspense fallback={<div className="p-4">Loading components...</div>}>
          {activeRecordCustomComponents[view_id]?.map(
            (item: CustomComponent, index: number) => (
              <React.Fragment key={index}>
                <DynamicComponentLoader
                  componentName={item?.metadata?.component_name}
                  props={{
                    ...activeRecord,
                    value: activeRecord,
                    height: "50vh",
                  }}
                />
              </React.Fragment>
            )
          )}
        </Suspense>
      )}
    </>
  );
};

export default RecordsDisplay;
