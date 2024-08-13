import React from "react";
import { TextInput, Textarea, Button } from "@mantine/core";
import { useForm } from "@mantine/form";

interface DataModel {
  data_model: {
    author_id: string;
    created_datetime: string;
    description: string;
    entity_type: string;
    id: string;
    name: string;
    schema: {
      properties: {
        [key: string]: {
          component: string;
          description: string;
          placeholder?: string;
          size?: string;
          title: string;
          type: string;
          readOnly?: boolean;
          format?: string;
        };
      };
      required: string[];
      title: string;
      type: string;
    };
    updated_datetime: string;
  };
}

interface DynamicFormProps {
  data_model: DataModel["data_model"];
}

const DynamicForm: React.FC<DynamicFormProps> = ({ data_model }) => {
  const { schema } = data_model;
  const form = useForm({
    initialValues: Object.keys(schema.properties).reduce((acc, key) => {
      acc[key] = ""; // Set initial values as empty strings or whatever default you want
      return acc;
    }, {} as { [key: string]: any }),
  });

  const renderField = (field: any, key: string) => {
    const { component, description, placeholder, size, readOnly } = field;
    switch (component) {
      case "Textarea":
        return (
          <Textarea
            key={key}
            label={field.title}
            placeholder={placeholder}
            description={description}
            size={size}
            readOnly={readOnly}
            {...form.getInputProps(key)}
          />
        );
      case "TextInput":
        return (
          <TextInput
            key={key}
            label={field.title}
            placeholder={placeholder}
            description={description}
            size={size}
            readOnly={readOnly}
            {...form.getInputProps(key)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <form onSubmit={form.onSubmit((values) => console.log(values))}>
      {Object.keys(schema.properties).map((key) =>
        renderField(schema.properties[key], key)
      )}
      <Button type="submit">Submit</Button>
    </form>
  );
};

export default DynamicForm;
