import type { ProjectConfig, StateMachineInfo, StateInfo, TransitionInfo } from '@/types'

export const DEFAULT_STATES: Record<string, StateInfo> = {
  inbox: { initial: true, terminal: false },
  ready: { initial: false, terminal: false },
  active: { initial: false, terminal: false },
  blocked: { initial: false, terminal: false },
  done: { initial: false, terminal: true },
  cancelled: { initial: false, terminal: true },
}

export const DEFAULT_TRANSITIONS: TransitionInfo[] = [
  { from: 'inbox', to: 'ready' },
  { from: 'inbox', to: 'cancelled' },
  { from: 'ready', to: 'active' },
  { from: 'ready', to: 'cancelled' },
  { from: 'active', to: 'blocked' },
  { from: 'active', to: 'done' },
  { from: 'active', to: 'cancelled' },
  { from: 'blocked', to: 'active' },
  { from: 'blocked', to: 'cancelled' },
]

export const DEFAULT_STATE_MACHINE: StateMachineInfo = {
  states: DEFAULT_STATES,
  transitions: DEFAULT_TRANSITIONS,
}

export const DEFAULT_CONFIG: ProjectConfig = {
  project: {
    name: 'My Project',
    prefix: 'CMT',
    description: '',
  },
  defaults: {
    priority: 'none',
    type: 'task',
    status: 'inbox',
  },
  state_machines: {
    default: DEFAULT_STATE_MACHINE,
  },
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export function validateConfig(config: ProjectConfig): ValidationResult {
  const errors: string[] = []

  // C-02: prefix format
  if (!/^[A-Z][A-Z0-9]{0,7}$/.test(config.project.prefix)) {
    errors.push(
      `Invalid prefix '${config.project.prefix}'. Must be 1-8 uppercase alphanumeric starting with a letter.`,
    )
  }

  // C-05: valid priority
  const validPriorities = ['critical', 'high', 'medium', 'low', 'none']
  if (!validPriorities.includes(config.defaults.priority)) {
    errors.push(`Invalid default priority '${config.defaults.priority}'.`)
  }

  // Validate state machines
  for (const [name, machine] of Object.entries(config.state_machines)) {
    // C-10: at least one initial
    const hasInitial = Object.values(machine.states).some((s) => s.initial)
    if (!hasInitial) {
      errors.push(`State machine '${name}' has no initial state.`)
    }

    // C-11: at least one terminal
    const hasTerminal = Object.values(machine.states).some((s) => s.terminal)
    if (!hasTerminal) {
      errors.push(`State machine '${name}' has no terminal state.`)
    }

    // C-08: state name format
    for (const stateName of Object.keys(machine.states)) {
      if (!/^[a-z][a-z0-9_-]{0,29}$/.test(stateName)) {
        errors.push(`State machine '${name}': invalid state name '${stateName}'.`)
      }
    }

    for (const t of machine.transitions) {
      // C-12/13: transitions reference defined states
      if (!machine.states[t.from]) {
        errors.push(`State machine '${name}': transition from unknown state '${t.from}'.`)
      }
      if (!machine.states[t.to]) {
        errors.push(`State machine '${name}': transition to unknown state '${t.to}'.`)
      }
      // C-14: no transitions from terminal
      if (machine.states[t.from]?.terminal) {
        errors.push(`State machine '${name}': terminal state '${t.from}' has outgoing transitions.`)
      }
      // C-15: no self-transitions
      if (t.from === t.to) {
        errors.push(`State machine '${name}': self-transition on '${t.from}'.`)
      }
    }

    // C-16: non-terminal states need outgoing transitions
    for (const [stateName, stateConfig] of Object.entries(machine.states)) {
      if (!stateConfig.terminal) {
        const hasOutgoing = machine.transitions.some((t) => t.from === stateName)
        if (!hasOutgoing) {
          errors.push(`State machine '${name}': non-terminal state '${stateName}' has no outgoing transitions.`)
        }
      }
    }

    // C-18: defaults.status must be initial in default machine
    if (name === 'default') {
      const defaultState = machine.states[config.defaults.status]
      if (defaultState && !defaultState.initial) {
        errors.push(`defaults.status '${config.defaults.status}' is not an initial state.`)
      }
      if (!defaultState && config.defaults.status) {
        errors.push(`defaults.status '${config.defaults.status}' is not a valid state.`)
      }
    }
  }

  return { valid: errors.length === 0, errors }
}

export function mergeConfigs(base: ProjectConfig, override: Partial<ProjectConfig>): ProjectConfig {
  return {
    project: { ...base.project, ...override.project },
    defaults: { ...base.defaults, ...override.defaults },
    state_machines: override.state_machines
      ? { ...base.state_machines, ...override.state_machines }
      : base.state_machines,
  }
}
