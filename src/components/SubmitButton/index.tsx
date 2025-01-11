// import { ActionIcon, Button, Tooltip } from "@mantine/core";
// import { useAppStore, useTransientStore } from "src/store";
// import { ReactElement, ComponentType } from "react";
// import { ActionComponentProps } from "@components/interfaces";
// import { iconMap } from "@components/Utils";
// import { IconCopy } from "@tabler/icons-react";

// interface ExternalSubmitButtonProps {
//   record: any;
//   entity_type: string;
//   action: string;
//   action_form_key?: string;
//   invalidate_query_key?: string;
//   view_item?: any;
//   // New prop for custom action component
//   ActionComponent?: ComponentType<ActionComponentProps>;
//   // Optional props to pass to the action component
//   actionProps?: Record<string, any>;
//   icon?: string;
//   reference_record?: any;
// }

// export const ExternalSubmitButton = ({
//   record,
//   action,
//   entity_type,
//   ActionComponent,
//   actionProps = {},
//   action_form_key,
//   invalidate_query_key,
//   view_item,
//   icon,
//   reference_record = {},
// }: ExternalSubmitButtonProps) => {
//   const { forms } = useTransientStore();
//   const {
//     form_status,
//     setActiveAction,
//     setActiveInvalidateQueryKey,
//     setActiveViewItem,
//   } = useAppStore();
//   const actionInputId = record?.id || "b79aaba2-a0d1-4fa7-9b68-0baebbd1b321";
//   const formId = action_form_key || `${action}_${actionInputId}`;
//   const formInstance = forms[formId]?.formInstance;

//   if (!formInstance) {
//     return null;
//     // return (
//     //   <div className="flex flex-col items-center">
//     //     <div>form instance unavailable</div>
//     //     <div>{formId}</div>
//     //   </div>
//     // );
//   }

//   const handleClick = () => {
//     if (formInstance?.handleSubmit) {
//       // set the action before submitting - passe to backend route
//       if (action) {
//         setActiveAction({
//           id: action,
//           name: action,
//           reference_record: reference_record,
//         });
//       }
//       if (view_item) {
//         setActiveViewItem(view_item);
//       }
//       if (invalidate_query_key) {
//         setActiveInvalidateQueryKey(invalidate_query_key);
//       }
//       formInstance.handleSubmit();
//       formInstance.reset();
//     } else {
//       console.error(`No submit handler found for form ID: ${formId}`);
//     }
//   };

//   // Render function to handle both custom component and default button
//   const renderActionElement = (
//     canSubmit: boolean,
//     isSubmitting: boolean
//   ): ReactElement => {
//     const isDisabled =
//       !canSubmit || isSubmitting || form_status[formId]?.is_submitting;
//     const isLoading = form_status[formId]?.is_submitting;

//     if (ActionComponent) {
//       return (
//         <ActionComponent
//           onClick={handleClick}
//           disabled={isDisabled}
//           loading={isLoading}
//           {...actionProps}
//         >
//           {action}
//         </ActionComponent>
//       );
//     }
//     if (icon) {
//       const IconComponent = iconMap[icon];
//       return (
//         <ActionIcon
//           aria-label={icon}
//           size="xs"
//           onClick={handleClick}
//           disabled={isDisabled}
//           loading={isLoading}
//           {...actionProps}
//           // onClick={(e) =>
//           //   component?.onClick(
//           //     e,
//           //     component?.record,
//           //     component?.entity_type,
//           //     component?.action,
//           //     component?.type
//           //   )
//           // }
//           // {...{
//           //   variant:
//           //     focused_entities[component?.record?.id]?.[component?.type] ===
//           //     component?.action
//           //       ? "filled"
//           //       : "outline",
//           // }}
//         >
//           {/* {IconComponent && <IconComponent size={16} />} Render the icon */}
//           <IconCopy size={24} />
//         </ActionIcon>
//       );
//     }

//     // Default button if no custom component is provided
//     return (
//       <Button
//         size="compact-xs"
//         loading={isLoading}
//         onClick={handleClick}
//         color="green"
//         disabled={isDisabled}
//         {...actionProps}
//       >
//         {action}
//       </Button>
//     );
//   };

