import { ContentBlockProps, HeroItem } from "@components/interfaces";
import { HeroBullets } from "./HeroBullets";

export function Hero(props: ContentBlockProps) {
  return (
    <>
      <HeroBullets {...props} />
      {/* <div>{JSON.stringify(props.items)}</div> */}
    </>
  );
}

export default Hero;
