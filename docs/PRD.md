# Business Management Platform — Product Requirements Document

Version: 1.0
Date: September 19, 2026
Status: Initial Discovery / Requirements Definition

> This is the authoritative requirements document for the platform. The schema
> that implements it is traced requirement-by-requirement in `SCHEMA.md`.

## 1. Executive Summary

The client operates a custom CNC and manufacturing business producing customized
parts, bolts, stainless and aluminum components, motorcycle parts, show parts,
and locally manufactured alternatives to imported products.

Sales come from multiple channels: Shopee, TikTok, business pages, and direct
customer orders.

Several business processes are still manual. Inventory quantities, production
status, material availability, and other operational information depend on the
owner's personal knowledge rather than a centralized system.

The proposed solution is a centralized, web-based business management platform,
introduced in phases rather than all at once.

Initial priorities:

1. Inventory and material visibility
2. Centralized order management
3. Production queue and employee task tracking
4. Production output monitoring
5. Customer follow-up
6. Operational reporting

Later phases may extend into finance, HR, payroll, attendance, CRM, incentives,
and business reporting.

Five major modules: Material Master and Inventory, Operations, CRM, Finance,
HR and Payroll.

## 2. Business Problem

The business lacks one centralized operational system. The most immediate
problem is inventory management — stock levels are largely remembered mentally,
which risks overstocking, running out of materials, incorrect assumptions about
available stock, poor finished-goods visibility, limited raw-material
visibility, difficulty planning production, difficulty reconciling physical
inventory, and possible shrinkage.

Two manufacturing models must both be supported:

- **Make-to-Order** — products manufactured to individual customer requirements.
- **Make-to-Stock** — frequently purchased products manufactured in advance for
  marketplace sales.

## 3. Product Vision

A centralized web platform where the owner and authorized employees manage
orders, materials, production, inventory, customers, employees, and financial
information from one system.

Management should get clear visibility into: what was ordered, what needs to be
manufactured, who is working on each order, current production status, materials
required and consumed, finished inventory, employee output, customer status,
expenses, sales, and revenue.

The system should gradually replace operational information that currently
exists only in the owner's memory.

## 4. Product Objectives

### 4.1 Primary

Establish a reliable inventory database; centralize orders from different sales
channels; provide a production queue; track employee assignments and production
progress; record timestamps and accountability; improve inventory accuracy; give
the owner operational visibility; support customer follow-up; and prepare the
data structure for future finance and HR modules.

### 4.2 Long-Term

Financial reporting, expense and revenue monitoring, payroll, attendance,
overtime, statutory deductions, employee incentives, CRM, purchasing, business
analytics, and management reports.

## 5. Target Users

### 5.1 Owner / Administrator

Primary decision-maker with visibility across the entire business: dashboards,
inventory, materials, orders, production, employee activities, reports, user
management, system settings, financial information.

### 5.2 Manager / Supervisor

Responsible for operational accuracy: review orders, assign production tasks,
validate completed jobs, update inventory, confirm material releases, monitor
employee progress, correct operational records, review production queues.

This role is especially important because system reliability depends on
employees consistently recording inventory and production transactions.

### 5.3 Production Employee

View assigned jobs, accept available jobs if permitted, start production tasks,
update task status, mark tasks completed, record produced quantities, view
personal work history.

### 5.4 HR / Finance User

Future role: employee records, attendance, payroll, expenses, purchases,
financial reporting.

## 6. Module 1: Inventory and Material Management

One of the foundations of the platform.

### Material Master

Material ID, name, category, type, specification, grade, dimensions, unit of
measurement, current quantity, minimum stock threshold, supplier, cost, storage
location, status.

Examples from discovery: Stainless 304, Aluminum 6061-T6.

### Finished Goods

Product ID, name, SKU, description, specifications, available quantity, reserved
quantity, production quantity, selling price, cost, marketplace information,
status.

### Inventory Transactions

Stock received, stock released, production consumption, production completion,
manual adjustments, returns, damaged items.

Each transaction records: user, timestamp, quantity, previous quantity, new
quantity, transaction reason.

## 7. Raw Material Consumption

Materials are not always consumed as complete units — sheets may be partially
cut, bars consumed by length, material sizes may vary, and different products
consume different dimensions.

Because exact consumption is difficult to encode, the first version should use
practical measurement rules agreed with the client. Possible units: piece,
sheet, millimeter, centimeter, meter, kilogram.

**The exact measurement approach remains an open requirement.**

## 8. Order Management

One centralized order record regardless of where the sale originated. Sources:
Shopee, TikTok, business page, direct customer order, website.

