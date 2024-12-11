#include "tree_sitter/parser.h"

#if defined(__GNUC__) || defined(__clang__)
#pragma GCC diagnostic ignored "-Wmissing-field-initializers"
#endif

#define LANGUAGE_VERSION 14
#define STATE_COUNT 115
#define LARGE_STATE_COUNT 2
#define SYMBOL_COUNT 85
#define ALIAS_COUNT 0
#define TOKEN_COUNT 48
#define EXTERNAL_TOKEN_COUNT 0
#define FIELD_COUNT 10
#define MAX_ALIAS_SEQUENCE_LENGTH 6
#define PRODUCTION_ID_COUNT 6

enum ts_symbol_identifiers {
  sym_identifier = 1,
  anon_sym_define = 2,
  anon_sym_task = 3,
  anon_sym_as = 4,
  anon_sym_COLON = 5,
  anon_sym_fetch = 6,
  anon_sym_view = 7,
  anon_sym_from = 8,
  anon_sym_DOT = 9,
  anon_sym_where = 10,
  anon_sym_using = 11,
  anon_sym_merge = 12,
  anon_sym_dynamic = 13,
  anon_sym_input = 14,
  anon_sym_LPAREN = 15,
  anon_sym_RPAREN = 16,
  anon_sym_COMMA = 17,
  anon_sym_EQ = 18,
  anon_sym_SQUOTE = 19,
  aux_sym_string_literal_token1 = 20,
  anon_sym_DQUOTE = 21,
  aux_sym_string_literal_token2 = 22,
  sym_keyword_and = 23,
  sym_keyword_or = 24,
  sym_keyword_not = 25,
  sym_keyword_order = 26,
  sym_keyword_by = 27,
  sym_keyword_limit = 28,
  sym_keyword_asc = 29,
  sym_keyword_desc = 30,
  sym_string = 31,
  sym_variable = 32,
  sym_number = 33,
  anon_sym_true = 34,
  anon_sym_false = 35,
  anon_sym_GT = 36,
  anon_sym_LT = 37,
  anon_sym_GT_EQ = 38,
  anon_sym_LT_EQ = 39,
  anon_sym_LT_GT = 40,
  anon_sym_BANG_EQ = 41,
  anon_sym_is = 42,
  anon_sym_isnot = 43,
  anon_sym_in = 44,
  anon_sym_like = 45,
  anon_sym_between = 46,
  sym_comment = 47,
  sym_source_file = 48,
  sym_task_definition = 49,
  sym_fetch_block = 50,
  sym_view_block = 51,
  sym_fetch_operation = 52,
  sym_view_operation = 53,
  sym_data_source = 54,
  sym_service_entity = 55,
  sym_operation_clause = 56,
  sym_where_clause = 57,
  sym_using_clause = 58,
  sym_merge_clause = 59,
  sym_as_clause = 60,
  sym_dynamic_clause = 61,
  sym_input_clause = 62,
  sym_parameter_list = 63,
  sym_parameter_items = 64,
  sym_parameter = 65,
  sym_order_by_clause = 66,
  sym_order_list = 67,
  sym_order_item = 68,
  sym_order_direction = 69,
  sym_limit_clause = 70,
  sym_condition = 71,
  sym_logical_operation = 72,
  sym_logical_operator = 73,
  sym_comparison = 74,
  sym_expression = 75,
  sym_string_literal = 76,
  sym_boolean = 77,
  sym_comparison_operator = 78,
  aux_sym_task_definition_repeat1 = 79,
  aux_sym_fetch_block_repeat1 = 80,
  aux_sym_view_block_repeat1 = 81,
  aux_sym_fetch_operation_repeat1 = 82,
  aux_sym_parameter_items_repeat1 = 83,
  aux_sym_order_list_repeat1 = 84,
};

static const char * const ts_symbol_names[] = {
  [ts_builtin_sym_end] = "end",
  [sym_identifier] = "identifier",
  [anon_sym_define] = "define",
  [anon_sym_task] = "task",
  [anon_sym_as] = "as",
  [anon_sym_COLON] = ":",
  [anon_sym_fetch] = "fetch",
  [anon_sym_view] = "view",
  [anon_sym_from] = "from",
  [anon_sym_DOT] = ".",
  [anon_sym_where] = "where",
  [anon_sym_using] = "using",
  [anon_sym_merge] = "merge",
  [anon_sym_dynamic] = "dynamic",
  [anon_sym_input] = "input",
  [anon_sym_LPAREN] = "(",
  [anon_sym_RPAREN] = ")",
  [anon_sym_COMMA] = ",",
  [anon_sym_EQ] = "=",
  [anon_sym_SQUOTE] = "'",
  [aux_sym_string_literal_token1] = "string_literal_token1",
  [anon_sym_DQUOTE] = "\"",
  [aux_sym_string_literal_token2] = "string_literal_token2",
  [sym_keyword_and] = "keyword_and",
  [sym_keyword_or] = "keyword_or",
  [sym_keyword_not] = "keyword_not",
  [sym_keyword_order] = "keyword_order",
  [sym_keyword_by] = "keyword_by",
  [sym_keyword_limit] = "keyword_limit",
  [sym_keyword_asc] = "keyword_asc",
  [sym_keyword_desc] = "keyword_desc",
  [sym_string] = "string",
  [sym_variable] = "variable",
  [sym_number] = "number",
  [anon_sym_true] = "true",
  [anon_sym_false] = "false",
  [anon_sym_GT] = ">",
  [anon_sym_LT] = "<",
  [anon_sym_GT_EQ] = ">=",
  [anon_sym_LT_EQ] = "<=",
  [anon_sym_LT_GT] = "<>",
  [anon_sym_BANG_EQ] = "!=",
  [anon_sym_is] = "is",
  [anon_sym_isnot] = "is not",
  [anon_sym_in] = "in",
  [anon_sym_like] = "like",
  [anon_sym_between] = "between",
  [sym_comment] = "comment",
  [sym_source_file] = "source_file",
  [sym_task_definition] = "task_definition",
  [sym_fetch_block] = "fetch_block",
  [sym_view_block] = "view_block",
  [sym_fetch_operation] = "fetch_operation",
  [sym_view_operation] = "view_operation",
  [sym_data_source] = "data_source",
  [sym_service_entity] = "service_entity",
  [sym_operation_clause] = "operation_clause",
  [sym_where_clause] = "where_clause",
  [sym_using_clause] = "using_clause",
  [sym_merge_clause] = "merge_clause",
  [sym_as_clause] = "as_clause",
  [sym_dynamic_clause] = "dynamic_clause",
  [sym_input_clause] = "input_clause",
  [sym_parameter_list] = "parameter_list",
  [sym_parameter_items] = "parameter_items",
  [sym_parameter] = "parameter",
  [sym_order_by_clause] = "order_by_clause",
  [sym_order_list] = "order_list",
  [sym_order_item] = "order_item",
  [sym_order_direction] = "order_direction",
  [sym_limit_clause] = "limit_clause",
  [sym_condition] = "condition",
  [sym_logical_operation] = "logical_operation",
  [sym_logical_operator] = "logical_operator",
  [sym_comparison] = "comparison",
  [sym_expression] = "expression",
  [sym_string_literal] = "string_literal",
  [sym_boolean] = "boolean",
  [sym_comparison_operator] = "comparison_operator",
  [aux_sym_task_definition_repeat1] = "task_definition_repeat1",
  [aux_sym_fetch_block_repeat1] = "fetch_block_repeat1",
  [aux_sym_view_block_repeat1] = "view_block_repeat1",
  [aux_sym_fetch_operation_repeat1] = "fetch_operation_repeat1",
  [aux_sym_parameter_items_repeat1] = "parameter_items_repeat1",
  [aux_sym_order_list_repeat1] = "order_list_repeat1",
};

static const TSSymbol ts_symbol_map[] = {
  [ts_builtin_sym_end] = ts_builtin_sym_end,
  [sym_identifier] = sym_identifier,
  [anon_sym_define] = anon_sym_define,
  [anon_sym_task] = anon_sym_task,
  [anon_sym_as] = anon_sym_as,
  [anon_sym_COLON] = anon_sym_COLON,
  [anon_sym_fetch] = anon_sym_fetch,
  [anon_sym_view] = anon_sym_view,
  [anon_sym_from] = anon_sym_from,
  [anon_sym_DOT] = anon_sym_DOT,
  [anon_sym_where] = anon_sym_where,
  [anon_sym_using] = anon_sym_using,
  [anon_sym_merge] = anon_sym_merge,
  [anon_sym_dynamic] = anon_sym_dynamic,
  [anon_sym_input] = anon_sym_input,
  [anon_sym_LPAREN] = anon_sym_LPAREN,
  [anon_sym_RPAREN] = anon_sym_RPAREN,
  [anon_sym_COMMA] = anon_sym_COMMA,
  [anon_sym_EQ] = anon_sym_EQ,
  [anon_sym_SQUOTE] = anon_sym_SQUOTE,
  [aux_sym_string_literal_token1] = aux_sym_string_literal_token1,
  [anon_sym_DQUOTE] = anon_sym_DQUOTE,
  [aux_sym_string_literal_token2] = aux_sym_string_literal_token2,
  [sym_keyword_and] = sym_keyword_and,
  [sym_keyword_or] = sym_keyword_or,
  [sym_keyword_not] = sym_keyword_not,
  [sym_keyword_order] = sym_keyword_order,
  [sym_keyword_by] = sym_keyword_by,
  [sym_keyword_limit] = sym_keyword_limit,
  [sym_keyword_asc] = sym_keyword_asc,
  [sym_keyword_desc] = sym_keyword_desc,
  [sym_string] = sym_string,
  [sym_variable] = sym_variable,
  [sym_number] = sym_number,
  [anon_sym_true] = anon_sym_true,
  [anon_sym_false] = anon_sym_false,
  [anon_sym_GT] = anon_sym_GT,
  [anon_sym_LT] = anon_sym_LT,
  [anon_sym_GT_EQ] = anon_sym_GT_EQ,
  [anon_sym_LT_EQ] = anon_sym_LT_EQ,
  [anon_sym_LT_GT] = anon_sym_LT_GT,
  [anon_sym_BANG_EQ] = anon_sym_BANG_EQ,
  [anon_sym_is] = anon_sym_is,
  [anon_sym_isnot] = anon_sym_isnot,
  [anon_sym_in] = anon_sym_in,
  [anon_sym_like] = anon_sym_like,
  [anon_sym_between] = anon_sym_between,
  [sym_comment] = sym_comment,
  [sym_source_file] = sym_source_file,
  [sym_task_definition] = sym_task_definition,
  [sym_fetch_block] = sym_fetch_block,
  [sym_view_block] = sym_view_block,
  [sym_fetch_operation] = sym_fetch_operation,
  [sym_view_operation] = sym_view_operation,
  [sym_data_source] = sym_data_source,
  [sym_service_entity] = sym_service_entity,
  [sym_operation_clause] = sym_operation_clause,
  [sym_where_clause] = sym_where_clause,
  [sym_using_clause] = sym_using_clause,
  [sym_merge_clause] = sym_merge_clause,
  [sym_as_clause] = sym_as_clause,
  [sym_dynamic_clause] = sym_dynamic_clause,
  [sym_input_clause] = sym_input_clause,
  [sym_parameter_list] = sym_parameter_list,
  [sym_parameter_items] = sym_parameter_items,
  [sym_parameter] = sym_parameter,
  [sym_order_by_clause] = sym_order_by_clause,
  [sym_order_list] = sym_order_list,
  [sym_order_item] = sym_order_item,
  [sym_order_direction] = sym_order_direction,
  [sym_limit_clause] = sym_limit_clause,
  [sym_condition] = sym_condition,
  [sym_logical_operation] = sym_logical_operation,
  [sym_logical_operator] = sym_logical_operator,
  [sym_comparison] = sym_comparison,
  [sym_expression] = sym_expression,
  [sym_string_literal] = sym_string_literal,
  [sym_boolean] = sym_boolean,
  [sym_comparison_operator] = sym_comparison_operator,
  [aux_sym_task_definition_repeat1] = aux_sym_task_definition_repeat1,
  [aux_sym_fetch_block_repeat1] = aux_sym_fetch_block_repeat1,
  [aux_sym_view_block_repeat1] = aux_sym_view_block_repeat1,
  [aux_sym_fetch_operation_repeat1] = aux_sym_fetch_operation_repeat1,
  [aux_sym_parameter_items_repeat1] = aux_sym_parameter_items_repeat1,
  [aux_sym_order_list_repeat1] = aux_sym_order_list_repeat1,
};

