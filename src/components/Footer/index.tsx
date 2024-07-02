/* eslint-disable-next-line */
// export interface FooterProps {}
import { Text } from "@mantine/core";
import Link from "next/link";
import { Anchor } from "@mantine/core";
import { FooterCentered } from "./FooterCentered";

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
  const links = [
    // { link: "#", label: "Contact" },
    // { link: "#", label: "Privacy" },
    // { link: "#", label: "Blog" },
  ] as { link: string; label: string }[];

  const actionItems = [{ link: "#", label: "Contact" }];
  return (
    <>
      {/* <SimpleFooter /> */}
      <FooterCentered links={links} actionItems={actionItems} />
    </>
  );
}

// export function Footer({ companyName, companyURL, year }) {
//   return (
//     <div className="bg-gray-200">
//       <div className="py-2 text-center text-gray-700">
//         <div className="flex justify-center">
//           <div className="max-w-xl">
//             <div className="flex flex-col gap-2">
//               <Anchor href="https://dpwanjala.com">© dpwanjala.com</Anchor>
//               <Anchor href="mailto: dpwanjala@gmail.com">
//                 dpwanjala@gmail.com
//               </Anchor>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export function Footer({ companyName, companyURL, year }) {
//   return (
//     <footer className="bg-gray-900 text-white py-6">
//       <div className="container px-4 mx-auto">
//         <div className="flex flex-wrap justify-center items-center">
//           <div className="w-full md:w-auto text-center md:text-left mb-4 md:mb-0">
//             {/* <p className="text-gray-500 text-sm">© 2023 dpwanjala.</p> */}
//             <Text color="blue">
//               <Link href={companyURL}>
//                 © {companyName} {year}
//               </Link>
//             </Text>
//             <div>dpwanjala@gmail.com</div>
//           </div>

//           {/* <div className="w-full md:w-auto text-center">
//             <ul className="flex justify-center md:justify-end">
//               <li className="mx-4">
//                 <a href="/faq" className="hover:text-gray-300">
//                   FAQ
//                 </a>
//               </li>
//             </ul>
//           </div> */}
//         </div>
//       </div>
//     </footer>
//   );
// }

export default Footer;

// const Footer = () => {
//   const { authStateUser } = useAuthState();
//   return (
//     <div className="bg-gray-200">
//       <div className="py-2 text-center text-gray-700">
//         <div className="flex justify-center">
//           <div className="max-w-xl">
//             <div>
//               <div>© dpwanjala, 2023.</div>
//               <div>dpwanjala@gmail.com</div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };
