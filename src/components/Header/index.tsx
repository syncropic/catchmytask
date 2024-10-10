import React from "react";
import LayoutToggle from "@components/Layout/LayoutToggle";
import UserMenu from "@components/Layout/UserMenu";
import { LogoName } from "@components/LogoName/LogoName";
import { useFetchDomainDataByDomain } from "@components/Utils";
import { useGo } from "@refinedev/core";
import { useAppStore } from "src/store";
import SearchBar from "@components/SearchBar";
import QuickActionsBar from "@components/QuickActionsBar";
import ColorSchemeToggle from "@components/ColorSchemeToggle";
import { ActionIcon, Tooltip } from "@mantine/core";
import { IconLetterB, IconMenu2 } from "@tabler/icons-react";
import SearchInput from "@components/SearchInput";

interface HeaderComponentProps {
  authenticatedData?: any;
  activeApplication?: any;
  applicationData?: any;
  go?: any;
}

const LargeScreenHeader = ({
  applicationData,
  authenticatedData,
  activeApplication,
  go,
}: HeaderComponentProps) => {
  const { sessionConfig, setSessionConfig, activeLayout, setActiveLayout } =
    useAppStore();

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

  return (
    <div className="flex justify-between items-center h-full md:pr-72 md:pl-72">
      <div className="flex items-center">
        <LogoName
          logoLink="/"
          logoURL={applicationData.logo_image_url}
          companyName={
            applicationData.name || activeApplication?.name || "APP NAME"
          }
          iconName={applicationData.logo_icon_name}
          handleClickHome={() => {
            go({
              to: "/",
              type: "push",
            });
          }}
        />
        {authenticatedData?.authenticated && (
          <div className="hidden lg:block">
            <LayoutToggle />
          </div>
        )}

        {<ColorSchemeToggle />}

        {authenticatedData?.authenticated && (
          <div className="block lg:hidden">
            <Tooltip label="Toggle quick actions" position="top">
              <ActionIcon
                size="sm"
                variant={
                  activeLayout?.quickActionsBar?.isDisplayed
                    ? "filled"
                    : "outline"
                }
                onClick={() => {
                  toggleDisplay("quickActionsBar");
                }}
              >
                {/* right */}
                <IconMenu2 />
              </ActionIcon>
            </Tooltip>
          </div>
        )}

        {/* {authenticatedData?.authenticated && (
          <div className="hidden lg:block">
            <div>
              <Tooltip label="Toggle background mode" position="top">
                <ActionIcon
                  aria-label="Toggle background mode"
                  size="sm"
                  onClick={() => toggleSessionInteractionMode("background")}
                  variant={
                    sessionConfig.interaction_mode == "background"
                      ? "filled"
                      : "outline"
                  }
                >
                  <IconLetterB />
                </ActionIcon>
              </Tooltip>
            </div>
          </div>
        )} */}
      </div>
      {authenticatedData?.authenticated && (
        <div className="hidden lg:block w-full items-center pl-4">
          {/* <SearchInput include_action_icons={["filter"]} /> */}
          <SearchInput include_action_icons={[]} />
        </div>
      )}

      {<UserMenu />}
    </div>
  );
};

export function Header({ authenticatedData }: HeaderComponentProps) {
  const go = useGo();
  const runtimeConfig = useAppStore((state) => state.runtimeConfig);

  let state = {
    domain_url: runtimeConfig?.DOMAIN_URL,
  };
  const { activeApplication } = useAppStore();
  const {
    data: domainData,
    isLoading: domainDataIsLoading,
    error: domainDataError,
  } = useFetchDomainDataByDomain(state);

  const applicationData =
    domainData?.data?.find(
      (item: any) => item?.message?.code === "query_success_results"
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

export default Header;
