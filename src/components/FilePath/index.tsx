import React from "react";
import { Anchor, Text } from "@mantine/core";
import { useAppStore } from "src/store";
import { useActivateSection } from "@components/Utils";
import { HttpError, useOne } from "@refinedev/core";
import { IAction, IFieldConfigurationWithValue } from "@components/interfaces";
import { set } from "date-fns";

const FilePath: React.FC<IFieldConfigurationWithValue> = ({
  value,
  record,
  display_format,
  display_component,
  display_component_content,
}) => {
  const {
    setActiveFile,
    setActiveActionOption,
    activeRecord,
    setActiveRecord,
  } = useAppStore();
  const { activateSection } = useActivateSection();
  // get clone action option
  const {
    data: viewFileActionOptionData,
    isLoading: isLoadingActionOption,
    isError: isErrorActionOption,
  } = useOne<IAction, HttpError>({
    resource: "action_options",
    id: "action_options:⟨1d005015-848e-41bd-93a0-241686b30d70⟩",
  });
  // Check if the value is a valid URL. If not, return an empty fragment
  // view file function, get file from server, save that in state and open file editor window using the file extension
  if (!value) {
    return <></>;
  }

  return (
    <Anchor component={Text}>
      <Text
        size="sm"
        onClick={() => {
          // setActiveFile(record);
          setActiveActionOption(viewFileActionOptionData?.data);
          setActiveRecord(record);
          activateSection("rightSection");
        }}
      >
        {display_component_content ? display_component_content : value}
      </Text>
    </Anchor>
  );
};

export default FilePath;
