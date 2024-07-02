import { Image, Accordion, Grid, Container, Title } from "@mantine/core";
// import image from "./image.svg";
import classes from "./FaqWithImage.module.css";

const placeholder =
  "It can’t help but hear a pin drop from over half a mile away, so it lives deep in the mountains where there aren’t many people or Pokémon.";

export function FaqWithImage({ imageURL, items, heading }) {
  const steps = items.map((item, index) => {
    return (
      <Accordion.Item className={classes.item} value={item.title} key={index}>
        <Accordion.Control>{item.title}</Accordion.Control>
        <Accordion.Panel>{item.description}</Accordion.Panel>
      </Accordion.Item>
    );
  });
  return (
    <div className={classes.wrapper}>
      <Container size="lg">
        <Grid id="faq-grid" gutter={50}>
          <Grid.Col span={{ base: 12, md: 6 }}>
            {/* <Image src={imageURL} alt="Getting started" /> */}
            <img
              className="object-contain w-96 h-72"
              src={imageURL}
              alt="catchmyvibe hero"
            ></img>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Title order={2} ta="left" className={classes.title}>
              {heading}
            </Title>

            <Accordion
              chevronPosition="right"
              defaultValue="reset-password"
              variant="separated"
            >
              {steps}
            </Accordion>
          </Grid.Col>
        </Grid>
      </Container>
    </div>
  );
}
