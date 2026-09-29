# AI Data Agent

An intelligent data intelligence platform that acts as a senior-level data analyst for your business databases. AI Data Agent understands, investigates, analyzes, explains, monitors, and communicates data from various database types, transforming complex data into clear business intelligence.

## 🚀 Overview

AI Data Agent is more than just a Text-to-SQL tool. It's a comprehensive data intelligence platform designed to:

- **Understand** your business data and context
- **Investigate** what's happening in your databases
- **Analyze** complex relationships and patterns
- **Explain** findings in business-friendly language
- **Monitor** data changes autonomously
- **Communicate** insights through natural language

## 🏗️ Architecture

This is a monorepo built with Turborepo, consisting of:

### Applications

- **`apps/api`** - Express.js backend API with TypeScript, Prisma ORM, and Gemini LLM integration
- **`apps/web`** - Next.js 16 frontend with React 19 and TypeScript

### Shared Packages

- **`packages/ui`** - Shared React UI components
- **`packages/eslint-config`** - ESLint configurations for the monorepo
- **`packages/typescript-config`** - TypeScript configurations for the monorepo

## 🛠️ Tech Stack

### Backend (`apps/api`)
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL (app data) with Prisma ORM
- **Client Database Support**: PostgreSQL and MongoDB
- **AI/ML**: Google Gemini LLM for query generation and insight generation
- **Security**: Helmet, CORS, rate limiting, credential encryption
- **Architecture**: Modular design with separate modules for auth, data sources, queries, metadata, relationships, business context, and organization management

### Frontend (`apps/web`)
- **Framework**: Next.js 16 with App Router
- **UI**: React 19 with TypeScript
- **Styling**: CSS Modules and custom fonts
- **Features**: Authentication, workspace management, data source integration

### Development Tools
- **Build System**: Turborepo for monorepo management
- **Package Manager**: pnpm
- **Language**: TypeScript across all packages
- **Linting**: ESLint with custom configurations
- **Formatting**: Prettier

## 📋 Core Features

### Data Intelligence Pipeline
1. **Intent Classification** - Understand user query intent
2. **Metadata Retrieval** - Fetch database schema and relationships
3. **SQL Generation** - Generate optimized SQL queries using AI
4. **Query Execution** - Execute queries with read-only enforcement
5. **Insight Generation** - Transform results into business intelligence

### Security & Organization
- **Read-Only Enforcement** - All queries are read-only by default
- **Credential Encryption** - Database credentials are encrypted at rest
- **Organization Isolation** - Complete data separation between organizations
- **Query Validation** - Validates queries before execution
- **Role-Based Access** - Admin and member roles with appropriate permissions

### Database Support
- **PostgreSQL** - Full support with schema introspection
- **MongoDB** - Support for document-based databases
- **Relationship Discovery** - Automatic detection of relationships between data sources

## 🚦 Getting Started

### Prerequisites
- Node.js >= 18
- pnpm (recommended) or npm
- PostgreSQL database for application data
- Optional: MongoDB for client data sources

### Installation

1. Clone the repository and install dependencies:
```bash
git clone <repository-url>
cd AI-Data-Agent
pnpm install
```

2. Set up environment variables:
```bash
cp apps/api/.env.example apps/api/.env
```

Configure the following environment variables in `apps/api/.env`:
- `DATABASE_URL` - PostgreSQL connection string for app data
- `GEMINI_API_KEY` - Google Gemini API key
- `WEB_ORIGIN` - Frontend URL (default: http://localhost:3000)
- `PORT` - API port (default: 4000)

3. Run database migrations:
```bash
cd apps/api
npx prisma generate
npx prisma db push
```

### Development

Run both applications in development mode:
```bash
# From root directory
pnpm dev
```

Or run individual applications:
```bash
# API only
pnpm --filter api dev

# Web only
pnpm --filter web dev
```

The API will be available at `http://localhost:4000` and the web app at `http://localhost:3000`.

### Building

Build all applications:
```bash
pnpm build
```

Build specific application:
```bash
pnpm --filter api build
pnpm --filter web build
```

## 📁 Project Structure

```
AI-Data-Agent/
├── apps/
│   ├── api/                 # Express.js backend
│   │   ├── src/
│   │   │   ├── modules/     # Feature modules
│   │   │   │   ├── agent/   # AI agent logic
│   │   │   │   ├── auth/    # Authentication
│   │   │   │   ├── data-source/ # Database connections
│   │   │   │   ├── query/   # Query execution
│   │   │   │   ├── metadata/ # Schema metadata
│   │   │   │   ├── relationship/ # Data relationships
│   │   │   │   ├── business-context/ # Business context
│   │   │   │   └── organization/ # Org management
│   │   │   ├── infrastructure/ # Infrastructure code
│   │   │   └── generated/   # Prisma generated client
│   │   ├── prisma/          # Database schema
│   │   └── .env             # Environment variables
│   └── web/                 # Next.js frontend
│       ├── app/             # App router pages
│       │   ├── landing/     # Landing page
│       │   ├── signin/      # Sign in page
│       │   ├── signup/      # Sign up page
│       │   └── workspace/   # Main workspace
│       └── public/          # Static assets
├── packages/
│   ├── ui/                  # Shared UI components
│   ├── eslint-config/      # ESLint configurations
│   └── typescript-config/  # TypeScript configurations
└── turbo.json              # Turborepo configuration
```

## 🔐 Security Features

- **Authentication**: JWT-based authentication system
- **Authorization**: Role-based access control (Admin/Member)
- **Data Encryption**: Credentials encrypted at rest
- **Rate Limiting**: Configurable rate limiting per origin
- **CORS Protection**: Configurable CORS for frontend integration
- **Query Safety**: Read-only enforcement and query validation
- **Input Validation**: JSON payload size limits (100kb)

## 🗄️ Database Schema

The application uses PostgreSQL with the following main entities:

- **Organization** - Tenant organizations with plans (Small, Mid-scale, Enterprise)
- **User** - User accounts with email authentication and roles
- **DataSource** - Database connections (PostgreSQL/MongoDB)
- **DataRelationship** - Discovered relationships between data sources
- **BusinessContext** - Organization-specific business context for AI

## 🧪 Testing

Run tests for the API:
```bash
pnpm --filter api test
```

## 📝 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user

### Data Sources
- `GET /data-sources` - List data sources
- `POST /data-sources` - Add data source
- `DELETE /data-sources/:id` - Remove data source

### Query & Analysis
- `POST /query` - Execute natural language query
- `POST /agent/chat` - Chat with AI agent
- `GET /metadata/:dataSourceId` - Get database metadata

### Organization
- `GET /organization` - Get organization details
- `PUT /organization` - Update organization
- `PUT /organization/context` - Update business context

## 🚀 Deployment

### Production Build
```bash
pnpm build
```

### Running in Production
```bash
# API
cd apps/api
pnpm start

# Web
cd apps/web
pnpm start
```

### Docker Support
MongoDB Docker configuration is available:
```bash
docker-compose -f docker-compose.mongo.yml up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Useful Links

- [Turborepo Documentation](https://turborepo.dev/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Documentation](https://expressjs.com/)
- [Google Gemini API](https://ai.google.dev/gemini-api/docs)

## 📞 Support

For issues, questions, or contributions, please open an issue on the repository or contact the development team.
