/* eslint-disable-next-line */
// export interface FooterProps {}
import { Text } from "@mantine/core";
import Link from "next/link";
import { Anchor } from "@mantine/core";
import { FooterCentered } from "./FooterCentered";
import { useFetchDomainDataByDomain } from "@components/Utils";
import { useAppStore } from "src/store";

export function SimpleFooter() {
  return (
    <div className="flex justify-center">
      <div className="max-w-xl">
        <div className="flex flex-col gap-2 pr-76 pl-76">
          <Anchor href="https://dpwanjala.com">© dpwanjala.com</Anchor>
          <Anchor href="mailto: dpwanjala@gmail.com">
            dpwanjala@gmail.com
          </Anchor>
        </div>
      </div>
    </div>
  );
}

export function Footer() {
  // const go = useGo();

  const runtimeConfig = useAppStore((state) => state.runtimeConfig);

  let state = {
    domain_url: runtimeConfig?.DOMAIN_URL,
  };
  const {
    data: domainData,
    isLoading: domainDataIsLoading,
    error: domainDataError,
  } = useFetchDomainDataByDomain(state);
  // const links = [
  //   // { link: "#", label: "Contact" },
  //   // { link: "#", label: "Privacy" },
  //   // { link: "#", label: "Blog" },
  // ] as { link: string; label: string }[];

  const links = [{ link: "#", label: "Contact" }];
  return (
    <>
      {/* <SimpleFooter /> */}
      <FooterCentered
        links={
          domainData?.data?.find(
            (item: any) => item?.message?.code === "query_success_results"
          )?.data[0]?.["application"]["footer_links"]
        }
        copywright={
          domainData?.data?.find(
            (item: any) => item?.message?.code === "query_success_results"
          )?.data[0]?.["application"]["copyright"]
        }
      />
    </>
  );
}

export default Footer;
