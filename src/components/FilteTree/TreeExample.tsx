import React, { useState } from "react";
import { Key } from "rc-tree/lib/interface";
import CustomTree, { TreeData } from "@components/FilteTree";

const TreeExample: React.FC = () => {
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);

  // Example data for the tree
  const treeData: TreeData[] = [
    {
      key: "0-0",
      title: "Parent 1",
      children: [
        {
          key: "0-0-0",
          title: "Child 1-1",
          children: [
            { key: "0-0-0-0", title: "Leaf 1-1-1" },
            { key: "0-0-0-1", title: "Leaf 1-1-2" },
          ],
        },
        {
          key: "0-0-1",
          title: "Child 1-2",
          children: [
            { key: "0-0-1-0", title: "Leaf 1-2-1" },
            { key: "0-0-1-1", title: "Leaf 1-2-2" },
          ],
        },
      ],
    },
    {
      key: "0-1",
      title: "Parent 2",
      children: [
        {
          key: "0-1-0",
          title: "Child 2-1",
          children: [
            { key: "0-1-0-0", title: "Leaf 2-1-1" },
            { key: "0-1-0-1", title: "Leaf 2-1-2" },
          ],
        },
        {
          key: "0-1-1",
          title: "Child 2-2",
          children: [
            { key: "0-1-1-0", title: "Leaf 2-2-1" },
            { key: "0-1-1-1", title: "Leaf 2-2-2" },
          ],
        },
      ],
    },
  ];

  // Custom title node example with Tailwind styling
  const customTitleNode = (
    <div className="flex items-center space-x-2">
      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
      <span className="text-blue-700 font-medium">Custom Node</span>
    </div>
  );

  // Adding a custom node example to the tree data
  const dataWithCustomNode: TreeData[] = [
    ...treeData,
    {
      key: "0-2",
      title: customTitleNode,
      children: [{ key: "0-2-0", title: "Custom Child" }],
    },
  ];

  // Handle tree selection
  const handleSelect = (keys: Key[], info: any) => {
    console.log("Selected:", keys, info);
    setSelectedKeys(keys);
  };

  // Handle tree node expansion
  const handleExpand = (keys: Key[], info: any) => {
    console.log("Expanded:", keys, info);
  };

  // Handle tree node checking (only relevant if checkable is true)
  const handleCheck = (keys: any, info: any) => {
    console.log("Checked:", keys, info);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">RC-Tree Example</h1>

      <div className="mb-8 p-4 border rounded-lg bg-white shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Basic Tree</h2>
        <CustomTree
          data={treeData}
          defaultExpandedKeys={["0-0"]}
          onSelect={handleSelect}
          onExpand={handleExpand}
        />
      </div>

      <div className="mb-8 p-4 border rounded-lg bg-white shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Tree with Checkboxes</h2>
        <CustomTree
          data={treeData}
          checkable={true}
          defaultExpandAll={true}
          onCheck={handleCheck}
        />
      </div>

      <div className="mb-8 p-4 border rounded-lg bg-white shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Tree with Custom Node</h2>
        <CustomTree
          data={dataWithCustomNode}
          defaultExpandedKeys={["0-2"]}
          showLine={true}
        />
      </div>

      <div className="mb-8 p-4 border rounded-lg bg-white shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Draggable Tree</h2>
        <CustomTree
          data={treeData}
          draggable={true}
          defaultExpandAll={true}
          onDrop={(info) => console.log("Dropped:", info)}
        />
      </div>

      {selectedKeys.length > 0 && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="font-medium">Selected Node: {selectedKeys[0]}</p>
        </div>
      )}
    </div>
  );
};

export default TreeExample;
