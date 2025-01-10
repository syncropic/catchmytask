// import React, { useState, useEffect } from "react";
// import { TextInput, NumberInput, Select, Checkbox } from "@mantine/core";
// import { DateInput } from "@mantine/dates";

// export interface Variable {
//   value: string;
//   label: string;
//   type: "string" | "number" | "datetime" | "boolean";
// }

// export interface Filter {
//   id: number;
//   field: string;
//   operator: Operator;
//   value: string | number | boolean | Date | null;
//   value2?: string | number | Date | null;
// }

// type Operator =
//   | "equals"
//   | "notEquals"
//   | "contains"
//   | "startsWith"
//   | "endsWith"
//   | "gt"
//   | "lt"
//   | "between"
//   | "before"
//   | "after";

// interface DynamicFilterProps {
//   variables: Variable[];
//   onFilterChange: (whereClause: string) => void;
// }

// const OPERATOR_MAP: Record<string, Operator[]> = {
//   string: ["equals", "notEquals", "contains", "startsWith", "endsWith"],
//   number: ["equals", "notEquals", "gt", "lt", "between"],
//   datetime: ["equals", "before", "after", "between"],
//   boolean: ["equals"],
// };

// const OPERATOR_LABELS: Record<Operator, string> = {
//   equals: "=",
//   notEquals: "!=",
//   contains: "LIKE",
//   startsWith: "LIKE",
//   endsWith: "LIKE",
//   gt: ">",
//   lt: "<",
//   between: "BETWEEN",
//   before: "<",
//   after: ">",
// };

// const DynamicFilter: React.FC<DynamicFilterProps> = ({
//   variables,
//   onFilterChange,
// }) => {
//   const [filters, setFilters] = useState<Filter[]>([]);

//   // Update filters when variables change
//   useEffect(() => {
//     const currentFields = new Set(filters.map((f) => f.field));
//     const variableFields = new Set(variables.map((v) => v.value));

//     // Remove filters for variables that no longer exist
//     const updatedFilters = filters.filter((filter) =>
//       variableFields.has(filter.field)
//     );

//     // Add new filters for new variables
//     variables.forEach((variable) => {
//       if (!currentFields.has(variable.value)) {
//         updatedFilters.push({
//           id: Date.now() + Math.random(), // Ensure unique ID
//           field: variable.value,
//           operator: OPERATOR_MAP[variable.type][0], // Default to first operator
//           value: null,
//         });
//       }
//     });

//     setFilters(updatedFilters);
//   }, [variables]);

//   const updateFilter = (filterId: number, updates: Partial<Filter>) => {
//     setFilters(
//       filters.map((filter) => {
//         if (filter.id === filterId) {
//           const updatedFilter = { ...filter, ...updates };
//           // Reset value when operator changes
//           if (updates.operator && updates.operator !== filter.operator) {
//             updatedFilter.value = null;
//             updatedFilter.value2 = null;
//           }
//           return updatedFilter;
//         }
//         return filter;
//       })
//     );
//   };

//   const getOperatorsForField = (fieldName: string): Operator[] => {
//     const variable = variables.find((v) => v.value === fieldName);
//     return variable ? OPERATOR_MAP[variable.type] : [];
//   };

//   const renderValueInput = (filter: Filter) => {
//     const variable = variables.find((v) => v.value === filter.field);
//     if (!variable) return null;

//     switch (variable.type) {
//       case "string":
//         return (
//           <TextInput
//             value={(filter.value as string) || ""}
//             onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
//             placeholder="Enter value"
//             className="w-full"
//           />
//         );

//       case "number":
//         return (
//           <div className="flex gap-2">
//             <NumberInput
//               value={(filter.value as number) || undefined}
//               onChange={(value) => updateFilter(filter.id, { value })}
//               placeholder="Enter value"
//               className="w-full"
//             />
//             {filter.operator === "between" && (
//               <NumberInput
//                 value={(filter.value2 as number) || undefined}
//                 onChange={(value) => updateFilter(filter.id, { value2: value })}
//                 placeholder="End value"
//                 className="w-full"
//               />
//             )}
//           </div>
//         );

//       case "datetime":
//         return (
//           <div className="flex gap-2">
//             <DateInput
//               value={(filter.value as Date) || null}
//               onChange={(date) => updateFilter(filter.id, { value: date })}
//               placeholder="Select date"
//               className="w-full"
//             />
//             {filter.operator === "between" && (
//               <DateInput
//                 value={(filter.value2 as Date) || null}
//                 onChange={(date) => updateFilter(filter.id, { value2: date })}
//                 placeholder="End date"
//                 className="w-full"
//               />
//             )}
//           </div>
//         );

//       case "boolean":
//         return (
//           <Checkbox
//             checked={(filter.value as boolean) || false}
//             onChange={(e) =>
//               updateFilter(filter.id, { value: e.target.checked })
//             }
//           />
//         );

//       default:
//         return null;
//     }
//   };

//   const formatValue = (
//     value: Filter["value"],
//     type: Variable["type"]
//   ): string => {
//     if (value === null) return "";

