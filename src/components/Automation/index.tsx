import ActionInputWrapper from "@components/ActionInput";
import { FilterItem } from "@components/interfaces";
import Reveal from "@components/Reveal";
import {
  ActionIcon,
  Badge,
  Checkbox,
  Tooltip,
  Indicator,
  Button,
  Accordion,
  Tabs,
} from "@mantine/core";
import {
  IconFilter,
  IconSearch,
  IconSettings,
  IconSettingsAutomation,
} from "@tabler/icons-react";
import { useAppStore } from "src/store";

const Automation = () => {
  const { activeSession } = useAppStore();

  // Ensure TypeScript knows searchFilters is an array of FilterItem objects
  // const activeFiltersCount = searchFilters.filter(
  //   (filter: FilterItem) => filter.is_selected
  // ).length;

  // const handleCheckboxChange = (itemId: number) => {
  //   const updatedFilters = searchFilters.map((filter: FilterItem) =>
  //     filter.id === itemId
  //       ? { ...filter, is_selected: !filter.is_selected }
  //       : filter
  //   );
  //   setSearchFilters(updatedFilters);
  // };

  return (
    <Reveal
      target={
        <Indicator inline label="on" size={16} color="blue">
          <Tooltip label="configure and view automation" position="right">
            <ActionIcon aria-label="filter" size="sm">
              <IconSettingsAutomation />
            </ActionIcon>
          </Tooltip>
        </Indicator>
      }
      trigger="click"
    >
      {/* <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {searchFilters.map((item: FilterItem) => (
          <Checkbox
            checked={item.is_selected}
            label={item.description}
            key={item.id}
            onChange={() => handleCheckboxChange(item.id)}
          />
        ))}
      </div> */}
      <Accordion defaultValue={["automation_config"]} multiple={true}>
        <Accordion.Item key="automation_config" value="automation_config">
          <Accordion.Control icon={<IconSettingsAutomation size={16} />}>
            Automation Config
          </Accordion.Control>
          <Accordion.Panel>
            <Tabs defaultValue="basic" orientation="vertical">
              <Tabs.List>
                <Tabs.Tab value="basic">Basic</Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="basic">
                <div className="p-3">
                  <ActionInputWrapper
                    name="automation_config"
                    query_name="data_model"
                    exclude_components={["input_mode", "submit_button"]}
                    success_message_code="automation_action_input_data_model_schema"
                    update_action_input_form_values_on_submit_success={true}
                  ></ActionInputWrapper>
                </div>
              </Tabs.Panel>
            </Tabs>
          </Accordion.Panel>
        </Accordion.Item>

        {/* <Accordion.Item key="session_config" value="session_config">
          <Accordion.Control icon={<IconSettings size={16} />}>
            Session Config
          </Accordion.Control>
          <Accordion.Panel>
            <Tabs defaultValue="basic" orientation="vertical">
              <Tabs.List>
                <Tabs.Tab value="basic">Basic</Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="basic">
                <div className="p-3">
                  <ActionInputWrapper
                    name="session_config"
                    query_name="data_model"
                    record={activeSession}
                    exclude_components={["input_mode", "submit_button"]}
                    success_message_code="session_action_input_data_model_schema"
                    update_action_input_form_values_on_submit_success={true}
                  ></ActionInputWrapper>
                </div>
              </Tabs.Panel>
            </Tabs>
          </Accordion.Panel>
        </Accordion.Item> */}

        {/* <div className="flex m-3 justify-end">
                <Button>Submit</Button>
              </div> */}
      </Accordion>
    </Reveal>
  );
};

export default Automation;
