import { TimesheetValidatorService } from './timesheet-validator.service';

describe('TimesheetValidatorService', () => {
  let validator: TimesheetValidatorService;

  beforeEach(() => {
    validator = new TimesheetValidatorService();
  });

  // ── Rule 1: Entries must exist ──

  it('should reject empty entries array', async () => {
    const result = await validator.validate({
      entries: [],
    });

    expect(result.valid).toBe(false);
    expect(result.needsClarification).toBe(true);
    expect(result.question).toBe('Please provide your work entries.');
  });

  it('should reject missing entries field', async () => {
    const result = await validator.validate({});

    expect(result.valid).toBe(false);
    expect(result.needsClarification).toBe(true);
    expect(result.question).toBe('Please provide your work entries.');
  });

  // ── Rule 2: Project must be present ──

  it('should reject entry with null project', async () => {
    const result = await validator.validate({
      entries: [{ project: null, hours: 5 }],
    });

    expect(result.valid).toBe(false);
    expect(result.needsClarification).toBe(true);
    expect(result.question).toBe('Which project did you work on?');
  });

  it('should reject entry with empty string project', async () => {
    const result = await validator.validate({
      entries: [{ project: '  ', hours: 5 }],
    });

    expect(result.valid).toBe(false);
    expect(result.needsClarification).toBe(true);
    expect(result.question).toBe('Which project did you work on?');
  });

  // ── Rule 3: Hours must be present ──

  it('should reject entry with null hours', async () => {
    const result = await validator.validate({
      entries: [{ project: 'CRM', hours: null }],
    });

    expect(result.valid).toBe(false);
    expect(result.needsClarification).toBe(true);
    expect(result.question).toBe('How many hours did you spend on CRM?');
  });

  it('should reject entry with undefined hours', async () => {
    const result = await validator.validate({
      entries: [{ project: 'CRM' }],
    });

    expect(result.valid).toBe(false);
    expect(result.needsClarification).toBe(true);
    expect(result.question).toBe('How many hours did you spend on CRM?');
  });

  // ── Rule 4: Hours must be greater than zero ──

  it('should reject zero hours', async () => {
    const result = await validator.validate({
      entries: [{ project: 'CRM', hours: 0 }],
    });

    expect(result.valid).toBe(false);
    expect(result.needsClarification).toBe(true);
    expect(result.question).toBe('Hours must be greater than zero.');
  });

  it('should reject negative hours', async () => {
    const result = await validator.validate({
      entries: [{ project: 'CRM', hours: -5 }],
    });

    expect(result.valid).toBe(false);
    expect(result.needsClarification).toBe(true);
    expect(result.question).toBe('Hours must be greater than zero.');
  });

  // ── Rule 5: Single entry hours <= 24 ──

  it('should reject single entry exceeding 24 hours', async () => {
    const result = await validator.validate({
      entries: [{ project: 'CRM', hours: 50 }],
    });

    expect(result.valid).toBe(false);
    expect(result.needsClarification).toBe(true);
    expect(result.question).toBe('A single entry cannot exceed 24 hours.');
  });

  // ── Rule 6: Total daily hours <= 24 ──

  it('should reject when total daily hours exceed 24', async () => {
    const result = await validator.validate({
      entries: [
        { project: 'CRM', hours: 15 },
        { project: 'Support', hours: 12 },
      ],
    });

    expect(result.valid).toBe(false);
    expect(result.needsClarification).toBe(true);
    expect(result.question).toBe(
      'Total daily hours cannot exceed 24. Current total: 27.',
    );
  });

  // ── Rule 7: Round to max 2 decimal places ──

  it('should round hours to 2 decimal places', async () => {
    const result = await validator.validate({
      entries: [{ project: 'CRM', hours: 2.3333 }],
    });

    expect(result.valid).toBe(true);
    expect(result.data!.entries![0].hours).toBe(2.33);
  });

  // ── Happy paths ──

  it('should accept valid single entry', async () => {
    const result = await validator.validate({
      entries: [{ project: 'CRM', hours: 8 }],
    });

    expect(result.valid).toBe(true);
    expect(result.needsClarification).toBe(false);
    expect(result.data!.entries).toHaveLength(1);
    expect(result.data!.entries![0].project).toBe('CRM');
    expect(result.data!.entries![0].hours).toBe(8);
  });

  it('should accept valid multiple entries totalling 24', async () => {
    const result = await validator.validate({
      entries: [
        { project: 'CRM', hours: 8 },
        { project: 'Support', hours: 8 },
        { project: 'Frontend', hours: 8 },
      ],
    });

    expect(result.valid).toBe(true);
    expect(result.needsClarification).toBe(false);
    expect(result.data!.entries).toHaveLength(3);
  });
});
