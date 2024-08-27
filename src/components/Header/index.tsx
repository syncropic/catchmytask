import React from "react";
import LayoutToggle from "@components/Layout/LayoutToggle";
import UserMenu from "@components/Layout/UserMenu";
import { LogoName } from "@components/LogoName/LogoName";
import SessionBar from "@components/SessionBar";
import { useFetchDomainDataByDomain } from "@components/Utils";
import { useGo } from "@refinedev/core";
import { useAppStore } from "src/store";

interface HeaderComponentProps {
  authenticatedData?: any;
  activeApplication?: any;
  applicationData?: any;
  go?: any;
}

const SmallMediumScreenHeader = ({
  applicationData,
  authenticatedData,
  activeApplication,
  go,
}: HeaderComponentProps) => (
  <div className="grid grid-cols-1 items-center">
    <div className="flex items-center h-full md:pr-72 md:pl-72 justify-between col-span-1">
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
      {authenticatedData?.authenticated && <UserMenu />}
    </div>
    <div className="md:pr-72 md:pl-72 col-span-1">
      {authenticatedData?.authenticated && (
        <SessionBar
          name={activeApplication?.name}
          heading={activeApplication?.heading}
          subheading={activeApplication?.subheading}
          description={activeApplication?.description}
        />
      )}
    </div>
  </div>
);

const LargeScreenHeader = ({
  applicationData,
  authenticatedData,
  activeApplication,
  go,
}: HeaderComponentProps) => (
  <div className="flex justify-between items-center h-full md:pr-72 md:pl-72">
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
      <SessionBar
        name={activeApplication?.name}
        heading={activeApplication?.heading}
        subheading={activeApplication?.subheading}
        description={activeApplication?.description}
      />
    )}
    {authenticatedData?.authenticated && <UserMenu />}
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
      <div className="block lg:hidden">
        <SmallMediumScreenHeader
          applicationData={applicationData}
          authenticatedData={authenticatedData}
          activeApplication={activeApplication}
          go={go}
        />
      </div>
      <div className="hidden lg:block">
        <LargeScreenHeader
          applicationData={applicationData}
          authenticatedData={authenticatedData}
          activeApplication={activeApplication}
          go={go}
        />
      </div>
    </>
  );
}

export default Header;
