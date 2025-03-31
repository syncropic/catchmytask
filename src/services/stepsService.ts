// src/services/stepsService.ts
export type StepPhase =
  | "initialization"
  | "data-collection"
  | "data-update"
  | "data-processing"
  | "finalization";
export type StepPriority = "high" | "medium" | "low";
export type StepStatus =
  | "pending"
  | "in-progress"
  | "running"
  | "completed"
  | "failed"
  | "warning";
export type AgentType = "executor" | "fetcher" | "updater" | "sql" | "python";

export interface StepOption {
  [key: string]: string | number | boolean | string[];
}

export interface Step {
  id: string;
  title: string;
  description?: string;
  assignedTo: AgentType;
  status: StepStatus;
  nestLevel: number;
  phase?: StepPhase;
  priority?: StepPriority;
  codeSnippet?: string;
  pythonSnippets?: string[];
  skipCondition?: string;
  options?: StepOption;
  dependencies?: string | string[];
  consumes?: string | string[];
  produces?: string | string[];
  dataSource?: string;
  children: Step[];
}

// This file provides test data for the ExecutionSteps component
// It mimics the structure from the YAML task definition

// Sample steps data based on your YAML task
export const sampleSteps: Step[] = [
  {
    id: "step-1",
    title: "Initialize Transaction Check",
    description: "Begin the process by retrieving base reservation data",
    assignedTo: "executor",
    status: "running",
    nestLevel: 0,
    phase: "initialization",
    priority: "high",
    children: [
      {
        id: "step-1.1",
        title: "execute_onewurld_snowstorm_database_reservation_action_records",
        description:
          "From: onewurld_snowstorm_database, Entity: reservation_action_records",
        assignedTo: "executor",
        status: "running",
        nestLevel: 1,
        phase: "initialization",
        priority: "high",
        dataSource: "onewurld_snowstorm_database",
        produces: ["reservation_action_records"],
        children: [],
      },
    ],
  },
  {
    id: "step-2",
    title: "Retrieve Base Reference Data",
    description: "Get supplier and payment info records from the database",
    assignedTo: "fetcher",
    status: "pending",
    nestLevel: 0,
    phase: "data-collection",
    priority: "high",
    dependencies: ["step-1"],
    children: [
      {
        id: "step-2.1",
        title: "fetch_onewurld_snowstorm_database_update_supplier_info_records",
        description:
          "From: onewurld_snowstorm_database, Entity: update_supplier_info_records",
        assignedTo: "fetcher",
        status: "pending",
        nestLevel: 1,
        phase: "data-collection",
        priority: "high",
        dataSource: "onewurld_snowstorm_database",
        produces: ["supplier_info_records"],
        children: [],
      },
      {
        id: "step-2.2",
        title: "fetch_onewurld_snowstorm_database_update_payment_info_records",
        description:
          "From: onewurld_snowstorm_database, Entity: update_payment_info_records",
        assignedTo: "fetcher",
        status: "pending",
        nestLevel: 1,
        phase: "data-collection",
        priority: "high",
        dataSource: "onewurld_snowstorm_database",
        produces: ["payment_info_records"],
        children: [],
      },
    ],
  },
  {
    id: "step-3",
    title: "Retrieve Payment Information",
    description: "Collect payment data from Stripe",
    assignedTo: "fetcher",
    status: "pending",
    nestLevel: 0,
    phase: "data-collection",
    priority: "medium",
    dataSource: "stripe",
    dependencies: ["step-2.2"],
    children: [
      {
        id: "step-3.1",
        title: "fetch_stripe_charges_by_date_range",
        description: "From: stripe, Entity: charges (date range)",
        assignedTo: "fetcher",
        status: "pending",
        nestLevel: 1,
        phase: "data-collection",
        priority: "medium",
        dataSource: "stripe",
        pythonSnippets: [
          "date_calculator('{{reporting_date_start}}', days=-1)",
          "date_calculator('{{reporting_date_end}}', days=+1)",
        ],
        produces: ["stripe_charges_by_date"],
        children: [],
      },
      {
        id: "step-3.2",
        title: "fetch_stripe_charges_by_records",
        description: "From: stripe, Entity: charges (by specific records)",
        assignedTo: "fetcher",
        status: "pending",
        nestLevel: 1,
        phase: "data-collection",
        priority: "medium",
        dataSource: "stripe",
        codeSnippet:
          "SELECT record_id AS itinerary_id, booking_number AS internal_id, reporting_date FROM fetch_onewurld_snowstorm_database_update_payment_info_records",
        consumes: ["payment_info_records"],
        produces: ["stripe_charges_by_records"],
        children: [],
      },
    ],
  },
  {
    id: "step-4",
    title: "Retrieve Supplier Reservation Data",
    description: "Retrieve reservation data from external supplier systems",
    assignedTo: "fetcher",
    status: "pending",
    nestLevel: 0,
    phase: "data-collection",
    priority: "medium",
    dataSource: "external-suppliers",
    dependencies: ["step-2.1"],
    children: [
      {
        id: "step-4.1",
        title: "fetch_mozio_reservations",
        description: "From: mozio, Entity: reservations",
        assignedTo: "fetcher",
        status: "pending",
        nestLevel: 1,
        phase: "data-collection",
        priority: "medium",
        dataSource: "mozio",
        codeSnippet:
          "SELECT * FROM fetch_onewurld_snowstorm_database_update_supplier_info_records WHERE supplier_name = 'Mozio'",
        skipCondition:
          "count(SELECT * FROM fetch_onewurld_snowstorm_database_update_supplier_info_records WHERE supplier_name = 'Mozio') < 1",
        consumes: ["supplier_info_records"],
        produces: ["mozio_reservations"],
        children: [],
      },
      {
        id: "step-4.2",
        title: "fetch_expedia_reservations",
        description: "From: expedia, Entity: reservations",
        assignedTo: "fetcher",
        status: "pending",
        nestLevel: 1,
        phase: "data-collection",
        priority: "medium",
        dataSource: "expedia",
        codeSnippet:
          "SELECT * FROM fetch_onewurld_snowstorm_database_update_supplier_info_records WHERE supplier_name = 'EXP'",
        skipCondition:
          "count(SELECT * FROM fetch_onewurld_snowstorm_database_update_supplier_info_records WHERE supplier_name = 'EXP') < 1",
        consumes: ["supplier_info_records"],
        produces: ["expedia_reservations"],
        children: [],
      },
      {
        id: "step-4.3",
        title: "fetch_grn_reservations",
        description: "From: grn, Entity: reservations",
        assignedTo: "fetcher",
        status: "pending",
        nestLevel: 1,
        phase: "data-collection",
        priority: "medium",
        dataSource: "grn",
        codeSnippet:
          "SELECT * FROM fetch_onewurld_snowstorm_database_update_supplier_info_records WHERE supplier_name IN ['GRNHotel', 'GRN']",
        skipCondition:
          "count(SELECT * FROM fetch_onewurld_snowstorm_database_update_supplier_info_records WHERE supplier_name IN ['GRNHotel', 'GRN']) < 1",
        consumes: ["supplier_info_records"],
        produces: ["grn_reservations"],
        children: [],
      },
      {
        id: "step-4.4",
        title: "fetch_priceline_reservations",
        description: "From: priceline, Entity: reservations",
        assignedTo: "fetcher",
        status: "pending",
        nestLevel: 1,
        phase: "data-collection",
        priority: "medium",
        dataSource: "priceline",
        codeSnippet:
          "SELECT * FROM fetch_onewurld_snowstorm_database_update_supplier_info_records WHERE supplier_name = 'PriceLine'",
        skipCondition:
          "count(SELECT * FROM fetch_onewurld_snowstorm_database_update_supplier_info_records WHERE supplier_name = 'PriceLine') < 1",
        consumes: ["supplier_info_records"],
        produces: ["priceline_reservations"],
        children: [],
      },
      {
        id: "step-4.5",
        title: "fetch_hotelbeds_reservations",
        description: "From: hotelbeds, Entity: reservations",
        assignedTo: "fetcher",
        status: "pending",
        nestLevel: 1,
        phase: "data-collection",
        priority: "medium",
        dataSource: "hotelbeds",
        codeSnippet:
          "SELECT * FROM fetch_onewurld_snowstorm_database_update_supplier_info_records WHERE supplier_name = 'HotelBeds'",
        skipCondition:
          "count(SELECT * FROM fetch_onewurld_snowstorm_database_update_supplier_info_records WHERE supplier_name = 'HotelBeds') < 1",
        consumes: ["supplier_info_records"],
        produces: ["hotelbeds_reservations"],
        children: [],
      },
    ],
  },
  {
    id: "step-5",
    title: "Update Database with Collected Data",
    description: "Store processed information back to database",
    assignedTo: "updater",
    status: "pending",
    nestLevel: 0,
    phase: "data-update",
    priority: "high",
    dependencies: ["step-3", "step-4"],
    children: [
      {
        id: "step-5.1",
        title: "upsert_onewurld_snowstorm_database_supplier_info",
        description: "From: onewurld_snowstorm_database, Entity: supplier_info",
        assignedTo: "updater",
        status: "pending",
        nestLevel: 1,
        phase: "data-update",
        priority: "high",
        dataSource: "onewurld_snowstorm_database",
        codeSnippet:
          "SELECT primary_id AS id, supplier_id, supplier_name, supplier_status, supplier_cost, supplier_currency, <string>raw_response AS supplier_info_response FROM fetch_mozio_reservations, fetch_expedia_reservations, fetch_grn_reservations, fetch_priceline_reservations, fetch_hotelbeds_reservations",
        options: {
          table_name: "supplier_info",
          primary_keys: ["id"],
          batch_size: 100,
        },
        consumes: [
          "mozio_reservations",
          "expedia_reservations",
          "grn_reservations",
          "priceline_reservations",
          "hotelbeds_reservations",
        ],
        produces: ["updated_supplier_info"],
        children: [],
      },
      {
        id: "step-5.2",
        title: "upsert_onewurld_snowstorm_database_payment_info",
        description: "From: onewurld_snowstorm_database, Entity: payment_info",
        assignedTo: "updater",
        status: "pending",
        nestLevel: 1,
        phase: "data-update",
        priority: "high",
        dataSource: "onewurld_snowstorm_database",
        codeSnippet:
          "SELECT region AS payment_account_id, payment_itinerary_id AS id, payment_internal_id, payment_id, payment_type, payment_source, payment_status, payment_failure_code, payment_failure_message, payment_currency, payment_amount, payment_amount_captured, payment_amount_refunded, payment_info_created_datetime, payment_internal_id_name, payment_info_response, payment_card_number, payment_customer, payment_statement_descriptor FROM fetch_stripe_charges_by_date_range, fetch_stripe_charges_by_records",
        options: {
          table_name: "payment_info",
          primary_keys: ["payment_id"],
          batch_size: 100,
        },
        consumes: ["stripe_charges_by_date", "stripe_charges_by_records"],
        produces: ["updated_payment_info"],
        children: [],
      },
    ],
  },
];