Each order contains: order number, customer, sales channel, product, custom
specifications, quantity, order date, required completion date, payment status,
production status, fulfillment status, assigned employee, notes.

## 9. Order Workflow

```
Order Received → Order Recorded → Order Validation → Material Availability Check
→ Production Queue → Task Assignment / Acceptance → Production Started
→ Production Completed → Supervisor Validation → Finished Goods / Fulfillment
→ Order Completed
```

## 10. Production Queue

**Option A: Manager Assignment** — the manager assigns each task to a specific
employee. Advantages: strong accountability, better operational control, clear
responsibility.

**Option B: Floating Queue** — available employees select tasks from a common
queue. Advantages: faster task pickup, less manager intervention, flexible
workload distribution.

**The client still needs to select the preferred workflow.**

## 11. Production Tracking

Track: order, product, assigned employee, start time, completion time, quantity
requested, quantity completed, current production stage, status, supervisor
validation.

Statuses: Pending, Assigned, Accepted, In Progress, Paused, Completed,
Validated, Cancelled.

## 12. Employee Output Tracking

The system should answer: who produced the item, what they produced, how many
units were completed, when production started and completed, how much an
employee completed during the shift, and what tasks remain incomplete.

Production quotas differ by task complexity — discovery referenced roughly 100
pieces for some work, with more difficult jobs reducing expected output by
approximately 10 to 20 pieces. Future performance and incentive calculations
must not assume every task has the same difficulty.

## 13. CRM Module

Customer name, marketplace account, messenger information, contact information,
order history, last interaction, follow-up status, notes.

## 14. Customer Follow-Up

Messenger is the preferred channel. SMS should not be primary because customers
may not consistently provide mobile numbers.

```
Customer Inquiry → No Customer Response → Wait Defined Period
→ Trigger Follow-Up → Send Messenger Follow-Up
```

A three-day no-response interval was discussed as an example. Messenger
integration feasibility still needs technical validation.

## 15. Finance Module

Expense categories: raw materials, salaries, rent, utilities, supplier
purchases, miscellaneous operating expenses.

Target reporting: `Revenue − Operating Costs − Material Costs − Payroll = Net Revenue`.

## 16. HR and Payroll Module

Employee profiles, employment information, shift information, attendance,
overtime, salary, payroll history. Future statutory calculations: SSS,
PhilHealth.

The current payroll process is relatively straightforward — primarily base pay
and overtime. Incentive calculations come later, once production tracking has
enough reliable data.

## 17. Attendance

The owner currently uses an electronic timecard system and is interested in
fingerprint and facial attendance. Integration should be treated as a later
requirement unless the existing platform provides an accessible mechanism.

Records: employee, time in, time out, shift, overtime, attendance status.

## 18. Dashboard

**Owner Dashboard** — orders today, open orders, orders in production, completed
orders, delayed orders, low-stock materials, finished goods inventory,
production output, employee activity, sales, expenses. Later: monthly revenue,
monthly expenses, net revenue.

**Operations Dashboard** — pending queue, in-progress jobs, assigned employee,
production stage, quantity, completion percentage, priority, due date.

## 19. Notifications

Low inventory, material shortage, new order, new task assignment, task accepted,
task completed, delayed production, order ready, follow-up required, inventory
adjustment. Channels to be determined during implementation.

## 20. Role-Based Access Control

- **Owner / Administrator** — full access.
- **Manager / Supervisor** — operations, inventory, validation, task management.
- **Production Employee** — assigned tasks and production updates.
- **Finance** — financial and expense information.
- **HR** — employee and payroll information.

Access follows the user's business responsibilities.

## 21. Audit Trail

Record user, action, record affected, previous value, new value, date, time.

Audited transactions: inventory adjustments, material release, finished goods
additions, order status changes, task assignments, production completion,
expense changes, user access changes.

## 22. Website and Hosting

The existing website uses Shopify. The team must determine whether Shopify
integration provides enough functionality.

Possible architecture: the existing Shopify website stays, with the custom
management platform as a separate web application at `portal.companydomain.com`
or `system.companydomain.com`. A separate subdomain reduces dependency on
Shopify limitations if direct integration is unavailable.

## 23. Technical Product Requirements

Web-based; works in modern desktop browsers; supports mobile browser access
where practical; requires authenticated access; supports multiple roles;
maintains centralized data; records timestamps; maintains transaction history;
supports modular expansion; allows future integration with external services.

The client accepted a web-based platform rather than a native application.

## 24. Recommended MVP

Operational control first, not all five modules at once:

1. User Management
2. Product Master
3. Material Master
4. Inventory Management
5. Order Management
6. Production Queue
7. Task Assignment
8. Employee Production Tracking
9. Supervisor Validation
10. Basic Customer Records
11. Basic Dashboard
12. Audit Logs

