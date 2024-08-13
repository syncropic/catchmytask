import { ContentBlockProps } from "@components/interfaces";
import { Card, Text } from "@mantine/core";

export function Features({ title, items }: ContentBlockProps) {
  return (
    <section className="bg-gray-100 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Key Features
          </h2>
        </div>
        <div className="mt-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {items.map((feature) => (
              <Card
                key={feature.name}
                shadow="lg"
                className="h-full flex flex-col justify-between"
              >
                <div className="flex-shrink-0 mx-auto">
                  {/* <Image src={feature.icon} alt={feature.title} width={50} /> */}
                  {/* {feature.icon} */}
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {title.name}
                  </h3>
                  <Text size="sm">{feature.description}</Text>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Features;
