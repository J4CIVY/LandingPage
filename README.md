# BSK Motorcycle Team - Landing Page

This is the repository for the frontend of the official website for **BSK Motorcycle Team**. The project is built with Next.js and TypeScript, providing a modern, fast, and responsive user experience.

## ✨ Key Features

- **Static and Dynamic Pages:** Multiple sections such as About Us, Events, Shop, Contact, and more.
- **Responsive Design:** Fully adaptive user interface built with Tailwind CSS.
- **Light/Dark Theme:** Support for switching between color themes.
- **Event Calendar:** Displays the club's upcoming events.
- **Registration Form:** Registration form with local validation using Zod (ready for future API integration).
- **SEO Optimized:** Components and configuration to improve search engine ranking.

## 🚀 Technology Stack

- **Framework:** [Next.js](https://nextjs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Form Management:** [React Hook Form](https://react-hook-form.com/)
- **Schema Validation:** [Zod](https://zod.dev/)
- **HTTP Client:** [Axios](https://axios-http.com/)
- **Testing:** [Vitest](https://vitest.dev/)
- **Icons:** [React Icons](https://react-icons.github.io/react-icons/)

## 📂 Project Structure

The project follows an organized structure to facilitate maintenance and scalability:

```
/
├── app/                # Application routing and pages
│   ├── about/
│   ├── contact/
│   └── ...
├── components/         # Reusable React components
│   ├── home/           # Components specific to the home page
│   └── shared/         # Shared components (Header, Footer, etc.)
├── data/               # Static data (form options, images)
├── hooks/              # Custom React hooks
├── http/               # HTTP client configuration (Axios)
├── providers/          # Context providers (e.g., ThemeProvider)
├── public/             # Static assets (images, favicons)
├── schemas/            # Validation schemas (Zod)
├── tests/              # Unit and integration tests
└── types/              # TypeScript type definitions
```

## 🏁 Quick Start Guide

Follow these steps to set up and run the project in your local environment.

### Prerequisites

- [Node.js](https://nodejs.org/) (version 20.x or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/BSKMT/LandingPage.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd LandingPage
    ```
3.  Install the dependencies:
    ```bash
    npm install
    ```

### Execution

To start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📜 Available Scripts

This project includes the following scripts defined in `package.json`:

-   `npm run dev`: Starts the application in development mode.
-   `npm run build`: Builds the application for production.
-   `npm run start`: Starts a production server.
-   `npm run lint`: Runs ESLint to analyze code for problems.
-   `npm run test`: Runs unit tests with Vitest.
-   `npm run test:watch`: Runs tests in watch mode.

## ⚙️ Configuration

The project uses environment variables to manage configuration. Create a `.env.local` file in the project root and add the necessary variables.

### HTTP Client and API Key

The HTTP client (`http/client.ts`) is configured to handle authentication intelligently:

-   If a JWT exists (via a cookie), requests include the `Authorization: Bearer <token>` header.
-   If there is no JWT and the route is in the whitelist (`apiKeyRoutes`), the client adds the `x-api-key` header with the value of `NEXT_PUBLIC_API_KEY`.
-   Optionally, request signing (HMAC-SHA256) can be enabled by setting `NEXT_PUBLIC_USE_HMAC` to `true`.

#### Environment Variables

-   `NEXT_PUBLIC_API_KEY`: The public API key for the domain.
-   `NEXT_PUBLIC_USE_HMAC`: `true` or `false` to enable/disable HMAC request signing.

## ✅ Testing

To run the test suite, use the following command:

```bash
npm run test
```

This will run all unit tests defined in the `tests/` directory using Vitest.

### Security Tests

To run specific tests for the secure authentication system:

```bash
npm run test:preauth
```

This will run the tests for the `PreAuthToken` model and verify the correct implementation of the pre-authentication token system.

## 🔒 Security

### Progressive Authentication System (v2.3.1)

This project implements a **3-step login system** similar to Google and Microsoft, with **RSA-2048 encryption**, **mandatory 2FA**, and **intelligent inactivity detection**.

#### 🎯 3-Step Login Flow

```
Step 1: Email          →  Step 2: Password   →  Step 3: WhatsApp 2FA
  📧 Verification           🔒 RSA-2048            🛡️ 6-digit code
  ⏱️ No timer              ⏱️ 90 seconds         ⏱️ 120 seconds
```

**Advantages**:
- ✅ **Familiar UX**: Used by Google, Microsoft, LinkedIn
- ✅ **Early Validation**: Detects errors sooner (non-existent email)
- ✅ **Specific Feedback**: Direct links to solutions
- ✅ **Inactivity Detection**: Warnings and help options
- ✅ **Professional**: Enterprise look & feel

#### Multi-Layer Protection

**1. Progressive Login (v2.2.0)**
- ✅ **Step 1 - Email**: Existence verification + status
- ✅ **Step 2 - Password**: Validation with RSA-2048 encryption
- ✅ **Step 3 - 2FA**: Mandatory WhatsApp code
- ✅ **Intuitive Navigation**: "Back" button to correct errors

**2. Inactivity System (v2.3.0)**
- ✅ **Intelligent Detection**: Step-specific timers with progressive warnings
- ✅ **Step 2 (Password)**: 90s timer, warning at 15s
- ✅ **Step 3 (2FA)**: 120s timer, warning at 30s
- ✅ **"We Haven't Heard From You" Screen**: Similar to Microsoft
- ✅ **Recovery Options**: Retry, Help, Go Back
- ✅ **Automatic Reset**: Timer resets upon detecting activity

**3. Rate Limiting and Anti-Enumeration (NEW v2.3.1)**
- ✅ **Email Verification Protection**: 10 attempts every 5 minutes
- ✅ **User Enumeration Prevention**: Prevents automated account discovery
- ✅ **Comprehensive Rate Limiting**: All auth endpoints protected
- ✅ **Enterprise Security**: Equivalent to Microsoft/Google/Facebook

**4. Client-Side Encryption**
- ✅ **RSA-2048**: Passwords encrypted in the browser before sending
- ✅ **Web Crypto API**: Native browser technology, no external libraries
- ✅ **Invisible in BurpSuite**: Passwords not visible even when intercepting traffic
- ✅ **MITM Protection**: Additional layer over HTTPS
- ✅ **Email in Plain Text**: Correct by design (necessary for DB searches)

**5. Pre-Authentication Tokens**
- ✅ **Temporary Tokens**: 256 bits, 5-minute expiration
- ✅ **Single Use**: Not reusable after verification
- ✅ **Context Validation**: IP + UserAgent binding
- ✅ **Automatic Cleanup**: MongoDB TTL indexes

**6. 2FA Authentication**
- ✅ **WhatsApp OTP**: 6-digit codes sent via WhatsApp
- ✅ **Rate Limiting**: Protection against brute force
- ✅ **Account Lockout**: After multiple failed attempts

#### Secure Authentication Flow

```
1. User enters email
   ↓
2. POST /api/auth/check-email
   ↓
3. Email exists and verified → Step 2
   ↓ [Timer starts: 90 seconds]
4. User enters password
   ↓ [If inactive 75s → Yellow banner]
   ↓ [If inactive 90s → "We haven't heard from you" screen]
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
   ↓ [If inactive 120s → "We haven't received the code" screen]
10. User enters code
    ↓
11. POST /api/auth/2fa/verify
    ↓
12. ✅ JWT session created → Dashboard
```

#### Security Level

```
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
Layer 7: WhatsApp 2FA Authentication
  ↓
Layer 8: Signed JWT
  ↓
🎯 MAXIMUM ENTERPRISE SECURITY
```

#### Security Documentation

For detailed information on the security implementation:

- **Inactivity System**: [`docs/INACTIVITY-SYSTEM.md`](./docs/INACTIVITY-SYSTEM.md) ⭐ NEW v2.3.0
- **3-Step Login**: [`docs/3-STEP-LOGIN-FLOW.md`](./docs/3-STEP-LOGIN-FLOW.md)
- **Client-Side Encryption**: [`docs/CLIENT-SIDE-ENCRYPTION.md`](./docs/CLIENT-SIDE-ENCRYPTION.md)
- **Technical Analysis**: [`docs/security-2fa-improvements.md`](./docs/security-2fa-improvements.md)
- **Deployment Guide**: [`docs/DEPLOYMENT-GUIDE.md`](./docs/DEPLOYMENT-GUIDE.md)
- **Advanced Configuration**: [`docs/SECURITY-CONFIGURATION.md`](./docs/SECURITY-CONFIGURATION.md)
- **Executive Summary**: [`docs/EXECUTIVE-SUMMARY.md`](./docs/EXECUTIVE-SUMMARY.md)

#### Comparison: System Evolution

| Aspect | v2.1.0 | v2.2.0 | v2.3.0 | v2.3.1 (Now) |
|---------|--------|--------|--------|----------------|
| **Login** | 1 step | 3 steps | 3 steps + timers | 3 steps + timers |
| **Inactivity** | ❌ | ❌ | ✅ Warnings | ✅ Warnings |
| **Email Rate Limiting** | ❌ | ❌ | ❌ | ✅ 10/5min |
| Visible fields | Email + Password | One field at a time |
| Validation | At the end | Progressive per step |
| Feedback | Generic | Specific + Links |
| Email not found | "Invalid credentials" | "Not found" → Registration link |
| UX | Standard | Google/Microsoft style |
| Navigation | Forward only | Forward + Back |

#### Security Tests

**With BurpSuite:**

**Step 1 - Email:**
```http
POST /api/auth/check-email HTTP/2
{
  "email": "user@example.com"
}
```

**Step 2 - Password:**
```http
POST /api/auth/validate-credentials HTTP/2
{
  "email": "user@example.com",
  "encryptedPassword": "kR7vXm9Q2Lp..." ✅ ENCRYPTED
}
```

✅ **Passwords are NOT visible in plain text**

#### Compliance

This authentication system complies with:
- ✅ OWASP Top 10 (2021)
- ✅ OWASP Authentication Cheat Sheet
- ✅ NIST SP 800-57 (Key Management)
- ✅ Next.js Security Best Practices
- ✅ Zero Trust Principles
- ✅ Bank-grade encryption (RSA-2048)
- ✅ Microsoft, Google, LinkedIn UX patterns