static const TSSymbolMetadata ts_symbol_metadata[] = {
  [ts_builtin_sym_end] = {
    .visible = false,
    .named = true,
  },
  [sym_identifier] = {
    .visible = true,
    .named = true,
  },
  [anon_sym_define] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_task] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_as] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_COLON] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_fetch] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_view] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_from] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_DOT] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_where] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_using] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_merge] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_dynamic] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_input] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_LPAREN] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_RPAREN] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_COMMA] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_EQ] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_SQUOTE] = {
    .visible = true,
    .named = false,
  },
  [aux_sym_string_literal_token1] = {
    .visible = false,
    .named = false,
  },
  [anon_sym_DQUOTE] = {
    .visible = true,
    .named = false,
  },
  [aux_sym_string_literal_token2] = {
    .visible = false,
    .named = false,
  },
  [sym_keyword_and] = {
    .visible = true,
    .named = true,
  },
  [sym_keyword_or] = {
    .visible = true,
    .named = true,
  },
  [sym_keyword_not] = {
    .visible = true,
    .named = true,
  },
  [sym_keyword_order] = {
    .visible = true,
    .named = true,
  },
  [sym_keyword_by] = {
    .visible = true,
    .named = true,
  },
  [sym_keyword_limit] = {
    .visible = true,
    .named = true,
  },
  [sym_keyword_asc] = {
    .visible = true,
    .named = true,
  },
  [sym_keyword_desc] = {
    .visible = true,
    .named = true,
  },
  [sym_string] = {
    .visible = true,
    .named = true,
  },
  [sym_variable] = {
    .visible = true,
    .named = true,
  },
  [sym_number] = {
    .visible = true,
    .named = true,
  },
  [anon_sym_true] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_false] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_GT] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_LT] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_GT_EQ] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_LT_EQ] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_LT_GT] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_BANG_EQ] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_is] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_isnot] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_in] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_like] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_between] = {
    .visible = true,
    .named = false,
  },
  [sym_comment] = {
    .visible = true,
    .named = true,
  },
  [sym_source_file] = {
    .visible = true,
    .named = true,
  },
  [sym_task_definition] = {
    .visible = true,
    .named = true,
  },
  [sym_fetch_block] = {
    .visible = true,
    .named = true,
  },
  [sym_view_block] = {
    .visible = true,
    .named = true,
  },
  [sym_fetch_operation] = {
    .visible = true,
    .named = true,
  },
  [sym_view_operation] = {
    .visible = true,
    .named = true,
  },
  [sym_data_source] = {
    .visible = true,
    .named = true,
  },
  [sym_service_entity] = {
    .visible = true,
    .named = true,
  },
  [sym_operation_clause] = {
    .visible = true,
    .named = true,
  },
  [sym_where_clause] = {
    .visible = true,
    .named = true,
  },
  [sym_using_clause] = {
    .visible = true,
    .named = true,
  },
  [sym_merge_clause] = {
    .visible = true,
    .named = true,
  },
  [sym_as_clause] = {
    .visible = true,
    .named = true,
  },
  [sym_dynamic_clause] = {
    .visible = true,
    .named = true,
  },
  [sym_input_clause] = {
    .visible = true,
    .named = true,
  },
  [sym_parameter_list] = {
    .visible = true,
    .named = true,
  },
  [sym_parameter_items] = {
    .visible = true,
    .named = true,
  },
  [sym_parameter] = {
    .visible = true,
    .named = true,
  },
  [sym_order_by_clause] = {
    .visible = true,
    .named = true,
  },
  [sym_order_list] = {
    .visible = true,
    .named = true,
  },
  [sym_order_item] = {
    .visible = true,
    .named = true,
  },
  [sym_order_direction] = {
    .visible = true,
    .named = true,
  },
  [sym_limit_clause] = {
    .visible = true,
    .named = true,
  },
  [sym_condition] = {
    .visible = true,
    .named = true,
  },
  [sym_logical_operation] = {
    .visible = true,
    .named = true,
  },
  [sym_logical_operator] = {
    .visible = true,
    .named = true,
  },
  [sym_comparison] = {
    .visible = true,
    .named = true,
  },
  [sym_expression] = {
    .visible = true,
    .named = true,
  },
  [sym_string_literal] = {
    .visible = true,
    .named = true,
  },
  [sym_boolean] = {
    .visible = true,
    .named = true,
  },
  [sym_comparison_operator] = {
    .visible = true,
    .named = true,
  },
  [aux_sym_task_definition_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_fetch_block_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_view_block_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_fetch_operation_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_parameter_items_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_order_list_repeat1] = {
    .visible = false,
    .named = false,
  },
};

enum ts_field_identifiers {
  field_entity = 1,
  field_key = 2,
  field_left = 3,
  field_name = 4,
  field_operand = 5,
  field_operator = 6,
  field_right = 7,
  field_service = 8,
  field_source = 9,
  field_value = 10,
};

static const char * const ts_field_names[] = {
  [0] = NULL,
  [field_entity] = "entity",
  [field_key] = "key",
  [field_left] = "left",
  [field_name] = "name",
  [field_operand] = "operand",
  [field_operator] = "operator",
  [field_right] = "right",
  [field_service] = "service",
  [field_source] = "source",
  [field_value] = "value",
};

static const TSFieldMapSlice ts_field_map_slices[PRODUCTION_ID_COUNT] = {
  [1] = {.index = 0, .length = 2},
  [2] = {.index = 2, .length = 2},
  [3] = {.index = 4, .length = 2},
  [4] = {.index = 6, .length = 3},
  [5] = {.index = 9, .length = 2},
};

static const TSFieldMapEntry ts_field_map_entries[] = {
  [0] =
    {field_name, 0},
    {field_source, 2},
  [2] =
    {field_entity, 2},
    {field_service, 0},
  [4] =
    {field_operand, 1},
    {field_operator, 0},
  [6] =
    {field_left, 0},
    {field_operator, 1},
    {field_right, 2},
  [9] =
    {field_key, 0},
    {field_value, 2},
};

static const TSSymbol ts_alias_sequences[PRODUCTION_ID_COUNT][MAX_ALIAS_SEQUENCE_LENGTH] = {
  [0] = {0},
};

static const uint16_t ts_non_terminal_alias_map[] = {
  0,
};

static const TSStateId ts_primary_state_ids[STATE_COUNT] = {
  [0] = 0,
  [1] = 1,
  [2] = 2,
  [3] = 3,
  [4] = 4,
  [5] = 5,
  [6] = 6,
  [7] = 7,
  [8] = 8,
  [9] = 9,
  [10] = 10,
  [11] = 11,
  [12] = 12,
  [13] = 13,
  [14] = 14,
  [15] = 15,
  [16] = 9,
  [17] = 17,
  [18] = 18,
  [19] = 8,
  [20] = 20,
  [21] = 21,
  [22] = 21,
  [23] = 23,
  [24] = 24,
  [25] = 25,
  [26] = 26,
  [27] = 27,
  [28] = 28,
  [29] = 29,
  [30] = 30,
  [31] = 31,
  [32] = 32,
  [33] = 33,
  [34] = 34,
  [35] = 35,
  [36] = 36,
  [37] = 27,
  [38] = 38,
  [39] = 39,
  [40] = 40,
  [41] = 41,
  [42] = 38,
  [43] = 43,
  [44] = 44,
  [45] = 32,
  [46] = 46,
  [47] = 47,
  [48] = 47,
  [49] = 49,
  [50] = 50,
  [51] = 51,
  [52] = 52,
  [53] = 53,
  [54] = 54,
  [55] = 55,
  [56] = 56,
  [57] = 57,
  [58] = 10,
  [59] = 59,
  [60] = 59,
  [61] = 12,
  [62] = 62,
  [63] = 17,
  [64] = 64,
  [65] = 65,
  [66] = 66,
  [67] = 67,
  [68] = 68,
  [69] = 69,
  [70] = 70,
  [71] = 71,
  [72] = 18,
  [73] = 13,
  [74] = 74,
  [75] = 75,
  [76] = 76,
  [77] = 77,
  [78] = 78,
  [79] = 79,
  [80] = 80,
  [81] = 81,
  [82] = 82,
  [83] = 83,
  [84] = 84,
  [85] = 85,
  [86] = 86,
  [87] = 87,
  [88] = 88,
  [89] = 89,
  [90] = 90,
  [91] = 91,
  [92] = 92,
  [93] = 93,
  [94] = 94,
  [95] = 95,
  [96] = 96,
  [97] = 97,
  [98] = 98,
  [99] = 99,
  [100] = 100,
  [101] = 101,
  [102] = 102,
  [103] = 103,
  [104] = 104,
  [105] = 105,
  [106] = 106,
  [107] = 107,
  [108] = 108,
  [109] = 107,
  [110] = 84,
  [111] = 111,
  [112] = 112,
  [113] = 94,
  [114] = 98,
};

