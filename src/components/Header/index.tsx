import React, { useState, useEffect } from "react";
import LayoutToggle from "@components/Layout/LayoutToggle";
import UserMenu from "@components/Layout/UserMenu";
import { LogoName } from "@components/LogoName/LogoName";
import {
  getLabel,
  getTooltipLabel,
  useFetchDomainDataByDomain,
  useIsMobile,
  useUpdateComponentAction,
} from "@components/Utils";
import {
  useActiveAuthProvider,
  useGetIdentity,
  useGo,
  useParsed,
} from "@refinedev/core";
import { useAppStore } from "src/store";
import SearchBar from "@components/SearchBar";
import QuickActionsBar from "@components/QuickActionsBar";
import ColorSchemeToggle from "@components/ColorSchemeToggle";
import AutomationsToggle from "@components/AutomationsToggle";

import {
  ActionIcon,
  Tooltip,
  Text,
  Button,
  Popover,
  Indicator,
  Select,
  Group,
  Checkbox,
  Stack,
  TextInput,
  Switch,
} from "@mantine/core";
import {
  IconChartDots3,
  IconClock,
  IconCode,
  IconDatabase,
  IconHttpGet,
  IconIconsOff,
  IconLetterB,
  IconMail,
  IconMenu2,
  IconPlus,
  IconSettingsAutomation,
  IconTerminal,
  IconEye,
  IconMoonStars,
  IconBell,
  IconDeviceFloppy,
  IconFileReport,
  IconFolder,
  IconListCheck,
  IconToggleRight,
  IconFilter,
} from "@tabler/icons-react";
import SearchInput from "@components/SearchInput";
import Reveal from "@components/Reveal";
import MonacoEditor from "@components/MonacoEditor";
import PinActionStepsToggle from "@components/PinActionStepsToggle";
import CustomTooltipComponent from "@components/CustomTooltipComponent";
import ComponentsToolbar from "@components/ComponentsToolbar";
import ExternalSubmitButton from "@components/SubmitButton";
import { useViewportSize } from "@mantine/hooks";
import SectionsToggle from "@components/SectionsToggle";
import { signIn, useSession } from "next-auth/react";
import { useDomainData } from "@components/Utils/useDomainData";
import SessionsWrapper from "@components/Sessions";
import SearchBox from "@components/SearchBox";

interface HeaderComponentProps {
  authenticatedData?: any;
  activeApplication?: any;
  applicationData?: any;
  go?: any;
}

// Function to initialize header state with defaults if needed
const initializeHeaderState = () => {
  const {
    show,
    setShow,
    switches,
    setSwitches,
    createItems,
    setCreateItems,
    filters,
    setFilters,
  } = useAppStore.getState();

  // Initialize show state if empty
  if (!show || !show.available_items || show.available_items.length === 0) {
    setShow({
      selected_items: ["active_item", "selected_items"], // Default visible sections
      search_results: [],
      available_items: [
        { id: "selected_items", label: "Selected Items" },
        { id: "search_results", label: "Search Results" },
        { id: "active_item", label: "Active Item" },
      ],
    });
  }

  // Initialize switches state if empty
  if (
    !switches ||
    !switches.available_items ||
    switches.available_items.length === 0
  ) {
    setSwitches({
      enabled_items: [], // No features enabled by default
      search_results: [],
      available_items: [
        { id: "developer", label: "Developer Mode", icon: "IconCode" },
      ],
    });
  }

  // Initialize createItems state if empty
  if (
    !createItems ||
    !createItems.available_items ||
    createItems.available_items.length === 0
  ) {
    setCreateItems({
      recent_items: [],
      count: 0,
      available_items: [
        { id: "document", label: "Session", icon: "IconDatabase" },
        { id: "script", label: "Function", icon: "IconTerminal" },
      ],
    });
  }

  // Initialize filters state if empty
  if (
    !filters ||
    !filters.available_items ||
    filters.available_items.length === 0
  ) {
    setFilters({
      active_filters: [], // No filters enabled by default
      search_results: [],
      available_items: [
        { id: "date_created", label: "Date Created", type: "date" },
        { id: "date_modified", label: "Date Modified", type: "date" },
        {
          id: "status",
          label: "Status",
          type: "select",
          options: ["Active", "Archived", "Draft"],
        },
        {
          id: "type",
          label: "Type",
          type: "select",
          options: ["Document", "Script", "Function"],
        },
        { id: "owner", label: "Owner", type: "text" },
      ],
    });
  }
};

