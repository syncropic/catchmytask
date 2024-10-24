// FlagCellTemplate.tsx
import * as React from "react";
import {
  CellTemplate,
  Cell,
  Compatible,
  Uncertain,
  UncertainCompatible,
  isNavigationKey,
  getCellProperty,
  isAlphaNumericKey,
  keyCodes,
} from "@silevis/reactgrid";
import "./detail-cell-style.module.css";
import Reveal from "@components/Reveal";
import { Tooltip } from "@mantine/core";
import { getLabel, getTooltipLabel } from "@components/Utils";
import MonacoEditor from "@components/MonacoEditor";
import { Text } from "@mantine/core";

export interface DetailCell extends Cell {
  type: "detail";
  text: string;
  record?: any;
  records?: any[];
}

export class DetailCellTemplate implements CellTemplate<DetailCell> {
  getCompatibleCell(
    uncertainCell: Uncertain<DetailCell>
  ): Compatible<DetailCell> {
    const text = getCellProperty(uncertainCell, "text", "string");
    const value = parseFloat(text);
    return { ...uncertainCell, text, value };
  }

  handleKeyDown(
    cell: Compatible<DetailCell>,
    keyCode: number,
    ctrl: boolean,
    shift: boolean,
    alt: boolean
  ): { cell: Compatible<DetailCell>; enableEditMode: boolean } {
    if (!ctrl && !alt && isAlphaNumericKey(keyCode))
      return { cell, enableEditMode: true };
    return {
      cell,
      enableEditMode:
        keyCode === keyCodes.POINTER || keyCode === keyCodes.ENTER,
    };
  }

  update(
    cell: Compatible<DetailCell>,
    cellToMerge: UncertainCompatible<DetailCell>
  ): Compatible<DetailCell> {
    return this.getCompatibleCell({ ...cell, text: cellToMerge.text });
  }

  render(
    cell: Compatible<DetailCell>,
    isInEditMode: boolean,
    onCellChanged: (cell: Compatible<DetailCell>, commit: boolean) => void
  ): React.ReactNode {
    if (!isInEditMode) {
      //   const flagISO = cell.text.toLowerCase(); // ISO 3166-1, 2/3 letters
      //   const flagURL = `https://restcountries.eu/data/${flagISO}.svg`;
      //   const alternativeURL = `https://upload.wikimedia.org/wikipedia/commons/0/04/Nuvola_unknown_flag.svg`;
      return (
        // <div
        //   className="rg-flag-wrapper"
        //   style={{ backgroundImage: `url(${flagURL}), url(${alternativeURL})` }}
        // />
        // <div>{cell.text.toLowerCase()}</div>
        // <div>{JSON.stringify(cell.record)}</div>
        <Reveal
          trigger="click"
          target={
            <Tooltip
              multiline
              w={220}
              withArrow
              transitionProps={{ duration: 200 }}
              // label={getTooltipLabel(cell.record)}
              label="click to view details"
            >
              <Text
                truncate="end"
                size="xs"
                className="text-blue-500 pl-3 pr-3"
              >
                {getLabel(cell.record)}
              </Text>
            </Tooltip>
          }
        >
          <MonacoEditor value={cell.record} language="json" height="50vh" />
        </Reveal>
      );
    }
    return (
      <input
        ref={(input) => {
          input && input.focus();
        }}
        defaultValue={cell.text}
        onChange={(e) =>
          onCellChanged(
            this.getCompatibleCell({ ...cell, text: e.currentTarget.value }),
            false
          )
        }
        onCopy={(e) => e.stopPropagation()}
        onCut={(e) => e.stopPropagation()}
        onPaste={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (isAlphaNumericKey(e.keyCode) || isNavigationKey(e.keyCode))
            e.stopPropagation();
        }}
      />
    );
  }
}
