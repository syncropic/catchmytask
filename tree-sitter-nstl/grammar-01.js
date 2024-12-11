/**
 * @file natural structured task language - Fetch Only Version
 * @author david <dpwanjala@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "nstl",

  precedences: ($) => [
    ["binary_operation"],
    ["logical_operation"],
    ["comparison_operation"],
    ["unary_operation"],
    ["order"],
  ],

  rules: {
    // Root level
    source_file: ($) => $.task_definition,

    task_definition: ($) =>
      seq("define", "task", $.string, "as", ":", repeat($.fetch_block)),

    fetch_block: ($) => seq("fetch", ":", repeat1($.fetch_operation)),

    fetch_operation: ($) =>
      seq(
        field("name", $.identifier),
        ":",
        field("source", $.data_source),
        repeat($.fetch_clause)
      ),

    data_source: ($) => seq("from", ":", $.service_entity),

    service_entity: ($) =>
      seq(field("service", $.identifier), ".", field("entity", $.identifier)),

    fetch_clause: ($) =>
      choice(
        $.where_clause,
        $.using_clause,
        $.merge_clause,
        $.as_clause,
        $.order_by_clause,
        $.limit_clause
      ),

    where_clause: ($) => seq("where", ":", $.condition),

    using_clause: ($) => seq("using", ":", $.variable),

    merge_clause: ($) => seq("merge", ":", $.boolean),

    as_clause: ($) => seq("as", ":", $.variable),

    order_by_clause: ($) => seq($.keyword_order, $.keyword_by, $.order_list),

    order_list: ($) => seq($.order_item, repeat(seq(",", $.order_item))),

    order_item: ($) => seq($.identifier, optional($.order_direction)),

    order_direction: ($) => choice($.keyword_asc, $.keyword_desc),

    limit_clause: ($) => seq($.keyword_limit, $.number),

    condition: ($) =>
      choice($.comparison, $.logical_operation, seq("(", $.condition, ")")),

    logical_operation: ($) =>
      choice(
        prec.left(
          "logical_operation",
          seq(
            field("left", $.condition),
            field("operator", $.logical_operator),
            field("right", $.condition)
          )
        ),
        prec.right(
          "unary_operation",
          seq(field("operator", $.keyword_not), field("operand", $.condition))
        )
      ),

    logical_operator: ($) => choice($.keyword_and, $.keyword_or),

    comparison: ($) =>
      prec.left(
        "comparison_operation",
        seq(
          field("left", $.expression),
          field("operator", $.comparison_operator),
          field("right", $.expression)
        )
      ),

    expression: ($) =>
      choice($.identifier, $.variable, $.string_literal, $.number),

    string_literal: ($) =>
      choice(seq("'", /[^']*/, "'"), seq('"', /[^"]*/, '"')),

    // Keywords with case-insensitive matching
    keyword_and: ($) => /[Aa][Nn][Dd]/,
    keyword_or: ($) => /[Oo][Rr]/,
    keyword_not: ($) => /[Nn][Oo][Tt]/,
    keyword_order: ($) => /[Oo][Rr][Dd][Ee][Rr]/,
    keyword_by: ($) => /[Bb][Yy]/,
    keyword_limit: ($) => /[Ll][Ii][Mm][Ii][Tt]/,
    keyword_asc: ($) => /[Aa][Ss][Cc]/,
    keyword_desc: ($) => /[Dd][Ee][Ss][Cc]/,

    // Basic elements
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
        "in",
        "like",
        "between"
      ),

    comment: ($) =>
      token(
        choice(
          seq("//", /.*/),
          seq("--", /.*/),
          seq("/*", /[^*]*\*+([^/*][^*]*\*+)*/, "*/")
        )
      ),
  },

  extras: ($) => [/\s/, $.comment],

  word: ($) => $.identifier,
});
