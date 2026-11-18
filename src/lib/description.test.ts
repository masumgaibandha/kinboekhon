import assert from "node:assert/strict";
import { test } from "node:test";

import { parseDescription, splitBold } from "@/lib/description";

test("headings, bullets and paragraphs", () => {
  const text = "## শিরোনাম\r\nপ্রথম লাইন।\n\n- এক\n-  দুই \n\nশেষ লাইন।";
  assert.deepEqual(parseDescription(text), [
    { kind: "heading", text: "শিরোনাম" },
    { kind: "paragraph", text: "প্রথম লাইন।" },
    { kind: "list", items: ["এক", "দুই"] },
    { kind: "paragraph", text: "শেষ লাইন।" },
  ]);
});

test("each plain line is its own paragraph", () => {
  assert.deepEqual(parseDescription("এক\nদুই"), [
    { kind: "paragraph", text: "এক" },
    { kind: "paragraph", text: "দুই" },
  ]);
});

test("a heading between bullets starts a new list", () => {
  assert.deepEqual(parseDescription("- a\n## h\n- b"), [
    { kind: "list", items: ["a"] },
    { kind: "heading", text: "h" },
    { kind: "list", items: ["b"] },
  ]);
});

test("empty text gives no blocks, and a bare dash or hashes stay paragraphs", () => {
  assert.deepEqual(parseDescription("  \n\n"), []);
  assert.deepEqual(parseDescription("-5 টাকা\n##নাম"), [
    { kind: "paragraph", text: "-5 টাকা" },
    { kind: "paragraph", text: "##নাম" },
  ]);
});

test("inline **text** is bold", () => {
  assert.deepEqual(splitBold("**মনোযোগ:** শিশু শেখে, **আর** খেলে"), [
    { text: "মনোযোগ:", bold: true },
    { text: " শিশু শেখে, ", bold: false },
    { text: "আর", bold: true },
    { text: " খেলে", bold: false },
  ]);
});

test("text without a closed pair stays plain", () => {
  assert.deepEqual(splitBold("৩ ** ৪"), [{ text: "৩ ** ৪", bold: false }]);
  assert.deepEqual(splitBold("****"), [{ text: "****", bold: false }]);
});
