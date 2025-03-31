import React, { useState } from "react";
import Tree, { TreeNode } from "rc-tree";
import "rc-tree/assets/index.css";
import { Key } from "rc-tree/lib/interface";

export interface TreeData {
  key: string;
  title: string | React.ReactNode;
  children?: TreeData[];
  disabled?: boolean;
  isLeaf?: boolean;
}

export interface CustomTreeProps {
  data: TreeData[];
  defaultExpandAll?: boolean;
  defaultExpandedKeys?: string[];
  defaultSelectedKeys?: string[];
  defaultCheckedKeys?: string[];
  checkable?: boolean;
  checkStrictly?: boolean;
  draggable?: boolean;
  showLine?: boolean;
  showIcon?: boolean;
  className?: string;
  onSelect?: (selectedKeys: Key[], info: any) => void;
  onCheck?: (
    checkedKeys: Key[] | { checked: Key[]; halfChecked: Key[] },
    info: any
  ) => void;
  onExpand?: (expandedKeys: Key[], info: any) => void;
  onDrop?: (info: any) => void;
}

// Helper function to render TreeNodes from data
const renderTreeNodes = (data: TreeData[]) => {
  return data.map((item) => {
    if (item.children && item.children.length > 0) {
      return (
        <TreeNode key={item.key} title={item.title} disabled={item.disabled}>
          {renderTreeNodes(item.children)}
        </TreeNode>
      );
    }
    return (
      <TreeNode
        key={item.key}
        title={item.title}
        disabled={item.disabled}
        isLeaf={item.isLeaf}
      />
    );
  });
};

const CustomTree: React.FC<CustomTreeProps> = ({
  data,
  defaultExpandAll = false,
  defaultExpandedKeys,
  defaultSelectedKeys,
  defaultCheckedKeys,
  checkable = false,
  checkStrictly = false,
  draggable = false,
  showLine = false,
  showIcon = true,
  className = "",
  onSelect,
  onCheck,
  onExpand,
  onDrop,
}) => {
  // For controlled components if needed
  const [expandedKeys, setExpandedKeys] = useState<Key[]>(
    defaultExpandedKeys || []
  );
  const [selectedKeys, setSelectedKeys] = useState<Key[]>(
    defaultSelectedKeys || []
  );
  const [checkedKeys, setCheckedKeys] = useState<Key[]>(
    defaultCheckedKeys || []
  );

  const handleExpand = (keys: Key[], info: any) => {
    setExpandedKeys(keys);
    onExpand?.(keys, info);
  };

  const handleSelect = (keys: Key[], info: any) => {
    setSelectedKeys(keys);
    onSelect?.(keys, info);
  };

  const handleCheck = (keys: any, info: any) => {
    setCheckedKeys(Array.isArray(keys) ? keys : keys.checked);
    onCheck?.(keys, info);
  };

  return (
    <Tree
      className={`custom-tree ${className}`}
      defaultExpandAll={defaultExpandAll}
      defaultExpandedKeys={defaultExpandedKeys}
      expandedKeys={expandedKeys}
      defaultSelectedKeys={defaultSelectedKeys}
      selectedKeys={selectedKeys}
      defaultCheckedKeys={defaultCheckedKeys}
      checkedKeys={checkedKeys}
      checkable={checkable}
      checkStrictly={checkStrictly}
      draggable={draggable}
      showLine={showLine}
      showIcon={showIcon}
      onExpand={handleExpand}
      onSelect={handleSelect}
      onCheck={handleCheck}
      onDrop={onDrop}
    >
      {renderTreeNodes(data)}
    </Tree>
  );
};

export default CustomTree;
