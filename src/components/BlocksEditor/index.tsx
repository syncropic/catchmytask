import { useEffect, useRef } from "react";
import { useAppStore } from "src/store";
import ColumnOptionsTool from "./ColumnOptionsTool";
import FilterColumns from "./FilterColumns";
import IncludeColumns from "./IncludeColumns";
import Tables from "./Tables";
import { FieldConfiguration } from "@components/interfaces";
import ReactDOM from "react-dom";

const BlocksEditor: any = ({ values }: any) => {
  const editorRef = useRef(null);
  const { text, setText, activeColumnOptions, activeViewItem } = useAppStore();
  // console.log("activeViewItem", activeViewItem);
  // Function to save editor data
  const saveEditorData = async () => {
    if (editorRef.current) {
      // console.log("saveEditorData");
      // const savedData = await editorRef.current.save();
      // const request_data = savedData;
      // console.log("savedData", savedData);
      // customMutate({
      //   url: `${process.env.NEXT_PUBLIC_CMT_API_BASEURL}/query`,
      //   method: "post",
      //   values: request_data,
      //   successNotification: (data, values) => {
      //     // invalidate({
      //     //   resource: "caesars_bookings",
      //     //   invalidates: ["list"],
      //     // });
      //     return {
      //       message: `successfully executed.`,
      //       description: "Success with no errors",
      //       type: "success",
      //     };
      //   },
      //   errorNotification: (data, values) => {
      //     return {
      //       message: `Something went wrong when executing`,
      //       description: "Error",
      //       type: "error",
      //     };
      //   },
      // });
      // setText(JSON.stringify(savedData)); // Update state or send data to server
    }
  };

  useEffect(() => {
    let EditorJS: any;

    import("@editorjs/editorjs").then((module) => {
      EditorJS = module.default;

      if (!editorRef.current) {
        editorRef.current = new EditorJS({
          holder: "editor",
          tools: {
            // header: Header,
            // list: List,
            // highlightedText: HighlightedText,
            tables: {
              class: Tables,
              // inlineToolbar: true,
            }, // Add the Tables tool here
            include_columns: {
              class: IncludeColumns,
              // inlineToolbar: true,
            }, // Add the Columns tool here
            filter_columns: {
              class: FilterColumns,
              // inlineToolbar: true,
            }, // Add the Columns tool here
            // datePicker: {
            //   class: DateInputTool,
            //   // Optionally, you can specify other configurations for the tool here
            // },
            columnOptions: {
              class: ColumnOptionsTool,
              // Optionally, you can specify other configurations for the tool here
            },
          },
          /**
           * Previously saved data that should be rendered
           */
          data: {
            time: 1709812323137,
            blocks: [
              {
                id: "BOkAAfyzDL",
                type: "paragraph",
                data: {
                  text: "select columns",
                },
              },
              {
                id: "TfLgkHoGMp",
                type: "include_columns",
                data: {
                  selectedItems: activeViewItem?.fields_configuration
                    ?.filter((item: FieldConfiguration) => item?.visible)
                    .map((item: FieldConfiguration) => item?.field_name),
                },
              },
              // {
              //   id: "kkG4aEUbIs",
              //   type: "paragraph",
              //   data: {
              //     text: "from",
              //   },
              // },
              // {
              //   id: "-cPqG27MHf",
              //   type: "tables",
              //   data: {
              //     selectedItems: ["onewurld bookings"],
              //   },
              // },
            ],
            version: "2.29.0",
          },
          autofocus: true,
          placeholder: "Use (+) to quickly build query with blocks!",
          readOnly: false,
        });
      }
    });

    return () => {
      if (editorRef.current) {
        // Unmount the React component from the DatePicker container
        const datePickerContainers =
          document.querySelectorAll(".date-tool-wrapper");
        datePickerContainers.forEach((container) => {
          ReactDOM.unmountComponentAtNode(container);
        });

        (editorRef.current as any).destroy();
        editorRef.current = null;
      }
    };
  }, []);

  return <div id="editor" className="editor-container bg-white rounded"></div>;
};

export default BlocksEditor;