// Function to get steps
export const getSteps = async (): Promise<Step[]> => {
  // In a real implementation, this would be an API call
  // For now, we'll just return the sample data
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(sampleSteps);
    }, 300);
  });
};

// Function to update steps
export const updateSteps = async (steps: Step[]): Promise<Step[]> => {
  // In a real implementation, this would be an API call to update steps
  return new Promise((resolve) => {
    setTimeout(() => {
      // Just return the updated steps as if they were saved
      resolve(steps);
    }, 300);
  });
};

// Function to find step by ID
export const findStepById = (
  stepId: string,
  stepsArray: Step[] = sampleSteps
): Step | null => {
  for (const step of stepsArray) {
    if (step.id === stepId) return step;
    if (step.children && step.children.length > 0) {
      const found = findStepById(stepId, step.children);
      if (found) return found;
    }
  }
  return null;
};

// Extract all unique phases from steps
export const getUniquePhases = (): StepPhase[] => {
  const phases = new Set<StepPhase>();

  const extractPhases = (steps: Step[]) => {
    for (const step of steps) {
      if (step.phase) phases.add(step.phase);
      if (step.children && step.children.length > 0) {
        extractPhases(step.children);
      }
    }
  };

  extractPhases(sampleSteps);
  return Array.from(phases);
};

// Extract all unique priorities from steps
export const getUniquePriorities = (): StepPriority[] => {
  const priorities = new Set<StepPriority>();

  const extractPriorities = (steps: Step[]) => {
    for (const step of steps) {
      if (step.priority) priorities.add(step.priority);
      if (step.children && step.children.length > 0) {
        extractPriorities(step.children);
      }
    }
  };

  extractPriorities(sampleSteps);
  return Array.from(priorities);
};

export default {
  getSteps,
  updateSteps,
  findStepById,
  getUniquePhases,
  getUniquePriorities,
};
