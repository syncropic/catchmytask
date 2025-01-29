// InteractiveGraph.tsx (Wrapper)
import dynamic from "next/dynamic";

const InteractiveGraph = dynamic(
  () => {
    console.log("Dynamic import started");
    return import("react-force-graph-2d")
      .then((mod) => {
        console.log("ForceGraph2D module successfully imported");
        return import("./ClientInteractiveGraph").then((client) => {
          console.log("Client component successfully imported");
          return client.default;
        });
      })
      .catch((err) => {
        console.error("Error importing modules:", err);
        return () => (
          <div className="w-full h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-gray-800">
              Failed to load graph: {err.message}
            </div>
          </div>
        );
      });
  },
  {
    ssr: false,
    loading: () => {
      console.log("Showing loading state");
      return (
        <div className="w-full h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-gray-800">Loading graph...</div>
        </div>
      );
    },
  }
);

export default InteractiveGraph;
