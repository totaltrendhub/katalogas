// app/components/RichTextEditor.jsx

"use client";

import { useRef, useEffect } from "react";
import dynamic from "next/dynamic";

// TinyMCE Editor – importuojam tik kliente (be SSR)
const TinyMCEEditor = dynamic(
  () => import("@tinymce/tinymce-react").then((m) => m.Editor),
  { ssr: false }
);

/**
 * WYSIWYG HTML editorius su TinyMCE.
 * Viskas, ką parašai, keliauja kaip HTML į <input name={name}> – t.y.
 * server action gauna body kaip HTML stringą.
 */
export default function RichTextEditor({
  name,
  defaultValue = "",
  height = 450,
}) {
  const hiddenRef = useRef(null);

  // užpildom hidden input pradiniu HTML
  useEffect(() => {
    if (hiddenRef.current) {
      hiddenRef.current.value = defaultValue || "";
    }
  }, [defaultValue]);

  function handleChange(content) {
    if (hiddenRef.current) {
      hiddenRef.current.value = content;
    }
  }

  return (
    <div className="space-y-2">
      {/* Čia keliauja HTML į server action */}
      <input
        type="hidden"
        name={name}
        ref={hiddenRef}
        defaultValue={defaultValue || ""}
      />

      <TinyMCEEditor
        apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
        initialValue={defaultValue || ""}
        onEditorChange={handleChange}
        init={{
          height,
          menubar: true,
          branding: false,
          statusbar: true,

          // pluginai – pagrindiniai + dalis iš tavo snippet'o
          plugins: [
            "anchor",
            "autolink",
            "charmap",
            "codesample",
            "emoticons",
            "link",
            "lists",
            "media",
            "searchreplace",
            "table",
            "visualblocks",
            "wordcount",
            "checklist",
            "casechange",
            "formatpainter",
            "pageembed",
            "a11ychecker",
            "tinymcespellchecker",
            "advtable",
            "advcode",
            "tableofcontents",
            "footnotes",
            "autocorrect",
            "typography",
            "markdown",
          ],

          // toolbar artimas tam, ką parodė snippet'e
          toolbar:
            "undo redo | blocks fontfamily fontsize | " +
            "bold italic underline strikethrough | forecolor backcolor | " +
            "alignleft aligncenter alignright alignjustify | " +
            "bullist numlist checklist outdent indent | " +
            "link media table | " +
            "emoticons charmap | " +
            "removeformat | code",

          tinycomments_mode: "embedded",
          tinycomments_author: "Autorius",

          content_style:
            "body { font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif; font-size:14px; }",
        }}
      />
    </div>
  );
}
