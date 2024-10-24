import { Row, Column, TextCell, DateCell, Id, CellStyle, DefaultCellTypes } from "@silevis/reactgrid";
import { useEffect, useState } from "react";
import { cellTemplateMap, getReactGridCellStyle, useReadRecordByState } from "@components/Utils";

interface DataField {
  name: string;
  data_type: string;
}

interface FormattingRule {
  value: string;
  class: string;
}

interface ConditionalFormatting {
  field_name: string;
  rules: FormattingRule[];
}

interface ViewField {
  field_name: string;
  conditional_formatting?: ConditionalFormatting;
}

interface View {
  fields: ViewField[];
}

interface AppState {
  views: Record<string, View>;
  activeTemplateRecord: { name?: string } | null;
}

function getActiveFormattingRules(fieldName: string, view_record: any): ConditionalFormatting | null {
  return view_record?.fields.find((f: any) => f.field_name === fieldName)?.conditional_formatting || null;
}

function applyConditionalFormatting(
  fieldName: string,
  record: any,
  view_record: any
): { className: string; style: CellStyle } {
  const rules = getActiveFormattingRules(fieldName, view_record);
  if (!rules) return { className: "", style: {} };

  const comparisonValue = String(record[rules.field_name]).toLowerCase().trim();
  const matchingRule = rules.rules.find(
    (rule) => String(rule.value).toLowerCase().trim() === comparisonValue
  );

  if (matchingRule) {
    const style = getReactGridCellStyle(matchingRule.class);
    return { className: matchingRule.class, style };
  }

  return { className: "", style: {} };
}

export function useGridData(data_items: any[], data_fields: DataField[], view_record: any) {
  const [rows, setRows] = useState<Row[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);

  const generateColumns = (): Column[] =>
    data_fields.map((field) => ({
      columnId: field.name,
      width: 150,
      reorderable: true,
      resizable: true,
    }));

  const handleColumnResize = (ci: Id, width: number) => {
    setColumns((prevColumns) => {
      const columnIndex = prevColumns.findIndex((el) => el.columnId === ci);
      const resizedColumn = prevColumns[columnIndex];
      const updatedColumn = { ...resizedColumn, width };
      return [
        ...prevColumns.slice(0, columnIndex),
        updatedColumn,
        ...prevColumns.slice(columnIndex + 1),
      ];
    });
  };

  const headerRow: Row = {
    rowId: "header",
    cells: [
      ...data_fields
            ?.map((field) => {
              return {
                type: "header" as const,
                text: field?.name,
              };
            })
    ]
  };

  // const headerRow: Row = {
  //   rowId: "header",
  //   cells: [
  //     { type: "header", text: "Name" },
  //     { type: "header", text: "Surname" }
  //   ]
  // };

  const generateRows = (headerRow: any, data_items: any[], view_record: any): Row[] => [
    headerRow,
    ...data_items
      .map<Row>((record, idx) => ({
        rowId: idx,
        cells: [
          ...data_fields
            .map((field) => {
              const { className, style } = applyConditionalFormatting(
                field?.name,
                record,
                view_record
              );
              // console.log(field?.name, className, style)
              return createCell(field, record, className, style) as DefaultCellTypes;
              
            })
        ],
      })),
  ];

  useEffect(() => {
    setColumns(generateColumns());
    setRows(generateRows(headerRow, data_items, view_record));
  }, [data_fields, data_items]);

  return { rows, columns, handleColumnResize };
}

export function createCell(
  field: DataField,
  record: any,
  className: string,
  style: CellStyle
) {
  const fieldValue = record[field.name];

  if (field.name === "id") {
    return {
      type: "detail",
      text: String(fieldValue || ""),
      className,
      style,
      record: record,
    };
  }

  switch (field.data_type) {
    case "datetime":
      return {
        type: "date",
        date: fieldValue ? new Date(fieldValue) : undefined,
        // format: "dd/MM/yyyy",
        className,
        style,
      };
    case "integer":
      return {
        type: cellTemplateMap[field?.data_type] ?? "text",
        value: Number(record[field?.name]),
        className,
        style,
      };
    case "float":
      return {
        type: cellTemplateMap[field?.data_type] ?? "text",
        value: Number(record[field?.name]),
        className,
        style,
      }
    default:
      return {
        type: "text",
        text: String(fieldValue || ""),
        className,
        style,
      };
  }
}

