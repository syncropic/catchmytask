import React, { useEffect, useRef, useState } from "react";
import { ReactGrid, CellChange } from "@silevis/reactgrid";
import { ConditionallyFormattedCellTemplate } from "./ConditionallyFormattedCellTemplate";
import { Table } from "@tanstack/react-table";
import { useGridData } from "./useGridData";
import { DetailCellTemplate } from "./DetailCellTemplate";
import { Data } from "./data";
// import PieChart from "./PieChart";
// import BarChart from "./BarChart";
import { useAppStore } from "src/store";
import { useReadRecordByState } from "@components/Utils";

interface ResultsComponentProps {
  // tableInstance: Table<T>;
  data_fields: any[];
  data_items: any[];
  view_record: any;
}

export function DataGridView({
  data_fields,
  data_items,
  view_record,
}: ResultsComponentProps) {
  const { rows, columns, handleColumnResize } = useGridData(
    data_items,
    data_fields,
    view_record
  );
  
  const handleChanges = (changes: CellChange[]) => {
    console.log("Cell changes:", changes);
  };

  const [chartData, setChartData] = useState({
    labels: Data.map((data) => data.year),
    datasets: [
      {
        label: "Users Gained ",
        data: Data.map((data) => data.userGain),
        backgroundColor: [
          "rgba(75,192,192,1)",
          "#ecf0f1",
          "#50AF95",
          "#f3ba2f",
          "#2a71d0",
        ],
        // Option 1: Fixed width for all bars
        barThickness: 40,
        // borderColor: "black",
        // borderWidth: 2,
      },
    ],
  });

  return (
    <div className="h-[85vh] overflow-scroll">
      {/* <PieChart chartData={chartData} /> */}
      <div className="">
      {/* {pinned_action_steps["summary"]?.is_displayed && (
        // <BarChart chartData={chartData} />
        // <BarChart />
        <StackedBarChart data={data_items} />
      )} */}
      </div>
          <div className="flex pl-14">
      {rows.length > 0 && columns?.length > 0 && (<ReactGrid
        rows={rows}
        columns={columns}
        stickyLeftColumns={2}
        stickyRightColumns={1}
        stickyTopRows={1}
        enableRowSelection={true}
        enableColumnSelection={true}
        enableRangeSelection={true}
        onColumnResized={handleColumnResize}
        customCellTemplates={{
          detail: new DetailCellTemplate(),
          conditionallyformatted: new ConditionallyFormattedCellTemplate(),
        }}
        // onCellsChanged={handleChanges}
      />)}
      
      {/* <div>{JSON.stringify(view_record)}</div> */}
      </div>
    </div>
  );
}

export default DataGridView;
