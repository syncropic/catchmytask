import Link from "next/link";
import { IconCheck } from "@tabler/icons-react";

interface BenefitsComponentProps {
  items: {
    name: string;
    description: string;
    icon: JSX.Element;
  }[];
}

export const Benefits = ({ items }: BenefitsComponentProps) => {
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {items.map((benefit) => (
            <div key={benefit.name}>
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                {benefit.icon}
              </div>
              <div className="mt-5">
                <h4 className="text-lg font-medium text-gray-900">
                  {benefit.name}
                </h4>
                <p className="mt-2 text-base text-gray-500">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Benefits;
