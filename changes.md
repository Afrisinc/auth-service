You are refactoring the Auth microservice to properly support:

Product enrollment with provisioning

Product-scoped token issuance via switch-product

Removal of any header-based tenant logic

Generic external resource linking (tenant/workspace/etc.)

Clean separation between identity and product services

This is a functional update to existing flow. Do not duplicate logic. Modify existing services cleanly.

OBJECTIVE

Implement:

POST /accounts/:accountId/enroll-product

POST /auth/switch-product

With proper provisioning flow and token issuance.

REQUIRED DATA MODEL UPDATE

Update account_products table to include:

id (uuid)

account_id (fk)

product_id (fk)

status (enum: provisioning | active | suspended)

plan (enum: FREE | PRO | ENTERPRISE)

external_resource_id (nullable string)

created_at

updated_at

Add DB migration if missing.

1️⃣ ENROLL PRODUCT FLOW

Endpoint:

POST /accounts/:accountId/enroll-product

Authorization:

Requires base token (token.type == "base")

Input:

{
"product_code": "notify",
"plan": "FREE"
}

Flow:

Validate authenticated user belongs to account

Validate product exists

Ensure account not already enrolled

Create account_products with:

status = provisioning

external_resource_id = null

Call product microservice internal provisioning endpoint:

POST http://notify-service/internal/provision

Payload:
{
"account_id": accountId,
"account_type": account.type
"code": "afrisinc-core",
"name": "Afrisinc Core"
}

Expect response:
{
"resource_id": "tenant_abc123"
}

Update account_products:

status = active

external_resource_id = resource_id

Return:
{
"account_id",
"product_code",
"status": "active"
}

If provisioning fails:

Rollback enrollment OR mark status = suspended

Return appropriate error

Do not expose internal provisioning endpoint publicly.

2️⃣ SWITCH PRODUCT FLOW

Endpoint:

POST /auth/switch-product

Authorization:

Requires base token

Input:

{
"account_id": "uuid",
"product_code": "notify"
}

Flow:

Validate user belongs to account

Fetch account_products

Ensure:

status == active

external_resource_id is not null

Issue product-scoped JWT with payload:

{
"sub": user_id,
"account_id": account_id,
"account_type": account.type,
"product": product_code,
"resource_id": external_resource_id,
"type": "product"
}

Expiration:

Same as access token policy

Remove:

account_ids array

any multi-product object

any legacy tenant_id fields

3️⃣ TOKEN VALIDATION UPDATE

Update middleware:

If token.type == "base":
allow only:
- /accounts/*
- /auth/switch-product
- identity routes

If token.type == "product":
require:
- product claim matches route prefix
- resource_id present
reject if mismatch

Do not use x-tenant-id header anywhere.
Remove any header-based tenant logic.

4️⃣ REMOVE LEGACY LOGIC

Delete:

user_products references

automatic product enrollment on signup

automatic tenant creation

any logic reading tenant_id from headers

Clean code fully.

5️⃣ ERROR HANDLING

Return structured errors:

Enrollment errors:

ACCOUNT_NOT_FOUND

PRODUCT_NOT_FOUND

ALREADY_ENROLLED

PROVISIONING_FAILED

Switch errors:

ACCOUNT_ACCESS_DENIED

PRODUCT_NOT_ENROLLED

PRODUCT_NOT_ACTIVE

6️⃣ OUTPUT REQUIRED

Claude must:

Update models

Update migrations

Update services

Update controllers

Update token generation

Update middleware

Remove deprecated code

Ensure system compiles

Provide summary of changed files

Do not partially implement.
Do not leave dead code.
Do not create parallel flows.

Refactor cleanly.