static bool ts_lex(TSLexer *lexer, TSStateId state) {
  START_LEXER();
  eof = lexer->eof(lexer);
  switch (state) {
    case 0:
      if (eof) ADVANCE(15);
      ADVANCE_MAP(
        '!', 8,
        '"', 30,
        '$', 13,
        '\'', 22,
        '(', 18,
        ')', 19,
        ',', 20,
        '-', 7,
        '.', 17,
        '/', 3,
        ':', 16,
        '<', 45,
        '=', 21,
        '>', 44,
        'i', 38,
      );
      if (('\t' <= lookahead && lookahead <= '\r') ||
          lookahead == ' ') SKIP(0);
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(42);
      if (('A' <= lookahead && lookahead <= 'Z') ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(39);
      END_STATE();
    case 1:
      if (lookahead == '"') ADVANCE(2);
      if (lookahead == '-') ADVANCE(7);
      if (lookahead == '/') ADVANCE(3);
      if (('\t' <= lookahead && lookahead <= '\r') ||
          lookahead == ' ') SKIP(1);
      END_STATE();
    case 2:
      if (lookahead == '"') ADVANCE(40);
      if (lookahead != 0) ADVANCE(2);
      END_STATE();
    case 3:
      if (lookahead == '*') ADVANCE(4);
      if (lookahead == '/') ADVANCE(53);
      END_STATE();
    case 4:
      if (lookahead == '*') ADVANCE(6);
      if (lookahead != 0) ADVANCE(4);
      END_STATE();
    case 5:
      if (lookahead == '*') ADVANCE(5);
      if (lookahead == '/') ADVANCE(52);
      if (lookahead != 0) ADVANCE(4);
      END_STATE();
    case 6:
      if (lookahead == '*') ADVANCE(5);
      if (lookahead != 0 &&
          lookahead != '/') ADVANCE(4);
      END_STATE();
    case 7:
      if (lookahead == '-') ADVANCE(53);
      END_STATE();
    case 8:
      if (lookahead == '=') ADVANCE(49);
      END_STATE();
    case 9:
      if (lookahead == 'n') ADVANCE(10);
      END_STATE();
    case 10:
      if (lookahead == 'o') ADVANCE(11);
      END_STATE();
    case 11:
      if (lookahead == 't') ADVANCE(51);
      END_STATE();
    case 12:
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(43);
      END_STATE();
    case 13:
      if (('A' <= lookahead && lookahead <= 'Z') ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(41);
      END_STATE();
    case 14:
      if (eof) ADVANCE(15);
      ADVANCE_MAP(
        '"', 30,
        '$', 13,
        '\'', 22,
        '(', 18,
        ')', 19,
        ',', 20,
        '-', 7,
        '/', 3,
      );
      if (('\t' <= lookahead && lookahead <= '\r') ||
          lookahead == ' ') SKIP(14);
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(42);
      if (('A' <= lookahead && lookahead <= 'Z') ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(39);
      END_STATE();
    case 15:
      ACCEPT_TOKEN(ts_builtin_sym_end);
      END_STATE();
    case 16:
      ACCEPT_TOKEN(anon_sym_COLON);
      END_STATE();
    case 17:
      ACCEPT_TOKEN(anon_sym_DOT);
      END_STATE();
    case 18:
      ACCEPT_TOKEN(anon_sym_LPAREN);
      END_STATE();
    case 19:
      ACCEPT_TOKEN(anon_sym_RPAREN);
      END_STATE();
    case 20:
      ACCEPT_TOKEN(anon_sym_COMMA);
      END_STATE();
    case 21:
      ACCEPT_TOKEN(anon_sym_EQ);
      END_STATE();
    case 22:
      ACCEPT_TOKEN(anon_sym_SQUOTE);
      END_STATE();
    case 23:
      ACCEPT_TOKEN(aux_sym_string_literal_token1);
      if (lookahead == '\n') ADVANCE(29);
      if (lookahead == '\'') ADVANCE(53);
      if (lookahead != 0) ADVANCE(23);
      END_STATE();
    case 24:
      ACCEPT_TOKEN(aux_sym_string_literal_token1);
      if (lookahead == '\'') ADVANCE(4);
      if (lookahead == '*') ADVANCE(24);
      if (lookahead == '/') ADVANCE(29);
      if (lookahead != 0) ADVANCE(25);
      END_STATE();
    case 25:
      ACCEPT_TOKEN(aux_sym_string_literal_token1);
      if (lookahead == '\'') ADVANCE(4);
      if (lookahead == '*') ADVANCE(24);
      if (lookahead != 0) ADVANCE(25);
      END_STATE();
    case 26:
      ACCEPT_TOKEN(aux_sym_string_literal_token1);
      if (lookahead == '*') ADVANCE(25);
      if (lookahead == '/') ADVANCE(23);
      if (lookahead != 0 &&
          lookahead != '\'') ADVANCE(29);
      END_STATE();
    case 27:
      ACCEPT_TOKEN(aux_sym_string_literal_token1);
      if (lookahead == '-') ADVANCE(28);
      if (lookahead == '/') ADVANCE(26);
      if (('\t' <= lookahead && lookahead <= '\r') ||
          lookahead == ' ') ADVANCE(27);
      if (lookahead != 0 &&
          lookahead != '\'') ADVANCE(29);
      END_STATE();
    case 28:
      ACCEPT_TOKEN(aux_sym_string_literal_token1);
      if (lookahead == '-') ADVANCE(23);
      if (lookahead != 0 &&
          lookahead != '\'') ADVANCE(29);
      END_STATE();
    case 29:
      ACCEPT_TOKEN(aux_sym_string_literal_token1);
      if (lookahead != 0 &&
          lookahead != '\'') ADVANCE(29);
      END_STATE();
    case 30:
      ACCEPT_TOKEN(anon_sym_DQUOTE);
      END_STATE();
    case 31:
      ACCEPT_TOKEN(aux_sym_string_literal_token2);
      if (lookahead == '\n') ADVANCE(37);
      if (lookahead == '"') ADVANCE(53);
      if (lookahead != 0) ADVANCE(31);
      END_STATE();
    case 32:
      ACCEPT_TOKEN(aux_sym_string_literal_token2);
      if (lookahead == '"') ADVANCE(4);
      if (lookahead == '*') ADVANCE(32);
      if (lookahead == '/') ADVANCE(37);
      if (lookahead != 0) ADVANCE(33);
      END_STATE();
    case 33:
      ACCEPT_TOKEN(aux_sym_string_literal_token2);
      if (lookahead == '"') ADVANCE(4);
      if (lookahead == '*') ADVANCE(32);
      if (lookahead != 0) ADVANCE(33);
      END_STATE();
    case 34:
      ACCEPT_TOKEN(aux_sym_string_literal_token2);
      if (lookahead == '*') ADVANCE(33);
      if (lookahead == '/') ADVANCE(31);
      if (lookahead != 0 &&
          lookahead != '"') ADVANCE(37);
      END_STATE();
    case 35:
      ACCEPT_TOKEN(aux_sym_string_literal_token2);
      if (lookahead == '-') ADVANCE(36);
      if (lookahead == '/') ADVANCE(34);
      if (('\t' <= lookahead && lookahead <= '\r') ||
          lookahead == ' ') ADVANCE(35);
      if (lookahead != 0 &&
          lookahead != '"') ADVANCE(37);
      END_STATE();
    case 36:
      ACCEPT_TOKEN(aux_sym_string_literal_token2);
      if (lookahead == '-') ADVANCE(31);
      if (lookahead != 0 &&
          lookahead != '"') ADVANCE(37);
      END_STATE();
    case 37:
      ACCEPT_TOKEN(aux_sym_string_literal_token2);
      if (lookahead != 0 &&
          lookahead != '"') ADVANCE(37);
      END_STATE();
    case 38:
      ACCEPT_TOKEN(sym_identifier);
      if (lookahead == 's') ADVANCE(50);
      if (('0' <= lookahead && lookahead <= '9') ||
          ('A' <= lookahead && lookahead <= 'Z') ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(39);
      END_STATE();
    case 39:
      ACCEPT_TOKEN(sym_identifier);
      if (('0' <= lookahead && lookahead <= '9') ||
          ('A' <= lookahead && lookahead <= 'Z') ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(39);
      END_STATE();
    case 40:
      ACCEPT_TOKEN(sym_string);
      END_STATE();
    case 41:
      ACCEPT_TOKEN(sym_variable);
      if (('0' <= lookahead && lookahead <= '9') ||
          ('A' <= lookahead && lookahead <= 'Z') ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(41);
      END_STATE();
    case 42:
      ACCEPT_TOKEN(sym_number);
      if (lookahead == '.') ADVANCE(12);
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(42);
      END_STATE();
    case 43:
      ACCEPT_TOKEN(sym_number);
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(43);
      END_STATE();
    case 44:
      ACCEPT_TOKEN(anon_sym_GT);
      if (lookahead == '=') ADVANCE(46);
      END_STATE();
    case 45:
      ACCEPT_TOKEN(anon_sym_LT);
      if (lookahead == '=') ADVANCE(47);
      if (lookahead == '>') ADVANCE(48);
      END_STATE();
    case 46:
      ACCEPT_TOKEN(anon_sym_GT_EQ);
      END_STATE();
    case 47:
      ACCEPT_TOKEN(anon_sym_LT_EQ);
      END_STATE();
    case 48:
      ACCEPT_TOKEN(anon_sym_LT_GT);
      END_STATE();
    case 49:
      ACCEPT_TOKEN(anon_sym_BANG_EQ);
      END_STATE();
    case 50:
      ACCEPT_TOKEN(anon_sym_is);
      if (lookahead == ' ') ADVANCE(9);
      if (('0' <= lookahead && lookahead <= '9') ||
          ('A' <= lookahead && lookahead <= 'Z') ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(39);
      END_STATE();
    case 51:
      ACCEPT_TOKEN(anon_sym_isnot);
      END_STATE();
    case 52:
      ACCEPT_TOKEN(sym_comment);
      END_STATE();
    case 53:
      ACCEPT_TOKEN(sym_comment);
      if (lookahead != 0 &&
          lookahead != '\n') ADVANCE(53);
      END_STATE();
    default:
      return false;
  }
}

static bool ts_lex_keywords(TSLexer *lexer, TSStateId state) {
  START_LEXER();
  eof = lexer->eof(lexer);
  switch (state) {
    case 0:
      ADVANCE_MAP(
        'A', 1,
        'B', 2,
        'D', 3,
        'L', 4,
        'a', 5,
        'b', 6,
        'd', 7,
        'f', 8,
        'i', 9,
        'l', 10,
        'm', 11,
        't', 12,
        'u', 13,
        'v', 14,
        'w', 15,
        'N', 16,
        'n', 16,
        'O', 17,
        'o', 17,
      );
      if (('\t' <= lookahead && lookahead <= '\r') ||
          lookahead == ' ') SKIP(0);
      END_STATE();
    case 1:
      if (lookahead == 'N' ||
          lookahead == 'n') ADVANCE(18);
      if (lookahead == 'S' ||
          lookahead == 's') ADVANCE(19);
      END_STATE();
    case 2:
      if (lookahead == 'Y' ||
          lookahead == 'y') ADVANCE(20);
      END_STATE();
    case 3:
      if (lookahead == 'E' ||
          lookahead == 'e') ADVANCE(21);
      END_STATE();
    case 4:
      if (lookahead == 'I' ||
          lookahead == 'i') ADVANCE(22);
      END_STATE();
    case 5:
      if (lookahead == 'S') ADVANCE(19);
      if (lookahead == 's') ADVANCE(23);
      if (lookahead == 'N' ||
          lookahead == 'n') ADVANCE(18);
      END_STATE();
    case 6:
      if (lookahead == 'e') ADVANCE(24);
      if (lookahead == 'Y' ||
          lookahead == 'y') ADVANCE(20);
      END_STATE();
    case 7:
      if (lookahead == 'E') ADVANCE(21);
      if (lookahead == 'e') ADVANCE(25);
      if (lookahead == 'y') ADVANCE(26);
      END_STATE();
    case 8:
      if (lookahead == 'a') ADVANCE(27);
      if (lookahead == 'e') ADVANCE(28);
      if (lookahead == 'r') ADVANCE(29);
      END_STATE();
    case 9:
      if (lookahead == 'n') ADVANCE(30);
      END_STATE();
    case 10:
      if (lookahead == 'I') ADVANCE(22);
      if (lookahead == 'i') ADVANCE(31);
      END_STATE();
    case 11:
      if (lookahead == 'e') ADVANCE(32);
      END_STATE();
    case 12:
      if (lookahead == 'a') ADVANCE(33);
      if (lookahead == 'r') ADVANCE(34);
      END_STATE();
    case 13:
      if (lookahead == 's') ADVANCE(35);
      END_STATE();
    case 14:
      if (lookahead == 'i') ADVANCE(36);
      END_STATE();
    case 15:
      if (lookahead == 'h') ADVANCE(37);
      END_STATE();
    case 16:
      if (lookahead == 'O' ||
          lookahead == 'o') ADVANCE(38);
      END_STATE();
    case 17:
      if (lookahead == 'R' ||
          lookahead == 'r') ADVANCE(39);
      END_STATE();
    case 18:
      if (lookahead == 'D' ||
          lookahead == 'd') ADVANCE(40);
      END_STATE();
    case 19:
      if (lookahead == 'C' ||
          lookahead == 'c') ADVANCE(41);
      END_STATE();
    case 20:
      ACCEPT_TOKEN(sym_keyword_by);
      END_STATE();
    case 21:
      if (lookahead == 'S' ||
          lookahead == 's') ADVANCE(42);
      END_STATE();
    case 22:
      if (lookahead == 'M' ||
          lookahead == 'm') ADVANCE(43);
      END_STATE();
    case 23:
      ACCEPT_TOKEN(anon_sym_as);
      if (lookahead == 'C' ||
          lookahead == 'c') ADVANCE(41);
      END_STATE();
    case 24:
      if (lookahead == 't') ADVANCE(44);
      END_STATE();
    case 25:
      if (lookahead == 'f') ADVANCE(45);
      if (lookahead == 'S' ||
          lookahead == 's') ADVANCE(42);
      END_STATE();
    case 26:
      if (lookahead == 'n') ADVANCE(46);
      END_STATE();
    case 27:
      if (lookahead == 'l') ADVANCE(47);
      END_STATE();
    case 28:
      if (lookahead == 't') ADVANCE(48);
      END_STATE();
    case 29:
      if (lookahead == 'o') ADVANCE(49);
      END_STATE();
    case 30:
      ACCEPT_TOKEN(anon_sym_in);
      if (lookahead == 'p') ADVANCE(50);
      END_STATE();
    case 31:
      if (lookahead == 'k') ADVANCE(51);
      if (lookahead == 'M' ||
          lookahead == 'm') ADVANCE(43);
      END_STATE();
    case 32:
      if (lookahead == 'r') ADVANCE(52);
      END_STATE();
    case 33:
      if (lookahead == 's') ADVANCE(53);
      END_STATE();
    case 34:
      if (lookahead == 'u') ADVANCE(54);
      END_STATE();
    case 35:
      if (lookahead == 'i') ADVANCE(55);
      END_STATE();
    case 36:
      if (lookahead == 'e') ADVANCE(56);
      END_STATE();
    case 37:
      if (lookahead == 'e') ADVANCE(57);
      END_STATE();
    case 38:
      if (lookahead == 'T' ||
          lookahead == 't') ADVANCE(58);
      END_STATE();
    case 39:
      ACCEPT_TOKEN(sym_keyword_or);
      if (lookahead == 'D' ||
          lookahead == 'd') ADVANCE(59);
      END_STATE();
    case 40:
      ACCEPT_TOKEN(sym_keyword_and);
      END_STATE();
    case 41:
      ACCEPT_TOKEN(sym_keyword_asc);
      END_STATE();
    case 42:
      if (lookahead == 'C' ||
          lookahead == 'c') ADVANCE(60);
      END_STATE();
    case 43:
      if (lookahead == 'I' ||
          lookahead == 'i') ADVANCE(61);
      END_STATE();
    case 44:
      if (lookahead == 'w') ADVANCE(62);
      END_STATE();
    case 45:
      if (lookahead == 'i') ADVANCE(63);
      END_STATE();
    case 46:
      if (lookahead == 'a') ADVANCE(64);
      END_STATE();
    case 47:
      if (lookahead == 's') ADVANCE(65);
      END_STATE();
    case 48:
      if (lookahead == 'c') ADVANCE(66);
      END_STATE();
    case 49:
      if (lookahead == 'm') ADVANCE(67);
      END_STATE();
    case 50:
      if (lookahead == 'u') ADVANCE(68);
      END_STATE();
    case 51:
      if (lookahead == 'e') ADVANCE(69);
      END_STATE();
    case 52:
      if (lookahead == 'g') ADVANCE(70);
      END_STATE();
    case 53:
      if (lookahead == 'k') ADVANCE(71);
      END_STATE();
    case 54:
      if (lookahead == 'e') ADVANCE(72);
      END_STATE();
    case 55:
      if (lookahead == 'n') ADVANCE(73);
      END_STATE();
    case 56:
      if (lookahead == 'w') ADVANCE(74);
      END_STATE();
    case 57:
      if (lookahead == 'r') ADVANCE(75);
      END_STATE();
    case 58:
      ACCEPT_TOKEN(sym_keyword_not);
      END_STATE();
    case 59:
      if (lookahead == 'E' ||
          lookahead == 'e') ADVANCE(76);
      END_STATE();
    case 60:
      ACCEPT_TOKEN(sym_keyword_desc);
      END_STATE();
    case 61:
      if (lookahead == 'T' ||
          lookahead == 't') ADVANCE(77);
      END_STATE();
    case 62:
      if (lookahead == 'e') ADVANCE(78);
      END_STATE();
    case 63:
      if (lookahead == 'n') ADVANCE(79);
      END_STATE();
    case 64:
      if (lookahead == 'm') ADVANCE(80);
      END_STATE();
    case 65:
      if (lookahead == 'e') ADVANCE(81);
      END_STATE();
    case 66:
      if (lookahead == 'h') ADVANCE(82);
      END_STATE();
    case 67:
      ACCEPT_TOKEN(anon_sym_from);
      END_STATE();
    case 68:
      if (lookahead == 't') ADVANCE(83);
      END_STATE();
    case 69:
      ACCEPT_TOKEN(anon_sym_like);
      END_STATE();
    case 70:
      if (lookahead == 'e') ADVANCE(84);
      END_STATE();
    case 71:
      ACCEPT_TOKEN(anon_sym_task);
      END_STATE();
    case 72:
      ACCEPT_TOKEN(anon_sym_true);
      END_STATE();
    case 73:
      if (lookahead == 'g') ADVANCE(85);
      END_STATE();
    case 74:
      ACCEPT_TOKEN(anon_sym_view);
      END_STATE();
    case 75:
      if (lookahead == 'e') ADVANCE(86);
      END_STATE();
    case 76:
      if (lookahead == 'R' ||
          lookahead == 'r') ADVANCE(87);
      END_STATE();
    case 77:
      ACCEPT_TOKEN(sym_keyword_limit);
      END_STATE();
    case 78:
      if (lookahead == 'e') ADVANCE(88);
      END_STATE();
    case 79:
      if (lookahead == 'e') ADVANCE(89);
      END_STATE();
    case 80:
      if (lookahead == 'i') ADVANCE(90);
      END_STATE();
    case 81:
      ACCEPT_TOKEN(anon_sym_false);
      END_STATE();
    case 82:
      ACCEPT_TOKEN(anon_sym_fetch);
      END_STATE();
    case 83:
      ACCEPT_TOKEN(anon_sym_input);
      END_STATE();
    case 84:
      ACCEPT_TOKEN(anon_sym_merge);
      END_STATE();
    case 85:
      ACCEPT_TOKEN(anon_sym_using);
      END_STATE();
    case 86:
      ACCEPT_TOKEN(anon_sym_where);
      END_STATE();
    case 87:
      ACCEPT_TOKEN(sym_keyword_order);
      END_STATE();
    case 88:
      if (lookahead == 'n') ADVANCE(91);
      END_STATE();
    case 89:
      ACCEPT_TOKEN(anon_sym_define);
      END_STATE();
    case 90:
      if (lookahead == 'c') ADVANCE(92);
      END_STATE();
    case 91:
      ACCEPT_TOKEN(anon_sym_between);
      END_STATE();
    case 92:
      ACCEPT_TOKEN(anon_sym_dynamic);
      END_STATE();
    default:
      return false;
  }
}

static const TSLexMode ts_lex_modes[STATE_COUNT] = {
  [0] = {.lex_state = 0},
  [1] = {.lex_state = 14},
  [2] = {.lex_state = 14},
  [3] = {.lex_state = 14},
  [4] = {.lex_state = 14},
  [5] = {.lex_state = 14},
  [6] = {.lex_state = 14},
  [7] = {.lex_state = 14},
  [8] = {.lex_state = 0},
  [9] = {.lex_state = 0},
  [10] = {.lex_state = 14},
  [11] = {.lex_state = 14},
  [12] = {.lex_state = 14},
  [13] = {.lex_state = 14},
  [14] = {.lex_state = 14},
  [15] = {.lex_state = 14},
  [16] = {.lex_state = 14},
  [17] = {.lex_state = 14},
  [18] = {.lex_state = 14},
  [19] = {.lex_state = 14},
  [20] = {.lex_state = 14},
  [21] = {.lex_state = 0},
  [22] = {.lex_state = 0},
  [23] = {.lex_state = 14},
  [24] = {.lex_state = 14},
  [25] = {.lex_state = 14},
  [26] = {.lex_state = 14},
  [27] = {.lex_state = 14},
  [28] = {.lex_state = 14},
  [29] = {.lex_state = 14},
  [30] = {.lex_state = 14},
  [31] = {.lex_state = 14},
  [32] = {.lex_state = 14},
  [33] = {.lex_state = 14},
  [34] = {.lex_state = 14},
  [35] = {.lex_state = 14},
  [36] = {.lex_state = 14},
  [37] = {.lex_state = 14},
  [38] = {.lex_state = 14},
  [39] = {.lex_state = 14},
  [40] = {.lex_state = 14},
  [41] = {.lex_state = 14},
  [42] = {.lex_state = 14},
  [43] = {.lex_state = 14},
  [44] = {.lex_state = 14},
  [45] = {.lex_state = 14},
  [46] = {.lex_state = 14},
  [47] = {.lex_state = 14},
  [48] = {.lex_state = 14},
  [49] = {.lex_state = 14},
  [50] = {.lex_state = 14},
  [51] = {.lex_state = 14},
  [52] = {.lex_state = 14},
  [53] = {.lex_state = 14},
  [54] = {.lex_state = 14},
  [55] = {.lex_state = 14},
  [56] = {.lex_state = 14},
  [57] = {.lex_state = 0},
  [58] = {.lex_state = 14},
  [59] = {.lex_state = 14},
  [60] = {.lex_state = 14},
  [61] = {.lex_state = 14},
  [62] = {.lex_state = 14},
  [63] = {.lex_state = 14},
  [64] = {.lex_state = 0},
  [65] = {.lex_state = 14},
  [66] = {.lex_state = 14},
  [67] = {.lex_state = 14},
  [68] = {.lex_state = 14},
  [69] = {.lex_state = 0},
  [70] = {.lex_state = 0},
  [71] = {.lex_state = 0},
  [72] = {.lex_state = 14},
  [73] = {.lex_state = 14},
  [74] = {.lex_state = 14},
  [75] = {.lex_state = 0},
  [76] = {.lex_state = 14},
  [77] = {.lex_state = 14},
  [78] = {.lex_state = 0},
  [79] = {.lex_state = 14},
  [80] = {.lex_state = 14},
  [81] = {.lex_state = 0},
  [82] = {.lex_state = 0},
  [83] = {.lex_state = 0},
  [84] = {.lex_state = 0},
  [85] = {.lex_state = 0},
  [86] = {.lex_state = 14},
  [87] = {.lex_state = 1},
  [88] = {.lex_state = 0},
  [89] = {.lex_state = 14},
  [90] = {.lex_state = 14},
  [91] = {.lex_state = 0},
  [92] = {.lex_state = 0},
  [93] = {.lex_state = 0},
  [94] = {.lex_state = 27},
  [95] = {.lex_state = 0},
  [96] = {.lex_state = 0},
  [97] = {.lex_state = 0},
  [98] = {.lex_state = 35},
  [99] = {.lex_state = 0},
  [100] = {.lex_state = 0},
  [101] = {.lex_state = 0},
  [102] = {.lex_state = 0},
  [103] = {.lex_state = 14},
  [104] = {.lex_state = 0},
  [105] = {.lex_state = 0},
  [106] = {.lex_state = 0},
  [107] = {.lex_state = 0},
  [108] = {.lex_state = 0},
  [109] = {.lex_state = 0},
  [110] = {.lex_state = 0},
  [111] = {.lex_state = 0},
  [112] = {.lex_state = 0},
  [113] = {.lex_state = 27},
  [114] = {.lex_state = 35},
};

static const uint16_t ts_parse_table[LARGE_STATE_COUNT][SYMBOL_COUNT] = {
  [0] = {
    [ts_builtin_sym_end] = ACTIONS(1),
    [sym_identifier] = ACTIONS(1),
    [anon_sym_define] = ACTIONS(1),
    [anon_sym_task] = ACTIONS(1),
    [anon_sym_as] = ACTIONS(1),
    [anon_sym_COLON] = ACTIONS(1),
    [anon_sym_fetch] = ACTIONS(1),
    [anon_sym_view] = ACTIONS(1),
    [anon_sym_from] = ACTIONS(1),
    [anon_sym_DOT] = ACTIONS(1),
    [anon_sym_where] = ACTIONS(1),
    [anon_sym_using] = ACTIONS(1),
    [anon_sym_merge] = ACTIONS(1),
    [anon_sym_dynamic] = ACTIONS(1),
    [anon_sym_input] = ACTIONS(1),
    [anon_sym_LPAREN] = ACTIONS(1),
    [anon_sym_RPAREN] = ACTIONS(1),
    [anon_sym_COMMA] = ACTIONS(1),
    [anon_sym_EQ] = ACTIONS(1),
    [anon_sym_SQUOTE] = ACTIONS(1),
    [anon_sym_DQUOTE] = ACTIONS(1),
    [sym_keyword_and] = ACTIONS(1),
    [sym_keyword_or] = ACTIONS(1),
    [sym_keyword_not] = ACTIONS(1),
    [sym_keyword_order] = ACTIONS(1),
    [sym_keyword_by] = ACTIONS(1),
    [sym_keyword_limit] = ACTIONS(1),
    [sym_keyword_asc] = ACTIONS(1),
    [sym_keyword_desc] = ACTIONS(1),
    [sym_variable] = ACTIONS(1),
    [sym_number] = ACTIONS(1),
    [anon_sym_true] = ACTIONS(1),
    [anon_sym_false] = ACTIONS(1),
    [anon_sym_GT] = ACTIONS(1),
    [anon_sym_LT] = ACTIONS(1),
    [anon_sym_GT_EQ] = ACTIONS(1),
    [anon_sym_LT_EQ] = ACTIONS(1),
    [anon_sym_LT_GT] = ACTIONS(1),
    [anon_sym_BANG_EQ] = ACTIONS(1),
    [anon_sym_is] = ACTIONS(1),
    [anon_sym_isnot] = ACTIONS(1),
    [anon_sym_in] = ACTIONS(1),
    [anon_sym_like] = ACTIONS(1),
    [anon_sym_between] = ACTIONS(1),
    [sym_comment] = ACTIONS(3),
  },
  [1] = {
    [sym_source_file] = STATE(102),
    [sym_task_definition] = STATE(92),
    [anon_sym_define] = ACTIONS(5),
    [sym_comment] = ACTIONS(3),
  },
};

static const uint16_t ts_small_parse_table[] = {
  [0] = 13,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(7), 1,
      ts_builtin_sym_end,
    ACTIONS(11), 1,
      anon_sym_as,
    ACTIONS(13), 1,
      anon_sym_where,
    ACTIONS(15), 1,
      anon_sym_using,
    ACTIONS(17), 1,
      anon_sym_merge,
    ACTIONS(19), 1,
      anon_sym_dynamic,
    ACTIONS(21), 1,
      anon_sym_input,
    ACTIONS(23), 1,
      sym_keyword_order,
    ACTIONS(25), 1,
      sym_keyword_limit,
    STATE(6), 2,
      sym_operation_clause,
      aux_sym_fetch_operation_repeat1,
    ACTIONS(9), 3,
      anon_sym_fetch,
      anon_sym_view,
      sym_identifier,
    STATE(39), 8,
      sym_where_clause,
      sym_using_clause,
      sym_merge_clause,
      sym_as_clause,
      sym_dynamic_clause,
      sym_input_clause,
      sym_order_by_clause,
      sym_limit_clause,
  [50] = 13,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(11), 1,
      anon_sym_as,
    ACTIONS(13), 1,
      anon_sym_where,
    ACTIONS(15), 1,
      anon_sym_using,
    ACTIONS(17), 1,
      anon_sym_merge,
    ACTIONS(19), 1,
      anon_sym_dynamic,
    ACTIONS(21), 1,
      anon_sym_input,
    ACTIONS(23), 1,
      sym_keyword_order,
    ACTIONS(25), 1,
      sym_keyword_limit,
    ACTIONS(27), 1,
      ts_builtin_sym_end,
    STATE(5), 2,
      sym_operation_clause,
      aux_sym_fetch_operation_repeat1,
    ACTIONS(29), 3,
      anon_sym_fetch,
      anon_sym_view,
      sym_identifier,
    STATE(39), 8,
      sym_where_clause,
      sym_using_clause,
      sym_merge_clause,
      sym_as_clause,
      sym_dynamic_clause,
      sym_input_clause,
      sym_order_by_clause,
      sym_limit_clause,
  [100] = 13,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(11), 1,
      anon_sym_as,
    ACTIONS(13), 1,
      anon_sym_where,
    ACTIONS(15), 1,
      anon_sym_using,
    ACTIONS(17), 1,
      anon_sym_merge,
    ACTIONS(19), 1,
      anon_sym_dynamic,
    ACTIONS(21), 1,
      anon_sym_input,
    ACTIONS(23), 1,
      sym_keyword_order,
    ACTIONS(25), 1,
      sym_keyword_limit,
    ACTIONS(31), 1,
      ts_builtin_sym_end,
    STATE(2), 2,
      sym_operation_clause,
      aux_sym_fetch_operation_repeat1,
    ACTIONS(33), 3,
      anon_sym_fetch,
      anon_sym_view,
      sym_identifier,
    STATE(39), 8,
      sym_where_clause,
      sym_using_clause,
      sym_merge_clause,
      sym_as_clause,
      sym_dynamic_clause,
      sym_input_clause,
      sym_order_by_clause,
      sym_limit_clause,
  [150] = 13,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(11), 1,
      anon_sym_as,
    ACTIONS(13), 1,
      anon_sym_where,
    ACTIONS(15), 1,
      anon_sym_using,
    ACTIONS(17), 1,
      anon_sym_merge,
    ACTIONS(19), 1,
      anon_sym_dynamic,
    ACTIONS(21), 1,
      anon_sym_input,
    ACTIONS(23), 1,
      sym_keyword_order,
    ACTIONS(25), 1,
      sym_keyword_limit,
    ACTIONS(35), 1,
      ts_builtin_sym_end,
    STATE(6), 2,
      sym_operation_clause,
      aux_sym_fetch_operation_repeat1,
    ACTIONS(37), 3,
      anon_sym_fetch,
      anon_sym_view,
      sym_identifier,
    STATE(39), 8,
      sym_where_clause,
      sym_using_clause,
      sym_merge_clause,
      sym_as_clause,
      sym_dynamic_clause,
      sym_input_clause,
      sym_order_by_clause,
      sym_limit_clause,
  [200] = 13,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(39), 1,
      ts_builtin_sym_end,
    ACTIONS(43), 1,
      anon_sym_as,
    ACTIONS(46), 1,
      anon_sym_where,
    ACTIONS(49), 1,
      anon_sym_using,
    ACTIONS(52), 1,
      anon_sym_merge,
    ACTIONS(55), 1,
      anon_sym_dynamic,
    ACTIONS(58), 1,
      anon_sym_input,
    ACTIONS(61), 1,
      sym_keyword_order,
    ACTIONS(64), 1,
      sym_keyword_limit,
    STATE(6), 2,
      sym_operation_clause,
      aux_sym_fetch_operation_repeat1,
    ACTIONS(41), 3,
      anon_sym_fetch,
      anon_sym_view,
      sym_identifier,
    STATE(39), 8,
      sym_where_clause,
      sym_using_clause,
      sym_merge_clause,
      sym_as_clause,
      sym_dynamic_clause,
      sym_input_clause,
      sym_order_by_clause,
      sym_limit_clause,
  [250] = 5,
    ACTIONS(3), 1,
      sym_comment,
    STATE(23), 1,
      sym_order_direction,
    ACTIONS(67), 2,
      ts_builtin_sym_end,
      anon_sym_COMMA,
    ACTIONS(71), 2,
      sym_keyword_asc,
      sym_keyword_desc,
    ACTIONS(69), 11,
      anon_sym_as,
      anon_sym_fetch,
      anon_sym_view,
      anon_sym_where,
      anon_sym_using,
      anon_sym_merge,
      anon_sym_dynamic,
      anon_sym_input,
      sym_keyword_order,
      sym_keyword_limit,
      sym_identifier,
  [278] = 3,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(75), 3,
      anon_sym_GT,
      anon_sym_LT,
      anon_sym_is,
    ACTIONS(73), 13,
      anon_sym_RPAREN,
      anon_sym_COMMA,
      anon_sym_EQ,
      sym_keyword_and,
      sym_keyword_or,
      anon_sym_GT_EQ,
      anon_sym_LT_EQ,
      anon_sym_LT_GT,
      anon_sym_BANG_EQ,
      anon_sym_isnot,
      anon_sym_in,
      anon_sym_like,
      anon_sym_between,
  [302] = 3,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(79), 3,
      anon_sym_GT,
      anon_sym_LT,
      anon_sym_is,
    ACTIONS(77), 12,
      anon_sym_RPAREN,
      anon_sym_EQ,
      sym_keyword_and,
      sym_keyword_or,
      anon_sym_GT_EQ,
      anon_sym_LT_EQ,
      anon_sym_LT_GT,
      anon_sym_BANG_EQ,
      anon_sym_isnot,
      anon_sym_in,
      anon_sym_like,
      anon_sym_between,
  [325] = 5,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(81), 1,
      ts_builtin_sym_end,
    STATE(32), 1,
      sym_logical_operator,
    ACTIONS(85), 2,
      sym_keyword_and,
      sym_keyword_or,
    ACTIONS(83), 11,
      anon_sym_as,
      anon_sym_fetch,
      anon_sym_view,
      anon_sym_where,
      anon_sym_using,
      anon_sym_merge,
      anon_sym_dynamic,
      anon_sym_input,
      sym_keyword_order,
      sym_keyword_limit,
      sym_identifier,
  [352] = 5,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(87), 1,
      ts_builtin_sym_end,
    STATE(32), 1,
      sym_logical_operator,
    ACTIONS(85), 2,
      sym_keyword_and,
      sym_keyword_or,
    ACTIONS(89), 11,
      anon_sym_as,
      anon_sym_fetch,
      anon_sym_view,
      anon_sym_where,
      anon_sym_using,
      anon_sym_merge,
      anon_sym_dynamic,
      anon_sym_input,
      sym_keyword_order,
      sym_keyword_limit,
      sym_identifier,
  [379] = 4,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(91), 1,
      ts_builtin_sym_end,
    STATE(32), 1,
      sym_logical_operator,
    ACTIONS(93), 13,
      anon_sym_as,
      anon_sym_fetch,
      anon_sym_view,
      anon_sym_where,
      anon_sym_using,
      anon_sym_merge,
      anon_sym_dynamic,
      anon_sym_input,
      sym_keyword_and,
      sym_keyword_or,
      sym_keyword_order,
      sym_keyword_limit,
      sym_identifier,
  [404] = 3,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(95), 1,
      ts_builtin_sym_end,
    ACTIONS(97), 13,
      anon_sym_as,
      anon_sym_fetch,
      anon_sym_view,
      anon_sym_where,
      anon_sym_using,
      anon_sym_merge,
      anon_sym_dynamic,
      anon_sym_input,
      sym_keyword_and,
      sym_keyword_or,
      sym_keyword_order,
      sym_keyword_limit,
      sym_identifier,
  [426] = 5,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(99), 1,
      ts_builtin_sym_end,
    ACTIONS(103), 1,
      anon_sym_COMMA,
    STATE(15), 1,
      aux_sym_order_list_repeat1,
    ACTIONS(101), 11,
      anon_sym_as,
      anon_sym_fetch,
      anon_sym_view,
      anon_sym_where,
      anon_sym_using,
      anon_sym_merge,
      anon_sym_dynamic,
      anon_sym_input,
      sym_keyword_order,
      sym_keyword_limit,
      sym_identifier,
  [452] = 5,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(103), 1,
      anon_sym_COMMA,
    ACTIONS(105), 1,
      ts_builtin_sym_end,
    STATE(20), 1,
      aux_sym_order_list_repeat1,
    ACTIONS(107), 11,
      anon_sym_as,
      anon_sym_fetch,
      anon_sym_view,
      anon_sym_where,
      anon_sym_using,
      anon_sym_merge,
      anon_sym_dynamic,
      anon_sym_input,
      sym_keyword_order,
      sym_keyword_limit,
      sym_identifier,
  [478] = 3,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(77), 1,
      ts_builtin_sym_end,
    ACTIONS(79), 13,
      anon_sym_as,
      anon_sym_fetch,
      anon_sym_view,
      anon_sym_where,
      anon_sym_using,
      anon_sym_merge,
      anon_sym_dynamic,
      anon_sym_input,
      sym_keyword_and,
      sym_keyword_or,
      sym_keyword_order,
      sym_keyword_limit,
      sym_identifier,
  [500] = 3,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(109), 1,
      ts_builtin_sym_end,
    ACTIONS(111), 13,
      anon_sym_as,
      anon_sym_fetch,
      anon_sym_view,
      anon_sym_where,
      anon_sym_using,
      anon_sym_merge,
      anon_sym_dynamic,
      anon_sym_input,
      sym_keyword_and,
      sym_keyword_or,
      sym_keyword_order,
      sym_keyword_limit,
      sym_identifier,
  [522] = 3,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(113), 1,
      ts_builtin_sym_end,
    ACTIONS(115), 13,
      anon_sym_as,
      anon_sym_fetch,
      anon_sym_view,
      anon_sym_where,
      anon_sym_using,
      anon_sym_merge,
      anon_sym_dynamic,
      anon_sym_input,
      sym_keyword_and,
      sym_keyword_or,
      sym_keyword_order,
      sym_keyword_limit,
      sym_identifier,
  [544] = 3,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(73), 1,
      ts_builtin_sym_end,
    ACTIONS(75), 13,
      anon_sym_as,
      anon_sym_fetch,
      anon_sym_view,
      anon_sym_where,
      anon_sym_using,
      anon_sym_merge,
      anon_sym_dynamic,
      anon_sym_input,
      sym_keyword_and,
      sym_keyword_or,
      sym_keyword_order,
      sym_keyword_limit,
      sym_identifier,
  [566] = 5,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(117), 1,
      ts_builtin_sym_end,
    ACTIONS(121), 1,
      anon_sym_COMMA,
    STATE(20), 1,
      aux_sym_order_list_repeat1,
    ACTIONS(119), 11,
      anon_sym_as,
      anon_sym_fetch,
      anon_sym_view,
      anon_sym_where,
      anon_sym_using,
      anon_sym_merge,
      anon_sym_dynamic,
      anon_sym_input,
      sym_keyword_order,
      sym_keyword_limit,
      sym_identifier,
  [592] = 4,
    ACTIONS(3), 1,
      sym_comment,
    STATE(47), 1,
      sym_comparison_operator,
    ACTIONS(126), 3,
      anon_sym_GT,
      anon_sym_LT,
      anon_sym_is,
    ACTIONS(124), 9,
      anon_sym_EQ,
      anon_sym_GT_EQ,
      anon_sym_LT_EQ,
      anon_sym_LT_GT,
      anon_sym_BANG_EQ,
      anon_sym_isnot,
      anon_sym_in,
      anon_sym_like,
      anon_sym_between,
  [615] = 4,
    ACTIONS(3), 1,
      sym_comment,
    STATE(48), 1,
      sym_comparison_operator,
    ACTIONS(126), 3,
      anon_sym_GT,
      anon_sym_LT,
      anon_sym_is,
    ACTIONS(124), 9,
      anon_sym_EQ,
      anon_sym_GT_EQ,
      anon_sym_LT_EQ,
      anon_sym_LT_GT,
      anon_sym_BANG_EQ,
      anon_sym_isnot,
      anon_sym_in,
      anon_sym_like,
      anon_sym_between,
  [638] = 3,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(128), 2,
      ts_builtin_sym_end,
      anon_sym_COMMA,
    ACTIONS(130), 11,
      anon_sym_as,
      anon_sym_fetch,
      anon_sym_view,
      anon_sym_where,
      anon_sym_using,
      anon_sym_merge,
      anon_sym_dynamic,
      anon_sym_input,
      sym_keyword_order,
      sym_keyword_limit,
      sym_identifier,
  [659] = 3,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(117), 2,
      ts_builtin_sym_end,
      anon_sym_COMMA,
    ACTIONS(119), 11,
      anon_sym_as,
      anon_sym_fetch,
      anon_sym_view,
      anon_sym_where,
      anon_sym_using,
      anon_sym_merge,
      anon_sym_dynamic,
      anon_sym_input,
      sym_keyword_order,
      sym_keyword_limit,
      sym_identifier,
  [680] = 3,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(132), 2,
      ts_builtin_sym_end,
      anon_sym_COMMA,
    ACTIONS(134), 11,
      anon_sym_as,
      anon_sym_fetch,
      anon_sym_view,
      anon_sym_where,
      anon_sym_using,
      anon_sym_merge,
      anon_sym_dynamic,
      anon_sym_input,
      sym_keyword_order,
      sym_keyword_limit,
      sym_identifier,
  [701] = 3,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(136), 1,
      ts_builtin_sym_end,
    ACTIONS(138), 11,
      anon_sym_as,
      anon_sym_fetch,
      anon_sym_view,
      anon_sym_where,
      anon_sym_using,
      anon_sym_merge,
      anon_sym_dynamic,
      anon_sym_input,
      sym_keyword_order,
      sym_keyword_limit,
      sym_identifier,
  [721] = 11,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(140), 1,
      sym_identifier,
    ACTIONS(142), 1,
      anon_sym_LPAREN,
    ACTIONS(144), 1,
      anon_sym_SQUOTE,
    ACTIONS(146), 1,
      anon_sym_DQUOTE,
    ACTIONS(148), 1,
      sym_keyword_not,
    STATE(9), 1,
      sym_string_literal,
    STATE(22), 1,
      sym_expression,
    STATE(60), 1,
      sym_condition,
    ACTIONS(150), 2,
      sym_variable,
      sym_number,
    STATE(73), 2,
      sym_logical_operation,
      sym_comparison,
  [757] = 3,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(152), 1,
      ts_builtin_sym_end,
    ACTIONS(154), 11,
      anon_sym_as,
      anon_sym_fetch,
      anon_sym_view,
      anon_sym_where,
      anon_sym_using,
      anon_sym_merge,
      anon_sym_dynamic,
      anon_sym_input,
      sym_keyword_order,
      sym_keyword_limit,
      sym_identifier,
  [777] = 3,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(156), 1,
      ts_builtin_sym_end,
    ACTIONS(158), 11,
      anon_sym_as,
      anon_sym_fetch,
      anon_sym_view,
      anon_sym_where,
      anon_sym_using,
      anon_sym_merge,
      anon_sym_dynamic,
      anon_sym_input,
      sym_keyword_order,
      sym_keyword_limit,
      sym_identifier,
  [797] = 3,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(160), 1,
      ts_builtin_sym_end,
    ACTIONS(162), 11,
      anon_sym_as,
      anon_sym_fetch,
      anon_sym_view,
      anon_sym_where,
      anon_sym_using,
      anon_sym_merge,
      anon_sym_dynamic,
      anon_sym_input,
      sym_keyword_order,
      sym_keyword_limit,
      sym_identifier,
  [817] = 3,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(164), 1,
      ts_builtin_sym_end,
    ACTIONS(166), 11,
      anon_sym_as,
      anon_sym_fetch,
      anon_sym_view,
      anon_sym_where,
      anon_sym_using,
      anon_sym_merge,
      anon_sym_dynamic,
      anon_sym_input,
      sym_keyword_order,
      sym_keyword_limit,
      sym_identifier,
  [837] = 11,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(140), 1,
      sym_identifier,
    ACTIONS(144), 1,
      anon_sym_SQUOTE,
    ACTIONS(146), 1,
      anon_sym_DQUOTE,
    ACTIONS(168), 1,
      anon_sym_LPAREN,
    ACTIONS(170), 1,
      sym_keyword_not,
    STATE(9), 1,
      sym_string_literal,
    STATE(12), 1,
      sym_condition,
    STATE(21), 1,
      sym_expression,
    ACTIONS(150), 2,
      sym_variable,
      sym_number,
    STATE(13), 2,
      sym_logical_operation,
      sym_comparison,
  [873] = 3,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(172), 1,
      ts_builtin_sym_end,
    ACTIONS(174), 11,
      anon_sym_as,
      anon_sym_fetch,
      anon_sym_view,
      anon_sym_where,
      anon_sym_using,
      anon_sym_merge,
      anon_sym_dynamic,
      anon_sym_input,
      sym_keyword_order,
      sym_keyword_limit,
      sym_identifier,
  [893] = 11,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(140), 1,
      sym_identifier,
    ACTIONS(144), 1,
      anon_sym_SQUOTE,
    ACTIONS(146), 1,
      anon_sym_DQUOTE,
    ACTIONS(168), 1,
      anon_sym_LPAREN,
    ACTIONS(170), 1,
      sym_keyword_not,
    STATE(9), 1,
      sym_string_literal,
    STATE(11), 1,
      sym_condition,
    STATE(21), 1,
      sym_expression,
    ACTIONS(150), 2,
      sym_variable,
      sym_number,
    STATE(13), 2,
      sym_logical_operation,
      sym_comparison,
  [929] = 3,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(176), 1,
      ts_builtin_sym_end,
    ACTIONS(178), 11,
      anon_sym_as,
      anon_sym_fetch,
      anon_sym_view,
      anon_sym_where,
      anon_sym_using,
      anon_sym_merge,
      anon_sym_dynamic,
      anon_sym_input,
      sym_keyword_order,
      sym_keyword_limit,
      sym_identifier,
  [949] = 3,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(180), 1,
      ts_builtin_sym_end,
    ACTIONS(182), 11,
      anon_sym_as,
      anon_sym_fetch,
      anon_sym_view,
      anon_sym_where,
      anon_sym_using,
      anon_sym_merge,
      anon_sym_dynamic,
      anon_sym_input,
      sym_keyword_order,
      sym_keyword_limit,
      sym_identifier,
  [969] = 11,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(140), 1,
      sym_identifier,
    ACTIONS(142), 1,
      anon_sym_LPAREN,
    ACTIONS(144), 1,
      anon_sym_SQUOTE,
    ACTIONS(146), 1,
      anon_sym_DQUOTE,
    ACTIONS(148), 1,
      sym_keyword_not,
    STATE(9), 1,
      sym_string_literal,
    STATE(22), 1,
      sym_expression,
    STATE(59), 1,
      sym_condition,
    ACTIONS(150), 2,
      sym_variable,
      sym_number,
    STATE(73), 2,
      sym_logical_operation,
      sym_comparison,
  [1005] = 11,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(140), 1,
      sym_identifier,
    ACTIONS(144), 1,
      anon_sym_SQUOTE,
    ACTIONS(146), 1,
      anon_sym_DQUOTE,
    ACTIONS(168), 1,
      anon_sym_LPAREN,
    ACTIONS(170), 1,
      sym_keyword_not,
    STATE(9), 1,
      sym_string_literal,
    STATE(10), 1,
      sym_condition,
    STATE(21), 1,
      sym_expression,
    ACTIONS(150), 2,
      sym_variable,
      sym_number,
    STATE(13), 2,
      sym_logical_operation,
      sym_comparison,
  [1041] = 3,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(184), 1,
      ts_builtin_sym_end,
    ACTIONS(186), 11,
      anon_sym_as,
      anon_sym_fetch,
      anon_sym_view,
      anon_sym_where,
      anon_sym_using,
      anon_sym_merge,
      anon_sym_dynamic,
      anon_sym_input,
      sym_keyword_order,
      sym_keyword_limit,
      sym_identifier,
  [1061] = 3,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(188), 1,
      ts_builtin_sym_end,
    ACTIONS(190), 11,
      anon_sym_as,
      anon_sym_fetch,
      anon_sym_view,
      anon_sym_where,
      anon_sym_using,
      anon_sym_merge,
      anon_sym_dynamic,
      anon_sym_input,
      sym_keyword_order,
      sym_keyword_limit,
      sym_identifier,
  [1081] = 3,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(192), 1,
      ts_builtin_sym_end,
    ACTIONS(194), 11,
      anon_sym_as,
      anon_sym_fetch,
      anon_sym_view,
      anon_sym_where,
      anon_sym_using,
      anon_sym_merge,
      anon_sym_dynamic,
      anon_sym_input,
      sym_keyword_order,
      sym_keyword_limit,
      sym_identifier,
  [1101] = 11,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(140), 1,
      sym_identifier,
    ACTIONS(142), 1,
      anon_sym_LPAREN,
    ACTIONS(144), 1,
      anon_sym_SQUOTE,
    ACTIONS(146), 1,
      anon_sym_DQUOTE,
    ACTIONS(148), 1,
      sym_keyword_not,
    STATE(9), 1,
      sym_string_literal,
    STATE(22), 1,
      sym_expression,
    STATE(58), 1,
      sym_condition,
    ACTIONS(150), 2,
      sym_variable,
      sym_number,
    STATE(73), 2,
      sym_logical_operation,
      sym_comparison,
  [1137] = 3,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(196), 1,
      ts_builtin_sym_end,
    ACTIONS(198), 11,
      anon_sym_as,
      anon_sym_fetch,
      anon_sym_view,
      anon_sym_where,
      anon_sym_using,
      anon_sym_merge,
      anon_sym_dynamic,
      anon_sym_input,
      sym_keyword_order,
      sym_keyword_limit,
      sym_identifier,
  [1157] = 3,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(200), 1,
      ts_builtin_sym_end,
    ACTIONS(202), 11,
      anon_sym_as,
      anon_sym_fetch,
      anon_sym_view,
      anon_sym_where,
      anon_sym_using,
      anon_sym_merge,
      anon_sym_dynamic,
      anon_sym_input,
      sym_keyword_order,
      sym_keyword_limit,
      sym_identifier,
  [1177] = 11,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(140), 1,
      sym_identifier,
    ACTIONS(142), 1,
      anon_sym_LPAREN,
    ACTIONS(144), 1,
      anon_sym_SQUOTE,
    ACTIONS(146), 1,
      anon_sym_DQUOTE,
    ACTIONS(148), 1,
      sym_keyword_not,
    STATE(9), 1,
      sym_string_literal,
    STATE(22), 1,
      sym_expression,
    STATE(61), 1,
      sym_condition,
    ACTIONS(150), 2,
      sym_variable,
      sym_number,
    STATE(73), 2,
      sym_logical_operation,
      sym_comparison,
  [1213] = 3,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(204), 2,
      sym_keyword_not,
      sym_identifier,
    ACTIONS(206), 5,
      anon_sym_LPAREN,
      anon_sym_SQUOTE,
      anon_sym_DQUOTE,
      sym_variable,
      sym_number,
  [1228] = 6,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(210), 1,
      anon_sym_SQUOTE,
    ACTIONS(212), 1,
      anon_sym_DQUOTE,
    STATE(16), 1,
      sym_string_literal,
    STATE(17), 1,
      sym_expression,
    ACTIONS(208), 3,
      sym_identifier,
      sym_variable,
      sym_number,
  [1249] = 6,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(144), 1,
      anon_sym_SQUOTE,
    ACTIONS(146), 1,
      anon_sym_DQUOTE,
    STATE(9), 1,
      sym_string_literal,
    STATE(63), 1,
      sym_expression,
    ACTIONS(150), 3,
      sym_identifier,
      sym_variable,
      sym_number,
  [1270] = 5,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(214), 1,
      ts_builtin_sym_end,
    ACTIONS(216), 1,
      sym_identifier,
    ACTIONS(219), 2,
      anon_sym_fetch,
      anon_sym_view,
    STATE(49), 2,
      sym_fetch_operation,
      aux_sym_fetch_block_repeat1,
  [1288] = 5,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(221), 1,
      ts_builtin_sym_end,
    ACTIONS(223), 1,
      anon_sym_fetch,
    ACTIONS(226), 1,
      anon_sym_view,
    STATE(50), 3,
      sym_fetch_block,
      sym_view_block,
      aux_sym_task_definition_repeat1,
  [1306] = 5,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(229), 1,
      ts_builtin_sym_end,
    ACTIONS(231), 1,
      sym_identifier,
    ACTIONS(234), 2,
      anon_sym_fetch,
      anon_sym_view,
    STATE(51), 2,
      sym_view_operation,
      aux_sym_view_block_repeat1,
  [1324] = 5,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(236), 1,
      ts_builtin_sym_end,
    ACTIONS(238), 1,
      sym_identifier,
    ACTIONS(240), 2,
      anon_sym_fetch,
      anon_sym_view,
    STATE(49), 2,
      sym_fetch_operation,
      aux_sym_fetch_block_repeat1,
  [1342] = 5,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(242), 1,
      ts_builtin_sym_end,
    ACTIONS(244), 1,
      anon_sym_fetch,
    ACTIONS(246), 1,
      anon_sym_view,
    STATE(50), 3,
      sym_fetch_block,
      sym_view_block,
      aux_sym_task_definition_repeat1,
  [1360] = 5,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(248), 1,
      ts_builtin_sym_end,
    ACTIONS(250), 1,
      sym_identifier,
    ACTIONS(252), 2,
      anon_sym_fetch,
      anon_sym_view,
    STATE(51), 2,
      sym_view_operation,
      aux_sym_view_block_repeat1,
  [1378] = 4,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(244), 1,
      anon_sym_fetch,
    ACTIONS(246), 1,
      anon_sym_view,
    STATE(53), 3,
      sym_fetch_block,
      sym_view_block,
      aux_sym_task_definition_repeat1,
  [1393] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(254), 5,
      anon_sym_SQUOTE,
      anon_sym_DQUOTE,
      sym_identifier,
      sym_variable,
      sym_number,
  [1404] = 5,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(144), 1,
      anon_sym_SQUOTE,
    ACTIONS(146), 1,
      anon_sym_DQUOTE,
    STATE(78), 1,
      sym_string_literal,
    ACTIONS(256), 2,
      sym_variable,
      sym_number,
  [1421] = 4,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(81), 1,
      anon_sym_RPAREN,
    STATE(45), 1,
      sym_logical_operator,
    ACTIONS(258), 2,
      sym_keyword_and,
      sym_keyword_or,
  [1435] = 4,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(260), 1,
      anon_sym_RPAREN,
    STATE(45), 1,
      sym_logical_operator,
    ACTIONS(258), 2,
      sym_keyword_and,
      sym_keyword_or,
  [1449] = 4,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(262), 1,
      anon_sym_RPAREN,
    STATE(45), 1,
      sym_logical_operator,
    ACTIONS(258), 2,
      sym_keyword_and,
      sym_keyword_or,
  [1463] = 3,
    ACTIONS(3), 1,
      sym_comment,
    STATE(45), 1,
      sym_logical_operator,
    ACTIONS(91), 3,
      anon_sym_RPAREN,
      sym_keyword_and,
      sym_keyword_or,
  [1475] = 5,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(264), 1,
      sym_identifier,
    ACTIONS(266), 1,
      anon_sym_RPAREN,
    STATE(64), 1,
      sym_parameter,
    STATE(97), 1,
      sym_parameter_items,
  [1491] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(109), 3,
      anon_sym_RPAREN,
      sym_keyword_and,
      sym_keyword_or,
  [1500] = 4,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(268), 1,
      anon_sym_RPAREN,
    ACTIONS(270), 1,
      anon_sym_COMMA,
    STATE(71), 1,
      aux_sym_parameter_items_repeat1,
  [1513] = 3,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(272), 1,
      sym_identifier,
    STATE(52), 2,
      sym_fetch_operation,
      aux_sym_fetch_block_repeat1,
  [1524] = 3,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(274), 1,
      sym_identifier,
    STATE(54), 2,
      sym_view_operation,
      aux_sym_view_block_repeat1,
  [1535] = 4,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(276), 1,
      sym_identifier,
    STATE(14), 1,
      sym_order_item,
    STATE(29), 1,
      sym_order_list,
  [1548] = 3,
    ACTIONS(3), 1,
      sym_comment,
    STATE(43), 1,
      sym_boolean,
    ACTIONS(278), 2,
      anon_sym_true,
      anon_sym_false,
  [1559] = 4,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(210), 1,
      anon_sym_SQUOTE,
    ACTIONS(212), 1,
      anon_sym_DQUOTE,
    STATE(44), 1,
      sym_string_literal,
  [1572] = 4,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(280), 1,
      anon_sym_RPAREN,
    ACTIONS(282), 1,
      anon_sym_COMMA,
    STATE(70), 1,
      aux_sym_parameter_items_repeat1,
  [1585] = 4,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(270), 1,
      anon_sym_COMMA,
    ACTIONS(285), 1,
      anon_sym_RPAREN,
    STATE(70), 1,
      aux_sym_parameter_items_repeat1,
  [1598] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(113), 3,
      anon_sym_RPAREN,
      sym_keyword_and,
      sym_keyword_or,
  [1607] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(95), 3,
      anon_sym_RPAREN,
      sym_keyword_and,
      sym_keyword_or,
  [1616] = 3,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(276), 1,
      sym_identifier,
    STATE(24), 1,
      sym_order_item,
  [1626] = 3,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(287), 1,
      anon_sym_LPAREN,
    STATE(28), 1,
      sym_parameter_list,
  [1636] = 3,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(289), 1,
      sym_identifier,
    STATE(31), 1,
      sym_service_entity,
  [1646] = 3,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(264), 1,
      sym_identifier,
    STATE(81), 1,
      sym_parameter,
  [1656] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(291), 2,
      anon_sym_RPAREN,
      anon_sym_COMMA,
  [1664] = 3,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(293), 1,
      anon_sym_from,
    STATE(3), 1,
      sym_data_source,
  [1674] = 3,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(293), 1,
      anon_sym_from,
    STATE(4), 1,
      sym_data_source,
  [1684] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(280), 2,
      anon_sym_RPAREN,
      anon_sym_COMMA,
  [1692] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(295), 1,
      anon_sym_COLON,
  [1699] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(297), 1,
      anon_sym_COLON,
  [1706] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(299), 1,
      anon_sym_DQUOTE,
  [1713] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(301), 1,
      anon_sym_COLON,
  [1720] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(303), 1,
      sym_keyword_by,
  [1727] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(305), 1,
      sym_string,
  [1734] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(307), 1,
      anon_sym_COLON,
  [1741] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(309), 1,
      sym_identifier,
  [1748] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(311), 1,
      anon_sym_as,
  [1755] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(313), 1,
      anon_sym_DOT,
  [1762] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(315), 1,
      ts_builtin_sym_end,
  [1769] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(317), 1,
      sym_variable,
  [1776] = 2,
    ACTIONS(319), 1,
      aux_sym_string_literal_token1,
    ACTIONS(321), 1,
      sym_comment,
  [1783] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(323), 1,
      anon_sym_COLON,
  [1790] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(325), 1,
      anon_sym_EQ,
  [1797] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(327), 1,
      anon_sym_RPAREN,
  [1804] = 2,
    ACTIONS(321), 1,
      sym_comment,
    ACTIONS(329), 1,
      aux_sym_string_literal_token2,
  [1811] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(331), 1,
      sym_number,
  [1818] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(333), 1,
      anon_sym_COLON,
  [1825] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(335), 1,
      sym_variable,
  [1832] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(337), 1,
      ts_builtin_sym_end,
  [1839] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(339), 1,
      anon_sym_task,
  [1846] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(341), 1,
      anon_sym_COLON,
  [1853] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(343), 1,
      anon_sym_COLON,
  [1860] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(345), 1,
      anon_sym_COLON,
  [1867] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(299), 1,
      anon_sym_SQUOTE,
  [1874] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(347), 1,
      anon_sym_COLON,
  [1881] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(349), 1,
      anon_sym_SQUOTE,
  [1888] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(349), 1,
      anon_sym_DQUOTE,
  [1895] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(351), 1,
      anon_sym_COLON,
  [1902] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(353), 1,
      anon_sym_COLON,
  [1909] = 2,
    ACTIONS(321), 1,
      sym_comment,
    ACTIONS(355), 1,
      aux_sym_string_literal_token1,
  [1916] = 2,
    ACTIONS(321), 1,
      sym_comment,
    ACTIONS(357), 1,
      aux_sym_string_literal_token2,
};

static const uint32_t ts_small_parse_table_map[] = {
  [SMALL_STATE(2)] = 0,
  [SMALL_STATE(3)] = 50,
  [SMALL_STATE(4)] = 100,
  [SMALL_STATE(5)] = 150,
  [SMALL_STATE(6)] = 200,
  [SMALL_STATE(7)] = 250,
  [SMALL_STATE(8)] = 278,
  [SMALL_STATE(9)] = 302,
  [SMALL_STATE(10)] = 325,
  [SMALL_STATE(11)] = 352,
  [SMALL_STATE(12)] = 379,
  [SMALL_STATE(13)] = 404,
  [SMALL_STATE(14)] = 426,
  [SMALL_STATE(15)] = 452,
  [SMALL_STATE(16)] = 478,
  [SMALL_STATE(17)] = 500,
  [SMALL_STATE(18)] = 522,
  [SMALL_STATE(19)] = 544,
  [SMALL_STATE(20)] = 566,
  [SMALL_STATE(21)] = 592,
  [SMALL_STATE(22)] = 615,
  [SMALL_STATE(23)] = 638,
  [SMALL_STATE(24)] = 659,
  [SMALL_STATE(25)] = 680,
  [SMALL_STATE(26)] = 701,
  [SMALL_STATE(27)] = 721,
  [SMALL_STATE(28)] = 757,
  [SMALL_STATE(29)] = 777,
  [SMALL_STATE(30)] = 797,
  [SMALL_STATE(31)] = 817,
  [SMALL_STATE(32)] = 837,
  [SMALL_STATE(33)] = 873,
  [SMALL_STATE(34)] = 893,
  [SMALL_STATE(35)] = 929,
  [SMALL_STATE(36)] = 949,
  [SMALL_STATE(37)] = 969,
  [SMALL_STATE(38)] = 1005,
  [SMALL_STATE(39)] = 1041,
  [SMALL_STATE(40)] = 1061,
  [SMALL_STATE(41)] = 1081,
  [SMALL_STATE(42)] = 1101,
  [SMALL_STATE(43)] = 1137,
  [SMALL_STATE(44)] = 1157,
  [SMALL_STATE(45)] = 1177,
  [SMALL_STATE(46)] = 1213,
  [SMALL_STATE(47)] = 1228,
  [SMALL_STATE(48)] = 1249,
  [SMALL_STATE(49)] = 1270,
  [SMALL_STATE(50)] = 1288,
  [SMALL_STATE(51)] = 1306,
  [SMALL_STATE(52)] = 1324,
  [SMALL_STATE(53)] = 1342,
  [SMALL_STATE(54)] = 1360,
  [SMALL_STATE(55)] = 1378,
  [SMALL_STATE(56)] = 1393,
  [SMALL_STATE(57)] = 1404,
  [SMALL_STATE(58)] = 1421,
  [SMALL_STATE(59)] = 1435,
  [SMALL_STATE(60)] = 1449,
  [SMALL_STATE(61)] = 1463,
  [SMALL_STATE(62)] = 1475,
  [SMALL_STATE(63)] = 1491,
  [SMALL_STATE(64)] = 1500,
  [SMALL_STATE(65)] = 1513,
  [SMALL_STATE(66)] = 1524,
  [SMALL_STATE(67)] = 1535,
  [SMALL_STATE(68)] = 1548,
  [SMALL_STATE(69)] = 1559,
  [SMALL_STATE(70)] = 1572,
  [SMALL_STATE(71)] = 1585,
  [SMALL_STATE(72)] = 1598,
  [SMALL_STATE(73)] = 1607,
  [SMALL_STATE(74)] = 1616,
  [SMALL_STATE(75)] = 1626,
  [SMALL_STATE(76)] = 1636,
  [SMALL_STATE(77)] = 1646,
  [SMALL_STATE(78)] = 1656,
  [SMALL_STATE(79)] = 1664,
  [SMALL_STATE(80)] = 1674,
  [SMALL_STATE(81)] = 1684,
  [SMALL_STATE(82)] = 1692,
  [SMALL_STATE(83)] = 1699,
  [SMALL_STATE(84)] = 1706,
  [SMALL_STATE(85)] = 1713,
  [SMALL_STATE(86)] = 1720,
  [SMALL_STATE(87)] = 1727,
  [SMALL_STATE(88)] = 1734,
  [SMALL_STATE(89)] = 1741,
  [SMALL_STATE(90)] = 1748,
  [SMALL_STATE(91)] = 1755,
  [SMALL_STATE(92)] = 1762,
  [SMALL_STATE(93)] = 1769,
  [SMALL_STATE(94)] = 1776,
  [SMALL_STATE(95)] = 1783,
  [SMALL_STATE(96)] = 1790,
  [SMALL_STATE(97)] = 1797,
  [SMALL_STATE(98)] = 1804,
  [SMALL_STATE(99)] = 1811,
  [SMALL_STATE(100)] = 1818,
  [SMALL_STATE(101)] = 1825,
  [SMALL_STATE(102)] = 1832,
  [SMALL_STATE(103)] = 1839,
  [SMALL_STATE(104)] = 1846,
  [SMALL_STATE(105)] = 1853,
  [SMALL_STATE(106)] = 1860,
  [SMALL_STATE(107)] = 1867,
  [SMALL_STATE(108)] = 1874,
  [SMALL_STATE(109)] = 1881,
  [SMALL_STATE(110)] = 1888,
  [SMALL_STATE(111)] = 1895,
  [SMALL_STATE(112)] = 1902,
  [SMALL_STATE(113)] = 1909,
  [SMALL_STATE(114)] = 1916,
};

static const TSParseActionEntry ts_parse_actions[] = {
  [0] = {.entry = {.count = 0, .reusable = false}},
  [1] = {.entry = {.count = 1, .reusable = false}}, RECOVER(),
  [3] = {.entry = {.count = 1, .reusable = true}}, SHIFT_EXTRA(),
  [5] = {.entry = {.count = 1, .reusable = true}}, SHIFT(103),
  [7] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_view_operation, 4, 0, 1),
  [9] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_view_operation, 4, 0, 1),
  [11] = {.entry = {.count = 1, .reusable = false}}, SHIFT(108),
  [13] = {.entry = {.count = 1, .reusable = false}}, SHIFT(111),
  [15] = {.entry = {.count = 1, .reusable = false}}, SHIFT(112),
  [17] = {.entry = {.count = 1, .reusable = false}}, SHIFT(88),
  [19] = {.entry = {.count = 1, .reusable = false}}, SHIFT(83),
  [21] = {.entry = {.count = 1, .reusable = false}}, SHIFT(85),
  [23] = {.entry = {.count = 1, .reusable = false}}, SHIFT(86),
  [25] = {.entry = {.count = 1, .reusable = false}}, SHIFT(99),
  [27] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_fetch_operation, 3, 0, 1),
  [29] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_fetch_operation, 3, 0, 1),
  [31] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_view_operation, 3, 0, 1),
  [33] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_view_operation, 3, 0, 1),
  [35] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_fetch_operation, 4, 0, 1),
  [37] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_fetch_operation, 4, 0, 1),
  [39] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym_fetch_operation_repeat1, 2, 0, 0),
  [41] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym_fetch_operation_repeat1, 2, 0, 0),
  [43] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_fetch_operation_repeat1, 2, 0, 0), SHIFT_REPEAT(108),
  [46] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_fetch_operation_repeat1, 2, 0, 0), SHIFT_REPEAT(111),
  [49] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_fetch_operation_repeat1, 2, 0, 0), SHIFT_REPEAT(112),
  [52] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_fetch_operation_repeat1, 2, 0, 0), SHIFT_REPEAT(88),
  [55] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_fetch_operation_repeat1, 2, 0, 0), SHIFT_REPEAT(83),
  [58] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_fetch_operation_repeat1, 2, 0, 0), SHIFT_REPEAT(85),
  [61] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_fetch_operation_repeat1, 2, 0, 0), SHIFT_REPEAT(86),
  [64] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_fetch_operation_repeat1, 2, 0, 0), SHIFT_REPEAT(99),
  [67] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_order_item, 1, 0, 0),
  [69] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_order_item, 1, 0, 0),
  [71] = {.entry = {.count = 1, .reusable = false}}, SHIFT(25),
  [73] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_string_literal, 3, 0, 0),
  [75] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_string_literal, 3, 0, 0),
  [77] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_expression, 1, 0, 0),
  [79] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_expression, 1, 0, 0),
  [81] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_logical_operation, 2, 0, 3),
  [83] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_logical_operation, 2, 0, 3),
  [85] = {.entry = {.count = 1, .reusable = false}}, SHIFT(46),
  [87] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_where_clause, 3, 0, 0),
  [89] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_where_clause, 3, 0, 0),
  [91] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_logical_operation, 3, 0, 4),
  [93] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_logical_operation, 3, 0, 4),
  [95] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_condition, 1, 0, 0),
  [97] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_condition, 1, 0, 0),
  [99] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_order_list, 1, 0, 0),
  [101] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_order_list, 1, 0, 0),
  [103] = {.entry = {.count = 1, .reusable = true}}, SHIFT(74),
  [105] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_order_list, 2, 0, 0),
  [107] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_order_list, 2, 0, 0),
  [109] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_comparison, 3, 0, 4),
  [111] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_comparison, 3, 0, 4),
  [113] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_condition, 3, 0, 0),
  [115] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_condition, 3, 0, 0),
  [117] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym_order_list_repeat1, 2, 0, 0),
  [119] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym_order_list_repeat1, 2, 0, 0),
  [121] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_order_list_repeat1, 2, 0, 0), SHIFT_REPEAT(74),
  [124] = {.entry = {.count = 1, .reusable = true}}, SHIFT(56),
  [126] = {.entry = {.count = 1, .reusable = false}}, SHIFT(56),
  [128] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_order_item, 2, 0, 0),
  [130] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_order_item, 2, 0, 0),
  [132] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_order_direction, 1, 0, 0),
  [134] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_order_direction, 1, 0, 0),
  [136] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_parameter_list, 3, 0, 0),
  [138] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_parameter_list, 3, 0, 0),
  [140] = {.entry = {.count = 1, .reusable = false}}, SHIFT(9),
  [142] = {.entry = {.count = 1, .reusable = true}}, SHIFT(27),
  [144] = {.entry = {.count = 1, .reusable = true}}, SHIFT(94),
  [146] = {.entry = {.count = 1, .reusable = true}}, SHIFT(98),
  [148] = {.entry = {.count = 1, .reusable = false}}, SHIFT(42),
  [150] = {.entry = {.count = 1, .reusable = true}}, SHIFT(9),
  [152] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_input_clause, 3, 0, 0),
  [154] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_input_clause, 3, 0, 0),
  [156] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_order_by_clause, 3, 0, 0),
  [158] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_order_by_clause, 3, 0, 0),
  [160] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_service_entity, 3, 0, 2),
  [162] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_service_entity, 3, 0, 2),
  [164] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_data_source, 3, 0, 0),
  [166] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_data_source, 3, 0, 0),
  [168] = {.entry = {.count = 1, .reusable = true}}, SHIFT(37),
  [170] = {.entry = {.count = 1, .reusable = false}}, SHIFT(38),
  [172] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_parameter_list, 2, 0, 0),
  [174] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_parameter_list, 2, 0, 0),
  [176] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_limit_clause, 2, 0, 0),
  [178] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_limit_clause, 2, 0, 0),
  [180] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_as_clause, 3, 0, 0),
  [182] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_as_clause, 3, 0, 0),
  [184] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_operation_clause, 1, 0, 0),
  [186] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_operation_clause, 1, 0, 0),
  [188] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_using_clause, 3, 0, 0),
  [190] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_using_clause, 3, 0, 0),
  [192] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_boolean, 1, 0, 0),
  [194] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_boolean, 1, 0, 0),
  [196] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_merge_clause, 3, 0, 0),
  [198] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_merge_clause, 3, 0, 0),
  [200] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_dynamic_clause, 3, 0, 0),
  [202] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_dynamic_clause, 3, 0, 0),
  [204] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_logical_operator, 1, 0, 0),
  [206] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_logical_operator, 1, 0, 0),
  [208] = {.entry = {.count = 1, .reusable = true}}, SHIFT(16),
  [210] = {.entry = {.count = 1, .reusable = true}}, SHIFT(113),
  [212] = {.entry = {.count = 1, .reusable = true}}, SHIFT(114),
  [214] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym_fetch_block_repeat1, 2, 0, 0),
  [216] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_fetch_block_repeat1, 2, 0, 0), SHIFT_REPEAT(95),
  [219] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym_fetch_block_repeat1, 2, 0, 0),
  [221] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym_task_definition_repeat1, 2, 0, 0),
  [223] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_task_definition_repeat1, 2, 0, 0), SHIFT_REPEAT(105),
  [226] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_task_definition_repeat1, 2, 0, 0), SHIFT_REPEAT(106),
  [229] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym_view_block_repeat1, 2, 0, 0),
  [231] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_view_block_repeat1, 2, 0, 0), SHIFT_REPEAT(82),
  [234] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym_view_block_repeat1, 2, 0, 0),
  [236] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_fetch_block, 3, 0, 0),
  [238] = {.entry = {.count = 1, .reusable = false}}, SHIFT(95),
  [240] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_fetch_block, 3, 0, 0),
  [242] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_task_definition, 6, 0, 0),
  [244] = {.entry = {.count = 1, .reusable = true}}, SHIFT(105),
  [246] = {.entry = {.count = 1, .reusable = true}}, SHIFT(106),
  [248] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_view_block, 3, 0, 0),
  [250] = {.entry = {.count = 1, .reusable = false}}, SHIFT(82),
  [252] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_view_block, 3, 0, 0),
  [254] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_comparison_operator, 1, 0, 0),
  [256] = {.entry = {.count = 1, .reusable = true}}, SHIFT(78),
  [258] = {.entry = {.count = 1, .reusable = true}}, SHIFT(46),
  [260] = {.entry = {.count = 1, .reusable = true}}, SHIFT(18),
  [262] = {.entry = {.count = 1, .reusable = true}}, SHIFT(72),
  [264] = {.entry = {.count = 1, .reusable = true}}, SHIFT(96),
  [266] = {.entry = {.count = 1, .reusable = true}}, SHIFT(33),
  [268] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_parameter_items, 1, 0, 0),
  [270] = {.entry = {.count = 1, .reusable = true}}, SHIFT(77),
  [272] = {.entry = {.count = 1, .reusable = true}}, SHIFT(95),
  [274] = {.entry = {.count = 1, .reusable = true}}, SHIFT(82),
  [276] = {.entry = {.count = 1, .reusable = true}}, SHIFT(7),
  [278] = {.entry = {.count = 1, .reusable = true}}, SHIFT(41),
  [280] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym_parameter_items_repeat1, 2, 0, 0),
  [282] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_parameter_items_repeat1, 2, 0, 0), SHIFT_REPEAT(77),
  [285] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_parameter_items, 2, 0, 0),
  [287] = {.entry = {.count = 1, .reusable = true}}, SHIFT(62),
  [289] = {.entry = {.count = 1, .reusable = true}}, SHIFT(91),
  [291] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_parameter, 3, 0, 5),
  [293] = {.entry = {.count = 1, .reusable = true}}, SHIFT(104),
  [295] = {.entry = {.count = 1, .reusable = true}}, SHIFT(80),
  [297] = {.entry = {.count = 1, .reusable = true}}, SHIFT(69),
  [299] = {.entry = {.count = 1, .reusable = true}}, SHIFT(8),
  [301] = {.entry = {.count = 1, .reusable = true}}, SHIFT(75),
  [303] = {.entry = {.count = 1, .reusable = true}}, SHIFT(67),
  [305] = {.entry = {.count = 1, .reusable = true}}, SHIFT(90),
  [307] = {.entry = {.count = 1, .reusable = true}}, SHIFT(68),
  [309] = {.entry = {.count = 1, .reusable = true}}, SHIFT(30),
  [311] = {.entry = {.count = 1, .reusable = true}}, SHIFT(100),
  [313] = {.entry = {.count = 1, .reusable = true}}, SHIFT(89),
  [315] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_source_file, 1, 0, 0),
  [317] = {.entry = {.count = 1, .reusable = true}}, SHIFT(36),
  [319] = {.entry = {.count = 1, .reusable = false}}, SHIFT(107),
  [321] = {.entry = {.count = 1, .reusable = false}}, SHIFT_EXTRA(),
  [323] = {.entry = {.count = 1, .reusable = true}}, SHIFT(79),
  [325] = {.entry = {.count = 1, .reusable = true}}, SHIFT(57),
  [327] = {.entry = {.count = 1, .reusable = true}}, SHIFT(26),
  [329] = {.entry = {.count = 1, .reusable = false}}, SHIFT(84),
  [331] = {.entry = {.count = 1, .reusable = true}}, SHIFT(35),
  [333] = {.entry = {.count = 1, .reusable = true}}, SHIFT(55),
  [335] = {.entry = {.count = 1, .reusable = true}}, SHIFT(40),
  [337] = {.entry = {.count = 1, .reusable = true}},  ACCEPT_INPUT(),
  [339] = {.entry = {.count = 1, .reusable = true}}, SHIFT(87),
  [341] = {.entry = {.count = 1, .reusable = true}}, SHIFT(76),
  [343] = {.entry = {.count = 1, .reusable = true}}, SHIFT(65),
  [345] = {.entry = {.count = 1, .reusable = true}}, SHIFT(66),
  [347] = {.entry = {.count = 1, .reusable = true}}, SHIFT(93),
  [349] = {.entry = {.count = 1, .reusable = true}}, SHIFT(19),
  [351] = {.entry = {.count = 1, .reusable = true}}, SHIFT(34),
  [353] = {.entry = {.count = 1, .reusable = true}}, SHIFT(101),
  [355] = {.entry = {.count = 1, .reusable = false}}, SHIFT(109),
  [357] = {.entry = {.count = 1, .reusable = false}}, SHIFT(110),
};