//     if (type === "datetime") {
//       return value instanceof Date
//         ? value.toISOString().split("T")[0]
//         : String(value);
//     }

//     return String(value);
//   };

//   const generateWhereClause = () => {
//     const conditions = filters
//       .map((filter) => {
//         if (!filter.field || !filter.operator || filter.value === null)
//           return null;

//         const variable = variables.find((v) => v.value === filter.field);
//         if (!variable) return null;

//         const operator = OPERATOR_LABELS[filter.operator];
//         const formattedValue = formatValue(filter.value, variable.type);

//         switch (filter.operator) {
//           case "contains":
//             return `${filter.field} ${operator} '%${formattedValue}%'`;
//           case "startsWith":
//             return `${filter.field} ${operator} '${formattedValue}%'`;
//           case "endsWith":
//             return `${filter.field} ${operator} '%${formattedValue}'`;
//           case "between":
//             if (filter.value2 === null) return null;
//             const formattedValue2 = formatValue(
//               filter.value2 || "",
//               variable.type
//             );
//             return `${filter.field} ${operator} ${
//               variable.type === "string" || variable.type === "datetime"
//                 ? `'${formattedValue}' AND '${formattedValue2}'`
//                 : `${formattedValue} AND ${formattedValue2}`
//             }`;
//           default:
//             if (variable.type === "string" || variable.type === "datetime") {
//               return `${filter.field} ${operator} '${formattedValue}'`;
//             }
//             return `${filter.field} ${operator} ${formattedValue}`;
//         }
//       })
//       .filter(Boolean);

//     return conditions.length ? conditions.join(" AND ") : "";
//   };

//   useEffect(() => {
//     const whereClause = generateWhereClause();
//     onFilterChange(whereClause);
//   }, [filters]);

//   return (
//     <div className="space-y-4">
//       {filters.map((filter) => (
//         <div key={filter.id} className="flex gap-4 items-start">
//           <div className="w-48 py-2">
//             {variables.find((v) => v.value === filter.field)?.label ||
//               filter.field}
//           </div>

//           <Select
//             value={filter.operator}
//             onChange={(value) =>
//               updateFilter(filter.id, { operator: value as Operator })
//             }
//             data={getOperatorsForField(filter.field).map((op) => ({
//               value: op,
//               label: OPERATOR_LABELS[op],
//             }))}
//             placeholder="Select operator"
//             className="w-32"
//           />

//           <div className="flex-1">{renderValueInput(filter)}</div>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default DynamicFilter;

import React, { useState, useEffect } from "react";
import { TextInput, NumberInput, Select, Checkbox } from "@mantine/core";
import { DateInput } from "@mantine/dates";

export interface Variable {
  value: string;
  label: string;
  type: "string" | "number" | "datetime" | "boolean";
}

export interface Filter {
  id: number;
  field: string;
  operator: Operator;
  value: string | number | boolean | Date | null;
  value2?: string | number | Date | null;
}

// New interface for structured filter condition
export interface FilterCondition {
  field: string;
  operator: string;
  value: string | number | boolean | Date | null;
  value2?: string | number | Date | null;
  fieldType: "string" | "number" | "datetime" | "boolean";
}

// New interface for filter output
export interface FilterOutput {
  whereClause: string;
  conditions: FilterCondition[];
  joinOperator: "AND" | "OR";
}

type Operator =
  | "equals"
  | "notEquals"
  | "contains"
  | "startsWith"
  | "endsWith"
  | "gt"
  | "lt"
  | "between"
  | "before"
  | "after";

interface DynamicFilterProps {
  variables: Variable[];
  onFilterChange: (output: FilterOutput) => void;
}

const OPERATOR_MAP: Record<string, Operator[]> = {
  string: ["equals", "notEquals", "contains", "startsWith", "endsWith"],
  number: ["equals", "notEquals", "gt", "lt", "between"],
  datetime: ["equals", "before", "after", "between"],
  boolean: ["equals"],
};

const OPERATOR_LABELS: Record<Operator, string> = {
  equals: "=",
  notEquals: "!=",
  contains: "LIKE",
  startsWith: "LIKE",
  endsWith: "LIKE",
  gt: ">",
  lt: "<",
  between: "BETWEEN",
  before: "<",
  after: ">",
};

