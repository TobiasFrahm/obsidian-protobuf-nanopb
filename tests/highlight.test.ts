import assert from "node:assert/strict";
import test from "node:test";
import { highlight } from "../src/highlight";
import { findBlocks } from "../src/blocks";

function tokens(source: string, language = "proto") {
  return highlight(source, language).map(span => ({ type: span.type, text: source.slice(span.from, span.to) }));
}

test("protobuf and nanopb options receive distinct tokens", () => {
  const result = tokens('optional string name = 1 [(nanopb).max_length = 40];');
  for (const token of [
    { type: "keyword", text: "optional" },
    { type: "builtin", text: "string" },
    { type: "nanopb-extension", text: "(nanopb)" },
    { type: "nanopb-option", text: "max_length" },
    { type: "number", text: "40" }
  ]) assert.ok(result.some(value => value.type === token.type && value.text === token.text), JSON.stringify(token));
});

test("strings and comments protect embedded syntax and HTML", () => {
  assert.deepEqual(tokens('"https://example.org/<script>" /* string = 4 */'), [
    { type: "string", text: '"https://example.org/<script>"' },
    { type: "comment", text: '/* string = 4 */' }
  ]);
  assert.equal(tokens('/* unfinished\n string name = 1;')[0].type, "comment");
});

test("options files support wildcards, comments and enum values", () => {
  const result = tokens('Telemetry.* max_count:8 type:FT_STATIC # comment', "nanopb-options");
  assert.ok(result.some(t => t.type === "nanopb-option" && t.text === "max_count"));
  assert.ok(result.some(t => t.type === "constant" && t.text === "FT_STATIC"));
  assert.ok(result.some(t => t.type === "comment" && t.text === "# comment"));
  assert.ok(result.some(t => t.type === "field-pattern" && t.text === "Telemetry.*"));
});

test("declared message names are highlighted", () => {
  assert.ok(tokens("message Telemetry {}").some(t => t.type === "class-name" && t.text === "Telemetry"));
});

test("spans preserve source positions including unicode and multiline comments", () => {
  const source = '// ü🙂\nmessage Foo {\n /* test\n comment */ string x = 0x10;\n}';
  const spans = highlight(source, "protobuf");
  let end = 0;
  for (const span of spans) {
    assert.ok(span.from >= end && span.to <= source.length && span.to > span.from);
    end = span.to;
  }
  assert.ok(spans.some(s => s.type === "comment" && source.slice(s.from, s.to).includes("comment")));
});

test("Markdown parser accepts aliases, tilde and longer fences and ignores other languages", () => {
  const source = '````proto\nmessage A {}\n````\n\n~~~nanopb-options\nA.* max_count:4\n~~~\n\n```js\nmessage B {}\n```\n\n```protobuf\nsyntax = "proto3";\n```';
  const blocks = findBlocks(source);
  assert.deepEqual(blocks.map(b => b.language), ["proto", "nanopb-options", "protobuf"]);
  assert.equal(source.slice(blocks[0].from, blocks[0].to), "message A {}");
});

test("empty blocks and nested fences are handled without leaking into Markdown", () => {
  assert.deepEqual(findBlocks('```proto\n```'), []);
  const source = '> ```nanopb\n> message A {}\n> ```\n\nText';
  const blocks = findBlocks(source);
  assert.equal(blocks.length, 1);
  assert.equal(source.slice(blocks[0].from, blocks[0].to), "message A {}");
  assert.equal(findBlocks('````text\n```proto\nmessage A {}\n```\n````').length, 0);
});
