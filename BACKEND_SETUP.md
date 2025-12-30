# 🚀 Sakhalas Finance Management - Backend Setup Complete!

## Backend Architecture

A complete **Node.js + Express + MongoDB** backend has been added to the project with the following features:

### ✅ Features Implemented

1. **Authentication & Authorization**
   - JWT-based authentication
   - Role-based access control (Admin, Project Manager, Employee, Treasurer, Auditor)
   - Password hashing with bcrypt
   - Token expiration and refresh

2. **Database Models**
   - User management
   - Project tracking
   - Expense management
   - Approval history
   - Payment proofs

3. **API Endpoints**
   - `/api/auth/*` - Authentication (login, register, profile)
   - `/api/projects/*` - Project CRUD operations
   - `/api/expenses/*` - Expense management, approvals, payments
   - `/api/dashboard/*` - Dashboard analytics

4. **Security**
   - Helmet for HTTP headers
   - CORS configuration
   - Rate limiting (100 req/15min)
   - Auth rate limiting (5 attempts/15min)
   - Input validation with express-validator
   - File upload restrictions

5. **File Uploads**
   - Multer for handling attachments
   - Support for receipts, invoices, payment proofs
   - File type validation
   - Size limits (5MB max)

## 📁 Backend Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts          # MongoDB connection
│   ├── controllers/
│   │   ├── auth.controller.ts   # Authentication logic
│   │   ├── project.controller.ts
│   │   ├── expense.controller.ts
│   │   └── dashboard.controller.ts
│   ├── middleware/
│   │   ├── auth.ts              # JWT verification
│   │   ├── errorHandler.ts      # Error handling
│   │   ├── rateLimiter.ts       # Rate limiting
│   │   └── upload.ts            # File upload
│   ├── models/
│   │   ├── User.model.ts
│   │   ├── Project.model.ts
│   │   ├── Expense.model.ts
│   │   └── ApprovalHistory.model.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── project.routes.ts
│   │   ├── expense.routes.ts
│   │   └── dashboard.routes.ts
│   └── server.ts                # Entry point
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites
- **Node.js** >= 18.x
- **MongoDB** >= 6.x (Install locally or use MongoDB Atlas)
- **npm** or **yarn**

### Step 1: Install MongoDB

**Windows:**
```bash
# Download from https://www.mongodb.com/try/download/community
# Install and start MongoDB service
```

**Or use MongoDB Atlas (Cloud):**
1. Create free account at https://www.mongodb.com/atlas
2. Create a cluster
3. Get connection string
4. Update backend/.env with your connection string

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 3: Configure Environment

Create `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/sakhalas
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

### Step 4: Start Backend Server

```bash
cd backend
npm run dev
```

Server will run on http://localhost:5000

### Step 5: Configure Frontend

Update `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Step 6: Start Frontend

```bash
# In project root
npm run dev
```

Frontend will run on http://localhost:5173

## 🔐 Default Users (Create via Register API)

You'll need to create users manually via the `/api/auth/register` endpoint or create a seed script.

**Example Admin User:**
```json
POST /api/auth/register
{
  "name": "Admin User",
  "email": "admin@sakhalas.com",
  "password": "admin123",
  "role": "Admin"
}
```

**Example Treasurer:**
```json
{
  "name": "Treasurer",
  "email": "treasurer@sakhalas.com",
  "password": "treasurer123",
  "role": "Treasurer"
}
```

## 📊 API Testing

### Using cURL:

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@test.com","password":"admin123","role":"Admin"}'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}'
```

**Get Projects (with token):**
```bash
curl -X GET http://localhost:5000/api/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using Postman:
1. Import API endpoints
2. Set Authorization to Bearer Token
3. Use token from login response

## 🚦 Running Both Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## 📦 What's Connected

The frontend is already configured to:
- ✅ Use axios interceptors for auth tokens
- ✅ Auto-redirect on 401 errors
- ✅ Handle file uploads with FormData
- ✅ Support all CRUD operations

**No frontend code changes needed!** The API client (`src/api/axios.ts`) is already set up.

## 🔄 Migration Path

1. **Install MongoDB** (local or cloud)
2. **Install backend dependencies**
3. **Configure .env files**
4. **Start both servers**
5. **Create initial admin user** via register endpoint
6. **Login and use the app!**

The mock data in the frontend will be automatically replaced with real database data once the backend is running.

## 📝 Next Steps

1. **Create seed data script** (optional):
   - Sample projects
   - Sample expenses
   - Test users

2. **Deploy backend**:
   - Heroku, Railway, or Render for Node.js
   - MongoDB Atlas for database
   - Update CORS_ORIGIN to production URL

3. **Environment-specific configs**:
   - Production .env
   - Secure JWT secrets
   - HTTPS enforcement

## 🐛 Troubleshooting

**MongoDB Connection Error:**
- Ensure MongoDB is running: `mongod --version`
- Check connection string in .env
- For Atlas, whitelist your IP

**CORS Error:**
- Ensure backend CORS_ORIGIN matches frontend URL
- Check both servers are running

**401 Unauthorized:**
- Check if token is stored in localStorage
- Verify JWT_SECRET matches
- Token might be expired

## 📚 Additional Resources

- [Express Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Guide](https://mongoosejs.com/docs/guide.html)
- [JWT.io](https://jwt.io/)

---

**Backend is ready! Start building! 🎉**
