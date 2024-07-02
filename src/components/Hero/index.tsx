import { ContentBlockProps, HeroItem } from "@components/interfaces";
import { HeroBullets } from "./HeroBullets";

export function Hero(props: ContentBlockProps) {
  return (
    <>
      <HeroBullets {...props} />
      {/* <div>{JSON.stringify(item)}</div> */}
    </>
  );
}

export default Hero;
