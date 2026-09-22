# Handlathe

> Manufacturing resource planning (ERP/MES) for small and medium businesses.

## 📖 Overview

Handlathe is a lightweight ERP/MES for small and medium manufacturers — sales,
purchasing, production, stock and finance in one application, covering
order-to-cash and procure-to-pay end to end.

It is a single Next.js application: the UI **and** the GraphQL API that backs it
ship together, with PostgreSQL for storage. There is no separate backend service
to deploy.

> **White-labelling.** Only the product name is branded. The package, database,
> environment variables and demo data are all deliberately brand-free, so the same
> build serves a different company by setting `NEXT_PUBLIC_APP_NAME` at build time
> — see [`src/config/brand.ts`](src/config/brand.ts).

### Core Features

- ✅ **Single deployable**: UI and API in one Next.js app, one build, one deploy
- ✅ **Auditable stock**: every movement written to a ledger that explains on-hand
- ✅ **Multi-tenant**: data scoped per company, enforced centrally and tested
- ✅ **Typed end to end**: GraphQL schema generates the frontend's hooks
- ✅ **Modular**: independent business modules, easy to extend
- ✅ **TypeScript**: type-safe from resolver to component

## 🚀 Feature Modules

### Implemented Features

#### 1. Sales Management
- ✅ Sales Order Management (create, view, edit)
- ✅ Customer Management (customer profiles, contact information)
- ✅ Sales Statistics (basic statistical reports)

#### 2. Procurement Management
- ✅ Purchase Order Management (create, view, edit)
- ✅ Supplier Management (supplier profiles, contact information)
- ✅ Procurement Statistics (basic statistical reports)

#### 3. Production Management (MES)
- ✅ Work Order Management (work order creation, scheduling)
- ✅ Production Task Management (task assignment, progress tracking)
- ✅ BOM Management (Bill of Materials)
- ✅ Production Process Management (process definition)
- ✅ Production Team Management (team configuration)

#### 4. Inventory Management
- ✅ Outbound Records (outbound order viewing)
- ✅ Inbound Records (inbound order viewing)
- ✅ Inventory Records (inventory transaction queries)

#### 5. Financial Management
- ✅ Sales Receipt Vouchers
- ✅ Purchase Payment Vouchers
- ✅ Transaction Record Queries
- ✅ Payment Method Management

#### 6. Product Management
- ✅ Product Profiles (CRUD operations)
- ✅ Unit of Measurement Management
- ✅ Warehouse Management (warehouse configuration)

#### 7. System Settings
- ✅ Member Management (user permissions)

### Planned Features

Not yet implemented:

#### Enhanced Sales Management
- [ ] Sales Dashboard (sales performance, customer status visualization)
- [ ] Quotation Management
- [ ] Sales Product Records (product dimension analysis)
- [ ] Sales Outbound Management (linked with inventory)
- [ ] Accounts Receivable Management (payment records, reconciliation)

#### Enhanced Procurement Management
- [ ] Procurement Dashboard (procurement costs, supplier status visualization)
- [ ] Procurement Product Records (product dimension analysis)
- [ ] Procurement Inbound Management (linked with inventory)
- [ ] Accounts Payable Management (payment records, reconciliation)

#### Enhanced Production Management
- [ ] Simple Work Orders (lightweight production management)
- [ ] Production Reporting (production progress recording)
- [ ] Finished Goods Receipt (production completion warehousing)
- [ ] Reporting Records (historical reporting queries)

#### Outsourcing Management (New Module)
- [ ] Outsourcing Order Management
- [ ] Outsourcing Supplier Management
- [ ] Outsourcing Material Management

#### Enhanced Inventory Management
- [ ] Inventory Information (real-time inventory queries)
- [ ] Inventory Transfer (inter-warehouse transfers)
- [ ] Inventory Counting (counting process)

#### Enhanced Financial Management
- [ ] Accounts Receivable Management (independent module)
- [ ] Accounts Payable Management (independent module)
- [ ] Outsourcing Payment Management
- [ ] Other Receipts and Payments (advance receipts and payments, etc.)

#### Enhanced Product Management
- [ ] Batch Price Adjustment (price adjustment orders)
- [ ] Product Grouping (category management)
- [ ] Brand Management

#### Enhanced System Settings
- [ ] Team Information (enterprise configuration, print templates)

## 🛠 Tech Stack

### Frontend Framework
- **Next.js** - React server-side rendering framework
- **React 18** - User interface library
- **TypeScript** - Type-safe JavaScript superset

### UI Component Library
- **Ant Design** - Enterprise-level UI design language and React component library
- **Ant Design Pro Components** - Advanced business component library
- **Tailwind CSS** - Utility-first CSS framework

### Data Management
- **Apollo Client** - GraphQL client for data fetching and state management
- **Zustand** - Lightweight React state management library
- **GraphQL** - Efficient API query language

### Backend
- **GraphQL Yoga** - GraphQL server, mounted at `/api/graphql`
- **Prisma** - Type-safe database access and migrations
- **PostgreSQL** - Relational database
- **JWT** - Stateless authentication

## 🚀 Quick Start

### Requirements

- Node.js >= 22.12 (see `.nvmrc`)
- pnpm >= 10.x
- PostgreSQL 16

### Setup

