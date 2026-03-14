# Portal Business Scope – Recap, Entities, Flow & Gaps

## 1. Roles

| Role   | Description |
|--------|-------------|
| **Admin** | Full access: users, agents, jobs, visa, authorizations, hiring requests, settings (profession, nationality, etc.), plus all agent capabilities. |
| **Agent** | Limited: upload CVs, create/edit candidates, assign candidates only to **their** hiring requests (manually or via Match AI), manage candidate stages for those jobs. |

---

## 2. Main Entities

| Entity | Description | Owner / Notes |
|--------|-------------|----------------|
| **User** | Login account. Role: Admin or Agent. If Agent → linked to one **Agent** (entity). | Admin creates users; for “agent user”, admin selects the Agent entity. |
| **Agent** | Agency/company (e.g. TRANS ASIA INTEGRATE SERVICES). Has many **agent users**. | Admin only: CRUD. Used when assigning HR and authorization to “an agent”. |
| **Job** | Position to fill (title, client, location, etc.). | Admin creates. |
| **Hiring Request (HR)** | Request under a job; has count (required/filled), visa, salary, etc. **Assigned to one Agent (entity) and one Agent user** (user) who is responsible for it. | Admin creates. Agent user sees only HRs assigned to them. |
| **Authorization** | Links client, hiring request, agent, visa-related and embassy fields, enjaz, etc. | Admin creates/manages. Tied to HR and agent. |
| **Visa** | Visa number (and related data). Stored on Hiring Request (and possibly Authorization). | Admin manages; visible in HR/authorization flow. |
| **Candidate** | Person in the pipeline. Created from CV (AI or manual) or created manually. | Agent (and admin) create/edit. |
| **CV** | Uploaded file. Can exist **without** job or hiring request. Converts to candidate (AI or manual). | Agent uploads; conversion to candidate by agent (or admin). |
| **Assignment** | Candidate assigned to a hiring request → enters pipeline (stages). One assignment = candidate in one HR’s stages. | Agent (or admin) assigns; agent manages stages only for their HRs. |
| **Settings / Master data** | Profession, Nationality, and similar reference data. | Admin only: manage; used in job, candidate, authorization, etc. |

---

## 3. High-Level Flow

```
Admin:
  → Create Job
  → Create Hiring Request(s) for the job
  → Create / link Authorization (assign Agent + agent user for the job)
  → (Manage visa, users, agents, settings)

Agent user:
  → Sees only his/her assigned Hiring Requests
  → Uploads CVs (optional: link to job/HR later)
  → Converts CV to Candidate (AI or manual) OR creates candidate manually
  → Assigns candidate to one of his Hiring Requests (manual or Match AI) → candidate in first stage
  → Moves candidate through stages (e.g. Sourcing → CV Submitted → … → Placed) for his HRs only

Admin can do everything above (all jobs, all HRs, all candidates, all CVs).
```

---

## 4. Gaps and Modifications to Implement

### 4.1 Entity model

| Gap | Current state | Change |
|-----|----------------|--------|
| **Agent vs Agent user** | `mockUsers` has role; HR has `assignedAgentId` (user). No clear “Agent (company)” that has many users. | **Introduce Agent (entity)** as the company. **User**: add `agentId` (optional, for role=Agent). **HR**: add `agentId` (Agent entity) and keep/rename `assignedAgentId` → `assignedAgentUserId` (the user responsible). |
| **Authorization ↔ Agent** | Authorization has `agentId` (user) and mainAgent (mockAgents). | Clarify: link Authorization to **Agent (entity)** and optionally to agent user; align with HR assignment. |
| **Visa** | Visa number exists on HR. | Keep visa on HR; ensure “Admin manages Visa” is reflected in HR/Authorization views and any visa list if needed. |

### 4.2 CV and candidate creation

| Gap | Current state | Change |
|-----|----------------|--------|
| **CV entity** | No CV entity or upload. | **Add CV**: id, file/reference, upload date, status (e.g. `not_converted` / `converted`), optional `candidateId` when converted. |
| **Upload CV** | — | **Upload CV** (no job/HR required). List “CVs” (e.g. unassigned / all). |
| **CV → Candidate** | Only manual candidate create. | **Convert CV to candidate**: (1) AI path (mock or real), (2) Manual “Create candidate from CV” / “Enter data manually”. Set candidate source (e.g. `from_cv`) and optional `cvId`. |
| **Candidate creation** | Create candidate form exists. | Allow creation from CV (prefill from AI or manual) and standalone; keep single candidate create/edit flow. |

### 4.3 Assignment and visibility (agent vs admin)