#ifdef __cplusplus
extern "C" {
#endif
#ifdef TREE_SITTER_HIDE_SYMBOLS
#define TS_PUBLIC
#elif defined(_WIN32)
#define TS_PUBLIC __declspec(dllexport)
#else
#define TS_PUBLIC __attribute__((visibility("default")))
#endif

TS_PUBLIC const TSLanguage *tree_sitter_nstl(void) {
  static const TSLanguage language = {
    .version = LANGUAGE_VERSION,
    .symbol_count = SYMBOL_COUNT,
    .alias_count = ALIAS_COUNT,
    .token_count = TOKEN_COUNT,
    .external_token_count = EXTERNAL_TOKEN_COUNT,
    .state_count = STATE_COUNT,
    .large_state_count = LARGE_STATE_COUNT,
    .production_id_count = PRODUCTION_ID_COUNT,
    .field_count = FIELD_COUNT,
    .max_alias_sequence_length = MAX_ALIAS_SEQUENCE_LENGTH,
    .parse_table = &ts_parse_table[0][0],
    .small_parse_table = ts_small_parse_table,
    .small_parse_table_map = ts_small_parse_table_map,
    .parse_actions = ts_parse_actions,
    .symbol_names = ts_symbol_names,
    .field_names = ts_field_names,
    .field_map_slices = ts_field_map_slices,
    .field_map_entries = ts_field_map_entries,
    .symbol_metadata = ts_symbol_metadata,
    .public_symbol_map = ts_symbol_map,
    .alias_map = ts_non_terminal_alias_map,
    .alias_sequences = &ts_alias_sequences[0][0],
    .lex_modes = ts_lex_modes,
    .lex_fn = ts_lex,
    .keyword_lex_fn = ts_lex_keywords,
    .keyword_capture_token = sym_identifier,
    .primary_state_ids = ts_primary_state_ids,
  };
  return &language;
}
#ifdef __cplusplus
}
#endif
