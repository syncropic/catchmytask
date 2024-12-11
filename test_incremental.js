// test_incremental.js
const Parser = require("web-tree-sitter");

const testCases = [
  // Test 1: Basic structure
  `define task "Test" as:`,

  // Test 2: Simple fetch
  `define task "Test" as:
    fetch:
        data:
            from: test.source`,

  // Test 3: Fetch with where
  `define task "Test" as:
    fetch:
        data:
            from: test.source
            where: status = 'active'`,

  // Test 4: Your full example
  `define task "Analyze Pending Tracks" as:
    fetch:
        pending_tracks:
            from: catchmyvibe.audio
            where: 
                analyzed = pending
        features:
            from: spotify.audio
            where: 
                analyzed = pending`,
  // Test 5: Complex logical operations
  `define task "Complex Test" as:
    fetch:
        data:
            from: test.source
            where: (status = 'active' and age > 18) or role = 'admin'`,

  // Test 6: Nested logical operations with NOT
  `define task "Nested Test" as:
    fetch:
        data:
            from: test.source
            where: not (status = 'pending' and (age < 21 or role = 'guest'))`,

  // Test 7: Multiple clauses
  `define task "Multi Clause" as:
    fetch:
        data:
            from: test.source
            where: status = 'active'
            order by id desc
            limit 10
            as: $result`,
];

(async () => {
  await Parser.init();
  const parser = new Parser();
  const Lang = await Parser.Language.load(
    "/home/dpwanjala/devspace/catchmytask/tree-sitter-nstl/tree-sitter-nstl.wasm"
  );
  parser.setLanguage(Lang);

  for (const [index, testCase] of testCases.entries()) {
    console.log(`\nTest Case ${index + 1}:`);
    console.log("Input:", testCase);
    try {
      const tree = parser.parse(testCase);
      console.log("Output:", tree.rootNode.toString());
    } catch (error) {
      console.error("Error:", error);
    }
  }
})();