| Gap | Current state | Change |
|-----|----------------|--------|
| **Agent sees only their HRs** | All users see all HRs, jobs, candidates. | **Filter by current user**: if role=Agent, only HRs where `assignedAgentUserId === currentUser.id` (or `HR.agentId === currentUser.agentId` if business rule is “all HRs of my agent”). |
| **Jobs list** | Everyone sees all jobs. | Admin: all jobs. Agent: only jobs that have at least one HR assigned to them (or hide job list and show “My hiring requests” only). |
| **Candidates** | All candidates visible. | Agent: see all candidates they created or that are in their HRs; admin: all. (Optional: strict “only candidates in my HRs” for agent.) |
| **Matches / Assign** | Matches view exists. | **Match AI**: only offer hiring requests the current user is allowed to assign to (admin = all HRs, agent = only their HRs). |
| **Stages / Kanban** | Kanban and bulk stage exist. | **Restrict to “my HRs”** for agent: only load and update stages for HRs where assignedAgentUserId = current user. |

### 4.4 Jobs, HR, Authorization flow

| Gap | Current state | Change |
|-----|----------------|--------|
| **Assign Agent + agent user** | HR has assignedAgentId (user). No Agent entity on HR. | When creating/editing HR (and Authorization): select **Agent (entity)** and **Agent user** (user with that agentId). Persist `agentId` and `assignedAgentUserId` on HR. |
| **Creation order** | Job → HR → Authorization can be done but not enforced in UI. | Keep flow: Admin creates Job → creates HR(s) → creates/links Authorization; assignment of Agent and agent user in HR and/or Authorization. |

### 4.5 User and Agent management (admin only)

| Gap | Current state | Change |
|-----|----------------|--------|
| **User management** | No user CRUD. | **Admin only**: List/Create/Edit users. When creating “agent user”: select **Agent** (entity), set role=Agent, set `agentId`. |
| **Agent (entity) management** | mockAgents used for Main/E-Wakala name. | **Admin only**: CRUD for **Agent** as first-class entity (list, add, edit). Use in HR and Authorization for “assign agent”. |
| **Visibility** | No role checks. | Hide “Users” and “Agents” (and Settings) from non-admin; show only to Admin. |

### 4.6 Settings / Master data (admin only)

| Gap | Current state | Change |
|-----|----------------|--------|
| **Profession, Nationality, etc.** | mockNationalities and similar exist. | **Admin only**: Settings (or “Master data”) section to manage Profession, Nationality, and other lists. Use these in Job, Candidate, Authorization forms. |
| **Data usage** | Nationalities etc. used in forms. | Ensure dropdowns (candidate, job, authorization) read from settings/master data. |

### 4.7 Navigation and menu

| Gap | Current state | Change |
|-----|----------------|--------|
| **Role-based menu** | Single menu for all. | **Admin**: Jobs, Hiring Requests, Authorizations, Candidates, CVs, Matches, Placements, **Users**, **Agents**, **Settings**. **Agent**: e.g. **My hiring requests** (or Assignments), Candidates, CVs, Matches (no Users, Agents, Settings; limited Jobs if any). |
| **“My hiring requests”** | — | Agent home: list only HRs assigned to them; from there open job/kanban/stages. |

### 4.8 Permissions (UI and data)

| Gap | Current state | Change |
|-----|----------------|--------|
| **Consistent checks** | No role checks. | **Every list/detail**: filter or allow access by `currentUser.role` and (if Agent) `currentUser.agentId` / `assignedAgentUserId`. |
| **Disable actions** | All actions visible. | Agent: hide or disable create Job, create Authorization, manage Users/Agents/Settings, edit other agents’ HRs. |
| **Current user** | Likely single user in UI. | **Persist current user** (e.g. from login or dev stub): id, role, agentId. Use in all filters and permission checks. |

---

## 5. Suggested implementation order

1. **Current user + role**  
   Add `currentUser` (id, role, agentId) and use it everywhere for visibility and actions.

2. **Agent entity (company)**  
   Make Agent a first-class entity; admin CRUD; link User (agentId) and HR (agentId + assignedAgentUserId).

3. **HR and Authorization**  
   Assign Agent (entity) + agent user on HR and Authorization; ensure visa is clear in UI.

4. **Visibility and menus**  
   Filter jobs/HRs/candidates by role and (for agent) assignedAgentUserId/agentId; role-based sidebar/menu.

5. **CV entity + upload**  
   Add CV model and upload; list CVs; “Convert to candidate” (AI stub + manual).

6. **User management (admin)**  
   List/create/edit users; agent user creation with Agent selection.

7. **Settings / Master data**  
   Admin CRUD for Profession, Nationality, etc.; wire to forms.

8. **Match AI and stages**  
   Restrict assignable HRs and stage changes to “my HRs” for agent.

---

## 6. Summary table (entities and who manages them)

| Entity           | Admin | Agent |
|------------------|-------|--------|
| User             | CRUD  | —      |
| Agent (company)  | CRUD  | —      |
| Job              | CRUD  | View (only jobs with their HRs) |
| Hiring Request   | CRUD  | View/use only assigned to them |
| Authorization    | CRUD  | —      |
| Visa             | Manage| —      |
| Settings (e.g. Profession, Nationality) | CRUD | — |
| CV               | View/all | Upload, convert to candidate |
| Candidate        | CRUD  | Create, edit, assign to own HRs |
| Assignment/Stages| Full  | Only for their HRs |

This document can be used as the single reference for scope, entities, flow, and the list of gaps and modifications to implement in the portal.
