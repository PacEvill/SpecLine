# Architecture, Infrastructure, and Capacity Engineering Document — SpecLine

**Project:** SpecLine — Unified Product Engineering Workspace
**Context:** Práticas Extensionistas Integradoras VI
**Version:** 2.0.0
**Classification:** Technical Architecture Specification, Sizing, Zero-Cost Strategy, and Scalability Roadmap

---

## 1. Executive Summary

This document establishes the architectural design, infrastructure sizing, and operational viability of **SpecLine**. Initially designed under the premise of **zero financial investment ($0.00)** and developed in an **agile sprint by a solo engineer**, this document also charts the course for scaling to enterprise-grade paid tiers as the platform grows.

The strategy adopts a **Modular Monolith in Ruby on Rails 8** paradigm, combined with serverless and edge computing infrastructure. The initial setup eliminates costly external dependencies (like dedicated Redis servers and databases with fixed minimum billing), ensuring resilience and high throughput. As the user base expands, the architecture is designed to seamlessly integrate with premium services and advanced technologies without requiring foundational rewrites.

---

## 2. Architectural Decisions and Trade-Offs

### 2.1. Modular Monolith (Rails 8) vs. Fragmented Architecture

The architectural choice prioritizes drastically reducing **accidental complexity**, optimizing delivery speed without compromising future scalability.

```text
┌─────────────────────────────────────────────────────────┐
│     TRADITIONAL FRAGMENTED ARCHITECTURE (High Cost)     │
├─────────────────────────────────────────────────────────┤
│ • SPA Frontend (Next.js / Vercel)                       │
│ • REST/GraphQL Backend (Node.js / Python API)           │
│ • Mandatory Redis Instance ($5 to $15/month)            │
│ • Managed Database ($15 to $25/month)                   │
│ • Multiple CI/CD pipelines and CORS configurations      │
└─────────────────────────────────────────────────────────┘
                             VS
┌─────────────────────────────────────────────────────────┐
│        SPECLINE ARCHITECTURE (Rails 8 Monolith)         │
├─────────────────────────────────────────────────────────┤
│ • Cohesive Full-Stack App in Ruby on Rails 8            │
│ • Hotwire (Turbo + Stimulus) for SPA-like reactivity    │
│ • Solid Stack (Jobs, Cache, WebSockets in PostgreSQL)   │
│ • Single Container Deploy (Docker+Thruster)             │
│ • Initial Cost: $0.00/month (Scalable)                  │
└─────────────────────────────────────────────────────────┘
```

### 2.2. Technical Advantages of the Adopted Approach

1. **Developer Velocity:** Rails 8 provides established conventions for authentication (Devise), schema migrations, automated tests, and file handling (Active Storage).
2. **Redis Elimination via Solid Stack:** Extensions like `solid_queue`, `solid_cache`, and `solid_cable` use the relational database (PostgreSQL) for queuing, temporary storage, and WebSockets, bypassing additional services in the initial phase.
3. **Strict Financial Predictability:** Exclusive use of permanent free tiers with controlled suspension (_Scale-to-Zero_) for the MVP, with a clear migration path to predictable paid tiers.

---

## 3. Infrastructure Topology and Data Flow

```mermaid
graph TD
    User([👤 User / Client / Evaluator]) -->|HTTPS / TLS 1.3| Cloudflare[🌐 Cloudflare Edge & CDN]

    subgraph Execution Layer (Scalable)
        Cloudflare -->|Dynamic Requests / HTML| Render[⚡ Render.com Web Service<br>Docker + Thruster + Puma]
        Cloudflare -->|Static Assets Cache<br>CSS, JS, Fonts| EdgeCache[(💾 Edge Cache)]

        Render -->|Postgres Protocol / PgBouncer Pooling| Neon[(🐘 Neon.tech Serverless PostgreSQL<br>Data + Solid Queue + Solid Cable)]

        Render -->|S3-Compatible API / Zero Egress| R2[(📦 Cloudflare R2 Object Storage<br>Uploads and Documents)]

        Render -->|SMTP / Transactional API| Resend[✉️ Resend Email Service]
    end
```

---

## 4. Capacity Engineering and Theoretical Sizing (Free Tier MVP)

The following table presents the nominal technical limits supported by the initial free infrastructure:

| Capacity Indicator               | Estimated Operational Limit        | Engineering Calculation Basis                                                  |
| :------------------------------- | :--------------------------------- | :----------------------------------------------------------------------------- |
| **Registered Users**             | **15,000 to 25,000 accounts**      | Average size per Devise record: ~0.5 KB within Neon's 500 MB storage.          |
| **Concurrent Users (Active)**    | **50 to 100 simultaneous users**   | Puma server with 3 to 5 threads and average response time of 35ms per query.   |
| **Dynamic Throughput**           | **15 to 30 requests/second**       | Optimized Ruby processing with`jemalloc` memory allocator.                     |
| **Static Throughput**            | **200+ requests/second**           | Thruster proxy serving pre-compiled assets directly from memory.               |
| **Monthly Pageviews**            | **250,000 to 500,000 views/month** | Cloudflare absorbing 70% to 85% of total traffic at the edge.                  |
| **Task Volume (Kanban)**         | **~500,000 cards**                 | Average weight of ~1.0 KB per card indexed with metadata and history.          |
| **Document Volume (Docs)**       | **~100,000 documents**             | Average weight of ~5.0 KB per rich document in JSON/Markdown format.           |
| **Chat / Real-Time Messages**    | **~1,500,000 messages**            | Average weight of ~0.3 KB per message in`solid_cable`.                         |
| **File Storage**                 | **10 GB free (Cloudflare R2)**     | Supports ~200,000 profile photos (50 KB) or ~20,000 PDFs/attachments (500 KB). |
| **Transactional Email Dispatch** | **3,000 dispatches/month**         | 100 daily dispatches quota on Resend for confirmations and recovery.           |

