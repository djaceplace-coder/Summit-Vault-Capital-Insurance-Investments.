# Security Specification & Threat Model

## 1. Data Invariants
1. **User Identity Boundary**: Every document under `/users/{userId}` belongs strictly to `{userId}`. A client can only read, write, or query their own record unless the request is made by an authorized Admin.
2. **Immutability of Core Ownership**: `userId` inside `/users/{userId}` and nested collections must never change across updates (`incoming().userId == existing().userId`).
3. **Role Escalation Prevention**: Standard users cannot modify or set their own `role` to `admin`. The `role` field is strictly guarded.
4. **Sub-resource Atomicity**: Subcollections `/users/{userId}/transactions/{transactionId}` and `/users/{userId}/policies/{policyId}` must have `userId` strictly matching `{userId}` and `request.auth.uid`.
5. **Admin Access Invariant**: Administrators verified via email (`adereraadenike@gmail.com`) or the `/admins/` collection can view all client balances and perform administrative adjustments.
6. **Denial of Wallet Prevention**: Strict length constraints (`.size()`) and regex filters (`isValidId`) on all document identifiers and strings prevent memory exhaustion or denial-of-wallet attacks.
7. **Heartbeat Access**: `/test/connection` is accessible for connection health checks.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Payload 1 (Identity Spoofing on User Profile)**: Attempting to create a profile under `/users/user_alice` with `request.auth.uid = 'user_bob'`. -> MUST RETURN PERMISSION_DENIED.
2. **Payload 2 (Privilege Escalation on Signup)**: User setting `role: "admin"` in their own profile creation payload. -> MUST RETURN PERMISSION_DENIED.
3. **Payload 3 (Role Hijacking on Profile Update)**: Changing `role` from `"client"` to `"admin"` via client SDK. -> MUST RETURN PERMISSION_DENIED.
4. **Payload 4 (Ghost Field / Shadow Update)**: Injecting `{ "secretBackdoor": true }` into user document update. -> MUST RETURN PERMISSION_DENIED.
5. **Payload 5 (Cross-Tenant Balance Sniffing)**: User `user_alice` querying `users/user_bob`. -> MUST RETURN PERMISSION_DENIED.
6. **Payload 6 (Cross-Tenant Transaction Injection)**: User `user_alice` attempting to write a deposit into `/users/user_bob/transactions/tx_123`. -> MUST RETURN PERMISSION_DENIED.
7. **Payload 7 (Denial of Wallet via Massive ID)**: Injecting a 2MB string as `transactionId`. -> MUST RETURN PERMISSION_DENIED.
8. **Payload 8 (Invalid Enum Value)**: Creating a transaction with `type: "free_money"` or `status: "hacked"`. -> MUST RETURN PERMISSION_DENIED.
9. **Payload 9 (Unauthenticated Transaction Write)**: Non-authenticated client attempting to write to `/users/{userId}/transactions/{txId}`. -> MUST RETURN PERMISSION_DENIED.
10. **Payload 10 (Spoofed Admin Write without Email Verification)**: Unverified email claiming admin privileges. -> MUST RETURN PERMISSION_DENIED.
11. **Payload 11 (Policy Hijacking)**: Creating an insurance policy under another user's subcollection. -> MUST RETURN PERMISSION_DENIED.
12. **Payload 12 (Negative Balance Attack)**: Attempting to submit arbitrary non-numeric structures as balance amounts. -> MUST RETURN PERMISSION_DENIED.