const DynamicFilter: React.FC<DynamicFilterProps> = ({
  variables,
  onFilterChange,
}) => {
  const [filters, setFilters] = useState<Filter[]>([]);

  // Update filters when variables change
  useEffect(() => {
    const currentFields = new Set(filters.map((f) => f.field));
    const variableFields = new Set(variables.map((v) => v.value));

    const updatedFilters = filters.filter((filter) =>
      variableFields.has(filter.field)
    );

    variables.forEach((variable) => {
      if (!currentFields.has(variable.value)) {
        updatedFilters.push({
          id: Date.now() + Math.random(),
          field: variable.value,
          operator: OPERATOR_MAP[variable.type][0],
          value: null,
        });
      }
    });

    setFilters(updatedFilters);
  }, [variables]);

  const updateFilter = (filterId: number, updates: Partial<Filter>) => {
    setFilters(
      filters.map((filter) => {
        if (filter.id === filterId) {
          const updatedFilter = { ...filter, ...updates };
          if (updates.operator && updates.operator !== filter.operator) {
            updatedFilter.value = null;
            updatedFilter.value2 = null;
          }
          return updatedFilter;
        }
        return filter;
      })
    );
  };

  const getOperatorsForField = (fieldName: string): Operator[] => {
    const variable = variables.find((v) => v.value === fieldName);
    return variable ? OPERATOR_MAP[variable.type] : [];
  };

  const renderValueInput = (filter: Filter) => {
    const variable = variables.find((v) => v.value === filter.field);
    if (!variable) return null;

    switch (variable.type) {
      case "string":
        return (
          <TextInput
            value={(filter.value as string) || ""}
            onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
            placeholder="Enter value"
            className="w-full"
          />
        );

      case "number":
        return (
          <div className="flex gap-2">
            <NumberInput
              value={(filter.value as number) || undefined}
              onChange={(value) => updateFilter(filter.id, { value })}
              placeholder="Enter value"
              className="w-full"
            />
            {filter.operator === "between" && (
              <NumberInput
                value={(filter.value2 as number) || undefined}
                onChange={(value) => updateFilter(filter.id, { value2: value })}
                placeholder="End value"
                className="w-full"
              />
            )}
          </div>
        );

      case "datetime":
        return (
          <div className="flex gap-2">
            <DateInput
              value={(filter.value as Date) || null}
              onChange={(date) => updateFilter(filter.id, { value: date })}
              placeholder="Select date"
              className="w-full"
            />
            {filter.operator === "between" && (
              <DateInput
                value={(filter.value2 as Date) || null}
                onChange={(date) => updateFilter(filter.id, { value2: date })}
                placeholder="End date"
                className="w-full"
              />
            )}
          </div>
        );

      case "boolean":
        return (
          <Checkbox
            checked={(filter.value as boolean) || false}
            onChange={(e) =>
              updateFilter(filter.id, { value: e.target.checked })
            }
          />
        );

      default:
        return null;
    }
  };

  const formatValue = (
    value: Filter["value"],
    type: Variable["type"]
  ): string => {
    if (value === null) return "";

    if (type === "datetime") {
      return value instanceof Date
        ? value.toISOString().split("T")[0]
        : String(value);
    }

    return String(value);
  };

  const generateFilterOutput = (): FilterOutput => {
    const conditions: FilterCondition[] = [];
    const sqlConditions: string[] = [];

    filters.forEach((filter) => {
      if (!filter.field || !filter.operator || filter.value === null) return;

      const variable = variables.find((v) => v.value === filter.field);
      if (!variable) return;

      const operator = OPERATOR_LABELS[filter.operator];
      const formattedValue = formatValue(filter.value, variable.type);

      // Create structured condition
      const condition: FilterCondition = {
        field: filter.field,
        operator: filter.operator,
        value: filter.value,
        fieldType: variable.type,
      };

      if (filter.operator === "between" && filter.value2 !== null) {
        condition.value2 = filter.value2;
      }

      conditions.push(condition);

      // Generate SQL condition
      let sqlCondition: string;
      switch (filter.operator) {
        case "contains":
          sqlCondition = `${filter.field} ${operator} '%${formattedValue}%'`;
          break;
        case "startsWith":
          sqlCondition = `${filter.field} ${operator} '${formattedValue}%'`;
          break;
        case "endsWith":
          sqlCondition = `${filter.field} ${operator} '%${formattedValue}'`;
          break;
        case "between":
          if (filter.value2 === null) return;
          const formattedValue2 = formatValue(
            filter.value2 || "",
            variable.type
          );
          sqlCondition = `${filter.field} ${operator} ${
            variable.type === "string" || variable.type === "datetime"
              ? `'${formattedValue}' AND '${formattedValue2}'`
              : `${formattedValue} AND ${formattedValue2}`
          }`;
          break;
        default:
          sqlCondition = `${filter.field} ${operator} ${
            variable.type === "string" || variable.type === "datetime"
              ? `'${formattedValue}'`
              : formattedValue
          }`;
      }

      sqlConditions.push(sqlCondition);
    });

    return {
      whereClause: sqlConditions.length ? sqlConditions.join(" AND ") : "",
      conditions,
      joinOperator: "AND",
    };
  };

  useEffect(() => {
    const output = generateFilterOutput();
    onFilterChange(output);
  }, [filters]);

  return (
    <div className="space-y-4">
      {filters.map((filter) => (
        <div key={filter.id} className="flex gap-4 items-start">
          <div className="w-48 py-2">
            {variables.find((v) => v.value === filter.field)?.label ||
              filter.field}
          </div>

          <Select
            value={filter.operator}
            onChange={(value) =>
              updateFilter(filter.id, { operator: value as Operator })
            }
            data={getOperatorsForField(filter.field).map((op) => ({
              value: op,
              label: OPERATOR_LABELS[op],
            }))}
            placeholder="Select operator"
            className="w-32"
          />

          <div className="flex-1">{renderValueInput(filter)}</div>
        </div>
      ))}
    </div>
  );
};

export default DynamicFilter;
