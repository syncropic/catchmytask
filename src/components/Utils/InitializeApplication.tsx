// InitializeApplication.tsx
// This component wraps around the application initialization logic and provides any necessary setup for the child components.

import React from "react";

function InitializeApplication({
  activeApplicationId,
  children,
}: {
  activeApplicationId?: string;
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}

export default InitializeApplication;
