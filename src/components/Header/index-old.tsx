import LoginWithGoogle from "@/features/auth/LoginWithGoogle";
import { useAuthState } from "@/features/auth/useAuthState";
// import useCreateMailingList from "@/features/mailing_list/useCreateItem";
// import useMailingList from "@/features/mailing_list/useItem";
import { Burger, Button, Container } from "@mantine/core";
import { useQueryClient } from "@tanstack/react-query";
import { LogoName } from "@/components/shared/ui-web/src";
import { CTA } from "./CTA";
import { UserMenu } from "./UserMenu";
import { useRouter, usePathname } from "next/navigation";
import { initializeDb } from "@/db";
import React, { useState, useEffect } from "react";
import { Download } from "./Download";

export const Header = ({ opened, toggle }) => {
  // const [deferredPrompt, setDeferredPrompt] = useState(null);
  // useEffect(() => {
  //   window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

  //   return () => {
  //     window.removeEventListener(
  //       "beforeinstallprompt",
  //       handleBeforeInstallPrompt
  //     );
  //   };
  // }, []);
  // function handleBeforeInstallPrompt(event) {
  //   event.preventDefault();
  //   setDeferredPrompt(event);
  // }

  // function handleInstallClick() {
  //   console.log("handleInstallClick");
  //   // if (deferredPrompt) {
  //   //   deferredPrompt.prompt();
  //   //   deferredPrompt.userChoice.then((choiceResult) => {
  //   //     if (choiceResult.outcome === "accepted") {
  //   //       console.log("User accepted the install prompt");
  //   //     } else {
  //   //       console.log("User dismissed the install prompt");
  //   //     }
  //   //     setDeferredPrompt(null);
  //   //   });
  //   // }
  // }
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { authStateUser } = useAuthState();
  const router = useRouter();

  //   const handleCreateMailingListSuccess = async (data) => {
  //     // console.log(data);
  //   };

  //   const handleUpdateItemSuccess = async (data) => {
  //     // console.log(data);
  //   };

  //   // const users = useUsers();
  //   const createMailingList = useCreateMailingList(
  //     authStateUser,
  //     queryClient,
  //     handleCreateMailingListSuccess
  //   );

  //   const mailingListQuery = `SELECT *, ->subscribe->mailing_list.* AS mailing_list FROM user:${authStateUser?.uid};`;
  //   const mailingList = useMailingList({
  //     user: authStateUser,
  //     query: mailingListQuery,
  //     key: "mailingList",
  //   });
  // if (mailingList.isLoading) return "Loading...";
  // if (mailingList.error)
  //   return "An error has occurred: " + mailingList.error.message;
  const burgerIcon = () => {
    if (authStateUser?.uid) {
      //   return (
      //     <Burger
      //       opened={opened}
      //       onClick={toggle}
      //       color="gray"
      //       size="md"
      //       aria-label="Open menu"
      //     />
      //   );'
      return null;
    }
    return null;
  };

  const cta = () => {
    if (pathname === "/") {
      <CTA></CTA>;
    }
    return null;
  };

  // const downloadApp = () => {
  //   // if (pathname === "/") {
  //   //   <CTA></CTA>;
  //   // }
  //   // return null;
  //   return (
  //     <Button
  //       onClick={handleInstallClick}
  //       variant="gradient"
  //       gradient={{ from: "red", to: "indigo", deg: 90 }}
  //       radius="xl"
  //     >
  //       download app
  //     </Button>
  //   );
  // };

  const handleSignInSuccess = async (data) => {
    // console.log(data);
    // const mailingListData = {
    //   name: "catchmyvibe launch notification",
    //   email: data?.email,
    //   author: `user:${data?.uid}`,
    // };

    initializeDb(data?.email, data?.uid);
    router.push("/chat");
    // handleCreateActionSuccess(user);
    // createMailingList.mutate(mailingListData);
    // // show notification
    // notifications.show({
    //   id: "mailing-list-singup",
    //   title: "Ooo yeah!",
    //   message: "You will be notified when we launch.🤘",
    //   color: "green",
    //   autoClose: 10000,
    //   withCloseButton: true,
    // });
  };

  const userMenu = () => {
    if (authStateUser?.uid) {
      return <UserMenu authStateUser={authStateUser}></UserMenu>;
    }
    if (!authStateUser?.uid) {
      return (
        <LoginWithGoogle
          createActionTitle="Login"
          presentItemTitle="Login"
          handleCreateActionSuccess={handleSignInSuccess}
          // item={mailingList?.data?.[0]?.result[0]?.mailing_list?.[0]}
          // item={mailingList}
        ></LoginWithGoogle>
      );
    }
    return null;
  };

  return (
    <>
      <div className="flex justify-between items-center h-full md:pr-72 md:pl-72">
        {burgerIcon()}
        <LogoName
          logoLink="/"
          logoURL="https://res.cloudinary.com/dobyiczlc/image/upload/v1696307973/dpwanjala-logo-favicon_crop_10_kxrljn.png"
          companyName="CATCHMYVIBE"
          // auth={auth}
          handleClickHome={() => router.push("/")}
        ></LogoName>
        {/* <WriteMailingListForm
                createActionTitle="Join Waitlist"
                displayHeading={false}
              ></WriteMailingListForm> */}
        {cta()}
        <Download></Download>
        {userMenu()}
      </div>
    </>
  );
};
