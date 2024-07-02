import UserMenu from "@components/Layout/UserMenu";
import { LogoName } from "@components/LogoName/LogoName";
import { useGo } from "@refinedev/core";
import { useAppStore } from "src/store";

interface HeaderComponentProps {
  authenticatedData: any;
}

export function Header({ authenticatedData }: HeaderComponentProps) {
  const go = useGo();
  const { activeApplication } = useAppStore();

  return (
    <>
      <div className="flex justify-between items-center h-full md:pr-72 md:pl-72">
        {/* {burgerIcon()} */}
        <LogoName
          logoLink="/"
          logoURL="https://res.cloudinary.com/dobyiczlc/image/upload/v1696307973/dpwanjala-logo-favicon_crop_10_kxrljn.png"
          companyName={activeApplication?.name || "CATCHMYTASK"}
          // auth={auth}
          handleClickHome={() => {
            go({
              to: "/",
              type: "push",
            });
          }}
        ></LogoName>
        {/* <WriteMailingListForm
                createActionTitle="Join Waitlist"
                displayHeading={false}
              ></WriteMailingListForm> */}
        {/* {cta()} */}
        {/* <Download></Download> */}
        {/* {userMenu()} */}
        <UserMenu />
      </div>
    </>
  );
}

export default Header;
