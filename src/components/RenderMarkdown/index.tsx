import React from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";

interface RenderMarkdownProps {
  content: string;
}

const RenderMarkdown: React.FC<RenderMarkdownProps> = ({ content }) => {
  const components: Partial<Components> = {
    // Using proper type definitions from react-markdown
    h1: ({ node, ...props }) => (
      <h1 className="text-3xl font-bold mb-4" {...props} />
    ),
    h2: ({ node, ...props }) => (
      <h2 className="text-2xl font-bold mb-3" {...props} />
    ),
    h3: ({ node, ...props }) => (
      <h3 className="text-xl font-bold mb-2" {...props} />
    ),
    p: ({ node, ...props }) => <p className="mb-4 text-gray-800" {...props} />,
    ul: ({ node, ...props }) => (
      <ul className="list-disc pl-6 mb-4" {...props} />
    ),
    ol: ({ node, ...props }) => (
      <ol className="list-decimal pl-6 mb-4" {...props} />
    ),
    li: ({ node, ...props }) => <li className="mb-1" {...props} />,
    a: ({ node, ...props }) => (
      <a className="text-blue-600 hover:text-blue-800 underline" {...props} />
    ),
    // code: ({ node, inline, ...props }) =>
    //   inline ? (
    //     <code className="bg-gray-100 px-1 rounded" {...props} />
    //   ) : (
    //     <pre className="bg-gray-100 p-4 rounded-lg mb-4 overflow-x-auto">
    //       <code {...props} />
    //     </pre>
    //   ),
    blockquote: ({ node, ...props }) => (
      <blockquote
        className="border-l-4 border-gray-300 pl-4 italic mb-4"
        {...props}
      />
    ),
  };

  return (
    <div className="max-w-3xl mx-auto">
      <ReactMarkdown components={components}>{content}</ReactMarkdown>
    </div>
  );
};

export default RenderMarkdown;