const LargeScreenHeader = ({
  applicationData,
  authenticatedData,
  activeApplication,
  go,
}: HeaderComponentProps) => {
  const {
    sessionConfig,
    setSessionConfig,
    activeLayout,
    setActiveLayout,
    activeTask,
    activeSession,
    activeView,
    focused_entities,
    activeProfile,
    clearViews,
    showRequestResponseView,
    setShowRequestResponseView,
    views,
    setMonitorComponents,
    toggleShowSessionWorkingMemory,
    showSessionWorkingMemory,
    global_session_trace_mode,
    toggleGlobalSessionTraceMode,
    global_input_mode,
    setGlobalInputMode,
    setDisplaySessionEmbedMonitor,
    // Enhanced state hooks
    show,
    setShow,
    addSelectedSection,
    removeSelectedSection,
    toggleSelectedSection,
    switches,
    setSwitches,
    toggleFeature,
    createItems,
    setCreateItems,
    trackCreatedItem,
    // Filters state hooks (add these to your useAppStore)
    filters,
    setFilters,
    toggleFilter,
  } = useAppStore();

  // Initialize header state on component mount
  useEffect(() => {
    initializeHeaderState();
  }, []);

  // Local state for popover control and search queries
  const [showPopoverOpened, setShowPopoverOpened] = useState(false);
  const [switchesPopoverOpened, setSwitchesPopoverOpened] = useState(false);
  const [createPopoverOpened, setCreatePopoverOpened] = useState(false);
  const [filtersPopoverOpened, setFiltersPopoverOpened] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [switchSearchQuery, setSwitchSearchQuery] = useState("");
  const [createSearchQuery, setCreateSearchQuery] = useState("");
  const [filterSearchQuery, setFilterSearchQuery] = useState("");
  const [filterValues, setFilterValues] = useState({});

  const { updateComponentAction } = useUpdateComponentAction();
  let action = focused_entities[activeTask?.id]?.["action"];
  const { width } = useViewportSize();
  const { data: user_session } = useSession();
  const authProvider = useActiveAuthProvider();
  const { params } = useParsed();

  // Filter sections based on search query
  const filteredSections = searchQuery
    ? (show?.available_items || []).filter((section) =>
        section.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : show?.available_items || [];

  // Filter switch items based on search query
  const filteredSwitchItems = switchSearchQuery
    ? (switches?.available_items || []).filter((item) =>
        item.label.toLowerCase().includes(switchSearchQuery.toLowerCase())
      )
    : switches?.available_items || [];

  // Filter create items based on search query
  const filteredCreateItems = createSearchQuery
    ? (createItems?.available_items || []).filter((item) =>
        item.label.toLowerCase().includes(createSearchQuery.toLowerCase())
      )
    : createItems?.available_items || [];

  // Filter filter items based on search query
  const filteredFilterItems = filterSearchQuery
    ? (filters?.available_items || []).filter((item) =>
        item.label.toLowerCase().includes(filterSearchQuery.toLowerCase())
      )
    : filters?.available_items || [];

  const { data: user } = useGetIdentity({
    v3LegacyAuthProviderCompatible: Boolean(authProvider?.isLegacy),
  });
  const isMobile = useIsMobile();
  let global_input_mode_developer =
    global_input_mode === "developer" ? true : false;

  const hasPermission = (permission: string): boolean => {
    return Boolean(
      user_session?.userProfile?.permissions?.includes(permission)
    );
  };

  const handleClearViews = () => {
    go({
      query: {
        profile_id: String(activeProfile?.id),
      },
      type: "push",
    });
    setShowRequestResponseView(false);
    clearViews({});
  };

  // handle toggleDisplay
  const toggleDisplay = (section: string) => {
    if (activeLayout) {
      const newLayout = { ...activeLayout };
      newLayout[section].isDisplayed = !newLayout[section].isDisplayed;
      setActiveLayout(newLayout);
    }
  };

  const toggleSessionInteractionMode = (mode: string) => {
    if (sessionConfig) {
      const newSessionConfig = { ...sessionConfig };
      let currentInteractionMode = newSessionConfig["interaction_mode"];
      if (mode) {
        newSessionConfig["interaction_mode"] =
          currentInteractionMode === mode ? "interactive" : mode;
      }
      setSessionConfig(newSessionConfig);
    }
  };

  const toggleShowRequestResponseView = () => {
    setShowRequestResponseView(!showRequestResponseView);
  };

  const handleMenuNavigate = (item: any) => {
    go({
      to: {
        resource: item?.entity_type,
        action: item?.action_type,
        id: item?.id,
      },
      type: "push",
    });
    setMonitorComponents(["messages"]);
  };

  const handleToggleGlobalInputMode = (mode: any) => {
    if (mode == "developer") {
      setGlobalInputMode(
        global_input_mode === "developer" ? "user" : "developer"
      );

      setShowRequestResponseView(
        global_input_mode === "developer" ? false : true
      );
      setDisplaySessionEmbedMonitor(
        global_input_mode === "developer" ? false : true
      );
    }

    if (mode == "terminal") {
      setGlobalInputMode(
        global_input_mode === "terminal" ? "user" : "terminal"
      );
    }
  };

  // Function to check if section is selected
  const isSectionSelected = (sectionId) => {
    return show?.selected_items?.includes(sectionId) || false;
  };

  // Function to check if feature is enabled
  const isFeatureEnabled = (featureId) => {
    return switches?.enabled_items?.includes(featureId) || false;
  };

  // Function to check if filter is active
  const isFilterActive = (filterId) => {
    return (
      filters?.active_filters?.some((filter) => filter.id === filterId) || false
    );
  };

  // Handle checkbox changes for show options
  const handleShowOptionChange = (sectionId) => {
    toggleSelectedSection(sectionId);

    // Update search results for persistence
    setShow((current) => ({
      ...current,
      search_results: filteredSections.map((s) => s.id),
    }));
  };

  // Handle switch toggles
  const handleSwitchToggle = (featureId) => {
    toggleFeature(featureId);

    // Update search results for persistence
    setSwitches((current) => ({
      ...current,
      search_results: filteredSwitchItems.map((item) => item.id),
    }));

    // Special handling for specific features
    if (featureId === "developer") {
      handleToggleGlobalInputMode("developer");
    } else if (featureId === "dark_mode") {
      // Handle dark mode toggle if you have theme functionality
      // toggleTheme();
    }
  };

  // Handle filter toggles and values
  const handleFilterToggle = (filterId) => {
    const filterItem = filters?.available_items.find(
      (item) => item.id === filterId
    );
    if (!filterItem) return;

    // If filter is already active, remove it
    if (isFilterActive(filterId)) {
      setFilters((current) => ({
        ...current,
        active_filters: current.active_filters.filter((f) => f.id !== filterId),
      }));
    } else {
      // Add the filter with its current value
      const value =
        filterValues[filterId] ||
        (filterItem.type === "select" && filterItem.options
          ? filterItem.options[0]
          : "");

      setFilters((current) => ({
        ...current,
        active_filters: [
          ...current.active_filters,
          { id: filterId, value: value },
        ],
      }));
    }

    // Update search results for persistence
    setFilters((current) => ({
      ...current,
      search_results: filteredFilterItems.map((item) => item.id),
    }));
  };

  // Handle filter value changes
  const handleFilterValueChange = (filterId, value) => {
    // Update local state
    setFilterValues((current) => ({
      ...current,
      [filterId]: value,
    }));

    // If this filter is already active, update its value
    if (isFilterActive(filterId)) {
      setFilters((current) => ({
        ...current,
        active_filters: current.active_filters.map((f) =>
          f.id === filterId ? { ...f, value } : f
        ),
      }));
    }
  };

  // Handle creating a new item
  const handleCreateItem = (itemId) => {
    console.log(`Creating new ${itemId}`);

    // Track this item in recent items
    trackCreatedItem(itemId);

    // Here you would typically navigate to a creation form or open a modal
    switch (itemId) {
      case "document":
        go({
          to: { resource: "documents", action: "create" },
          type: "push",
        });
        break;
      case "script":
        go({
          to: { resource: "scripts", action: "create" },
          type: "push",
        });
        break;
      case "report":
        go({
          to: { resource: "reports", action: "create" },
          type: "push",
        });
        break;
      case "folder":
        go({
          to: { resource: "folders", action: "create" },
          type: "push",
        });
        break;
      case "task":
        go({
          to: { resource: "tasks", action: "create" },
          type: "push",
        });
        break;
      default:
        // Default handling
        console.log(
          `No specific handler for creating ${itemId}, using generic approach`
        );
        go({
          to: { resource: itemId + "s", action: "create" },
          type: "push",
        });
    }

    // Close popover after selection
    setCreatePopoverOpened(false);
  };

  // Icon mapping function to dynamically render icons
  const renderIcon = (iconName, size = 14) => {
    switch (iconName) {
      case "IconDatabase":
        return <IconDatabase size={size} />;
      case "IconTerminal":
        return <IconTerminal size={size} />;
      case "IconFileReport":
        return <IconFileReport size={size} />;
      case "IconFolder":
        return <IconFolder size={size} />;
      case "IconListCheck":
        return <IconListCheck size={size} />;
      case "IconCode":
        return <IconCode size={size} />;
      case "IconMoonStars":
        return <IconMoonStars size={size} />;
      case "IconBell":
        return <IconBell size={size} />;
      case "IconDeviceFloppy":
        return <IconDeviceFloppy size={size} />;
      case "IconFilter":
        return <IconFilter size={size} />;
      default:
        return <IconIconsOff size={size} />;
    }
  };

  // Render filter input based on type
  const renderFilterInput = (filter) => {
    const value =
      filterValues[filter.id] ||
      (isFilterActive(filter.id)
        ? filters.active_filters.find((f) => f.id === filter.id)?.value
        : "");

    switch (filter.type) {
      case "select":
        return (
          <Select
            size="xs"
            data={filter.options || []}
            value={value}
            onChange={(newValue) =>
              handleFilterValueChange(filter.id, newValue)
            }
            placeholder={`Select ${filter.label.toLowerCase()}`}
          />
        );
      case "date":
        return (
          <TextInput
            size="xs"
            type="date"
            value={value}
            onChange={(e) =>
              handleFilterValueChange(filter.id, e.currentTarget.value)
            }
          />
        );
      case "text":
      default:
        return (
          <TextInput
            size="xs"
            value={value}
            onChange={(e) =>
              handleFilterValueChange(filter.id, e.currentTarget.value)
            }
            placeholder={`Enter ${filter.label.toLowerCase()}`}
          />
        );
    }
  };

  return (
    <div className="flex items-center h-full">
      <div className="flex items-center">
        <LogoName
          logoLink="/"
          logoURL={applicationData.logo_image_url}
          companyName={
            applicationData.name || activeApplication?.name || "APP NAME"
          }
          authenticatedData={authenticatedData}
          iconName={applicationData.logo_icon_name}
          handleClickHome={() => {
            console.log("click logo");
            // go({
            //   to: "/",
            //   type: "push",
            // });
          }}
        />

        {/* Show Popover */}
        <Popover
          opened={showPopoverOpened}
          onChange={setShowPopoverOpened}
          width={320}
          position="bottom-start"
          shadow="md"
          withArrow
          trapFocus
          closeOnEscape={true}
          closeOnClickOutside={true}
        >
          <Popover.Target>
            <Tooltip
              label={`${
                show?.selected_items?.length > 0
                  ? "Manage visible sections"
                  : "Show sections"
              }`}
            >
              <Indicator
                inline
                size={16}
                disabled={!(show?.selected_items?.length > 0)}
                color="blue"
                offset={4}
              >
                <Button
                  size="compact-xs"
                  leftSection={<IconEye size={14} />}
                  variant={
                    show?.selected_items?.length > 0 ? "filled" : "outline"
                  }
                  onClick={() => setShowPopoverOpened((o) => !o)}
                >
                  Show
                </Button>
              </Indicator>
            </Tooltip>
          </Popover.Target>

          <Popover.Dropdown>
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <h3 style={{ marginTop: 0, marginBottom: 0 }}>
                  Visible Sections
                </h3>
                <Button
                  size="compact-xs"
                  variant="subtle"
                  onClick={() => setShowPopoverOpened(false)}
                  style={{ marginLeft: "auto" }}
                >
                  ✕
                </Button>
              </div>

              <TextInput
                placeholder="Search sections..."
                mb="md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
              />

              <Stack spacing="xs">
                {filteredSections.map((section) => (
                  <Checkbox
                    key={section.id}
                    label={section.label}
                    checked={isSectionSelected(section.id)}
                    onChange={() => handleShowOptionChange(section.id)}
                  />
                ))}
              </Stack>
            </div>
          </Popover.Dropdown>
        </Popover>

        {/* Switches Popover */}
        <Popover
          width={320}
          position="bottom-start"
          shadow="md"
          withArrow
          opened={switchesPopoverOpened}
          onChange={setSwitchesPopoverOpened}
          closeOnEscape={true}
          closeOnClickOutside={true}
        >
          <Popover.Target>
            <Tooltip label="Toggle features">
              <Indicator
                inline
                size={16}
                disabled={!(switches?.enabled_items?.length > 0)}
                color="green"
                offset={4}
                className="ml-2"
              >
                <Button
                  size="compact-xs"
                  leftSection={<IconToggleRight size={14} />}
                  variant={
                    switches?.enabled_items?.length > 0 ? "filled" : "outline"
                  }
                  onClick={() => setSwitchesPopoverOpened((o) => !o)}
                >
                  Switch
                </Button>
              </Indicator>
            </Tooltip>
          </Popover.Target>

          <Popover.Dropdown>
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <h3 style={{ marginTop: 0, marginBottom: 0 }}>
                  Toggle Features
                </h3>
                <Button
                  size="compact-xs"
                  variant="subtle"
                  onClick={() => setSwitchesPopoverOpened(false)}
                  style={{ marginLeft: "auto" }}
                >
                  ✕
                </Button>
              </div>

              <TextInput
                placeholder="Search features..."
                mb="md"
                value={switchSearchQuery}
                onChange={(e) => setSwitchSearchQuery(e.currentTarget.value)}
              />

              <Stack spacing="md">
                {filteredSwitchItems.map((item) => (
                  <Group key={item.id} position="apart" spacing="xl">
                    <Group spacing="xs">
                      {renderIcon(item.icon)}
                      <Text size="sm">{item.label}</Text>
                    </Group>
                    <Switch
                      checked={isFeatureEnabled(item.id)}
                      onChange={() => handleSwitchToggle(item.id)}
                      size="md"
                    />
                  </Group>
                ))}
              </Stack>
            </div>
          </Popover.Dropdown>
        </Popover>

        {/* Create Popover */}
        <Popover
          width={320}
          position="bottom-start"
          shadow="md"
          withArrow
          opened={createPopoverOpened}
          onChange={setCreatePopoverOpened}
          closeOnEscape={true}
          closeOnClickOutside={true}
        >
          <Popover.Target>
            <Tooltip label="Create new items">
              <Button
                size="compact-xs"
                leftSection={<IconPlus size={14} />}
                variant="outline"
                className="ml-2"
                onClick={() => setCreatePopoverOpened((o) => !o)}
              >
                Create
              </Button>
            </Tooltip>
          </Popover.Target>

          <Popover.Dropdown>
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <h3 style={{ marginTop: 0, marginBottom: 0 }}>Create New</h3>
                <Button
                  size="compact-xs"
                  variant="subtle"
                  onClick={() => setCreatePopoverOpened(false)}
                  style={{ marginLeft: "auto" }}
                >
                  ✕
                </Button>
              </div>

              <TextInput
                placeholder="Search items..."
                mb="md"
                value={createSearchQuery}
                onChange={(e) => setCreateSearchQuery(e.currentTarget.value)}
              />

              {/* Recent Items (if any) */}
              {createItems?.recent_items &&
                createItems.recent_items.length > 0 && (
                  <>
                    <Text size="xs" color="dimmed" mb="xs">
                      Recent
                    </Text>
                    <Group mb="md" spacing="xs">
                      {createItems.recent_items.slice(0, 3).map((itemId) => {
                        const item = createItems.available_items.find(
                          (i) => i.id === itemId
                        );
                        if (!item) return null;

                        return (
                          <Button
                            key={item.id}
                            variant="light"
                            size="xs"
                            leftSection={renderIcon(item.icon, 12)}
                            onClick={() => handleCreateItem(item.id)}
                          >
                            {item.label}
                          </Button>
                        );
                      })}
                    </Group>
                  </>
                )}

              <Stack spacing="xs">
                {filteredCreateItems.map((item) => (
                  <Button
                    key={item.id}
                    variant="light"
                    leftSection={renderIcon(item.icon)}
                    fullWidth
                    justify="flex-start"
                    onClick={() => handleCreateItem(item.id)}
                  >
                    {item.label}
                  </Button>
                ))}
              </Stack>
            </div>
          </Popover.Dropdown>
        </Popover>
      </div>

      {authenticatedData?.authenticated && (
        <div className="w-full max-w-3xl pr-3 pl-3">
          <SessionsWrapper
            func_name="fetch_system_sessions"
            view_id="views:36xo8keq9tsoyly68shk"
            title="monitor"
            display_mode="search_input"
            actions={user_session?.userProfile?.session_actions || []}
            // actions={[]}
            success_message_code="fetch_system_sessions"
          />
        </div>
      )}

      {authenticatedData?.authenticated && (
        <div className="w-full max-w-3xl pr-3 pl-3 flex items-center">
          {/* <SearchBox /> */}

          {/* Filters Popover */}
          <Popover
            width={320}
            position="bottom-start"
            shadow="md"
            withArrow
            opened={filtersPopoverOpened}
            onChange={setFiltersPopoverOpened}
            closeOnEscape={true}
            closeOnClickOutside={true}
          >
            <Popover.Target>
              <Tooltip label="Apply filters">
                <Indicator
                  inline
                  size={16}
                  disabled={!(filters?.active_filters?.length > 0)}
                  color="orange"
                  offset={4}
                  className="ml-2"
                >
                  <Button
                    size="compact-xs"
                    leftSection={<IconFilter size={14} />}
                    variant={
                      filters?.active_filters?.length > 0 ? "filled" : "outline"
                    }
                    onClick={() => setFiltersPopoverOpened((o) => !o)}
                  >
                    Filters
                  </Button>
                </Indicator>
              </Tooltip>
            </Popover.Target>

            <Popover.Dropdown>
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <h3 style={{ marginTop: 0, marginBottom: 0 }}>
                    Search Filters
                  </h3>
                  <Button
                    size="compact-xs"
                    variant="subtle"
                    onClick={() => setFiltersPopoverOpened(false)}
                    style={{ marginLeft: "auto" }}
                  >
                    ✕
                  </Button>
                </div>

                <TextInput
                  placeholder="Search filters..."
                  mb="md"
                  value={filterSearchQuery}
                  onChange={(e) => setFilterSearchQuery(e.currentTarget.value)}
                />

                {/* Active Filters (if any) */}
                {filters?.active_filters &&
                  filters.active_filters.length > 0 && (
                    <>
                      <Text size="xs" color="dimmed" mb="xs">
                        Active Filters
                      </Text>
                      <Group mb="md" spacing="xs">
                        {filters.active_filters.slice(0, 3).map((filter) => {
                          const filterItem = filters.available_items.find(
                            (i) => i.id === filter.id
                          );
                          if (!filterItem) return null;

                          return (
                            <Button
                              key={filter.id}
                              variant="light"
                              size="xs"
                              color="orange"
                              onClick={() => handleFilterToggle(filter.id)}
                            >
                              {filterItem.label}: {filter.value || "Any"}
                            </Button>
                          );
                        })}
                      </Group>
                    </>
                  )}

                <Stack spacing="md">
                  {filteredFilterItems.map((filter) => (
                    <div key={filter.id}>
                      <Group position="apart" mb="xs">
                        <Group spacing="xs">
                          <Text size="sm">{filter.label}</Text>
                        </Group>
                        <Switch
                          checked={isFilterActive(filter.id)}
                          onChange={() => handleFilterToggle(filter.id)}
                          size="md"
                        />
                      </Group>
                      {renderFilterInput(filter)}
                    </div>
                  ))}
                </Stack>

                {/* Apply button for filters */}
                {filters?.active_filters?.length > 0 && (
                  <Button
                    fullWidth
                    variant="filled"
                    color="orange"
                    mt="md"
                    onClick={() => {
                      console.log("Applying filters:", filters.active_filters);
                      setFiltersPopoverOpened(false);
                      // Here you would typically trigger the search with the filters
                    }}
                  >
                    Apply Filters
                  </Button>
                )}
              </div>
            </Popover.Dropdown>
          </Popover>
        </div>
      )}

      {!isMobile &&
        activeSession &&
        params?.id &&
        global_input_mode_developer && (
          <div className="w-full overflow-hidden pt-2">
            <Reveal
              trigger="click"
              target={
                <Tooltip
                  multiline
                  withArrow
                  transitionProps={{ duration: 200 }}
                  label={getTooltipLabel(activeSession)}
                >
                  <div className="flex max-w-full overflow-hidden justify-center">
                    <Text size="sm" className="text-blue-500 truncate block">
                      {getLabel(activeSession)}
                    </Text>
                  </div>
                </Tooltip>
              }
            >
              <MonacoEditor
                value={activeSession}
                language="json"
                height="50vh"
              />
            </Reveal>
          </div>
        )}

      {isMobile && !applicationData?.authenticated && !user && (
        <div className="pr-3">
          <Button
            size="xs"
            gradient={{ from: "blue", to: "cyan", deg: 90 }}
            variant="gradient"
            onClick={() => signIn("keycloak")}
          >
            Sign In
          </Button>
        </div>
      )}
    </div>
  );
};

export function Header({ authenticatedData }: HeaderComponentProps) {
  const go = useGo();
  const {
    domainData,
    isLoading: domainDataIsLoading,
    error: domainDataError,
    domainRecord,
  } = useDomainData();

  const { activeApplication } = useAppStore();

  const applicationData =
    domainData?.data?.find(
      (item: any) => item?.message?.code === "fetch_system_domain_data"
    )?.data[0]?.application || {};

  return (
    <>
      <LargeScreenHeader
        applicationData={applicationData}
        authenticatedData={authenticatedData}
        activeApplication={activeApplication}
        go={go}
      />
    </>
  );
}

// Update the app store to include filter state
// You would need to add these to your actual store implementation
// This is just for TypeScript type checking
declare module "src/store" {
  interface AppStore {
    filters: {
      active_filters: Array<{ id: string; value: any }>;
      search_results: string[];
      available_items: Array<{
        id: string;
        label: string;
        type: "text" | "select" | "date";
        options?: string[];
      }>;
    };
    setFilters: (
      filters:
        | AppStore["filters"]
        | ((current: AppStore["filters"]) => AppStore["filters"])
    ) => void;
    toggleFilter: (filterId: string) => void;
  }
}

export default Header;