```bash
nvm use
pnpm install
cp .env.example .env     # set JWT_SECRET; DATABASE_URL default matches the container
pnpm db:init             # start PostgreSQL, apply migrations, load demo data
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in:

```
admin@example.com / password123
```

### Database

PostgreSQL runs in Docker, so it stays isolated from the rest of your machine and
can be removed completely in one command.

| Command | What it does |
| --- | --- |
| `pnpm db:up` | Start PostgreSQL |
| `pnpm db:down` | Stop it, keeping the data |
| `pnpm db:destroy` | Stop it **and delete the data volume** |
| `pnpm db:psql` | Open a psql shell inside the container |
| `pnpm db:logs` | Tail the database log |
| `pnpm db:stats` | Current CPU and memory use |

It is capped at **512 MB memory and 1 CPU**, with Postgres tuned to match
(`shared_buffers=128MB`, `max_connections=50`). Typical idle use is around 80 MB.
Raise the limits in [`docker-compose.dev.yml`](docker-compose.dev.yml) if you
start working with real data volumes.

The port is bound to `127.0.0.1`, so the database is never reachable from the
network.

**Removing it entirely** — this deletes the data:

```bash
pnpm db:destroy && docker rmi postgres:16-alpine
```

That leaves nothing behind: the container, its named volume (`erp-dev-pgdata`)
and the image are all namespaced under `erp-dev`.

### Backend

The GraphQL API is **part of this application** — it is served from
`/api/graphql` by the same Next.js process, backed by PostgreSQL via Prisma. No
separate backend service is required.

The interactive GraphQL explorer is at
[http://localhost:3000/api/graphql](http://localhost:3000/api/graphql).

See [`src/server/README.md`](src/server/README.md) for how the backend is laid out,
[`DESIGN.md`](DESIGN.md) for the UI design system, [`AUDIT.md`](AUDIT.md) for the
migration audit and its findings, and [`DEPLOYMENT.md`](DEPLOYMENT.md) for running
it on a VPS or Vercel.

> `NEXT_PUBLIC_API_URL` only needs a value if you are pointing the frontend at a
> GraphQL API on a different origin (for example the original Elixir backend).
> Leave it empty otherwise.

### Commands

| Command | What it does |
| --- | --- |
| `pnpm dev` | Dev server (UI + API) |
| `pnpm build` / `pnpm start` | Production build and serve |
| `pnpm smoke` | End-to-end API check against a seeded DB |
| `pnpm check:queries` | Runs all 40 frontend queries against the API (read-only) |
| `pnpm db:migrate` | Create/apply a migration |
| `pnpm db:seed` | Reset to demo data |
| `pnpm db:studio` | Browse the database in a GUI |
| `pnpm codegen` | Regenerate typed hooks from the GraphQL schema |
| `pnpm audit:tenancy` | Verify one company cannot read or write another's data |
| `pnpm check:env` | Verify `.env.example` matches the variables the code reads |
| `pnpm create-company` | Provision a company and its first admin user |

### Docker

```bash
cp .env.example .env     # set JWT_SECRET and POSTGRES_PASSWORD
docker compose up -d --build
```

Brings up PostgreSQL and the app together, applying migrations on start.

## 📁 Project Structure

```
handlathe/
├── src/
│   ├── components/            # React components
│   │   ├── common/           # Common components (layout, menu, etc.)
│   │   ├── sales-order/      # Sales order components
│   │   ├── purchase-order/   # Purchase order components
│   │   ├── work-order/       # Work order components
│   │   ├── customer/         # Customer management components
│   │   ├── supplier/         # Supplier management components
│   │   ├── item/             # Product management components
│   │   └── ...               # Other business components
│   ├── pages/                # Next.js page routing
│   │   └── api/graphql.ts    # GraphQL endpoint (the whole API surface)
│   ├── server/               # Backend: schema, resolvers, business rules
│   │   ├── schema.graphql    # The API contract (source of truth)
│   │   ├── domain/           # ERP rules (stock, production, invoicing)
│   │   └── resolvers/        # GraphQL resolvers per business area
│   ├── gql/                  # GraphQL client
│   │   ├── apollo/           # Apollo Client configuration
│   │   ├── documents/        # Queries and mutations
│   │   └── index.ts          # Generated hooks (pnpm codegen)
│   ├── stores/               # Zustand state management
│   ├── utils/                # Utility functions
│   └── styles/               # Global styles
├── prisma/                   # Database schema, migrations, seed
├── scripts/                  # Smoke test, database backup
├── public/                   # Static assets
└── ...                       # Configuration files
```

## 🔗 Related Projects

- **Upstream project**: [Handan](https://github.com/zven21/handan) — Elixir + Phoenix + GraphQL + CQRS/ES. This repository's frontend originates from Handan Web; the backend here is an original TypeScript/Prisma implementation serving the same GraphQL contract. The Elixir project remains a useful reference for business rules. See [NOTICE](NOTICE).

## 🤝 Contributing

Contributions are welcome! We look forward to your participation in building a better open-source ERP system together.

### Contribution Process

1. Fork this repository
2. Create a feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create a Pull Request

### Development Guidelines

- Follow TypeScript type constraints
- Maintain consistent code style
- Add appropriate comments for new features
- Ensure the code builds successfully

## 📄 License

Licensed under the [MIT License](LICENSE).

Copyright (c) 2026 Handlathe. Portions copyright (c) zven21 and the Handan
contributors — see [NOTICE](NOTICE) for what was inherited and what is original
to this project.

---

**Note**: Handlathe is under active development. See [AUDIT.md](AUDIT.md) for the
state of the backend migration, its findings and known limitations.

