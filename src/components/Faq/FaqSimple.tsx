import { Container, Title, Accordion, Text } from "@mantine/core";
import classes from "./FaqSimple.module.css";

interface FaqSimpleProps {
  heading?: string;
  subheading?: string;
  items: {
    name: string;
    description: string;
  }[];
}

export function FaqSimple({ heading, subheading, items }: FaqSimpleProps) {
  return (
    <Container size="sm" className={classes.wrapper}>
      <Title ta="center" className={classes.title}>
        Frequently Asked Questions
      </Title>

      <Accordion variant="separated">
        {items.map((item, index) => {
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
    </Container>
  );
}

export default FaqSimple;
