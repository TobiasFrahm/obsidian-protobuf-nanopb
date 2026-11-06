import Prism from "prismjs";

export const languages = ["proto", "protobuf", "nanopb", "nanopb-options"] as const;

export function isSupported(language: string): boolean {
  return (languages as readonly string[]).includes(language);
}

const comments = [
    { pattern: /\/\*[\s\S]*?(?:\*\/|$)/, greedy: true },
    { pattern: /\/\/[^\r\n]*/, greedy: true }
];

const common: Prism.Grammar = {
  comment: comments,
  string: { pattern: /"(?:\\.|[^"\\\r\n])*"|'(?:\\.|[^'\\\r\n])*'/, greedy: true },
  "nanopb-extension": { pattern: /\(\s*\.?nanopb(?:_fileopt|_msgopt|_enumopt)?\s*\)/, alias: "annotation" },
  "nanopb-option": {
    pattern: /\b(?:max_size|max_length|max_count|int_size|enum_intsize|type|long_names|packed_struct|packed_enum|skip_message|no_unions|msgid|anonymous_oneof|proto3|proto3_singular_msgs|enum_to_string|fixed_length|fixed_count|submsg_callback|callback_datatype|callback_function|descriptorsize|default_has|include|exclude|package|type_override|label_override|sort_by_tag|fallback_type|discard_unused_automatic_types|mangle_names)\b(?=\s*[:=])/,
    alias: "property"
  },
  "class-name": { pattern: /(\b(?:message|enum|service|extend)\s+)[A-Za-z_]\w*/, lookbehind: true },
  keyword: /\b(?:syntax|edition|import|weak|public|package|option|message|enum|service|rpc|returns|stream|extend|extensions|to|max|reserved|oneof|optional|required|repeated|group)\b/,
  builtin: /\b(?:double|float|int32|int64|uint32|uint64|sint32|sint64|fixed32|fixed64|sfixed32|sfixed64|bool|string|bytes|map)\b/,
  boolean: /\b(?:true|false)\b/,
  number: /\b(?:0x[\da-f]+|(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)\b|\b(?:inf|nan)\b/i,
  constant: /\b[A-Z][A-Z_\d]*\b/,
  operator: /[=:+-]/,
  punctuation: /[{}[\];(),.<>]/
};

const options: Prism.Grammar = {
  comment: [],
  string: common.string,
  "field-pattern": { pattern: /^[\t ]*[\w.*?]+(?=\s)/m, alias: "selector" },
  ...Object.fromEntries(Object.entries(common).filter(([key]) => key !== "comment" && key !== "string"))
};
options.comment = [{ pattern: /#[^\r\n]*/, greedy: true }, ...comments];

export interface HighlightSpan {
  from: number;
  to: number;
  type: string;
}

export function highlight(source: string, language: string): HighlightSpan[] {
  const tokens = Prism.tokenize(source, language === "nanopb-options" ? options : common);
  const spans: HighlightSpan[] = [];
  let offset = 0;
  for (const token of tokens) {
    if (typeof token === "string") {
      offset += token.length;
    } else {
      spans.push({ from: offset, to: offset + token.length, type: token.type });
      offset += token.length;
    }
  }
  return spans;
}
