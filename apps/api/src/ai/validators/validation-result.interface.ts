export interface ValidationResult {
  valid: boolean;

  needsClarification: boolean;

  question?: string;

  data?: any;
}