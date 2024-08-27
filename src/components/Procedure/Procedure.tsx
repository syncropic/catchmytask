import React, { useState } from "react";
import { IconCheck } from "@tabler/icons-react";
import { ContentBlockProps } from "@components/interfaces";
import { FaqWithImage } from "@components/Faq/FaqWithImage";
import { Container, Title, Accordion, Text, Grid } from "@mantine/core";
import classes from "./FaqSimple.module.css";

export const Procedure = ({ title, items }: ContentBlockProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleActiveIndexChange = (index: any) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  return (
    <Container size="lg" className={classes.wrapper}>
      {/* <Title ta="center" className={classes.title}>
        {title.name}
      </Title> */}

      <Grid id="faq-grid" gutter={50}>
        <Grid.Col span={{ base: 12, md: 6 }}>
          {/* <Image src={imageURL} alt="Getting started" /> */}
          <img
            className="object-contain w-64 h-64"
            src={title.metadata?.illustration}
            alt="main content illustration"
          ></img>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Title order={2} ta="left" className={classes.title}>
            {title.name}
          </Title>

          <Accordion variant="separated">
            {items
              .sort((a, b) => a.name.localeCompare(b.name)) // Sort items by name
              .map((item, index) => {
                return (
                  <Accordion.Item
                    className={classes.item}
                    value={item.name}
                    key={index}
                  >
                    <Accordion.Control>
                      <Text
                        size="sm"
                        fw={700}
                        variant="gradient"
                        gradient={{ from: "blue", to: "cyan", deg: 90 }}
                      >
                        {item.name}
                      </Text>
                    </Accordion.Control>
                    <Accordion.Panel>{item.description}</Accordion.Panel>
                  </Accordion.Item>
                );
              })}
          </Accordion>
        </Grid.Col>
      </Grid>
    </Container>
  );
};
export default Procedure;

// <Container size="lg">

// <Grid id="faq-grid" gutter={50}>
//   <Grid.Col span={{ base: 12, md: 6 }}>
//     {/* <Image src={imageURL} alt="Getting started" /> */}
//     <img
//       className="object-contain w-96 h-72"
//       src={imageURL}
//       alt="catchmyvibe hero"
//     ></img>
//   </Grid.Col>
//   <Grid.Col span={{ base: 12, md: 6 }}>
//     <Title order={2} ta="left" className={classes.title}>
//       {heading}
//     </Title>

//     <Accordion
//       chevronPosition="right"
//       defaultValue="reset-password"
//       variant="separated"
//     >
//       {steps}
//     </Accordion>
//   </Grid.Col>
// </Grid>

// </Container>
