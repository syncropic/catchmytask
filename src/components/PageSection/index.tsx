// import { HeroItem } from "@components/interfaces";
// import { HeroBullets } from "./HeroBullets";

import { FaqSimple } from "@components/Faq/FaqSimple";
import { FeaturesCards } from "@components/Features/FeaturesCards";

interface PageSectionComponentProps {
  name: string;
  description: string;
  items: any[];
}

export function PageSection({
  name,
  description,
  items,
}: PageSectionComponentProps) {
  return (
    <>
      {/* <HeroBullets {...item} /> */}
      {/* <div>{JSON.stringify(item)}</div> */}
      <div>page section</div>
      {/* <div className="bg-gray-200">
        <FeaturesCards
          items={[]}
          heading="Integrate effortlessly with your existing technology stack"
          subheading="Use the following as your music sources and destinations to create your vibe sessions"
        ></FeaturesCards>
      </div> */}
      {/* <div className="bg-gray-200">
            <FeaturesGrid
              heading={benefits.heading}
              items={benefits.benefits}
              subheading={benefits.subheading}
            ></FeaturesGrid>
          </div> */}
      {/* <FaqSimple {...faq}></FaqSimple> */}
      {/* <FaqWithImage
            imageURL="https://res.cloudinary.com/dobyiczlc/image/upload/v1695885494/undraw_online_media_re_r9qv_oyzjtq.svg"
            items={procedure?.procedure}
            heading={procedure.heading}
          ></FaqWithImage> */}
    </>
  );
}

export default PageSection;
