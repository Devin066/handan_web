# Handan Web

> Open Source ERP (MES) Frontend Solution for SMEs - Open Source Version of Nianxiaoyou

<div align="center">
	<img src="./docs/live-demo.jpg"/>
</div>

<div align="center">
	<a href="https://handan-web.vercel.app">Live Demo</a>
</div>

## 📖 Overview

Handan Web is the open-source version of [Nianxiaoyou](https://www.nianxiaoyou.com), a lightweight and user-friendly digital management frontend system designed specifically for small and medium-sized manufacturing enterprises.

We understand the challenges SMEs face in digital transformation: ERP systems on the market are either overly complex with high learning curves, or prohibitively expensive. Handan is committed to providing a **simple, practical, and open-source** solution to help businesses achieve digital management of their business processes at the lowest cost.

### Core Features

- ✅ **Lightweight Architecture**: Based on Next.js + GraphQL, fast response, easy to deploy
- ✅ **Modern UI**: Using Ant Design design system for excellent user experience
- ✅ **Modular Design**: Independent business modules, easy to extend and maintain
- ✅ **Open Source & Free**: MIT license, completely open source, continuously updated
- ✅ **GraphQL API**: Efficient data querying, reducing network requests
- ✅ **TypeScript**: Type-safe, improving development efficiency and code quality

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

### Planned Features (Already Available in Nianxiaoyou)

The following features are already implemented in Nianxiaoyou but not yet completed in Handan Web:

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
cp .env.example .env     # set DATABASE_URL and JWT_SECRET
pnpm db:migrate          # create the schema
pnpm db:seed             # demo company + sample data
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in:

```
admin@handan.dev / password123
```

Need a database? `brew install postgresql@16 && brew services start postgresql@16 && createdb handan`

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

> `NEXT_PUBLIC_HANDAN_API` only needs a value if you are pointing the frontend at a
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
handan_web/
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

- **Original Backend**: [Handan](https://github.com/zven21/handan) - Elixir + Phoenix + GraphQL + CQRS/ES. This repo now ships its own TypeScript/Prisma backend instead, serving the same GraphQL schema; the Elixir project remains the reference for business rules.
- **Enterprise Edition**: [Nianxiaoyou](https://www.nianxiaoyou.com) - More complete enterprise version

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

Handan Web is licensed under the [MIT License](http://opensource.org/licenses/MIT).

## 📞 Contact

- GitHub Issues: [Submit Issue](https://github.com/zven21/handan_web/issues)
- Project Homepage: [GitHub](https://github.com/zven21/handan)

---

**Note**: As an open-source project, Handan will be continuously updated and improved, with ongoing feature enhancements and bug fixes. We welcome community contributions to build a better open-source ERP system together.

