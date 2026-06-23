# Architectural Summary & Decision Log

Our blueprint provides a **highly secure, type-safe backend architecture** designed to support a React and TypeScript frontend. The system manages complex inventory logistics, AI features, and token-based permission sharing while avoiding the vulnerabilities that led to the historical Tea App data breaches.

---

### 1. Rationale for the Ultimate Decision

We selected **Path A: A Custom Node.js Server paired with a private Supabase PostgreSQL database**.

Your team’s proficiency in Node.js allows for immediate productivity without the learning curve of frameworks like NestJS. Instead of using Supabase’s native public GraphQL API (Path B), routing traffic through a custom Node.js server establishes an essential security perimeter, shields database credentials, and allows for robust query inspection.

---

### 2. Evaluated Framework & Database Trade-offs

#### Frameworks

- **NestJS**: Enforces strict structural choices beneficial for large teams, but introduces unnecessary boilerplate and abstraction overhead for a solo developer or smaller team.
- **Raw Node.js + Express/Fastify (Chosen)**: Delivers high development velocity, minimal architectural overhead, and total control over middleware and routes.

#### Databases & APIs

- **Supabase Client-Direct (Path B)**: Provides an ultra-lean setup by generating an API directly from the database schema using tools like `pg_graphql`. However, it limits application-level security controls and complicates AI integrations.
- **Node.js Server Gateway + PostgreSQL via Prisma (Chosen)**: Keeps your database schema confidential from the public web. It allows you to intercept incoming client payloads, strip malicious deep queries, validate token scopes in middleware, and protect private AI vendor API keys.

---

### 3. Dataflow & Architecture Diagram

```text
[ Frontend Client ]
       │
       ▼ (Encrypted TLS 1.3 / GraphQL Queries & Mutations)
[ Node.js Server Gateway ]
       │  ├── Query Depth & Cost Analyzer (Blocks DoS attacks)
       │  ├── Token Validation Middleware (Verifies share permissions)
       │  └── Node Crypto Library (Encrypts sensitive data fields)
       │
       ▼ (Private VPC Network Connection)
[ Supabase Hosted PostgreSQL Database ]
          ├── Disabled Public API Access (PostgREST / pg_graphql shut down)
          ├── AES-256 Storage Encryption at Rest
          └── pg_cron Automated Purging Worker (Daily data minimization)
```

---

### 4. Critical Security Precautions (Anti-Tea App Protocols)

To eliminate risks like misconfigured storage, hardcoded secrets, and insufficient logging, this architecture enforces the following security boundaries:

- **Isolated Storage & Database Lockdown**: Supabase data storage buckets must be kept **Private**. The system will issue short-lived, expiring presigned URLs for verified resource access. The public-facing PostgREST and GraphQL API layers on Supabase must be fully disabled, ensuring the database only accepts traffic arriving from your Node.js server.
- **Data Minimization (Automated Purging)**: Implement automated PostgreSQL `pg_cron` worker jobs to permanently scrub expired access tokens and sensitive transaction logs every 24 hours.
- **Application-Layer Field Encryption**: Encrypt sensitive data payloads (like partner supplier contacts or access strings) in Node.js using the native `crypto` module before executing database writes via Prisma. This shields sensitive fields even if a database snapshot is compromised.
- **Zero Hardcoded Keys**: Inject all runtime API keys, database connection strings, and third-party AI platform credentials exclusively through hosting provider environment variables. Use `gitleaks` pre-commit hooks to block developers from accidentally pushing raw credentials to repository branches.
- **GraphQL Query Defense**: Protect against performance and Denial of Service (DoS) attacks by implementing query depth limiting and cost analysis within your Express GraphQL server layer.

---

### 5. Observability Integration

We integrated **Datadog APM via OpenTelemetry (OTel)** to ensure comprehensive monitoring. This infrastructure captures GraphQL field resolver execution times to catch performance bottlenecks, injects active user and organization context metadata into server logs, tracks Supabase database health with `pg_stat_statements`, and leverages Datadog's Sensitive Data Scanner to prevent personal data from spilling into log aggregation pools.
