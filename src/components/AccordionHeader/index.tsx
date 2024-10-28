import ComponentsToolbar from "@components/ComponentsToolbar";
import MonacoEditor from "@components/MonacoEditor";
import Reveal from "@components/Reveal";
import ExternalSubmitButton from "@components/SubmitButton";
import { useUpdateComponentAction } from "@components/Utils";
import { MultiSelect, Select, Text, TextInput } from "@mantine/core";
import { Carousel } from "@mantine/carousel";
import { useAppStore } from "src/store";
import SearchInput from "@components/SearchInput";

interface AccordionHeaderProps {
  name?: string; // Adjust the type as needed
  entity_type?: string;
}

const AccordionHeader: React.FC<AccordionHeaderProps> = ({
  name,
  entity_type,
}) => {
  const {
    activeTask,
    selectedRecords,
    focused_entities,
    action_modes,
    action_mode,
    setActionModes,
    setActionMode,
    activeAgent,
    setActiveAgent,
    activeView,
  } = useAppStore();
  let action = focused_entities[activeTask?.id]?.["action"];
  const { updateComponentAction } = useUpdateComponentAction();

  const handleChangeAgent = (option: any) => {
    console.log(`selected item option`);
    console.log(option);

    // let component = {
    //   record: activeTask,
    //   entity_type: entity_type || "action_steps",
    //   action: "search", // tapping in to the search form instance
    //   type: "action",
    // };
    // // console.log(item);
    // updateComponentAction(
    //   null,
    //   component?.record,
    //   component?.entity_type,
    //   component?.action,
    //   component?.type
    // );
    setActiveAgent(option);
  };

  // let data = [
  //   {
  //     value: "chat",
  //     label: "chat",
  //   },
  //   {
  //     value: "default",
  //     label: "default",
  //   },
  // ];

  return (
    <div className="flex justify-between items-center">
      {/* <div>{name}</div> */}

      <div className="p-3" onClick={(e) => e.stopPropagation()}>
        {/* {activeTask && (
          <div className="flex items-center gap-2">
            <div className="pr-3">
              <ComponentsToolbar
                include_components={[
                  {
                    action: "save",
                    entity_type: entity_type || "action_steps",
                    type: "action",
                    record: activeTask,
                    onClick: updateComponentAction,
                  },
                  {
                    action: "upload",
                    entity_type: entity_type || "action_steps",
                    type: "action",
                    record: activeTask,
                    onClick: updateComponentAction,
                  },
                ]}
              />
              
            </div>
          </div>
        )} */}
        {/* <Select
          // placeholder="select query mode"
          description="select query mode"
          value={action_mode}
          onChange={handleChangeQueryModes}
          size="sm"
          // data={["default", "chat", "chat + filters"]}
          data={["default", "chat"]}
          // data={data}
          searchable={true}
          clearable={true}
          // maxValues={1}
        ></Select> */}
        <SearchInput
          placeholder="agents"
          description="agents"
          handleOptionSubmit={handleChangeAgent}
          value={activeAgent?.id || ""}
          include_action_icons={activeAgent?.id ? ["filter"] : []}
          // navigateOnSelect={{ resource: "views" }}
          // navigateOnClear={{ resource: "home" }}
          activeFilters={[
            {
              id: 1,
              name: "tasks",
              description: "tasks",
              entity_type: "tasks",
              metadata: {
                is_agent: true,
              },
              is_selected: true,
            },
          ]}
        />
      </div>

      <div className="pr-3">
        <ComponentsToolbar
          include_components={[
            // {
            //   action: "search",
            //   entity_type: "action_steps",
            //   type: "action",
            //   record: activeTask,
            //   onClick: updateComponentAction,
            // },
            {
              action: "save",
              entity_type: entity_type || "action_steps",
              type: "action",
              record: activeTask,
              onClick: updateComponentAction,
            },
            {
              action: "upload",
              entity_type: entity_type || "action_steps",
              type: "action",
              record: activeTask,
              onClick: updateComponentAction,
            },
            // {
            //   action: "execute",
            //   entity_type: "action_steps",
            //   type: "action",
            //   record: activeTask,
            //   onClick: updateComponentAction,
            // },
          ]}
        />
      </div>
    </div>
  );
};

export default AccordionHeader;
