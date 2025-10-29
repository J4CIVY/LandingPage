🌎 Traducción al Inglés
Aquí tienes la traducción completa al inglés del contenido proporcionado:

BSK Motorcycle Team - Landing Page
This is the repository for the frontend of the official BSK Motorcycle Team website. The project is built with Next.js and TypeScript, providing a modern, fast, and responsive user experience.

✨ Key Features
Static and Dynamic Pages: Multiple sections such as About Us, Events, Store, Contact, and more.

Responsive Design: Fully adaptive user interface built with Tailwind CSS.

Light/Dark Theme: Support for switching between color themes.

Event Calendar: Displays the club's upcoming events.

Registration Form: Registration form with local validation using Zod (prepared for future API integration).

SEO Optimized: Components and configuration to improve search engine ranking.

🚀 Tech Stack
Framework: Next.js

Language: TypeScript

Styling: Tailwind CSS

Form Management: React Hook Form

Schema Validation: Zod

HTTP Client: Axios

Testing: Vitest

Icons: React Icons

📂 Project Structure
The project follows an organized structure to facilitate maintenance and scalability:

/
├── app/                # Application routing and pages
│   ├── about/
│   ├── contact/
│   └── ...
├── components/         # Reusable React components
│   ├── home/           # Homepage-specific components
│   └── shared/         # Shared components (Header, Footer, etc.)
├── data/               # Static data (form options, images)
├── hooks/              # Custom React hooks
├── http/               # HTTP client configuration (Axios)
├── providers/          # Context providers (e.g., ThemeProvider)
├── public/             # Static assets (images, favicons)
├── schemas/            # Validation schemas (Zod)
├── tests/              # Unit and integration tests
└── types/              # TypeScript type definitions
🏁 Quick Start Guide
Follow these steps to set up and run the project in your local environment.

Prerequisites
Node.js (version 20.x or higher)

npm or yarn

Installation
Clone the repository:

Bash

git clone https://github.com/BSKMT/LandingPage.git
Navigate to the project directory:

Bash

cd LandingPage
Install dependencies:

Bash

npm install
Running
To start the development server:

Bash

npm run dev
Open http://localhost:3000 in your browser to view the application.

📜 Available Scripts
This project includes the following scripts defined in package.json:

npm run dev: Starts the application in development mode.

npm run build: Compiles the application for production.

npm run start: Starts a production server.

npm run lint: Runs ESLint to analyze code for problems.

npm run test: Executes unit tests with Vitest.

npm run test:watch: Executes tests in watch mode.

⚙️ Configuration
The project uses environment variables to manage configuration. Create a .env.local file in the project root and add the necessary variables.

HTTP Client and API Key
The HTTP client (http/client.ts) is configured to manage authentication intelligently:

If a JWT exists (via a cookie), requests include the Authorization: Bearer <token> header.

If there is no JWT and the route is whitelisted (apiKeyRoutes), the client adds the x-api-key header with the NEXT_PUBLIC_API_KEY value.

Optionally, request signing (HMAC-SHA256) can be enabled by setting NEXT_PUBLIC_USE_HMAC to true.

Environment Variables
NEXT_PUBLIC_API_KEY: The public API key for the domain.

NEXT_PUBLIC_USE_HMAC: true or false to enable/disable HMAC request signing.

✅ Testing
To run the test suite, use the following command:

Bash

npm run test
This will execute all unit tests defined in the tests/ directory using Vitest.

Security Tests
To run the specific secure authentication system tests:

Bash

npm run test:preauth
This will execute the PreAuthToken model tests and verify the correct implementation of the pre-authentication token system.

🔒 Security
Progressive Authentication System (v2.3.1)
This project implements a 3-step login system similar to Google and Microsoft, featuring RSA-2048 encryption, mandatory 2FA authentication, and intelligent inactivity detection.

🎯 3-Step Login Flow
Step 1: Email          →  Step 2: Password  →  Step 3: 2FA WhatsApp
  📧 Verification           🔒 RSA-2048            🛡️ 6-digit code
  ⏱️ No timer              ⏱️ 90 seconds         ⏱️ 120 seconds
Advantages:

✅ Familiar UX: Used by Google, Microsoft, LinkedIn

✅ Early Validation: Detects errors sooner (non-existent email)

✅ Specific Feedback: Direct links to solutions

