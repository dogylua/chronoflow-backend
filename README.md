# ChronoFlow Backend

A modern NestJS backend application for managing time paradoxes and habits.

## Features

- 🔐 Authentication with device registration and QR code support
- 📝 OpenAPI documentation with Swagger
- 🛡️ Security with Helmet and rate limiting
- 🎯 Request validation and error handling
- 📊 PostgreSQL database with TypeORM
- 🔄 Environment-based configuration
- 📝 Logging and request tracking

## Prerequisites

- Node.js (v18 or later)
- PostgreSQL (v14 or later)
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create environment file:
   ```bash
   cp .env.example .env
   ```
4. Update the `.env` file with your configuration

## Environment Variables

```env
NODE_ENV=development
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=chronoflow

# JWT Configuration
JWT_SECRET=your-secret-key-here
JWT_ACCESS_EXPIRATION=1h
```

## Running the Application

### Development

```bash
npm run start:dev
```

### Production

```bash
npm run build
npm run start:prod
```

## API Documentation

Once the application is running, you can access the Swagger documentation at:

```
http://localhost:3000/api
```

## Project Structure

```
src/
├── config/             # Configuration files
├── core/              # Core functionality (filters, interceptors, etc.)
├── modules/           # Feature modules
│   ├── auth/         # Authentication module
│   ├── users/        # Users module
│   └── habits/       # Habits module
├── database/         # Database migrations and seeds
└── types/           # TypeScript type definitions
```

## Security Features

- CORS protection
- Helmet security headers
- Rate limiting
- Input validation
- JWT authentication
- Request logging

## Development Guidelines

1. Follow the NestJS best practices
2. Use TypeScript decorators for validation
3. Write meaningful commit messages
4. Document new endpoints in Swagger
5. Handle errors properly using filters
6. Use environment variables for configuration

## License

MIT
