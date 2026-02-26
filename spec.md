# Specification

## Summary
**Goal:** Fix the user registration bug causing "Unauthorized: Only admins can assign user roles" error, ensure the admin panel login works, and verify the full end-to-end authentication flow.

**Planned changes:**
- Remove the admin role check from the `registerUser` backend function so new users can register with mobile number, full name, and 4-digit PIN without errors; newly registered users receive a default non-admin role
- Ensure the admin panel at `/admin` authenticates successfully with credentials `nuralom1` / `9040`, stores an admin session token in localStorage, and redirects to the admin dashboard with all six tabs accessible
- Verify end-to-end user auth flow: registration succeeds, login with mobile + PIN works, device fingerprint is stored on first login, and subsequent logins from the same device succeed

**User-visible outcome:** Regular users can register and log in without errors, and the admin can log into the admin panel and access all dashboard sections.