---

## 5. Scalability Roadmap: From Zero-Cost to Enterprise (Paid Tiers)

As the platform grows, SpecLine is designed to transition smoothly to robust paid configurations without architectural rewrites.

### 5.1. Application Layer (Render.com)

- **Current (Hobby Free):** 512 MB RAM, 0.1 vCPU. Subject to cold starts after 15 minutes of inactivity.
- **Growth (Starter Tier - $7/mo):** 512 MB RAM, persistent execution (no cold starts), ideal for early traction.
- **Expansion (Pro Tier - $15-$85/mo):** 1 GB to 4 GB RAM, auto-scaling enabled. Supports thousands of concurrent requests seamlessly.
- **Self-Hosted Alternative (Kamal):** Utilizing the existing `config/deploy.yml`, deployment can be migrated to a dedicated VPS (e.g., Hetzner, DigitalOcean) for a fixed cost of ~$5 to $20/month, providing vastly superior resources (up to 16 GB RAM).

### 5.2. Database Layer (Neon.tech PostgreSQL)

- **Current (Free):** 0.5 GB SSD, dynamic scaling up to 0.25 Compute Units. Suspends after 5 mins of inactivity (_Auto-Wake_ ~1s).
- **Growth (Launch Tier - $19/mo):** 10 GB Storage, 300 compute hours, eliminates cold starts, handles sustained B2B workloads.
- **Expansion (Scale Tier - $69+/mo):** Auto-scaling up to 8 Compute Units, massive connection pooling, perfect for analytics and high-volume background jobs.

### 5.3. Real-Time and WebSockets (Solid Cable to AnyCable)

- **Current:** `Solid Cable` handles real-time syncs via PostgreSQL polling. Excellent for low-to-medium scale.
- **Expansion:** If concurrent connections exceed the thousands (causing database strain), the system will migrate to **AnyCable**. By deploying an AnyCable Go/Erlang backend alongside Rails, long-lived connections are offloaded from Puma/Postgres, enabling tens of thousands of simultaneous collaborative sessions with minimal overhead.

### 5.4. Background Processing (Solid Queue to Redis/Sidekiq)

- **Current:** `Solid Queue` leverages Postgres for background jobs.
- **Expansion:** For extreme throughput (millions of jobs/day), a dedicated Redis instance can be spun up (via Render or Upstash) to transition back to Sidekiq, though Solid Queue scales remarkably well up to very high thresholds.

---

## 6. Future Integrations and Feature Expansion

To support monetization and advanced user capabilities, the following integrations are mapped out:

### 6.1. Billing and Payments

- **Stripe / LemonSqueezy:** Integration via the **Pay gem** to handle SaaS subscriptions, usage-based billing (B2B quotas), and international tax compliance (Merchant of Record).

### 6.2. Artificial Intelligence and Agentic Workflows

- **Model Context Protocol (MCP):** Implementation of MCP to allow external AI assistants (like Claude) to securely interact with Workspace repositories and Kanban boards.
- **Langchain.rb / Ruby-OpenAI:** Integrating LLMs directly into the platform for automatic PRD summarization, issue generation from documents, and semantic search via Pgvector embeddings.
- **Asynchronous AI Jobs:** Heavy LLM processing will be deferred to Solid Queue to maintain swift UI response times.

### 6.3. Observability and APM (Application Performance Monitoring)

- **Sentry / AppSignal:** Real-time error tracking and performance tracing to identify N+1 queries and frontend JavaScript exceptions.
- **Logster / Better Stack:** Centralized logging for security auditing and SLA/SLO incident management.

---

## 7. Total Cost of Ownership (TCO) Matrix

A comparative breakdown demonstrating the financial efficiency of the current setup versus standard commercial alternatives:

| Infrastructure Component      | Standard Commercial Solution (Paid) | SpecLine Initial Phase (Free) | Monthly Savings |
| :---------------------------- | :---------------------------------: | :---------------------------: | :-------------: |
| Application Server (1 GB RAM) |    $7.00 / month (Render/Heroku)    |   **Render.com Hobby Free**   |     ~$7.00      |
| Managed PostgreSQL Database   |   $15.00 / month (Heroku/AWS RDS)   | **Neon.tech Serverless Free** |     ~$15.00     |
| Messaging / Redis Server      | $10.00 / month (Upstash/Redis Labs) |  **Solid Stack on Postgres**  |     ~$10.00     |
| File Storage (10 GB + Egress) |       $3.00 / month (AWS S3)        |    **Cloudflare R2 Free**     |     ~$3.00      |
| CDN and DDoS Mitigation       |   $5.00 / month (Cloudflare Pro)    |   **Cloudflare Free Tier**    |     ~$5.00      |
| Transactional Emails          |  $5.00 / month (SendGrid/Mailgun)   |     **Resend Free Tier**      |     ~$5.00      |
| **ESTIMATED TOTAL**           |         **~$45.00 / month**         |       **$0.00 / month**       | **~$540/year**  |

---

## 8. Alignment with Extension Program Guidelines

The design of this architecture fulfills the core pillars of university extension programs:

1. **Economic Sustainability:** Eliminates budget barriers for the receiving community institution, ensuring the software remains active without infrastructure maintenance costs in its initial lifecycle.
2. **Technological Transferability:** Standardization on Docker containers and established market technologies enables continuous maintenance and evolution by other students and technical teams.
3. **Social and Technical Responsibility:** Practical demonstration that rigorous software engineering can deliver high-standard enterprise value with maximum resource efficiency.
