import React from "react";
import LayoutToggle from "@components/Layout/LayoutToggle";
import UserMenu from "@components/Layout/UserMenu";
import { LogoName } from "@components/LogoName/LogoName";
import { useFetchDomainDataByDomain } from "@components/Utils";
import { useGo } from "@refinedev/core";
import { useAppStore } from "src/store";
import SearchBar from "@components/SearchBar";
import QuickActionsBar from "@components/QuickActionsBar";

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
}: HeaderComponentProps) => (
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
      {authenticatedData?.authenticated && <LayoutToggle />}
      {authenticatedData?.authenticated && (
        <QuickActionsBar
          name={activeApplication?.name}
          heading={activeApplication?.heading}
          subheading={activeApplication?.subheading}
          description={activeApplication?.description}
        />
      )}
    </div>
    {authenticatedData?.authenticated && (
      <SearchBar
        name={activeApplication?.name}
        heading={activeApplication?.heading}
        subheading={activeApplication?.subheading}
        description={activeApplication?.description}
      />
    )}

    {<UserMenu />}
  </div>
);

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
