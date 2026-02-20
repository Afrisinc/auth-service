# Breaking API Changes - Multi-Product Identity Platform Refactoring

This document outlines all breaking changes introduced in the refactoring of the Auth service into a multi-product identity and account platform.

## Overview

The auth service has been refactored from a single-product user management system to a centralized identity and account platform supporting:

- **Individual accounts** - personal user accounts
- **Organization accounts** - company accounts with multi-member support
- **Multi-product enrollment** - accounts can be enrolled in multiple products
- **Product-scoped tokens** - separate tokens for base identity and product-specific access
- **Separation of concerns** - identity layer is independent from product provisioning

## Data Model Changes

### Removed Entities/Columns

1. **User Role Field** - `UserRole` enum and `role` field removed from users table
   - Users no longer have implicit roles
   - Roles are now defined at the organization member level

2. **User Profile Fields** - Removed from users table:
   - `firstName`
   - `lastName`
   - `phone`
   - `tin` (Tax ID)
   - `companyName`
   - `resetPasswordOtp` (OTP support removed)
   - `otpExpiresAt`
   - `lastLogin`

3. **user_products Table** - Completely removed
   - Replaced by `account_products` table
   - Individual user-to-product relationships no longer supported

### New Entities/Columns

1. **user.status** - New field added
   - Type: String
   - Default: 'active'
   - Possible values: 'active', 'inactive', 'suspended', etc.

2. **user.password_hash** - Column renamed from `password`
   - Reflects actual hashing mechanism

3. **organizations** - New table
   ```sql
   id (uuid, primary key)
   name (string)
   legal_name (string, nullable)
   country (string, nullable)
   tax_id (string, nullable)
   created_at
   updated_at
   ```

4. **organization_members** - New table
   ```sql
   id (uuid, primary key)
   organization_id (fk)
   user_id (fk)
   role (OWNER, ADMIN, MEMBER)
   created_at
   updated_at
   ```

5. **accounts** - New table (core entity)
   ```sql
   id (uuid, primary key)
   type (INDIVIDUAL | ORGANIZATION enum)
   owner_user_id (fk to users)
   organization_id (fk to organizations, nullable)
   created_at
   updated_at
   ```

6. **products** - New table
   ```sql
   id (uuid, primary key)
   name (string)
   code (string, unique)
   created_at
   updated_at
   ```

7. **account_products** - New table (replaces user_products)
   ```sql
   id (uuid, primary key)
   account_id (fk)
   product_id (fk)
   status (ACTIVE | SUSPENDED enum)
   plan (FREE | PRO | ENTERPRISE enum)
   created_at
   updated_at
   ```

## Endpoint Changes

### Modified Endpoints

#### 1. POST /auth/register

**Request Changes:**
```json
// Old
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}

// New
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response Changes:**
```json
// Old
{
  "success": true,
  "resp_msg": "User registered successfully",
  "resp_code": 1001,
  "data": {
    "user": {
      "id": "...",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+1234567890",
      "role": "BUYER"
    },
    "token": "eyJ..."
  }
}

// New - Automatically creates individual account
{
  "success": true,
  "resp_msg": "User registered successfully",
  "resp_code": 1001,
  "data": {
    "user_id": "uuid",
    "account_id": "uuid",
    "email": "user@example.com",
    "token": "eyJ..."
  }
}
```

**Behavior Changes:**
- No longer accepts firstName, lastName, phone in request
- Automatically creates an individual account for the user
- Does NOT enroll user in any products
- Returns individual account ID in response

#### 2. POST /auth/login

**Request Changes:** None

**Response Changes:**
```json
// Old
{
  "success": true,
  "resp_msg": "Login successful",
  "resp_code": 1000,
  "data": {
    "user": { ... },
    "token": "eyJ..."
  }
}

