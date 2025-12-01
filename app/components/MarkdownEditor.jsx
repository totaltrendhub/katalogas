// app/components/MarkdownEditor.jsx

"use client";

import { useState, useEffect } from "react";
import { Editor } from "@tinymce/tinymce-react";

export default function MarkdownEditor({
  name,
  defaultValue = "",
  label = "Straipsnio turinys",
}) {
  const [value, setValue] = useState(defaultValue || "");
  const [mounted, setMounted] = useState(false);

  // kad redaguojant iš DB atėjęs turinys atsirastų editoriuje
  useEffect(() => {
    setValue(defaultValue || "");
  }, [defaultValue]);

  // apsauga – editorių rodome tik naršyklėje
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-800 mb-1">
          {label}
        </label>
      )}

      {/* ČIA yra realus formos fieldas, kurį paims server action */}
      <input type="hidden" name={name} value={value} />

      <div className="border border-gray-300 rounded-2xl overflow-hidden bg-white">
        {mounted ? (
          <Editor
            apiKey="px3mv4zxifjukx3bm8cwn4y5d8dw7lyqp5jvvy8uj1wyq0ba" // tavo TinyMCE API key
            value={value}
            onEditorChange={(content) => setValue(content || "")}
            init={{
              height: 500,
              menubar: "edit view insert format table tools",
              plugins: [
                "advlist",
                "autolink",
                "lists",
                "link",
                "charmap",
                "preview",
                "anchor",
                "searchreplace",
                "visualblocks",
                "code",
                "fullscreen",
                "insertdatetime",
                "table",
                "wordcount",
                "codesample",
              ],
              toolbar:
                "undo redo | blocks | " +
                "bold italic underline strikethrough | " +
                "alignleft aligncenter alignright alignjustify | " +
                "bullist numlist outdent indent | " +
                "link | table | removeformat | code",
              branding: false,
              statusbar: true,
              convert_urls: false,
              content_style: `
                body {
                  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
                  font-size: 14px;
                  line-height: 1.7;
                  color: #111827;
                  padding: 12px;
                }
                h1,h2,h3,h4,h5,h6 {
                  font-weight: 700;
                  margin-top: 1.5rem;
                  margin-bottom: 0.75rem;
                }
                h1 { font-size: 1.6rem; }
                h2 { font-size: 1.4rem; }
                h3 { font-size: 1.2rem; }
                p { margin: 0 0 0.75rem; }
                ul,ol { margin: 0.75rem 0 0.75rem 1.5rem; }
                table {
                  width: 100%;
                  border-collapse: collapse;
                  margin: 1rem 0;
                  font-size: 0.9rem;
                }
                th,td {
                  border: 1px solid #e5e7eb;
                  padding: 0.4rem 0.6rem;
                }
                th {
                  background-color: #f9fafb;
                  font-weight: 600;
                }
                a { color: #1d4ed8; text-decoration: underline; }
                a:hover { color: #1e40af; }
                img {
                  max-width: 100%;
                  height: auto;
                  border-radius: 0.5rem;
                  margin: 1rem 0;
                }
              `,
            }}
          />
        ) : (
          <div className="p-4 text-xs text-gray-400">Kraunamas editorius…</div>
        )}
      </div>

      <p className="text-[11px] text-gray-500">
        Turinys saugomas kaip HTML (`body_html`). Gali rašyti, formatuoti,
        dėti lenteles ir t. t. – taip pat bus rodoma straipsnio puslapyje.
      </p>
    </div>
  );
}
