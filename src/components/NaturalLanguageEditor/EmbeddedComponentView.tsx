// src/components/NaturalLanguageEditor/EmbeddedComponentView.tsx
import React, { useCallback } from "react";
import { NodeViewWrapper, NodeViewProps } from "@tiptap/react";
import { getComponentByResourceType } from "@components/Utils";
import { useAppStore } from "src/store";
import FilterInputTriplet from "./FilterInputTriplet";
import { safeParseDate } from "../Utils/dateUtils";

export const EmbeddedComponentView = (props: NodeViewProps) => {
  const { node, updateAttributes, editor } = props;
  const {
    type: componentType,
    props: componentProps,
    id,
    formKey,
  } = node.attrs;
  const { action_input_form_values, setActionInputFormValues } = useAppStore();

  // Get the component values from the store with safety checks
  const storedValues = action_input_form_values?.[formKey] || {};

  // Handle component value changes
  const handleChange = (value: any) => {
    // Handle different types of values based on component type
    let processedValue = value;

    // Special handling for date values
    if (componentType === "DateInput" && value instanceof Date) {
      try {
        processedValue = value.toISOString();
      } catch (e) {
        processedValue = null;
      }
    }

    // Update the Zustand store
    const newValues = {
      ...action_input_form_values,
      [formKey]: {
        ...storedValues,
        value: processedValue,
      },
    };
    setActionInputFormValues(newValues);

    // Update component props in the node
    updateAttributes({
      props: {
        ...componentProps,
        value: processedValue,
      },
    });
  };

  // Special handler for FilterInputTriplet components that have more complex values
  const handleFilterTripletChange = (values: any) => {
    // Update the Zustand store with a more stable structure
    const newValues = {
      ...action_input_form_values,
      [formKey]: {
        ...action_input_form_values[formKey],
        ...values, // Merge values instead of replacing them
        __lastUpdated: Date.now(), // Add a timestamp to ensure updates are recognized
      },
    };
    setActionInputFormValues(newValues);

    // Update component props in the node
    updateAttributes({
      props: {
        ...componentProps,
        values, // Store all values for filter triplets
      },
    });
  };

  // Handle clear for FilterInputTriplet
  const handleFilterTripletClear = () => {
    // Clear values in the Zustand store
    const newValues = {
      ...action_input_form_values,
      [formKey]: {
        ...storedValues,
        value: null,
        value2: null,
      },
    };
    setActionInputFormValues(newValues);

    // Update component props in the node
    updateAttributes({
      props: {
        ...componentProps,
        values: {
          ...componentProps.values,
          value: null,
          value2: null,
        },
      },
    });
  };

  // Prevent editor from handling events inside the component
  const handleContainerEvents = useCallback((e: React.SyntheticEvent) => {
    e.stopPropagation();
    e.preventDefault();
  }, []);

  // Special handling for FilterInputTriplet
  if (componentType === "FilterInputTriplet" && componentProps.variable) {
    return (
      <NodeViewWrapper className="embedded-component">
        <div
          onClick={handleContainerEvents}
          onKeyDown={handleContainerEvents}
          onMouseDown={handleContainerEvents}
          onFocus={handleContainerEvents} // Add this to better handle focus events
          className="embedded-component-container"
        >
          <FilterInputTriplet
            variable={componentProps.variable}
            formKey={formKey}
            onChange={handleFilterTripletChange}
            onClear={handleFilterTripletClear}
            compact={componentProps.compact || false}
          />
        </div>
      </NodeViewWrapper>
    );
  }

  // Get the component by its type for other component types
  const Component = getComponentByResourceType(componentType);

  if (!Component) {
    return (
      <NodeViewWrapper>Unknown component: {componentType}</NodeViewWrapper>
    );
  }

  // Handle different value types
  let value =
    storedValues.value !== undefined
      ? storedValues.value
      : componentProps?.value;

  // Special handling for DateInput values
  if (componentType === "DateInput" && value) {
    value = safeParseDate(value);
  }

  // Prepare props with proper values
  const safeProps = {
    ...componentProps,
    onChange: handleChange,
    value,
    action_input_form_values_key: formKey,

    // For DateInput components, ensure we include proper date-related props
    ...(componentType === "DateInput"
      ? {
          clearable: true,
          valueFormat: "YYYY-MM-DD",
          popoverProps: { withinPortal: true },
        }
      : {}),
  };

  return (
    <NodeViewWrapper className="embedded-component">
      <div
        onClick={handleContainerEvents}
        onKeyDown={handleContainerEvents}
        onMouseDown={handleContainerEvents}
        className="embedded-component-container"
      >
        <Component {...safeProps} />
      </div>
    </NodeViewWrapper>
  );
};
