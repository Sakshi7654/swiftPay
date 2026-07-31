# 🚀 SwiftPay

**SwiftPay** is a full-stack digital wallet and payment platform built using a high-performance monorepo architecture. It enables seamless peer-to-peer (P2P) transfers, simulated bank webhook integrations, and real-time transaction tracking users.

---

## 🛠️ Tech Stack

* **Framework:** [Next.js](https://nextjs.org/) (App Router, React 19)
* **Monorepo:** [Turborepo](https://turbo.build/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Database & ORM:** PostgreSQL + [Prisma ORM](https://www.prisma.io/)
* **Authentication:** [NextAuth.js](https://next-auth.js.org/)
* **State Management:** [Recoil](https://recoiljs.org/)
* **Backend Services:** Node.js + Express (Bank Webhook Service)

---

## 📁 Repository Structure

```bash
swiftPay/
├── apps/
│   ├── user-app/         # Next.js frontend for end users
│   ├── merchant-app/     # Next.js frontend for merchants
│   └── bank-webhook/     # Express server for simulated bank transactions
│
├── packages/
│   ├── db/               # Prisma schema, migrations, DB client
│   ├── ui/               # Shared UI components (Tailwind-based)
│   ├── store/            # Shared state management (Recoil)
│   ├── typescript-config/# Shared TypeScript configs
│   └── eslint-config/    # Shared ESLint rules
│
├── turbo.json            # Turborepo pipeline configuration
└── package.json          # Root workspace config
```

---

## ⚙️ Getting Started

### 📌 Prerequisites

Make sure you have the following installed:

* Node.js (v18+ or v20+)
* npm (v10+)
* PostgreSQL database (local or hosted like Neon, Supabase, Railway)

---

### 📥 Installation

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/swiftPay.git
cd swiftPay
```

Install dependencies:

```bash
npm install
```

---

### 🔐 Environment Variables

Create `.env` files in:

* `packages/db/`
* `apps/user-app/`

Add the following variables:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/swiftpay?sslmode=require"
NEXTAUTH_SECRET="your_nextauth_secret_key"
NEXTAUTH_URL="http://localhost:3000"
```

---

### 🧬 Database Setup

Generate Prisma client:

```bash
npx prisma generate --schema=packages/db/prisma/schema.prisma
```

Sync database schema:

```bash
npx prisma db push --schema=packages/db/prisma/schema.prisma
```

---

## ▶️ Running the Project

Start all services using Turborepo:

```bash
npm run dev
```

---

## 🌐 Local Development URLs

* **User App:** http://localhost:3000
* **Bank Webhook Server:** http://localhost:3003

---

## ✨ Features

* 💸 Peer-to-Peer (P2P) money transfers
* 🔁 Simulated bank webhook system
* ⚡ Real-time transaction tracking
* 🔐 Secure authentication using NextAuth
* 🧠 Shared state management across apps
* 🏗️ Scalable monorepo architecture

