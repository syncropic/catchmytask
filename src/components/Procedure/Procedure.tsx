import { Accordion } from "@mantine/core";
import React, { useState } from "react";
import { IconCheck } from "@tabler/icons-react";

export const Procedure = ({ procedure, heading, subheading }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleActiveIndexChange = (index) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  return (
    <section className="bg-gray-300 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">{heading}</h2>
        </div>
        <div className="mt-12">
          <div className="flex flex-col">
            <Accordion value="value" onChange={handleActiveIndexChange}>
              {procedure.map((step, index) => (
                <Accordion.Item key={index} value={step.title}>
                  <Accordion.Control>
                    <div className="flex items-center justify-between cursor-pointer">
                      <h4 className="text-xl font-semibold text-gray-800">
                        {step.title}
                      </h4>
                      <div className="ml-4">
                        <IconCheck
                          size={24}
                          strokeWidth={2}
                          className={`${
                            activeIndex === index
                              ? "text-green-500"
                              : "text-gray-300"
                          }`}
                        />
                      </div>
                    </div>
                  </Accordion.Control>
                  <Accordion.Panel>
                    <p className="text-gray-500 mb-4">{step.description}</p>
                  </Accordion.Panel>
                </Accordion.Item>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
};
export default Procedure;
