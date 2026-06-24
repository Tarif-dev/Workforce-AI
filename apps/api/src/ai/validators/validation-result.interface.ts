export interface ValidationResult<T = any> {
  valid: boolean;

  needsClarification: boolean;

  question?: string;

  data?: T;
}
