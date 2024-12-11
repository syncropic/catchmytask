// test_minimal.js
const Parser = require("web-tree-sitter");

(async () => {
  await Parser.init();
  const parser = new Parser();
  const Lang = await Parser.Language.load("./tree-sitter-nstl.wasm");
  parser.setLanguage(Lang);

  // Test with simplest possible valid input
  const tree = parser.parse(`define task "Test" as:`);
  console.log(tree.rootNode.toString());
})();