## 25. Phase 2

CRM improvements, Messenger follow-up automation, purchasing, supplier
management, low-stock alerts, material consumption improvements, advanced
reporting, attendance integration, employee performance analytics.

## 26. Phase 3

Finance, expense management, payroll, SSS and PhilHealth calculations,
incentives, revenue reporting, profitability reporting, deeper marketplace
integrations.

## 27. Out of Scope for Initial MVP

Full accounting system, full payroll automation, native mobile application,
advanced AI functionality, advanced predictive inventory, full Shopify
replacement, automatic marketplace synchronization, complex incentive
calculations, fully precise material optimization.

## 28. Key Business Rules

| ID | Rule |
| --- | --- |
| BR-01 | Every inventory adjustment should identify the user responsible for the change. |
| BR-02 | Production tasks should maintain start and completion timestamps. |
| BR-03 | Completed production should identify the employee responsible. |
| BR-04 | Production completion may require supervisor validation before inventory updates. |
| BR-05 | Orders should maintain their original sales channel. |
| BR-06 | Raw-material releases should affect inventory. |
| BR-07 | Finished production should update finished-goods inventory where applicable. |
| BR-08 | Users should only access functions authorized for their role. |
| BR-09 | Customer follow-up timing should be configurable. |
| BR-10 | Inventory data should be updated as close to the actual transaction time as possible. |

## 29. Success Metrics

Inventory accuracy (system vs physical), order visibility (% of active orders
recorded), production traceability (% of jobs with employee, status and
timestamps), queue adoption (% of jobs processed through the system), supervisor
validation (% of completed jobs reviewed where required), customer follow-up (%
of eligible conversations followed up), system adoption (% of relevant employees
actively using the platform).

## 30. Risks

- **Data accuracy** — unreliable reports if employees do not update records.
  *Mitigation:* assign clear ownership to supervisors or managers.
- **Raw-material complexity** — partial consumption may create discrepancies.
  *Mitigation:* define practical units and measurement rules before
  implementation.
- **Employee adoption** — employees may continue verbal or manual processes.
  *Mitigation:* role-based training and simple workflows.
- **Shopify integration** — capabilities may be limited. *Mitigation:* evaluate
  Shopify APIs and hosting restrictions before committing to an architecture.
- **Scope expansion** — implementing everything simultaneously increases
  complexity. *Mitigation:* phased implementation.

## 31. Open Requirements

1. Should MVP inventory include finished goods, raw materials, or both?
2. How should raw-material consumption be measured?
3. Who will maintain inventory records?
4. Will production jobs be manager-assigned or employee-selected?
5. Who validates completed production?
6. What product data currently exists?
7. What material data currently exists?
8. What Shopify plan and integrations are currently available?
9. Does the business have domain and DNS access?
10. Can Messenger automation be supported through the client's current business setup?
11. Which sales channels require direct integration?
12. Should Shopee and TikTok orders initially synchronize automatically or be encoded manually?
13. What reports are considered mandatory for MVP?
14. What exact employee roles require system access?
15. How should damaged or rejected production be recorded?

## 32. Information Required From Client

- **Product data** — product list, SKU, specifications, selling price, category.
- **Material data** — material list, specifications, measurement units, current
  estimated stock, suppliers.
- **Employee data** — roles, shift structure, current attendance process,
  production responsibilities.
- **Operational data** — current order workflow, production stages, approval
  requirements, current inventory process.
- **Technical data** — website URL, Shopify configuration, domain access,
  hosting information, available APIs.

## 33. Follow-Up Actions

Review the existing website, hosting, domain and Shopify setup; collect product
information and specifications; confirm first-phase automation priorities;
determine initial raw-material and finished-goods inventory scope; select the
production queue model; identify the manager or supervisor responsible for
system data; document employee structure and payroll requirements; identify
required expense categories; validate Messenger follow-up feasibility; prepare
scoped pricing and implementation options; schedule the next requirements
meeting; include user training and role-based access in the implementation plan.

## 34. Proposed Delivery Roadmap

```
Discovery → Requirements Validation → MVP Scope Confirmation
→ Technical Architecture → UI/UX → MVP Development → Internal Testing
→ Client Testing → Data Initialization → User Training → Production Launch
→ Phase 2 Planning
```

## 35. Product Direction

Build the operational core first:

```
Order → Material → Production → Employee → Inventory → Customer → Financial Data
```

Once these transactions are consistently captured, Finance, HR, Payroll, CRM
automation, incentives, and management analytics can build on reliable
operational data.
