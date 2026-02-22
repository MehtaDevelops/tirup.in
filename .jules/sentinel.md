## 2026-02-22 - [CRITICAL] Exposed Gemini API Key in Client Component
**Vulnerability:** A hardcoded Google Gemini API key was found in a client-side React component (`components/ai-project-recommender.tsx`). This allowed anyone with access to the frontend code to steal and misuse the key.
**Learning:** Hardcoding secrets is a common mistake, but especially dangerous in client-side code where obfuscation is not protection. Next.js 15 provides Server Actions as a clean way to move such logic to the server.
**Prevention:** Always use environment variables for secrets and ensure that any logic requiring these secrets is executed server-side. Regularly scan the codebase for hardcoded keys (e.g., using `grep` or automated tools).
