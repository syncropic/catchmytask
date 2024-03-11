import {
  Button,
  Drawer,
  LoadingOverlay,
  MultiSelect,
  ScrollArea,
} from "@mantine/core";
import { useCustomMutation, useInvalidate } from "@refinedev/core";
import { useForm } from "@refinedev/mantine";
import { SelectActionOptionComponentProps } from "@components/interfaces";
import { useAppStore } from "src/store";

function SelectTaskComponent<T extends Record<string, any>>({
  setActionType,
  data_items,
  action_options,
  identity,
  action_step,
  record,
  data_table,
  variant = "default",
  activeActionOption,
  setActiveActionOption,
}: SelectActionOptionComponentProps<T>) {
  const invalidate = useInvalidate();
  const {
    mutate,
    isLoading: mutationIsLoading,
    isError: mutationIsError,
  } = useCustomMutation();

  const {
    getInputProps,
    saveButtonProps,
    setFieldValue,
    values,
    refineCore: { formLoading, onFinish },
    onSubmit,
  } = useForm({
    initialValues: {},
  });
  const { activeRecord, setActiveRecord, activeLayout, setActiveLayout } =
    useAppStore();

  const handleActionChange = (value: string[]) => {
    const item = action_options.find((item) => item.value === value[0]);
    setActiveActionOption(item);
    setActionType("setActiveActionOption");
    if (record) {
      setActiveRecord(record);
    }
    activateSection("rightSection");
    setFieldValue("action", value);
  };
  // handle toggleDisplay
  const activateSection = (section: string) => {
    if (activeLayout) {
      const newLayout = { ...activeLayout };
      newLayout[section].isDisplayed = true;
      setActiveLayout(newLayout);
    }
  };

  return (
    <div className="flex items-end space-x-2">
      <LoadingOverlay
        visible={mutationIsLoading}
        // zIndex={1000}
        // overlayProps={{ radius: "sm", blur: 2 }}
      />
      {variant === "inline" ? (
        <>
          <MultiSelect
            placeholder="Select action"
            maxSelectedValues={1}
            searchable={true}
            data={action_options.map((action) => action.display_name)}
            value={getInputProps("action").value}
            onChange={handleActionChange}
            withinPortal={true}
            styles={{
              input: { width: "200px" },
              wrapper: { width: "200px" },
            }}
          />
          {/* <Button
            size="xs"
            onClick={() => {
              // handleRunInline();
              setActionType("run");
              setActiveRecord(record);
              activateSection("rightSection");
              // open();
            }}
          >
            RUN
          </Button> */}
        </>
      ) : (
        <>
          <MultiSelect
            className="flex-1"
            maxSelectedValues={1}
            // label="actions"
            placeholder="select action"
            searchable={true}
            data={action_options.map((action) => action.display_name)}
            value={getInputProps("action").value}
            onChange={handleActionChange}
            withinPortal={true}
          />
          {/* <Button
            size="sm"
            onClick={() => {
              setActionType("run");
              setActiveRecord(record);
              activateSection("rightSection");
              // open();
            }}
          >
            RUN
          </Button> */}
        </>
      )}
    </div>
  );
}

export default SelectTaskComponent;