//   return (
//     <formInstance.Subscribe
//       selector={(state: { canSubmit: any; isSubmitting: any }) => [
//         state.canSubmit,
//         state.isSubmitting,
//       ]}
//     >
//       {([canSubmit, isSubmitting]: [boolean, boolean]) => (
//         <Tooltip
//           label={`${action} ${entity_type} ${record?.id || ""}`}
//           key={formId}
//         >
//           {renderActionElement(canSubmit, isSubmitting)}
//         </Tooltip>
//       )}
//     </formInstance.Subscribe>
//   );
// };

// export default ExternalSubmitButton;

import { ActionIcon, Button, Tooltip, Group } from "@mantine/core";
import { useAppStore, useTransientStore } from "src/store";
import { ReactElement, ComponentType, useState } from "react";
import { ActionComponentProps } from "@components/interfaces";
import { iconMap } from "@components/Utils";
import { IconCopy, IconX } from "@tabler/icons-react";

interface ExternalSubmitButtonProps {
  record: any;
  entity_type: string;
  action: string;
  action_form_key?: string;
  invalidate_query_key?: string;
  view_item?: any;
  ActionComponent?: ComponentType<ActionComponentProps>;
  actionProps?: Record<string, any>;
  icon?: string;
  reference_record?: any;
}

export const ExternalSubmitButton = ({
  record,
  action,
  entity_type,
  ActionComponent,
  actionProps = {},
  action_form_key,
  invalidate_query_key,
  view_item,
  icon,
  reference_record = {},
}: ExternalSubmitButtonProps) => {
  const { forms } = useTransientStore();
  const {
    form_status,
    setActiveAction,
    setActiveInvalidateQueryKey,
    setActiveViewItem,
    setFormStatus, // Add this if not already in useAppStore
  } = useAppStore();

  // const actionInputId = record?.id || "b79aaba2-a0d1-4fa7-9b68-0baebbd1b321";
  // const formId = action_form_key || `${action}_${actionInputId}`;
  let formId = action_form_key || "general";
  const formInstance = forms[formId]?.formInstance;

  if (!formInstance) {
    return null;
  }

  const handleCancel = () => {
    // Reset form status
    setFormStatus(formId, {
      is_submitting: false,
      error: "Request cancelled",
    });

    // Reset form
    formInstance.reset();

    // Clear active states
    setActiveAction(null);
    setActiveInvalidateQueryKey(null);
    setActiveViewItem(null);
  };

  const handleClick = () => {
    if (formInstance?.handleSubmit) {
      if (action) {
        setActiveAction({
          id: action,
          name: action,
          reference_record: reference_record,
          entity_type: entity_type,
        });
      }
      if (view_item) {
        setActiveViewItem(view_item);
      }
      if (invalidate_query_key) {
        setActiveInvalidateQueryKey(invalidate_query_key);
      }
      formInstance.handleSubmit();
    } else {
      console.error(`No submit handler found for form ID: ${formId}`);
    }
  };

  const renderActionElement = (
    canSubmit: boolean,
    isSubmitting: boolean
  ): ReactElement => {
    const isDisabled =
      !canSubmit || isSubmitting || form_status[formId]?.is_submitting;
    const isLoading = form_status[formId]?.is_submitting;

    if (ActionComponent) {
      return (
        <Group gap="xs">
          <ActionComponent
            onClick={handleClick}
            disabled={isDisabled}
            loading={isLoading}
            {...actionProps}
          >
            {action}
          </ActionComponent>
          {isLoading && (
            <Button
              size="compact-xs"
              color="red"
              onClick={handleCancel}
              leftSection={<IconX size={16} />}
            >
              Cancel
            </Button>
          )}
        </Group>
      );
    }

    if (icon) {
      return (
        <Group gap="xs">
          <ActionIcon
            aria-label={icon}
            size="xs"
            onClick={handleClick}
            disabled={isDisabled}
            loading={isLoading}
            {...actionProps}
          >
            <IconCopy size={24} />
          </ActionIcon>
          {isLoading && (
            <ActionIcon
              size="xs"
              color="red"
              onClick={handleCancel}
              aria-label="Cancel"
            >
              <IconX size={24} />
            </ActionIcon>
          )}
        </Group>
      );
    }

    return (
      <Group gap="xs">
        <Button
          size="compact-xs"
          loading={isLoading}
          onClick={handleClick}
          color="green"
          disabled={isDisabled}
          {...actionProps}
        >
          {action}
        </Button>
        {isLoading && (
          <Button
            size="compact-xs"
            color="red"
            onClick={handleCancel}
            leftSection={<IconX size={16} />}
          >
            Cancel
          </Button>
        )}
      </Group>
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
