import React from "react";
// import { Anchor, Text } from "@mantine/core";
// import { useAppStore } from "src/store";
// import { useActivateSection } from "@components/Utils";

const CodeView = ({ path }) => {
  // optimally display code with the appropriate context and abilities to action on the code
  // const { setActiveFile } = useAppStore();
  // const { activateSection } = useActivateSection();
  // // Check if the value is a valid URL. If not, return an empty fragment
  // // view file function, get file from server, save that in state and open file editor window using the file extension
  // if (!value) {
  //   return <></>;
  // }

  return (
    <div>codeview {path}</div>
    // <Anchor component={Text}>
    //   <Text
    //     size="sm"
    //     onClick={() => {
    //       // setActiveFile(record);
    //       activateSection("rightSection");
    //     }}
    //   >
    //     {displayComponentContent ? displayComponentContent : value}
    //   </Text>
    // </Anchor>
  );
};

export default CodeView;
