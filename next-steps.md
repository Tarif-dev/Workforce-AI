# Workforce AI SaaS - Backend Build Instructions

## Project Goal

Build a production-grade AI-powered workforce management platform where employees interact through WhatsApp using natural language.

The AI system must convert employee messages into structured business operations while maintaining strict validation, auditability, and data integrity.

This is NOT a chatbot.

This is a business transaction processing system.

AI may assist extraction.

AI must never make business decisions.

Business rules are deterministic.

Validation is deterministic.

Database writes are deterministic.

---

# Core Architectural Principle

Never trust:

* User Input
* LLM Output
* Extracted Data

Always validate before database operations.

Architecture:

User Message
→ Intent Classification
→ Extraction
→ Validation
→ Tool Execution
→ Database
→ Response

No database write may occur before validation.

---

# Current Status

Completed:

* AI Provider (Ollama)
* Intent Classification
* Leave Extraction
* Leave Validation
* Leave Tool
* Leave Database Persistence
* Timesheet Extraction
* Intent Router

---

# Phase 1 - Complete Timesheet Flow

Goal:

Bring Timesheet flow to the same maturity level as Leave flow.

---

## Create TimesheetValidatorService

Responsibilities:

Validate extracted timesheet data.

Must NOT call AI.

Pure business logic.

Rules:

### Rule 1

Entries must exist.

Reject:

{
"entries":[]
}

Question:

"Please provide your work entries."

---

### Rule 2

Project must be present.

Reject:

{
"project": null,
"hours": 5
}

Question:

"Which project did you work on?"

---

### Rule 3

Hours must be present.

Reject:

{
"project":"CRM",
"hours": null
}

Question:

"How many hours did you spend on CRM?"

---

### Rule 4

Hours must be greater than zero.

Reject:

0
-1
-5

---

### Rule 5

Single entry hours <= 24

Reject:

50
100

---

### Rule 6

Total daily hours <= 24

Reject:

CRM 15h
Support 12h

Total = 27

---

### Rule 7

Round to maximum 2 decimal places.

---

## Create Timesheet Persistence

SubmitTimesheetTool must write:

Timesheet

and

TimesheetEntry

records.

Use Prisma transaction.

Requirements:

* Find existing timesheet for user/date
* Update existing if present
* Create if absent

Prevent duplicate submissions.

---

# Phase 2 - Project Validation

Current issue:

AI can extract:

"Worked 5 hours on Superman Project"

Project may not exist.

Create:

ProjectValidationService

Responsibilities:

Validate project existence.

Check organization projects.

Return clarification when project not found.

Example:

"I cannot find project 'Superman Project'. Please choose one of: CRM, Support, Frontend."

No AI.

Database lookup only.

---

# Phase 3 - Context Memory

Problem:

Conversation state is lost.

Example:

User:
Need leave

Bot:
What type?

User:
Sick

Current system fails.

Build:

ConversationContext table

Store:

* User ID
* Last Intent
* Missing Fields
* Pending Workflow
* Timestamp

Allow multi-turn completion.

---

# Phase 4 - Attendance Module

Add:

AttendanceExtractor

AttendanceValidator

AttendanceTool

Supported actions:

* Mark Attendance
* Regularization
* Forgot Punch
* Mark Present

---

# Phase 5 - Work From Home Module

Add:

WFHExtractor

WFHValidator

WFHTool

Supported actions:

* Request WFH
* Remote Work Request

---

# Phase 6 - Organization-Aware AI

Current issue:

AI is organization agnostic.

Future:

Each organization has:

* Leave Policies
* Working Hours
* Allowed Leave Types
* Projects
* Managers

Validation must use organization configuration.

---

# Phase 7 - Audit Logging

Create:

AuditLog table

Track:

* User Message
* Intent
* Extracted Data
* Validation Result
* Tool Executed
* Database Changes
* Timestamp

Never lose AI decisions.

Required for enterprise customers.

---

# Phase 8 - Error Handling

Create global exception filters.

Never expose:

* Prisma Errors
* Stack Traces
* Internal Exceptions

Return business-safe messages only.

---

# Phase 9 - DTO Layer

Every endpoint must have:

Request DTO

Response DTO

Validation decorators

No any types.

No raw objects.

Strict typing.

---

# Phase 10 - Testing

Unit Tests:

* Intent
* Extractors
* Validators
* Tools

Integration Tests:

* Full Leave Flow
* Full Timesheet Flow

Create 100+ test scenarios.

---

# Phase 11 - WhatsApp Integration

After all business flows are stable:

Connect:

WhatsApp Webhook
→ Router
→ Context Engine
→ Validators
→ Tools

No AI logic inside controller.

Controllers remain thin.

---

# Phase 12 - Production Readiness

Add:

* Logging
* Rate Limiting
* Request IDs
* Monitoring
* Metrics
* Retry Logic
* Queue Processing
* Background Jobs

---

# Non-Negotiable Rules

1. AI extracts.
2. Validators decide.
3. Tools execute.
4. Database stores.
5. Controllers orchestrate.
6. No business logic in controllers.
7. No AI inside validators.
8. No AI inside tools.
9. No database writes before validation.
10. No usage of any in production code.

Follow SOLID principles.

Follow NestJS module boundaries.

Prefer composition over inheritance.

Prefer deterministic business logic over AI reasoning.
