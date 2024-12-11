// grammar.js
module.exports = grammar({
  name: "nstl",

  rules: {
    source_file: ($) => repeat($._definition),

    _definition: ($) => $.task_definition,

    // Task Definition
    task_definition: ($) =>
      seq("define", "task", $.string, "as", ":", repeat($.block)),

    // Main Blocks
    block: ($) =>
      choice(
        $.fetch_block,
        $.upsert_block,
        $.repeat_block,
        $.requires_block,
        $.monitor_block,
        $.process_block,
        $.options_block
      ),

    // Fetch Block
    fetch_block: ($) => seq("fetch", ":", repeat1($.fetch_operation)),

    fetch_operation: ($) =>
      seq(
        field("name", $.identifier),
        ":",
        field("source", $.data_source),
        repeat($.fetch_clause)
      ),

    fetch_clause: ($) =>
      choice(
        $.where_clause,
        $.using_clause,
        $.merge_clause,
        $.as_clause,
        $.validate_clause,
        $.metrics_clause,
        $.on_error_clause
      ),

    data_source: ($) => seq("from", ":", $.service_entity),

    // Upsert Block
    upsert_block: ($) =>
      seq(
        "upsert",
        ":",
        $.target_clause,
        $.data_clause,
        $.match_clause,
        $.set_clause,
        optional($.on_conflict_clause),
        optional($.on_error_clause)
      ),

    // Repeat Block
    repeat_block: ($) =>
      seq(
        "repeat",
        ":",
        repeat($.block),
        $.stop_clause,
        optional($.options_block)
      ),

    // Requires Block
    requires_block: ($) => seq("requires", ":", repeat($.resource_definition)),

    resource_definition: ($) =>
      seq(field("name", $.identifier), ":", repeat($.resource_setting)),

    // Monitor Block
    monitor_block: ($) => seq("monitor", ":", repeat($.monitor_item)),

    monitor_item: ($) =>
      choice($.metrics_definition, $.alerts_definition, $.logging_definition),

    // Clauses
    where_clause: ($) => seq("where", ":", $.condition),

    using_clause: ($) => seq("using", ":", $.variable),

    merge_clause: ($) => seq("merge", ":", $.boolean),

    as_clause: ($) => seq("as", ":", $.variable),

    target_clause: ($) => seq("target", ":", $.service_entity),

    data_clause: ($) => seq("data", ":", $.variable),

    match_clause: ($) => seq("match_on", ":", $.identifier),

    set_clause: ($) => seq("set", ":", repeat1($.assignment)),

    stop_clause: ($) => seq("stop", "when", ":", $.condition),

    on_error_clause: ($) => seq("on", "error", ":", $.error_handling),

    on_conflict_clause: ($) => seq("on", "conflict", ":", $.conflict_handling),

    validate_clause: ($) =>
      seq("validate", ":", choice($.required_fields, $.validation_rules)),

    metrics_clause: ($) => seq("metrics", ":", repeat1($.metric_definition)),

    // Expressions
    condition: ($) =>
      choice(
        $.comparison,
        $.logical_expression,
        $.exists_clause,
        $.in_clause,
        $.between_clause
      ),

    comparison: ($) =>
      seq(
        field("left", $.expression),
        field("operator", $.comparison_operator),
        field("right", $.expression)
      ),

    logical_expression: ($) =>
      choice(
        seq($.condition, "and", $.condition),
        seq($.condition, "or", $.condition),
        seq("not", $.condition)
      ),

    exists_clause: ($) => seq("exists", "(", $.select_statement, ")"),

    in_clause: ($) =>
      seq(
        field("value", $.expression),
        "in",
        choice($.array, $.select_statement)
      ),

    between_clause: ($) =>
      seq(
        field("value", $.expression),
        "between",
        field("lower", $.expression),
        "and",
        field("upper", $.expression)
      ),

    expression: ($) =>
      choice(
        $.identifier,
        $.variable,
        $.string,
        $.number,
        $.function_call,
        $.parenthesized_expression
      ),

    // Basic Elements
    service_entity: ($) =>
      seq(field("service", $.identifier), ".", field("entity", $.identifier)),

    assignment: ($) =>
      seq(field("field", $.identifier), "=", field("value", $.expression)),

    function_call: ($) =>
      seq(field("name", $.identifier), "(", optional($.argument_list), ")"),

    argument_list: ($) => seq($.expression, repeat(seq(",", $.expression))),

    array: ($) =>
      seq(
        "[",
        optional(seq($.expression, repeat(seq(",", $.expression)))),
        "]"
      ),

    parenthesized_expression: ($) => seq("(", $.expression, ")"),

    // Terminals
    identifier: ($) => /[a-zA-Z_][a-zA-Z0-9_]*/,
    string: ($) => /"[^"]*"/,
    variable: ($) => /\$[a-zA-Z_][a-zA-Z0-9_]*/,
    number: ($) => /\d+(\.\d+)?/,
    boolean: ($) => choice("true", "false"),

    comparison_operator: ($) =>
      choice(
        ">",
        "<",
        ">=",
        "<=",
        "=",
        "<>",
        "!=",
        "is",
        "is not",
        "like",
        "not like"
      ),

    // Comments (both styles)
    comment: ($) =>
      choice(
        seq("//", /.*/), // Line comment
        seq("--", /.*/), // SQL-style comment
        seq("/*", /[^*]*/, "*/") // Block comment
      ),
  },
});