// New - Returns base token with account list
{
  "success": true,
  "resp_msg": "Login successful",
  "resp_code": 1000,
  "data": {
    "user_id": "uuid",
    "email": "user@example.com",
    "account_ids": ["uuid1", "uuid2", ...],
    "token": "eyJ..."
  }
}
```

**Token Changes:**
- Old token: `{ userId, email }`
- New base token: `{ sub, email, account_ids[], type: 'base' }`
- Token type indicates whether it's a base or product-scoped token

#### 3. POST /auth/forgot-password

**Request Changes:**
```json
// Old
{
  "email": "user@example.com",
  "source": "webapp" // or "app"
}

// New
{
  "email": "user@example.com"
}
```

**Response Changes:**
```json
// Old - Returns either resetLink or otp
{
  "success": true,
  "resp_msg": "Reset password email sent successfully",
  "resp_code": 1002,
  "data": {
    "resetLink": "https://...",
    "otp": null  // or otp code if source was "app"
  }
}

// New - Only supports token-based reset
{
  "success": true,
  "resp_msg": "Reset password email sent successfully",
  "resp_code": 1002,
  "data": {
    "resetLink": "https://..."
  }
}
```

#### 4. POST /reset-password

**Request Changes:**
```json
// Old - Supported both token and OTP
{
  "token": "eyJ...",  // optional, from URL query param
  "otp": "123456",    // optional, from body
  "email": "user@example.com", // optional, required if using OTP
  "newPassword": "newpass123"
}

// New - Only token-based
{
  "newPassword": "newpass123"
}
// token is passed via query parameter: /reset-password?token=eyJ...
```

**Token Behavior:**
- OTP-based password reset is no longer supported
- Only supports reset tokens sent via email

#### 5. POST /auth/verify

**Request Changes:** None

**Response Changes:**
```json
// Old
{
  "success": true,
  "resp_msg": "Token is valid",
  "resp_code": 1004,
  "data": {
    "valid": true,
    "userId": "uuid",
    "email": "user@example.com",
    "user": { ... }
  }
}

// New
{
  "success": true,
  "resp_msg": "Token is valid",
  "resp_code": 1004,
  "data": {
    "valid": true,
    "user_id": "uuid",
    "email": "user@example.com",
    "token_type": "base" // or "product"
  }
}
```

#### 6. GET /users/profile

**Behavior Changes:**
- Returns simplified user object (only id, email, status)
- No longer returns firstName, lastName, phone, role, etc.

#### 7. PUT /users/profile

**Request Changes:**
```json
// Old
{
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+1987654321"
}

// New
{
  "status": "active" // or "inactive", "suspended"
}
```

### New Endpoints

#### 1. POST /organizations
Create a new organization
```json
Request:
{
  "name": "Acme Inc.",
  "legal_name": "Acme Incorporated",
  "country": "US",
  "tax_id": "12-3456789"
}

Response:
{
  "success": true,
  "resp_msg": "Organization created successfully",
  "resp_code": 1001,
  "data": {
    "organization_id": "uuid",
    "account_id": "uuid",
    "name": "Acme Inc."
  }
}
```
- Requires authenticated user
- Automatically creates organization account
- Creator is added as OWNER

#### 2. GET /organizations/:organizationId
Get organization details with members

#### 3. PUT /organizations/:organizationId
Update organization details

#### 4. POST /organizations/:organizationId/members
Add member to organization
```json
{
  "user_id": "uuid",
  "role": "ADMIN" // OWNER, ADMIN, or MEMBER
}
```

#### 5. DELETE /organizations/:organizationId/members/:userId
Remove member from organization

#### 6. GET /organizations/:organizationId/members
List organization members

#### 7. GET /accounts
Get all user accounts
```json
Response:
{
  "success": true,
  "data": {
    "accounts": [
      {
        "id": "uuid",
        "type": "INDIVIDUAL",
        "owner_user_id": "uuid",
        "organization_id": null,
        "products": [...]
      }
    ]
  }
}
```

#### 8. GET /accounts/:accountId
Get account details with enrolled products

#### 9. POST /accounts/:accountId/enroll-product
Enroll account in product
```json
Request:
{
  "product_code": "notify",
  "plan": "FREE" // or PRO, ENTERPRISE
}

