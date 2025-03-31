import React, { useState, useEffect } from "react";
import Tree from "rc-tree";
import "rc-tree/assets/index.css";
import { Key } from "rc-tree/lib/interface";
import { TreeNode } from "rc-tree";

// If you're using Mantine icons
import {
  IconFolder,
  IconFolderOpen,
  IconFile,
  IconChevronRight,
  IconChevronDown,
} from "@tabler/icons-react";

// For integration with refine.dev (adjust based on your refine setup)
import { useList } from "@refinedev/core";

interface DataItem {
  id: string;
  name: string;
  parentId: string | null;
  type: "folder" | "file";
}

interface TreeItem {
  key: string;
  title: React.ReactNode;
  children?: TreeItem[];
  isLeaf?: boolean;
}

const AdvancedTreeExample: React.FC = () => {
  const [expandedKeys, setExpandedKeys] = useState<Key[]>([]);
  const [treeData, setTreeData] = useState<TreeItem[]>([]);

  // Example of using refine.dev hooks (adjust to your actual API/resources)
  const { data, isLoading } = useList({
    resource: "file-structure",
    // Add any filters, pagination or other options needed
  });

  useEffect(() => {
    if (data?.data) {
      // Convert flat data to tree structure
      const items = data.data as DataItem[];
      const transformedData = transformToTreeData(items);
      setTreeData(transformedData);

      // Auto expand first level
      const firstLevelKeys = transformedData.map((item) => item.key);
      setExpandedKeys(firstLevelKeys);
    }
  }, [data]);

  // Transform flat data to hierarchical tree structure
  const transformToTreeData = (items: DataItem[]): TreeItem[] => {
    const itemMap: Record<string, TreeItem> = {};
    const result: TreeItem[] = [];

    // First pass: create all nodes without children
    items.forEach((item) => {
      itemMap[item.id] = {
        key: item.id,
        title: renderTreeNodeTitle(item),
        isLeaf: item.type === "file",
        children: [],
      };
    });

    // Second pass: establish parent-child relationships
    items.forEach((item) => {
      if (item.parentId) {
        const parent = itemMap[item.parentId];
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(itemMap[item.id]);
        }
      } else {
        // Root level items
        result.push(itemMap[item.id]);
      }
    });

    return result;
  };

  // Custom rendering for tree node titles with icons
  const renderTreeNodeTitle = (item: DataItem): React.ReactNode => {
    return (
      <div className="flex items-center space-x-2 py-1">
        {item.type === "folder" ? (
          <IconFolder className="text-yellow-500" size={18} />
        ) : (
          <IconFile className="text-blue-500" size={18} />
        )}
        <span className="text-sm">{item.name}</span>
      </div>
    );
  };

  // Custom switcher icon based on expanded state
  const switcherIcon = (obj: { expanded: boolean; isLeaf: boolean }) => {
    if (obj.isLeaf) {
      return null;
    }
    return obj.expanded ? (
      <IconChevronDown size={16} className="text-gray-600" />
    ) : (
      <IconChevronRight size={16} className="text-gray-600" />
    );
  };

  const handleExpand = (expandedKeys: Key[], info: any) => {
    setExpandedKeys(expandedKeys);
  };

  const handleSelect = (selectedKeys: Key[], info: any) => {
    console.log("Selected:", selectedKeys, info);
    // Handle node selection logic here
  };

  // If you want to add drag and drop capabilities
  const handleDrop = (info: any) => {
    console.log("Dropped:", info);
    // Implement your logic for handling node movement
    // You'll need to update your data structure and possibly call an API
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  // Mock data for demonstration when not using refine
  const mockTreeData: TreeItem[] = [
    {
      key: "0-0",
      title: (
        <div className="flex items-center space-x-2 py-1">
          <IconFolder className="text-yellow-500" size={18} />
          <span className="text-sm">Project Files</span>
        </div>
      ),
      children: [
        {
          key: "0-0-0",
          title: (
            <div className="flex items-center space-x-2 py-1">
              <IconFolder className="text-yellow-500" size={18} />
              <span className="text-sm">src</span>
            </div>
          ),
          children: [
            {
              key: "0-0-0-0",
              title: (
                <div className="flex items-center space-x-2 py-1">
                  <IconFile className="text-blue-500" size={18} />
                  <span className="text-sm">index.tsx</span>
                </div>
              ),
              isLeaf: true,
            },
            {
              key: "0-0-0-1",
              title: (
                <div className="flex items-center space-x-2 py-1">
                  <IconFile className="text-blue-500" size={18} />
                  <span className="text-sm">styles.css</span>
                </div>
              ),
              isLeaf: true,
            },
          ],
        },
        {
          key: "0-0-1",
          title: (
            <div className="flex items-center space-x-2 py-1">
              <IconFolder className="text-yellow-500" size={18} />
              <span className="text-sm">public</span>
            </div>
          ),
          children: [
            {
              key: "0-0-1-0",
              title: (
                <div className="flex items-center space-x-2 py-1">
                  <IconFile className="text-blue-500" size={18} />
                  <span className="text-sm">index.html</span>
                </div>
              ),
              isLeaf: true,
            },
          ],
        },
      ],
    },
  ];

  return (
    <div className="w-full border rounded-lg bg-white shadow-sm p-4 overflow-auto">
      <h2 className="text-lg font-semibold mb-4">Project Structure</h2>
      <div className="border-t pt-3">
        <Tree
          className="custom-tree w-full"
          expandedKeys={expandedKeys}
          onExpand={handleExpand}
          onSelect={handleSelect}
          switcherIcon={switcherIcon}
          draggable
          onDrop={handleDrop}
          showLine={{ showLeafIcon: false }}
          treeData={data?.data ? treeData : mockTreeData}
        />
      </div>
    </div>
  );
};

export default AdvancedTreeExample;