✅ Inactivity Detection: Warnings and help options

✅ Professional: Enterprise look & feel

Multi-Layer Protection
1. Progressive Login (v2.2.0)

✅ Step 1 - Email: Existence + status verification

✅ Step 2 - Password: Validation with RSA-2048 encryption

✅ Step 3 - 2FA: Mandatory WhatsApp code

✅ Intuitive Navigation: "Back" button to correct errors

2. Inactivity System (v2.3.0)

✅ Intelligent Detection: Timers per step with progressive warnings

✅ Step 2 (Password): 90s timer, warning at 15s

✅ Step 3 (2FA): 120s timer, warning at 30s

✅ "Haven't heard from you" Screen: Similar to Microsoft

✅ Recovery Options: Retry, Help, Go Back

✅ Automatic Reset: Timer resets upon activity detection

3. Rate Limiting and Anti-Enumeration (NEW v2.3.1)

✅ Email Verification Protection: 10 attempts every 5 minutes

✅ User Enumeration Prevention: Prevents automated account discovery

✅ Comprehensive Rate Limiting: All auth endpoints protected

✅ Enterprise Security: Equivalent to Microsoft/Google/Facebook

4. Client-Side Encryption

✅ RSA-2048: Passwords encrypted in the browser before sending

✅ Web Crypto API: Native browser technology, no external libraries

✅ Invisible in BurpSuite: Passwords are not visible even by intercepting traffic

✅ MITM Protection: Additional layer over HTTPS

✅ Email in Plain Text: Correct by design (needed for DB searches)

5. Pre-Authentication Tokens

✅ Temporary Tokens: 256 bits, 5-minute expiration

✅ Single Use: Not reusable after verification

✅ Context Validation: IP + UserAgent binding

✅ Automatic Cleanup: MongoDB TTL indexes

6. 2FA Authentication

✅ WhatsApp OTP: 6-digit codes sent via WhatsApp

✅ Rate Limiting: Brute force protection

✅ Account Lockout: After multiple failed attempts

Secure Authentication Flow
1. User enters email
   ↓
2. POST /api/auth/check-email
   ↓
3. Email exists and verified → Step 2
   ↓ [Timer starts: 90 seconds]
4. User enters password
   ↓ [If inactive 75s → Yellow banner]
   ↓ [If inactive 90s → "Haven't heard from you" screen]
5. RSA-2048 Encryption (browser)
   ↓
6. POST /api/auth/validate-credentials
   ↓
7. Correct credentials → Pre-auth token
   ↓
8. POST /api/auth/2fa/generate
   ↓ [Timer starts: 120 seconds]
9. Code sent via WhatsApp → Step 3
   ↓ [If inactive 90s → Warning]
   ↓ [If inactive 120s → "Code not received" screen]
10. User enters code
    ↓
11. POST /api/auth/2fa/verify
    ↓
12. ✅ JWT Session created → Dashboard
Security Level
Layer 1: HTTPS/TLS 1.3
  ↓
Layer 2: Progressive Validation (3 steps)
  ↓
Layer 3: RSA-2048 Encryption (Client-Side)
  ↓
Layer 4: Rate Limiting per step
  ↓
Layer 5: Pre-Authentication Tokens (256 bits)
  ↓
Layer 6: IP + UserAgent Validation
  ↓
Layer 7: 2FA Authentication via WhatsApp
  ↓
Layer 8: Signed JWT
  ↓
🎯 MAXIMUM ENTERPRISE SECURITY
Security Documentation
For detailed information on the security implementation:

Inactivity System: docs/INACTIVITY-SYSTEM.md ⭐ NEW v2.3.0

3-Step Login:

Client-Side Encryption:

Technical Analysis:

Deployment Guide:

Advanced Configuration:

Executive Summary:

Comparison: System Evolution
Security Tests
With BurpSuite:

Step 1 - Email:

Step 2 - Password:

✅ Passwords are NOT visible in plain text

Compliance
This authentication system complies with:

✅ OWASP Top 10 (2021)

✅ OWASP Authentication Cheat Sheet

✅ NIST SP 800-57 (Key Management)

✅ Next.js security best practices

✅ Zero Trust Principles

✅ Banking-grade encryption (RSA-2048)

✅ Microsoft, Google, LinkedIn UX patterns
