import React, { memo, useEffect, useRef } from "react";
import EditorJS from "@editorjs/editorjs";
import Paragraph from "@editorjs/paragraph";
import ExecutionStep from "./ExecutionStep";
// import { EDITOR_JS_TOOLS } from "./tools";

const Editor = ({ data, onChange, editorblock }) => {
  const ref = useRef();
  //Initialize editorjs
  useEffect(() => {
    //Initialize editorjs if we don't have a reference
    if (!ref.current) {
      const editor = new EditorJS({
        holder: editorblock,

        tools: {
          paragraph: {
            class: Paragraph,
            inlineToolbar: true,
          },
          image: ExecutionStep,
        },
        data: data,
        async onChange(api, event) {
          const data = await api.saver.save();
          onChange(data);
        },
      });
      ref.current = editor;
      console.log("EditorJS initialized");
    }

    //Add a return function to handle cleanup
    return () => {
      if (ref.current && ref.current.destroy) {
        ref.current.destroy();
      }
    };
  }, []);
  return <div id={editorblock} />;
};

export default memo(Editor);
