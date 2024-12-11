// utils/nstlParser.ts

import Parser from "web-tree-sitter";

let parserInstance: Parser | null = null;

export const initializeParser = async () => {
  console.log("Initializing web-tree-sitter...");

  // Initialize the WebAssembly runtime with locateFile to find the .wasm file
  await Parser.init({
    locateFile: (scriptName: string, scriptDirectory: string) => {
      // Return the correct path for the .wasm file
      return `${scriptName}`;
    },
  });

  console.log("WebAssembly runtime initialized.");

  // Load the NSTL language file
  const NSTL = await Parser.Language.load("/wasm/tree-sitter-nstl.wasm");
  console.log("NSTL language loaded successfully.");

  // Create a parser instance and set the language
  const parser = new Parser();
  parser.setLanguage(NSTL);

  parserInstance = parser;
  console.log("Parser initialized.");
};
export const parseNSTLQuery = (query: string) => {
  if (!parserInstance) {
    throw new Error("Parser not initialized. Call initializeParser first.");
  }

  const tree = parserInstance.parse(query);
  const fetchBlocks = getFetchBlocks(tree);

  return {
    syntaxTree: tree.rootNode.toString(),
    fetchBlocks,
  };
};

const getFetchBlocks = (tree: Parser.Tree): FetchBlock[] => {
  const fetchBlocks: FetchBlock[] = [];

  const fetchBlockQuery = parserInstance!.getLanguage().query(`
    (fetch_block) @fetch_block
  `);

  const matches = fetchBlockQuery.matches(tree.rootNode);

  for (const match of matches) {
    const fetchBlock = match.captures[0].node;
    const operations = parseFetchOperations(fetchBlock);
    fetchBlocks.push({ operations });
  }

  return fetchBlocks;
};

const parseFetchOperations = (
  fetchBlock: Parser.SyntaxNode
): FetchOperation[] => {
  const operations: FetchOperation[] = [];

  const operationQuery = parserInstance!.getLanguage().query(`
    (fetch_operation
      name: (identifier) @name
      source: (data_source
        (service_entity
          service: (identifier) @service
          entity: (identifier) @entity))
      (where_clause)? @where
      (using_clause)? @using
      (merge_clause)? @merge
      (as_clause)? @as) @operation
  `);

  const matches = operationQuery.matches(fetchBlock);

  for (const match of matches) {
    const operation: FetchOperation = {
      name: "",
      source: { service: "", entity: "" },
    };

    for (const capture of match.captures) {
      switch (capture.name) {
        case "name":
          operation.name = capture.node.text;
          break;
        case "service":
          operation.source.service = capture.node.text;
          break;
        case "entity":
          operation.source.entity = capture.node.text;
          break;
        case "where":
          operation.where = extractClauseContent(capture.node);
          break;
        case "using":
          operation.using = extractClauseContent(capture.node);
          break;
        case "merge":
          operation.merge = extractClauseContent(capture.node) === "true";
          break;
        case "as":
          operation.as = extractClauseContent(capture.node);
          break;
      }
    }

    operations.push(operation);
  }

  return operations;
};

const extractClauseContent = (node: Parser.SyntaxNode): string => {
  const contentNode = node.children.find(
    (child) =>
      ![":", "where", "using", "merge", "as"].includes(child.text.trim())
  );

  return contentNode ? contentNode.text : "";
};

interface FetchOperation {
  name: string;
  source: {
    service: string;
    entity: string;
  };
  where?: string;
  using?: string;
  merge?: boolean;
  as?: string;
}

interface FetchBlock {
  operations: FetchOperation[];
}
