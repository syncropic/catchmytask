import { Button, Tooltip } from "@mantine/core";
import { useAppStore, useTransientStore } from "src/store";
import { ReactElement, ComponentType } from "react";
import { ActionComponentProps } from "@components/interfaces";

interface ExternalSubmitButtonProps {
  record: any;
  entity_type: string;
  action: string;
  action_form_key?: string;
  invalidate_query_key?: string;
  // New prop for custom action component
  ActionComponent?: ComponentType<ActionComponentProps>;
  // Optional props to pass to the action component
  actionProps?: Record<string, any>;
}

export const ExternalSubmitButton = ({
  record,
  action,
  entity_type,
  ActionComponent,
  actionProps = {},
  action_form_key,
  invalidate_query_key,
}: ExternalSubmitButtonProps) => {
  const { forms } = useTransientStore();
  const { form_status, setActiveAction, setActiveInvalidateQueryKey } =
    useAppStore();
  const actionInputId = record?.id || "b79aaba2-a0d1-4fa7-9b68-0baebbd1b321";
  const formId = action_form_key || `${action}_${actionInputId}`;
  const formInstance = forms[formId]?.formInstance;

  if (!formInstance) {
    return (
      <div className="flex flex-col items-center">
        <div>form instance unavailable</div>
        <div>{formId}</div>
      </div>
    );
  }

  const handleClick = () => {
    if (formInstance?.handleSubmit) {
      // set the action before submitting - passe to backend route
      if (action) {
        setActiveAction({
          id: action,
          name: action,
        });
      }
      if (invalidate_query_key) {
        setActiveInvalidateQueryKey(invalidate_query_key);
      }
      formInstance.handleSubmit();
      formInstance.reset();
    } else {
      console.error(`No submit handler found for form ID: ${formId}`);
    }
  };

  // Render function to handle both custom component and default button
  const renderActionElement = (
    canSubmit: boolean,
    isSubmitting: boolean
  ): ReactElement => {
    const isDisabled =
      !canSubmit || isSubmitting || form_status[formId]?.is_submitting;
    const isLoading = form_status[formId]?.is_submitting;

    if (ActionComponent) {
      return (
        <ActionComponent
          onClick={handleClick}
          disabled={isDisabled}
          loading={isLoading}
          {...actionProps}
        >
          {action}
        </ActionComponent>
      );
    }

    // Default button if no custom component is provided
    return (
      <Button
        size="compact-sm"
        loading={isLoading}
        onClick={handleClick}
        color="green"
        disabled={isDisabled}
        {...actionProps}
      >
        {action}
      </Button>
    );
  };

  return (
    <formInstance.Subscribe
      selector={(state: { canSubmit: any; isSubmitting: any }) => [
        state.canSubmit,
        state.isSubmitting,
      ]}
    >
      {([canSubmit, isSubmitting]: [boolean, boolean]) => (
        <Tooltip
          label={`${action} ${entity_type} ${record?.id || ""}`}
          key={formId}
        >
          {renderActionElement(canSubmit, isSubmitting)}
        </Tooltip>
      )}
    </formInstance.Subscribe>
  );
};

export default ExternalSubmitButton;

// import { Button, Tooltip } from "@mantine/core";
// import { useAppStore, useTransientStore } from "src/store";

// interface ExternalSubmitButtonProps {
//   record: any;
//   entity_type: string;
//   action: string;
// }

// export const ExternalSubmitButton = ({
//   record,
//   action,
//   entity_type,
// }: ExternalSubmitButtonProps) => {
//   const { forms, getFormSubmitHandler } = useTransientStore();
//   // console.log("forms", forms["clone_action_steps:1u2jdt8lz28yc45drye0"]);
//   const { form_status } = useAppStore();
//   // const formId = `${focused_entities[record?.id]?.[action]}_${record?.id}`;
//   const actionInputId = record?.id || "b79aaba2-a0d1-4fa7-9b68-0baebbd1b321";

//   const formId = `${action}_${actionInputId}`;
//   // console.log("formId", formId);
//   // const submitForm = getFormSubmitHandler(formId);
//   // const submitForm = forms[formId]?.submitForm;
//   const formInstance = forms[formId]?.formInstance;
//   // const submitForm =
//   //   forms["clone_action_steps:1u2jdt8lz28yc45drye0"]?.submitForm;
//   // console.log("formInstance", formInstance?.store?.state?.isSubmitting);
//   // const isSubmitting = formInstance?.useStore((state) => state.isSubmitting);
//   // Properly subscribe to the form's store for isSubmitting state
//   // const isSubmitting = formInstance?.store?.useStore(
//   //   (state) => state.isSubmitting
//   // );
//   if (!formInstance) {
//     return <div className="flex flex-col items-center">
//       <div>form instance unavailable</div>
//       <div>{formId}</div></div>;
//   }

//   return (
//     <>
//       {/* <div>{JSON.stringify({ formId, action })}</div> */}
//       <formInstance.Subscribe
//         selector={(state: { canSubmit: any; isSubmitting: any }) => [
//           state.canSubmit,
//           state.isSubmitting,
//         ]} // Only track the state changes we care about
//         children={([canSubmit, isSubmitting]: [boolean, boolean]) => (
//           <Tooltip
//             label={`${action} ${entity_type} ${record?.id}`}
//             // position="top"
//             key={formId}
//           >
//             <Button
//               size="xs"
//               loading={form_status[formId]?.is_submitting}
//               onClick={() => {
//                 if (formInstance?.handleSubmit) {
//                   formInstance.handleSubmit(); // Trigger form submission
//                   // Optionally reset the form after a successful submission
//                   formInstance.reset();
//                 } else {
//                   console.error(
//                     `No submit handler found for form ID: ${formId}`
//                   );
//                 }
//               }}
//               color="green"
//               disabled={
//                 !canSubmit || isSubmitting || form_status[formId]?.is_submitting
//               } // Disable button if the form cannot submit
//             >
//               {action}
//             </Button>
//           </Tooltip>
//         )}
//       />
//     </>
//   );
// };

// export default ExternalSubmitButton;
