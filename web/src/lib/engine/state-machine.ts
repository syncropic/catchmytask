import type { StateMachineInfo, WorkItem } from '@/types'

export interface TransitionResult {
  valid: true
  setStartedAt: boolean
  setCompletedAt: boolean
  clearCompletedAt: boolean
  clearBlockedReason: boolean
  requireBlockedReason: boolean
}

export interface TransitionError {
  valid: false
  error: string
}

export function validateTransition(
  machine: StateMachineInfo,
  fromStatus: string,
  toStatus: string,
  force = false,
): TransitionResult | TransitionError {
  // Check target state exists
  if (!machine.states[toStatus]) {
    const validStates = Object.keys(machine.states).join(', ')
    return { valid: false, error: `Unknown state '${toStatus}'. Valid states: ${validStates}` }
  }

  if (!force) {
    const targets = getValidTargets(machine, fromStatus)
    if (!targets.includes(toStatus)) {
      const targetList = targets.length ? targets.join(', ') : '(none)'
      return {
        valid: false,
        error: `Cannot transition from '${fromStatus}' to '${toStatus}'. Valid targets: ${targetList}`,
      }
    }
  }

  const targetConfig = machine.states[toStatus]
  const currentConfig = machine.states[fromStatus]

  const isTargetInitial = targetConfig?.initial ?? false
  const isTargetTerminal = targetConfig?.terminal ?? false
  const isCurrentTerminal = currentConfig?.terminal ?? false

  return {
    valid: true,
    setStartedAt: !isTargetInitial && !isTargetTerminal,
    setCompletedAt: isTargetTerminal,
    clearCompletedAt: isCurrentTerminal && !isTargetTerminal,
    requireBlockedReason: toStatus === 'blocked',
    clearBlockedReason: fromStatus === 'blocked' && toStatus !== 'blocked',
  }
}

export function getValidTargets(machine: StateMachineInfo, fromStatus: string): string[] {
  return machine.transitions
    .filter((t) => t.from === fromStatus)
    .map((t) => t.to)
}

export function applyTransitionEffects(
  item: WorkItem,
  toStatus: string,
  machine: StateMachineInfo,
  reason?: string,
  force = false,
): { item: WorkItem; error?: string } {
  const result = validateTransition(machine, item.status, toStatus, force)

  if (!result.valid) {
    return { item, error: result.error }
  }

  if (result.requireBlockedReason && !reason) {
    return { item, error: "Blocked reason is required when transitioning to 'blocked'" }
  }

  const now = new Date().toISOString()
  const updated: WorkItem = { ...item, status: toStatus, updated_at: now }

  if (result.setStartedAt && !item.started_at) {
    updated.started_at = now
  }
  if (result.setCompletedAt) {
    updated.completed_at = now
  }
  if (result.clearCompletedAt) {
    updated.completed_at = undefined
  }
  if (result.requireBlockedReason) {
    updated.blocked_reason = reason
  }
  if (result.clearBlockedReason) {
    updated.blocked_reason = undefined
  }

  return { item: updated }
}
