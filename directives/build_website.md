# Directive: Operational Project Management Platform

## Objective

Build a modern operational project management platform focused on:

- meetings
- decisions
- issues
- action items
- operational traceability
- project coordination

The system should function as an **operational command center** where meetings generate structured execution flows.

The platform is **NOT** intended to be a generic task manager.

The focus is:

- operational governance
- meeting-driven workflows
- relationship-based architecture
- execution visibility
- operational intelligence

---

## Product Positioning

The platform should communicate:

- operational clarity
- modern project coordination
- execution visibility
- premium simplicity
- fast navigation
- connected workflows

The product positioning should sit between:

- Linear
- ClickUp
- Notion
- enterprise governance systems

But with a more operational and relationship-driven approach.

---

## Core System Concept

The system is based on the following operational flow:

```
Meeting
↓
Decision
↓
Issue
↓
Mitigation Action
↓
Execution
```

Everything should remain connected and traceable.

Users must always understand:

- where information came from
- what generated what
- who owns the execution
- what is blocked
- what requires attention

---

## Core Modules

The platform should contain the following modules:

- Dashboard
- Meetings
- Action Items
- Decisions
- Issues
- Directory
- Settings
- Projects

**Projects** are the main operational containers.

Each project should contain:

- meetings
- decisions
- issues
- action items
- members
- organizations
- operational activity

---

## Project Dashboard

The dashboard should function as an **operational command center**.

**NOT** as a traditional analytics dashboard.

Avoid:

- excessive charts
- complex BI visuals
- overloaded metrics
- enterprise ERP feeling

The dashboard must prioritize:

- clarity
- operational scanning
- quick decision-making
- execution visibility

---

### Dashboard Structure

#### Header

The project header should contain:

- project name
- short description
- operational status badge

Remove unnecessary visual noise such as:

- owner block
- procurement badge
- directory shortcut
- settings shortcut
- excessive metadata

Keep the header extremely clean and focused.

---

#### KPI Cards

The dashboard should contain operational KPI cards.

**Operational KPIs**

- Open Action Items
- Open Issues
- Recent Decisions
- Upcoming Meetings

**Financial KPIs**

The dashboard should also support project financial tracking.

Required cards:

- Contract Original Value
- Total Pay App Approved
- Addendum Up-to-date Value
- Total Project Contract

The financial cards should:

- remain visually minimal
- use strong typography
- avoid excessive colors
- prioritize readability

---

#### Recent Activity

Operational timeline showing:

- decisions created
- issues raised
- meetings finalized
- action items completed

The activity feed should support:

- fast scanning
- temporal grouping
- lightweight layout
- subtle separators

---

#### Project Status Widget

The project status card should contain:

- progress percentage
- operational phase
- number of members
- open issues
- decision count

Avoid complex charts.

---

#### Upcoming Meetings

Simple operational list containing:

- meeting title
- schedule
- attendee count

---

## Meetings

Meetings are the **operational core** of the platform.

The system must allow users to:

- create meetings
- invite attendees
- write structured notes
- extract operational items
- finalize and publish meetings

---

### Meeting Structure

Each meeting should contain:

- title
- date
- attendees
- notes
- status
- extracted items

---

### Smart Extraction System

During meetings, users may use markers such as:

- `[decision]`
- `[issue]`
- `[action @name]`

The system automatically converts these markers into:

- Decisions
- Issues
- Action Items

---

### Meeting Finalization Flow

When ending a meeting:

- the system displays a review dialog
- extracted items become editable
- users confirm publication
- all entities are persisted

---

## Decisions

Decisions function as **official operational decision records**.

### Decision Structure

Each decision should contain:

- decision text
- origin meeting
- date
- status
- decider
- optional notes

### Decision Statuses

- Proposed
- Approved
- Reverted

### Decision Creation Rules

Decisions should:

- primarily originate from meetings
- maintain traceability
- allow metadata editing

The decision text itself should remain tied to the meeting origin.

---

## Issues

Issues represent:

- risks
- blockers
- operational problems
- execution impediments

### Issue Structure

Each issue should contain:

- issue text
- owner
- severity
- status
- blocking flag
- optional mitigation action
- origin reference

### Issue Statuses

- Open
- In Review
- Resolved

### Severity Levels

- Low
- Medium
- High
- Critical

---

### Blocking Logic

When an issue is marked as:

```
blocking = true
```

the system should allow users to:

- link an existing Action Item
- create a new mitigation Action Item
- maintain bidirectional relationships

---

### Mitigation Action Workflow

The mitigation flow should feel natural and contextual.

The mitigation section should only appear when:

```
blocking = ON
```

**Mitigation UX Flow**

When blocking is enabled:

