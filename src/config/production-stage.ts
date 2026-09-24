/**
 * Production board stages, shared by the board screen and the API so both agree
 * on the order, the labels and who may make each move.
 *
 *   Queue → Assigned → In Progress → Quality Check → Final Check → Completed
 *
 * Workers move their own task up to Quality Check. Passing or failing a check
 * and completing the task are a supervisor's (manager or owner), so nobody
 * signs off their own work.
 */
export const STAGES = ['queued', 'assigned', 'in_progress', 'quality_check', 'final_check', 'completed'] as const;
export type Stage = (typeof STAGES)[number];

export const STAGE_LABELS: Record<Stage, string> = {
  queued: 'Queue',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  quality_check: 'Quality Check',
  final_check: 'Final Check',
  completed: 'Completed',
};

export const isStage = (value: unknown): value is Stage => STAGES.includes(value as Stage);

export type Move = {
  to: Stage;
  /** Button text on the board. */
  label: string;
  supervisorOnly: boolean;
  /** A step back needs a reason on the log. */
  needsNote?: boolean;
};

/** The moves offered from each stage, forward first. */
export const MOVES: Record<Stage, Move[]> = {
  queued: [{ to: 'assigned', label: 'Assign', supervisorOnly: false }],
  assigned: [
    { to: 'in_progress', label: 'Start work', supervisorOnly: false },
    { to: 'queued', label: 'Return to queue', supervisorOnly: false },
  ],
  in_progress: [{ to: 'quality_check', label: 'Send to quality check', supervisorOnly: false }],
  quality_check: [
    { to: 'final_check', label: 'Pass quality check', supervisorOnly: true },
    { to: 'in_progress', label: 'Send back for rework', supervisorOnly: true, needsNote: true },
  ],
  final_check: [
    { to: 'completed', label: 'Complete and stock', supervisorOnly: true },
    { to: 'quality_check', label: 'Back to quality check', supervisorOnly: true, needsNote: true },
  ],
  completed: [],
};

export const SUPERVISOR_ROLES = ['manager', 'owner'];
