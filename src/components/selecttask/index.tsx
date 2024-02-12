import { Button, Drawer, LoadingOverlay, MultiSelect } from "@mantine/core";
import { useCustomMutation, useInvalidate } from "@refinedev/core";
import { useForm } from "@refinedev/mantine";
import { addSeparator } from "src/utils";
import {
  RetrieveDatasets,
  SendFlightConfirmation,
  SendFlightScheduleChangeEmail,
  Sync,
} from "@components/completeaction";
import { useDisclosure } from "@mantine/hooks";
import { SelectActionOptionComponentProps } from "@components/interfaces";

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

  // const handleRunInline = () => {
  //   const action_option = action_options.find(
  //     (item) => item.value === values?.action[0]
  //   );
  //   let request_data = action_option ?? {};
  //   mutate({
  //     url: `${process.env.NEXT_PUBLIC_CMT_API_BASEURL}/execute`,
  //     method: "post",
  //     values: {
  //       ...action_option,
  //       values: {
  //         ...record,
  //         action_option: addSeparator(action_option?.id, "action_options"),
  //       },
  //       options: {
  //         ...action_option?.options,
  //         execution_type: "new_task",
  //       },
  //     },
  //     successNotification: (data, values) => {
  //       return {
  //         message: `successfully executed.`,
  //         description: "Success with no errors",
  //         type: "success",
  //       };
  //     },
  //     errorNotification: (data, values) => {
  //       return {
  //         message: `Something went wrong when executing`,
  //         description: "Error",
  //         type: "error",
  //       };
  //     },
  //   });
  // };

  return (
    <div className="flex items-end space-x-2">
      <Drawer
        opened={opened}
        onClose={close}
        title={activeActionOption?.display_name}
        position="right"
      >
        {activeActionOption?.display_name === "Send Flight Confirmation" && (
          <SendFlightConfirmation
            setActionType={setActionType}
            action_options={action_options}
            identity={identity}
            data_items={data_items}
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
        {activeActionOption?.display_name ===
          "Send Flight Schedule Change Email" && (
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
        {activeActionOption?.display_name === "Sync" && (
          <Sync
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
      </Drawer>
      <LoadingOverlay
        visible={mutationIsLoading}
        // zIndex={1000}
        // overlayProps={{ radius: "sm", blur: 2 }}
      />
      {variant === "inline" ? (
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
            // style={{ option: { whiteSpace: "normal" } }} // Adjust this line based on your component's API
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
