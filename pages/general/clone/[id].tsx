import {
  BaseKey,
  HttpError,
  IResourceComponentsProps,
  useGetIdentity,
  useOne,
  useParsed,
  useShow,
} from "@refinedev/core";
import { useAppStore } from "src/store";
import CloneForm from "@components/CloneForm";
import { extractFields, getResourceName } from "@components/Utils";
import { IActionOption } from "@components/interfaces";

export const PageEdit: React.FC<IResourceComponentsProps> = () => {
  const { id } = useParsed();
  const resourceName = getResourceName(id);
  const { queryResult } = useShow();
  const { data, isLoading } = queryResult;

  // get clone action option
  const {
    data: actionOptionData,
    isLoading: isLoadingActionOption,
    isError: isErrorActionOption,
  } = useOne<IActionOption, HttpError>({
    resource: "action_options",
    id: "action_options:b7mh2av3p49zcir80ctz",
  });

  const extractedFields = extractFields(
    data?.data || {},
    actionOptionData?.data?.field_configurations || []
  );

  return (
    <>
      {/* {JSON.stringify(activeActionOption?.field_configurations || [])} */}
      <CloneForm
        resource={resourceName}
        activeActionOption={actionOptionData?.data}
        activeRecord={data?.data}
        extractedFields={extractedFields}
      ></CloneForm>
    </>
  );
};
export default PageEdit;