```
[ Blocking switch: ON ]
        │
        ▼
┌─ Mitigation action ──────────────────┐
│  No mitigation action linked         │
│  [ Link existing ]  [ + Create ]     │
└──────────────────────────────────────┘
```

When already linked:

```
┌─ Mitigation action ──────────────────┐
│  ✓ "Contact utility company"         │
│     [ Change ] [ Unlink ]            │
└──────────────────────────────────────┘
```

---

### Bidirectional Relationships

Issues should contain:

- `linkedActionItemId?: string`

Action Items should contain:

- `linkedIssueId?: string`
- `linkedIssueText?: string`

The relationship should remain synchronized automatically.

---

## Action Items

Action Items represent **operational execution**.

### Action Item Structure

Each Action Item should contain:

- title
- assignee
- priority
- status
- optional due date
- origin reference
- optional linked issue

### Action Item Statuses

- Open
- In Progress
- Done

### Action Item Priorities

- Low
- Medium
- High
- Urgent

### Action Item Origins

Possible origins:

- Meeting
- Decision
- Issue
- Manual

---

## Directory

The Directory module should exist **outside** the internal project operational flow.

It should function as a workspace-level module.

**NOT** as a project subpage.

### Directory Purpose

The Directory manages:

- people
- organizations
- participants
- companies
- project members

### Directory Structure

The Directory should support two separated views.

#### People

Table-based view containing:

- name
- role/title
- organization
- permission role
- contact information

#### Organizations

Card-based view containing:

- organization name
- member count
- linked members

---

## Table Design Guidelines

All system tables should follow modern operational UX/UI principles.

### Tables Must Prioritize

- readability
- operational scanning
- lightweight hierarchy
- compact spacing
- clean typography
- low visual noise

### Table UX Rules

Avoid:

- excessive borders
- heavy grids
- outdated enterprise aesthetics
- too many columns
- oversized filters
- dense metadata

Prioritize:

- fast scanning
- clean row separation
- subtle hover states
- strong typography hierarchy
- lightweight badges
- contextual actions

---

### Filtering System

Tables should support:

- lightweight filters
- compact chips
- simplified search
- fast interactions

Avoid large filter panels.

---

### Recommended Table Pattern

Preferred structure:

```
Tabs
↓
Search + lightweight filters
↓
Clean operational table
↓
Subtle footer metadata
```

---

### Issues Table Direction

The recommended Issues layout should follow:

- compact operational table
- tabs on top
- lightweight filters
- clean rows
- subtle status badges
- reduced visual complexity

The visual direction should prioritize:

- operational clarity
- modern SaaS feeling
- fast scanning
- premium simplicity

---

## Sidebar

The sidebar should be:

- dark
- compact
- operational
- minimal

### Sidebar Structure

- Dashboard
- Meetings
- Action Items
- Decisions
- Issues

Avoid adding:

- analytics overload
- unnecessary modules
- excessive navigation layers

---

## Design Principles

The entire platform should follow:

- minimalist UI
- operational focus
- premium SaaS aesthetics
- strong typography
- generous spacing
- mobile-first thinking

### The Platform Should NOT Feel Like

- ERP systems
- legacy enterprise software
- spreadsheet-based management tools
- heavy PM suites

### The Platform SHOULD Feel Like

- modern operational software
- executive coordination platform
- premium SaaS product
- high-performance workflow system

---

## Responsiveness

The platform must function perfectly on:

- desktop
- tablet
- mobile

The architecture should follow a **mobile-first** approach.

---

## Performance

Prioritize:

- fast rendering
- lightweight interfaces
- reusable components
- low visual complexity

---

## Technical Architecture

The project should follow a modular architecture.

### Folder Structure

```
/components
Reusable UI components

/routes
Application routes

/lib
Business logic, stores, services

/design-system
Tokens and UI foundations
```

---

### Core Components

Main reusable components:

- Sidebar
- Header
- KPI Cards
- Activity Timeline
- Tables
- Filters
- Dialogs
- Popovers
- Command Search
- Status Badges
- Relation Badges
- Origin Badges

---

## Data Relationships

The platform architecture should preserve relationships between entities.

Examples:

```
Meeting
 ├── Decisions
 ├── Issues
 └── Action Items

Issue
 └── Mitigation Action Item

Decision
 └── Generated Action Items
```

Everything should remain connected and traceable.

---

## Out of Scope

The following items are intentionally excluded for now:

- cascade delete logic
- automatic resolution flows
- advanced automation engines
- multiple mitigation actions per issue
- enterprise reporting
- advanced analytics

---

## Expected Outcome

At the end of implementation, the platform should deliver:

- operational traceability
- connected workflows
- meeting-driven execution
- modern operational UX/UI
- premium SaaS experience
- fast navigation
- clean architecture
- execution visibility
- scalable relational structure