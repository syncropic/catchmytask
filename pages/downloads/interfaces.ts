// Define the IDownload interface
export interface IDownload {
  id: string;
  view: string;
  created_at: string;
  download_link: string;
  name: string;
  author: string; // Ensure this matches the data structure you have.
}

export interface DownloadListProps {
  downloads_items: IDownload[];
  filterView: string;
}

// export a simple react component
const OnewurldBookings = () => {
  return "hello world!";
};

export default OnewurldBookings;
