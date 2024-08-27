import { Container, Title, Accordion, Text } from "@mantine/core";
import classes from "./AccordionList.module.css";
import { ContentBlockProps } from "@components/interfaces";

export function AccordionList({ title, items }: ContentBlockProps) {
  return (
    <div className="bg-gray-200">
      <Container size="sm" className={classes.wrapper}>
        <Title ta="center" className={classes.title}>
          {title?.name}
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
    </div>
  );
}

export default AccordionList;
