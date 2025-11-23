// app/components/RichTextEditor.jsx
"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

// react-quill veikia tik kliente, todėl imam dynamic import
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function RichTextEditor({ name, defaultValue = "" }) {
  const [value, setValue] = useState(defaultValue || "");

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ align: [] }],
      ["link", "blockquote", "code-block"],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "align",
    "link",
    "blockquote",
    "code-block",
  ];

  return (
    <div className="space-y-3">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={setValue}
        modules={modules}
        formats={formats}
      />

      {/* Čia pasleptas input, kad server action gautų HTML */}
      <input type="hidden" name={name} value={value} />

      <p className="text-[11px] text-gray-500">
        Čia gali keisti H1/H2/H3, storinti, įdėti nuorodas, sąrašus, citatas,
        kodą ir pan. HTML bus išsaugotas duomenų bazėje.
      </p>
    </div>
  );
}
