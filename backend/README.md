# Sakhalas Backend API

Backend server for Sakhalas Finance Management application.

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, Rate Limiting
- **File Upload**: Multer

## Features

- ✅ RESTful API design
- ✅ JWT authentication & authorization
- ✅ Role-based access control
- ✅ File upload for receipts/invoices
- ✅ MongoDB with Mongoose schemas
- ✅ Input validation with express-validator
- ✅ Error handling middleware
- ✅ Rate limiting for API protection
- ✅ Request logging with Morgan
- ✅ CORS enabled for frontend integration

## Prerequisites

- Node.js >= 18.x
- MongoDB >= 6.x
- npm or yarn

## Installation

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/sakhalas
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

## Running the Server

### Development mode:
```bash
npm run dev
```

### Production mode:
```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Change password

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `GET /api/projects/:id/stats` - Get project statistics
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `PATCH /api/projects/:id/archive` - Archive project

### Expenses
- `GET /api/expenses` - Get all expenses
- `GET /api/expenses/pending-approvals` - Get pending approvals
- `GET /api/expenses/:id` - Get expense by ID
- `GET /api/expenses/:id/history` - Get approval history
- `POST /api/expenses` - Create expense (with file upload)
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `POST /api/expenses/approve` - Approve/reject expense
- `POST /api/expenses/:id/payments` - Add payment

### Dashboard
- `GET /api/dashboard/company` - Company dashboard data
- `GET /api/dashboard/project/:projectId` - Project dashboard data
- `GET /api/dashboard/today-payments` - Today's payments

## Database Models

### User
- name, email, password (hashed)
- role: Admin, Project Manager, Employee, Treasurer, Auditor
- department, phone
- isActive, requiresTwoFactor

### Project
- name, code, description
- managerId, budget, spent
- startDate, endDate, status, progress
- category, location

### Expense
- projectId, category, amount
- vendor, description, date
- status: Pending, Approved, Rejected, Partially Paid, Paid
- submittedBy, attachments
- paidAmount, paymentProofs[]

### ApprovalHistory
- expenseId, action
- performedBy, performedAt
- comment

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based authorization
- Rate limiting (100 requests per 15 minutes)
- Auth rate limiting (5 attempts per 15 minutes)
- Helmet for HTTP headers security
- CORS configuration
- Input validation and sanitization
- File upload restrictions

## File Uploads

- Allowed types: jpeg, jpg, png, pdf, doc, docx, xls, xlsx
- Max file size: 5MB
- Storage: Local filesystem (./uploads)

## Error Handling

All errors return consistent JSON format:
```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "stack": "Stack trace (dev only)"
  }
}
```

## Development

### Linting:
```bash
npm run lint
```

### Format code:
```bash
npm run format
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| NODE_ENV | Environment | development |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/sakhalas |
| JWT_SECRET | Secret for JWT signing | (required) |
| JWT_EXPIRES_IN | Token expiration | 7d |
| CORS_ORIGIN | Frontend URL | http://localhost:5173 |
| MAX_FILE_SIZE | Max upload size (bytes) | 5242880 (5MB) |

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   └── server.ts        # Entry point
├── uploads/             # Uploaded files
├── .env                 # Environment variables
├── .env.example         # Example env file
├── package.json
└── tsconfig.json
```

## License

MIT
