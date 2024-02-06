import CodeBlock from "src/components/codeblock/codeblock";

const SaveFunctionCallInfoComponent = ({ data }: { data: any }) => {
  // Custom rendering logic for 'save_function_call_info'
  return (
    <div>
      <CodeBlock jsonData={data} />
    </div>
  );
};

const CreateAndSaveToRemoteComponent = (data_item: any) => {
  let data = data_item?.data;
  // Function to extract download_link and webUrl (remote_link)
  const extractLinks = (data: any) => {
    const downloadLink = data?.remote_file?.download_link || "";
    let remoteLink = "";

    if (data?.remote_file?.link?.webUrl) {
      remoteLink = data.remote_file.link.webUrl;
    } else if (data?.remote_file?.shareable_link) {
      remoteLink = data.remote_file.shareable_link;
    } else if (data?.remote_file?.upload_error?.webUrl) {
      remoteLink = data.remote_file.upload_error.webUrl;
    } else if (data?.remote_file?.shareable_link_error?.link?.webUrl) {
      remoteLink = data.remote_file.shareable_link_error.link.webUrl;
    }

    return { downloadLink, remoteLink };
  };

  const { downloadLink, remoteLink } = extractLinks(data);

  return (
    <div>
      <p>
        <strong>Name: </strong>
        {data?.name}
      </p>
      <p className="break-words">
        <strong>Remote Link:</strong>{" "}
        <a href={remoteLink} target="_blank" rel="noopener noreferrer">
          {remoteLink}
        </a>
      </p>
      <p className="break-words">
        <strong>Download Link:</strong>{" "}
        <a href={downloadLink} target="_blank" rel="noopener noreferrer">
          {downloadLink}
        </a>
      </p>
    </div>
  );
};

export const renderOperationDetails = (fileOperation: any, data: any) => {
  switch (fileOperation) {
    case "save_function_call_info":
      return <SaveFunctionCallInfoComponent data={data} />;
    case "create_and_save_to_remote":
      return <CreateAndSaveToRemoteComponent data={data} />;
    default:
      return <SaveFunctionCallInfoComponent data={data} />;
  }
};
