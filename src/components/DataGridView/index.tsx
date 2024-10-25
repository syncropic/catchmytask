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
import { MyResponsiveBar } from "@components/ChartView";

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
      {/* <MyResponsiveBar data={data}/> */}

      {/* <PieChart chartData={chartData} /> */}
      <div className="">
        {/* {pinned_action_steps["summary"]?.is_displayed && (
        // <BarChart chartData={chartData} />
        // <BarChart />
        <StackedBarChart data={data_items} />
      )} */}
      </div>
      {rows.length > 0 && columns?.length > 0 && (
        <ReactGrid
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
        />
      )}

      {/* <div>{JSON.stringify(view_record)}</div> */}
    </div>
  );
}

export default DataGridView;

let data = [
  {
    country: "AD",
    "hot dog": 55,
    "hot dogColor": "hsl(169, 70%, 50%)",
    burger: 40,
    burgerColor: "hsl(100, 70%, 50%)",
    sandwich: 182,
    sandwichColor: "hsl(29, 70%, 50%)",
    kebab: 66,
    kebabColor: "hsl(302, 70%, 50%)",
    fries: 13,
    friesColor: "hsl(134, 70%, 50%)",
    donut: 32,
    donutColor: "hsl(25, 70%, 50%)",
  },
  {
    country: "AE",
    "hot dog": 126,
    "hot dogColor": "hsl(125, 70%, 50%)",
    burger: 9,
    burgerColor: "hsl(202, 70%, 50%)",
    sandwich: 70,
    sandwichColor: "hsl(327, 70%, 50%)",
    kebab: 66,
    kebabColor: "hsl(158, 70%, 50%)",
    fries: 81,
    friesColor: "hsl(312, 70%, 50%)",
    donut: 178,
    donutColor: "hsl(140, 70%, 50%)",
  },
  {
    country: "AF",
    "hot dog": 35,
    "hot dogColor": "hsl(31, 70%, 50%)",
    burger: 150,
    burgerColor: "hsl(111, 70%, 50%)",
    sandwich: 190,
    sandwichColor: "hsl(31, 70%, 50%)",
    kebab: 103,
    kebabColor: "hsl(24, 70%, 50%)",
    fries: 112,
    friesColor: "hsl(175, 70%, 50%)",
    donut: 83,
    donutColor: "hsl(43, 70%, 50%)",
  },
  {
    country: "AG",
    "hot dog": 179,
    "hot dogColor": "hsl(241, 70%, 50%)",
    burger: 132,
    burgerColor: "hsl(271, 70%, 50%)",
    sandwich: 43,
    sandwichColor: "hsl(337, 70%, 50%)",
    kebab: 147,
    kebabColor: "hsl(128, 70%, 50%)",
    fries: 34,
    friesColor: "hsl(23, 70%, 50%)",
    donut: 66,
    donutColor: "hsl(20, 70%, 50%)",
  },
  {
    country: "AI",
    "hot dog": 40,
    "hot dogColor": "hsl(82, 70%, 50%)",
    burger: 122,
    burgerColor: "hsl(27, 70%, 50%)",
    sandwich: 166,
    sandwichColor: "hsl(135, 70%, 50%)",
    kebab: 2,
    kebabColor: "hsl(342, 70%, 50%)",
    fries: 69,
    friesColor: "hsl(308, 70%, 50%)",
    donut: 149,
    donutColor: "hsl(332, 70%, 50%)",
  },
  {
    country: "AL",
    "hot dog": 158,
    "hot dogColor": "hsl(158, 70%, 50%)",
    burger: 97,
    burgerColor: "hsl(302, 70%, 50%)",
    sandwich: 16,
    sandwichColor: "hsl(213, 70%, 50%)",
    kebab: 66,
    kebabColor: "hsl(227, 70%, 50%)",
    fries: 31,
    friesColor: "hsl(233, 70%, 50%)",
    donut: 192,
    donutColor: "hsl(260, 70%, 50%)",
  },
  {
    country: "AM",
    "hot dog": 50,
    "hot dogColor": "hsl(85, 70%, 50%)",
    burger: 163,
    burgerColor: "hsl(341, 70%, 50%)",
    sandwich: 184,
    sandwichColor: "hsl(56, 70%, 50%)",
    kebab: 115,
    kebabColor: "hsl(18, 70%, 50%)",
    fries: 105,
    friesColor: "hsl(20, 70%, 50%)",
    donut: 113,
    donutColor: "hsl(16, 70%, 50%)",
  },
];