Response:
{
  "success": true,
  "resp_code": 1001,
  "data": {
    "enrollment_id": "uuid",
    "product_code": "notify",
    "account_id": "uuid",
    "plan": "FREE",
    "status": "ACTIVE"
  }
}
```
- Emits internal provisioning event (does not create tenant directly)

#### 10. POST /auth/switch-product
Get product-scoped token
```json
Request:
{
  "account_id": "uuid",
  "product_code": "notify"
}

Response:
{
  "success": true,
  "resp_code": 1000,
  "data": {
    "account_id": "uuid",
    "product": "notify",
    "account_type": "INDIVIDUAL",
    "token": "eyJ..."
  }
}
```
- Requires base token or product-scoped token
- Returns product-scoped token
- Token contains: `{ sub, email, account_id, account_type, product, role, type: 'product' }`

#### 11. GET /accounts/:accountId/products
Get all products account is enrolled in

## Token Schema Changes

### Base Token (Issued on Login)
```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "account_ids": ["account-id-1", "account-id-2"],
  "type": "base",
  "iat": 1234567890,
  "exp": 1234654290
}
```

### Product-Scoped Token (Issued on Product Selection)
```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "account_id": "account-id",
  "account_type": "INDIVIDUAL",
  "product": "notify",
  "role": "member",
  "type": "product",
  "iat": 1234567890,
  "exp": 1234654290
}
```

## Middleware Changes

### Authorization Middleware (authGuard)

**Base Token Validation:**
- `type: 'base'` tokens contain `account_ids` array
- Used for account management operations

**Product-Scoped Token Validation:**
- `type: 'product'` tokens contain single `account_id` and `product` field
- Used for product-specific operations
- Must match route namespace (product in URL matches token product)

## Migration Requirements

### For Existing Systems

1. **Data Migration Script:**
   - Convert existing users to users + individual accounts
   - Convert user_products to account_products
   - Assign roles at organization level (if applicable)

2. **Client Updates Required:**
   - Update signup to remove firstName, lastName, phone fields
   - Update login to handle new response format
   - Update password reset flow (OTP no longer supported)
   - Implement account selection UI
   - Implement product switching via /auth/switch-product

3. **Token Handling:**
   - Update token parsing to handle new `sub` vs `userId` fields
   - Implement base token → product-scoped token flow
   - Add token type checking

## Summary of Removed Features

1. ❌ User roles (ADMIN, SUPPORT, SELLER, BUYER) - removed from users table
2. ❌ User profile fields (firstName, lastName, phone, tin, companyName)
3. ❌ OTP-based password reset - only token-based reset supported
4. ❌ Single user-to-product relationships - replaced by account-based relationships
5. ❌ Automatic product assignment at signup
6. ❌ Automatic tenant creation at signup
7. ❌ Multi-product context in single token - tokens are now product-scoped

## Summary of New Features

1. ✅ Individual and organization accounts
2. ✅ Multi-member organization support with role-based access
3. ✅ Account-scoped product enrollment
4. ✅ Product-scoped JWT tokens
5. ✅ Internal provisioning events (extensible for external products)
6. ✅ Account ownership validation
7. ✅ Organization membership validation
8. ✅ Status tracking for users and enrollments

## Migration Checklist

- [ ] Review all API clients and update endpoints
- [ ] Update request/response handling for modified endpoints
- [ ] Remove OTP from password reset flow
- [ ] Add account selection UI
- [ ] Add product switching UI
- [ ] Update token parsing logic
- [ ] Implement account ownership checks
- [ ] Run data migration script
- [ ] Test signup flow (creates individual account)
- [ ] Test organization creation (creates organization account)
- [ ] Test product enrollment
- [ ] Test product switching (token generation)
- [ ] Test authorization middleware with new token formats
- [ ] Update API documentation
- [ ] Update error handling and messages
