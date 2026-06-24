export enum IntentType {
  TIMESHEET_ENTRY = 'TIMESHEET_ENTRY',

  LEAVE_REQUEST = 'LEAVE_REQUEST',

  LEAVE_BALANCE_QUERY = 'LEAVE_BALANCE_QUERY',

  TIMESHEET_QUERY = 'TIMESHEET_QUERY',

  APPROVAL_QUERY = 'APPROVAL_QUERY',

  GENERAL_QUERY = 'GENERAL_QUERY',

  HELP = 'HELP',

  UNKNOWN = 'UNKNOWN',
}

export interface IntentResult {
  intent: IntentType;

  confidence: number;

  extractedData?: Record<string, any>;
}
