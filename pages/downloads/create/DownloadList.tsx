import React from "react";
import { IDownload, DownloadListProps } from "../interfaces";

const DownloadList: React.FC<DownloadListProps> = ({
  downloads_items,
  filterView,
}) => {
  // Filter and sort the items
  const sortedItems = downloads_items
    .filter((item) => item.view === filterView)
    .sort(
      (a, b) =>
        new Date(b.created_at).valueOf() - new Date(a.created_at).valueOf()
    );

  return (
    <div className="container mx-auto overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created At
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Download
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Author
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedItems.map((item) => (
            <tr key={item.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(item.created_at).toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-500 hover:text-blue-700">
                <a
                  href={item.download_link}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download
                </a>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                <a
                  href={item.download_link}
                  download
                  className="text-blue-500 hover:text-blue-700"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {item.name}
                </a>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.author}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DownloadList;
