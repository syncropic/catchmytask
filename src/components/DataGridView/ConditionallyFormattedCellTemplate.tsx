import {
  CellTemplate,
  Cell,
  Compatible,
  Uncertain,
  keyCodes,
  CellStyle,
  getCellProperty,
} from "@silevis/reactgrid";
import { getReactGridCellStyle } from "@components/Utils"; // Utility function to convert styles

// Custom cell interface extending ReactGrid's Cell interface
export interface ConditionallyFormattedCell extends Cell {
  type: "conditionallyformatted";
  text: string;
  style?: CellStyle; // Updated to match ReactGrid's CellStyle type
  className?: string;
  record?: any;
}

export class ConditionallyFormattedCellTemplate
  implements CellTemplate<ConditionallyFormattedCell>
{
  getCompatibleCell(
    uncertainCell: Uncertain<ConditionallyFormattedCell>
  ): Compatible<ConditionallyFormattedCell> {
    const text = getCellProperty(uncertainCell, "text", "string");
    const value = parseFloat(text);
    return { ...uncertainCell, text, value };
  }
  render(
    cell: Compatible<ConditionallyFormattedCell>,
    isInEditMode: boolean
  ): React.ReactNode {
    const { className, style, text } = cell;

    return (
      // <div className={className} style={style}>
      //   {text}
      // </div>
      <div className={className} style={{background: style?.background, color: style?.color}}>
        {text}
      </div>
    );
  }
}
