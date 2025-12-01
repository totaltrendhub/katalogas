// app/components/TinyMceEditor.jsx
"use client";

import { useState, useEffect } from "react";
import { Editor } from "@tinymce/tinymce-react";

export default function TinyMceEditor({
  name = "body",
  initialValue = "",
  label = "Straipsnio turinys",
  height = 500,
}) {
  const [value, setValue] = useState(initialValue || "");

  useEffect(() => {
    setValue(initialValue || "");
  }, [initialValue]);

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-800">
          {label}
        </label>
      )}

      {/* Slapta textarea – kad formos submit metu backendas gautų `body` */}
      <textarea name={name} value={value} readOnly hidden />

      <Editor
        // ČIA tavo TinyMCE Cloud API key
        apiKey="px3mv4zxifjukx3bm8cwn4y5d8dw7lyqp5jvvy8uj1wyq0ba"
        value={value}
        onEditorChange={(content) => {
          setValue(content);
        }}
        init={{
          height,
          menubar: true,
          promotion: false, // paslepia "Upgrade" reklamėles
          branding: false,
          language: "lt",
          skin: "oxide",
          content_css: "default",

          // TIK NEMOKAMI PLUGINAI
          plugins: [
            "advlist",
            "autolink",
            "lists",
            "link",
            "image",
            "charmap",
            "preview",
            "anchor",
            "searchreplace",
            "visualblocks",
            "code",
            "fullscreen",
            "insertdatetime",
            "media",
            "table",
            "wordcount",
          ],

          // Paprastas nemokamas toolbar
          toolbar:
            "undo redo | blocks | " +
            "bold italic underline strikethrough | " +
            "alignleft aligncenter alignright alignjustify | " +
            "bullist numlist outdent indent | " +
            "link image media table | " +
            "removeformat | code preview fullscreen",

          block_formats:
            "Pastraipa=p; Antraštė 1=h1; Antraštė 2=h2; Antraštė 3=h3; Antraštė 4=h4",

          // Minimalus vidinis stilius redaktoriuje (tik kaip atrodo editoriuje)
          content_style: `
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
              font-size: 14px;
              line-height: 1.7;
            }
            h1, h2, h3, h4 {
              font-weight: 700;
              margin-top: 1.4rem;
              margin-bottom: 0.7rem;
            }
            h1 { font-size: 1.6rem; }
            h2 { font-size: 1.4rem; }
            h3 { font-size: 1.2rem; }
            h4 { font-size: 1.05rem; }
            p { margin: 0 0 0.7rem; }
            ul, ol { margin-left: 1.4rem; }
            img {
              max-width: 100%;
              height: auto;
              border-radius: 0.5rem;
              margin: 1rem 0;
            }
          `,
        }}
      />

      <p className="text-[11px] text-gray-500">
        Tai yra WYSIWYG redaktorius. Kaip matai čia, taip (su
        <code> .article-body </code> CSS) bus rodomas straipsnis viešame
        puslapyje.
      </p>
    </div>
  );
}
