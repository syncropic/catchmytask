import { Button, Drawer, LoadingOverlay, MultiSelect } from "@mantine/core";
import { useCustomMutation, useInvalidate } from "@refinedev/core";
import { useForm } from "@refinedev/mantine";
import { useDisclosure } from "@mantine/hooks";
import { SelectActionOptionComponentProps } from "@components/interfaces";
import DynamicComponentLoader from "@components/DynamicComponentLoader";
import RetrieveDatasets from "@components/RetrieveDatasets";
import SendFlightConfirmation from "@components/SendFlightConfirmation";
import SendFlightScheduleChangeEmail from "@components/SendFlightScheduleChangeEmail";

function SelectTaskComponent({
  setActionType,
  data_items,
  action_options,
  identity,
  action_step,
  record,
  variant = "default",
  activeActionOption,
  setActiveActionOption,
}: SelectActionOptionComponentProps) {
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

  const handleActionChange = (value: string[]) => {
    const item = action_options.find((item) => item.value === value[0]);
    setActiveActionOption(item);
    // setActionType("create");
    setFieldValue("action", value);
  };
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <div className="flex items-end space-x-2">
      <Drawer
        opened={opened}
        onClose={close}
        title={activeActionOption?.display_name}
        position="right"
      >
        {/* {activeActionOption?.metadata?.display_component && (
          <DynamicComponentLoader
            componentName={activeActionOption?.metadata?.display_component
              .trim()
              .replace(/\s+/g, "")}
            componentProps={{
              data_items: data_items,
              setActionType: setActionType,
              action_options: action_options,
              identity: identity,
              open: open,
              close: close,
              opened: opened,
              record: record,
              action_step: null,
              variant: "default",
              activeActionOption: activeActionOption,
              setActiveActionOption: setActiveActionOption,
            }}
          />
        )} */}

        {activeActionOption?.metadata?.display_component ==
          "RetrieveDatasets" && (
          <RetrieveDatasets
            data_items={data_items}
            setActionType={setActionType}
            action_options={action_options}
            identity={identity}
            open={open}
            close={close}
            opened={opened}
            record={record}
            action_step={null}
            variant="default"
            activeActionOption={activeActionOption}
            setActiveActionOption={setActiveActionOption}
          />
        )}
        {activeActionOption?.metadata?.display_component ==
          "SendFlightConfirmation" && (
          <SendFlightConfirmation
            data_items={data_items}
            setActionType={setActionType}
            action_options={action_options}
            identity={identity}
            open={open}
            close={close}
            opened={opened}
            record={record}
            action_step={null}
            variant="default"
            activeActionOption={activeActionOption}
            setActiveActionOption={setActiveActionOption}
          />
        )}

        {activeActionOption?.metadata?.display_component ==
          "SendFlightScheduleChangeEmail" && (
          <SendFlightScheduleChangeEmail
            data_items={data_items}
            setActionType={setActionType}
            action_options={action_options}
            identity={identity}
            open={open}
            close={close}
            opened={opened}
            record={record}
            action_step={null}
            variant="default"
            activeActionOption={activeActionOption}
            setActiveActionOption={setActiveActionOption}
          />
        )}

        {/*         
        <RetrieveDatasets
          data_items={data_items}
          setActionType={setActionType}
          action_options={action_options}
          identity={identity}
          open={open}
          close={close}
          opened={opened}
          record={record}
          action_step={null}
          variant="default"
          activeActionOption={activeActionOption}
          setActiveActionOption={setActiveActionOption}
        /> */}
      </Drawer>
      <LoadingOverlay
        visible={mutationIsLoading}
        // zIndex={1000}
        // overlayProps={{ radius: "sm", blur: 2 }}
      />
      {variant === "inline" ? (
        <>
          <MultiSelect
            placeholder="Select action"
            searchable={true}
            data={action_options.map((action) => action.display_name)}
            value={getInputProps("action").value}
            onChange={handleActionChange}
            withinPortal={true}
            styles={{
              input: { width: "200px" }, // Apply fixed width to the input part
              wrapper: { width: "200px" }, // Optionally ensure the wrapper also has a fixed width
            }}
          />
          <Button
            size="xs"
            onClick={() => {
              // handleRunInline();
              setActionType("run");
              open();
            }}
          >
            RUN
          </Button>
        </>
      ) : (
        <>
          <MultiSelect
            className="flex-1"
            // label="actions"
            placeholder="select action"
            searchable={true}
            data={action_options.map((action) => action.display_name)}
            value={getInputProps("action").value}
            onChange={handleActionChange}
            withinPortal={true}
          />
          <Button
            size="sm"
            onClick={() => {
              setActionType("run");
              open();
            }}
          >
            RUN
          </Button>
        </>
      )}
    </div>
  );
}

export default SelectTaskComponent;
