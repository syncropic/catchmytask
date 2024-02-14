import React, { Suspense, ReactElement, ComponentType } from "react";

interface DynamicComponentLoaderProps {
  componentName: string;
  componentProps: any; // Using any for simplicity, but consider a more specific type or generics if possible
}

const loadComponent = (componentName: string) => {
  return React.lazy(async () => {
    const componentModule = await import(`@components/${componentName}`);
    // Dynamically determine the correct component to use
    return {
      default:
        componentModule.default ||
        componentModule[componentName as keyof typeof componentModule],
    };
  });
};

// High-Order Component to wrap a dynamically loaded component
function withDynamicProps<P extends React.HTMLAttributes<HTMLElement>>(
  Component: ComponentType<P>,
  componentProps: P
) {
  return function WrappedComponent(props: P) {
    return <Component {...componentProps} {...props} />;
  };
}

const DynamicComponentLoader: React.FC<DynamicComponentLoaderProps> = ({
  componentName,
  componentProps,
}) => {
  const Component = React.useMemo(
    () => loadComponent(componentName),
    [componentName]
  );

  const ComponentWithProps = React.useMemo(() => {
    return Component && withDynamicProps(Component, componentProps);
  }, [Component, componentProps]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      {ComponentWithProps ? <ComponentWithProps /> : null}
    </Suspense>
  );
};

export default DynamicComponentLoader;
