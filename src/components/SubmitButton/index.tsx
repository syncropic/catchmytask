import { Button, Tooltip } from "@mantine/core";
import { useAppStore, useTransientStore } from "src/store";

interface ExternalSubmitButtonProps {
  record: any;
  entity_type: string;
  action: string;
}

export const ExternalSubmitButton = ({
  record,
  action,
  entity_type,
}: ExternalSubmitButtonProps) => {
  const { forms, getFormSubmitHandler } = useTransientStore();
  // console.log("forms", forms["clone_action_steps:1u2jdt8lz28yc45drye0"]);
  const { form_status } = useAppStore();
  // const formId = `${focused_entities[record?.id]?.[action]}_${record?.id}`;
  const actionInputId = record?.id || "b79aaba2-a0d1-4fa7-9b68-0baebbd1b321";

  const formId = `${action}_${actionInputId}`;
  // console.log("formId", formId);
  // const submitForm = getFormSubmitHandler(formId);
  // const submitForm = forms[formId]?.submitForm;
  const formInstance = forms[formId]?.formInstance;
  // const submitForm =
  //   forms["clone_action_steps:1u2jdt8lz28yc45drye0"]?.submitForm;
  // console.log("formInstance", formInstance?.store?.state?.isSubmitting);
  // const isSubmitting = formInstance?.useStore((state) => state.isSubmitting);
  // Properly subscribe to the form's store for isSubmitting state
  // const isSubmitting = formInstance?.store?.useStore(
  //   (state) => state.isSubmitting
  // );
  if (!formInstance) {
    return <div className="flex flex-col items-center">
      <div>form instance unavailable</div>
      <div>{formId}</div></div>;
  }

  return (
    <>
      {/* <div>{JSON.stringify({ formId, action })}</div> */}
      <formInstance.Subscribe
        selector={(state: { canSubmit: any; isSubmitting: any }) => [
          state.canSubmit,
          state.isSubmitting,
        ]} // Only track the state changes we care about
        children={([canSubmit, isSubmitting]: [boolean, boolean]) => (
          <Tooltip
            label={`${action} ${entity_type} ${record?.id}`}
            // position="top"
            key={formId}
          >
            <Button
              size="xs"
              loading={form_status[formId]?.is_submitting}
              onClick={() => {
                if (formInstance?.handleSubmit) {
                  formInstance.handleSubmit(); // Trigger form submission
                  // Optionally reset the form after a successful submission
                  formInstance.reset();
                } else {
                  console.error(
                    `No submit handler found for form ID: ${formId}`
                  );
                }
              }}
              color="green"
              disabled={
                !canSubmit || isSubmitting || form_status[formId]?.is_submitting
              } // Disable button if the form cannot submit
            >
              {action}
            </Button>
          </Tooltip>
        )}
      />
    </>
  );
};

export default ExternalSubmitButton;
