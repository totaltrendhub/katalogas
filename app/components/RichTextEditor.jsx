// app/components/RichTextEditor.jsx
"use client";

import { useState, useEffect } from "react";
import { Editor } from "@tinymce/tinymce-react";

// TinyMCE – bundler režimas (be Cloud API, viskas iš npm)
import "tinymce/tinymce";
import "tinymce/icons/default";
import "tinymce/themes/silver";
import "tinymce/models/dom";

// Pluginai (tik nemokami)
import "tinymce/plugins/advlist";
import "tinymce/plugins/autolink";
import "tinymce/plugins/lists";
import "tinymce/plugins/link";
import "tinymce/plugins/image";
import "tinymce/plugins/charmap";
import "tinymce/plugins/preview";
import "tinymce/plugins/anchor";
import "tinymce/plugins/searchreplace";
import "tinymce/plugins/code";
import "tinymce/plugins/fullscreen";
import "tinymce/plugins/insertdatetime";
import "tinymce/plugins/media";
import "tinymce/plugins/table";
import "tinymce/plugins/wordcount";

// UI skin (oxide)
import "tinymce/skins/ui/oxide/skin.min.css";

export default function RichTextEditor({
  name = "body",
  initialValue = "",
  label = "Straipsnio turinys",
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

      <Editor
        value={value}
        onEditorChange={(content) => setValue(content || "")}
        init={{
          height: 500,
          menubar: false,
          branding: false,
          statusbar: false,
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
            "code",
            "fullscreen",
            "insertdatetime",
            "media",
            "table",
            "wordcount",
          ],
          toolbar:
            "undo redo | blocks | bold italic underline strikethrough | " +
            "alignleft aligncenter alignright alignjustify | " +
            "bullist numlist outdent indent | " +
            "link image media table | removeformat | code fullscreen",
          block_formats:
            "Pastraipa=p; Antraštė 2=h2; Antraštė 3=h3; Antraštė 4=h4",
          content_style: `
            body { 
              font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; 
              font-size: 14px; 
              line-height: 1.7; 
            }
            img { max-width: 100%; height: auto; border-radius: 8px; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #e5e7eb; padding: 4px 6px; }
          `,
        }}
      />

      {/* ČIA – kas realiai keliauja į server action kaip form field */}
      <input type="hidden" name={name} value={value} />
    </div>
  );
}
