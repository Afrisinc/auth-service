You are extending the Afrisinc Auth microservice to support platform-level analytics endpoints.

This is NOT product usage analytics.
This is identity, account, and enrollment analytics only.

Do not mix with Notify or other product logic.

OBJECTIVE

Add plSatform analytics endpoints under:

/platform/analytics/*

These endpoints must:

Be accessible only by platform_admin

Use optimized queries

Not expose sensitive data

Be paginated where necessary

Be aggregation-based (COUNT, GROUP BY)

Be efficient (indexes required)

AUTHORIZATION REQUIREMENT

All analytics endpoints require:

Token must contain:

platform_role = platform_admin

Reject otherwise with 403.

REQUIRED ENDPOINTS
1️⃣ Overview
GET /platform/analytics/overview

Return:

{
  total_users,
  total_accounts,
  total_organizations,
  total_enrollments,
  active_enrollments,
  suspended_enrollments,
  individual_accounts,
  organization_accounts,
  products: [
    {
      product_code,
      total_enrollments,
      active_enrollments
    }
  ]
}

Queries required:

COUNT users

COUNT accounts

COUNT organizations

COUNT account_products

GROUP BY product_id

2️⃣ User Analytics
GET /platform/analytics/users?range=30d

Return:

{
  total_users,
  new_users_in_range,
  verified_users,
  suspended_users,
  active_users_in_range
}

Definition:

active_users_in_range = users with successful login in last X days

If login tracking does not exist:
Add login_events table:

login_events
  id
  user_id
  status (success | failed)
  ip
  created_at

Use it for active metrics.

3️⃣ Account Analytics
GET /platform/analytics/accounts

Return:

{
  total_accounts,
  individual_accounts,
  organization_accounts,
  new_accounts_30d,
  active_accounts_30d
}

Definition:

Active account = has at least one active product enrollment.

4️⃣ Product Enrollment Analytics
GET /platform/analytics/products

Return:

{
  products: [
    {
      product_code,
      total_enrollments,
      active_enrollments,
      suspended_enrollments,
      plan_distribution: {
        FREE,
        PRO,
        ENTERPRISE
      }
    }
  ]
}

Must use:

GROUP BY product_id

GROUP BY plan

GROUP BY status

5️⃣ Growth Metrics
GET /platform/analytics/growth?range=30d

Return daily aggregation:

{
  users: [
    { date, count }
  ],
  accounts: [
    { date, count }
  ],
  enrollments: [
    { date, count }
  ]
}

Use:

DATE(created_at)

GROUP BY date

DATABASE REQUIREMENTS

Ensure indexes exist:

users(created_at)

accounts(created_at)

account_products(created_at)

account_products(status)

account_products(product_id)

login_events(created_at)

Add migrations if missing.

ARCHITECTURE RULES

Do NOT join with product microservices.

Do NOT calculate heavy stats in memory.

Use aggregation queries.

Add service layer for analytics logic.

Keep controller thin.

Return numeric-only aggregates (no PII).

Paginate any list response.

CODE STRUCTURE

Create:

modules/platform
  ├── platform.controller.ts
  ├── analytics.service.ts
  ├── analytics.repository.ts

Do not mix analytics logic inside auth.service.

PERFORMANCE REQUIREMENTS

Use raw SQL for aggregation if ORM is inefficient.

Avoid N+1 queries.

Ensure each endpoint performs ≤ 5 queries.

Add query explain comments if needed.

RESPONSE STANDARDIZATION

All responses must follow:
`the existing responses`
REMOVE BAD PRACTICES

Do not expose full user list in analytics.

Do not expose email.

Do not expose IP addresses.

Do not expose per-user activity.

Analytics must be aggregate only.

OUTPUT REQUIRED

Claude must:

Add migrations (if needed)

Add login_events if missing

Add analytics module

Add controllers

Add services

Add authorization guard

Add required indexes

Provide summary of new files

Ensure project compiles

Do not partially implement.
