// app/components/MarkdownEditor.jsx

"use client";

import { useRef, useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

export default function MarkdownEditor({
  name,
  defaultValue = "",
  label = "Straipsnio turinys",
}) {
  const [value, setValue] = useState(defaultValue || "");
  const textareaRef = useRef(null);

  // jei redaguojant straipsnį ateina nauja defaultValue – atnaujinam editorių
  useEffect(() => {
    setValue(defaultValue || "");
  }, [defaultValue]);

  function apply(format) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const selected = value.slice(start, end);

    let replacement = selected;
    let before = "";
    let after = "";

    switch (format) {
      case "h1": {
        const lineStart = value.lastIndexOf("\n", start - 1) + 1;
        const lineEnd =
          value.indexOf("\n", end) === -1 ? value.length : value.indexOf("\n", end);
        const line = value.slice(lineStart, lineEnd).replace(/^#+\s*/, "");
        replacement = `# ${line || selected || "Antraštė"}`;
        setValue(
          value.slice(0, lineStart) + replacement + value.slice(lineEnd)
        );
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(
            lineStart + 2,
            lineStart + 2 + (line || selected || "Antraštė").length
          );
        }, 0);
        return;
      }
      case "h2": {
        const lineStart = value.lastIndexOf("\n", start - 1) + 1;
        const lineEnd =
          value.indexOf("\n", end) === -1 ? value.length : value.indexOf("\n", end);
        const line = value.slice(lineStart, lineEnd).replace(/^#+\s*/, "");
        replacement = `## ${line || selected || "Antraštė"}`;
        setValue(
          value.slice(0, lineStart) + replacement + value.slice(lineEnd)
        );
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(
            lineStart + 3,
            lineStart + 3 + (line || selected || "Antraštė").length
          );
        }, 0);
        return;
      }
      case "h3": {
        const lineStart = value.lastIndexOf("\n", start - 1) + 1;
        const lineEnd =
          value.indexOf("\n", end) === -1 ? value.length : value.indexOf("\n", end);
        const line = value.slice(lineStart, lineEnd).replace(/^#+\s*/, "");
        replacement = `### ${line || selected || "Antraštė"}`;
        setValue(
          value.slice(0, lineStart) + replacement + value.slice(lineEnd)
        );
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(
            lineStart + 4,
            lineStart + 4 + (line || selected || "Antraštė").length
          );
        }, 0);
        return;
      }

      case "bold":
        before = "**";
        after = "**";
        replacement = selected || "paryškintas tekstas";
        break;

      case "italic":
        before = "_";
        after = "_";
        replacement = selected || "pasviras tekstas";
        break;

      case "underline":
        // markdown neturi underline – naudosim paprastą HTML
        before = "<u>";
        after = "</u>";
        replacement = selected || "pabrauktas tekstas";
        break;

      case "strike":
        before = "~~";
        after = "~~";
        replacement = selected || "perbrauktas tekstas";
        break;

      case "inlineCode":
        before = "`";
        after = "`";
        replacement = selected || "kodo fragmentas";
        break;

      case "link": {
        const text = selected || "nuorodos tekstas";
        replacement = `[${text}](https://)`;
        before = "";
        after = "";
        break;
      }

      case "ul": {
        const block = selected || "Pirmas punktas\nAntras punktas";
        const lines = block.split("\n").map((l) => (l ? `- ${l}` : "- Punktas"));
        replacement = lines.join("\n");
        before = "";
        after = "";
        break;
      }

      case "ol": {
        const block = selected || "Pirmas punktas\nAntras punktas";
        const lines = block
          .split("\n")
          .map((l, i) => `${i + 1}. ${l || "Punktas"}`);
        replacement = lines.join("\n");
        before = "";
        after = "";
        break;
      }

      case "quote": {
        const block = selected || "Citatos tekstas";
        const lines = block.split("\n").map((l) => `> ${l || "Citata"}`);
        replacement = lines.join("\n");
        before = "";
        after = "";
        break;
      }

      case "codeBlock": {
        const block = selected || "console.log('Labas');";
        replacement = "```js\n" + block + "\n```";
        before = "";
        after = "";
        break;
      }

      case "hr": {
        replacement = "\n\n---\n\n";
        before = "";
        after = "";
        break;
      }

      default:
        return;
    }

    const newValue =
      value.slice(0, start) +
      before +
      replacement +
      after +
      value.slice(end);

    const caretPos = start + before.length + replacement.length;

    setValue(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(caretPos, caretPos);
    }, 0);
  }

  function handleChange(e) {
    setValue(e.target.value);
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-800 mb-1">
        {label}
      </label>

      {/* Įrankių juosta */}
      <div className="flex flex-wrap gap-2 text-xs mb-1">
        {/* Antraštės */}
        <div className="flex items-center gap-1 rounded-full bg-gray-50 px-2 py-1 border border-gray-200">
          <button
            type="button"
            onClick={() => apply("h1")}
            className="px-2 py-0.5 rounded-full hover:bg-gray-200"
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => apply("h2")}
            className="px-2 py-0.5 rounded-full hover:bg-gray-200"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => apply("h3")}
            className="px-2 py-0.5 rounded-full hover:bg-gray-200"
          >
            H3
          </button>
        </div>

        {/* Teksto stilius */}
        <div className="flex items-center gap-1 rounded-full bg-gray-50 px-2 py-1 border border-gray-200">
          <button
            type="button"
            onClick={() => apply("bold")}
            className="px-2 py-0.5 font-semibold hover:bg-gray-200"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => apply("italic")}
            className="px-2 py-0.5 italic hover:bg-gray-200"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => apply("underline")}
            className="px-2 py-0.5 underline hover:bg-gray-200"
          >
            U
          </button>
          <button
            type="button"
            onClick={() => apply("strike")}
            className="px-2 py-0.5 line-through hover:bg-gray-200"
          >
            S
          </button>
          <button
            type="button"
            onClick={() => apply("inlineCode")}
            className="px-2 py-0.5 font-mono text-[11px] hover:bg-gray-200"
          >
            {"</>"}
          </button>
        </div>

        {/* Sąrašai / citatos */}
        <div className="flex items-center gap-1 rounded-full bg-gray-50 px-2 py-1 border border-gray-200">
          <button
            type="button"
            onClick={() => apply("ul")}
            className="px-2 py-0.5 hover:bg-gray-200"
          >
            Bullets
          </button>
          <button
            type="button"
            onClick={() => apply("ol")}
            className="px-2 py-0.5 hover:bg-gray-200"
          >
            Numeruotas
          </button>
          <button
            type="button"
            onClick={() => apply("quote")}
            className="px-2 py-0.5 hover:bg-gray-200"
          >
            Citata
          </button>
        </div>

        {/* Nuorodos / blokai */}
        <div className="flex items-center gap-1 rounded-full bg-gray-50 px-2 py-1 border border-gray-200">
          <button
            type="button"
            onClick={() => apply("link")}
            className="px-2 py-0.5 hover:bg-gray-200"
          >
            Nuoroda
          </button>
          <button
            type="button"
            onClick={() => apply("codeBlock")}
            className="px-2 py-0.5 hover:bg-gray-200"
          >
            Code blokas
          </button>
          <button
            type="button"
            onClick={() => apply("hr")}
            className="px-2 py-0.5 hover:bg-gray-200"
          >
            Linija
          </button>
        </div>
      </div>

      {/* Editor + peržiūra */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <textarea
            ref={textareaRef}
            name={name}
            value={value}
            onChange={handleChange}
            rows={14}
            className="w-full rounded-2xl border border-gray-300 px-3 py-2 text-sm font-mono leading-relaxed outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400 resize-y"
            placeholder="Tekstas (paprastas, markdown arba HTML)."
          />
        </div>

        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-3 py-2 text-sm overflow-y-auto max-h-[360px]">
          <p className="text-[11px] font-semibold text-gray-500 mb-2">
            Peržiūra
          </p>
          {value.trim() ? (
            <div className="prose prose-sm max-w-none prose-headings:mt-4 prose-headings:mb-2 prose-p:my-1 prose-ul:my-1 prose-ol:my-1">
              <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                {value}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text-[11px] text-gray-400">
              Kol kas nėra turinio. Rašyk teksto lauke viršuje – čia matysi
              rezultatą.
            </p>
          )}
        </div>
      </div>

      <p className="text-[11px] text-gray-500">
        Gali naudoti tiek paprastą tekstą, tiek Markdown sintaksę (#, ##, **bold**,
        _italic_, sąrašus, nuorodas) ir paprastą HTML. Peržiūros skiltis rodo,
        kaip straipsnis atrodys galutiniame variante.
      </p>
    </div>
  );
}
