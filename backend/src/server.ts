import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import { User } from './models/User.model';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';

// Routes
import authRoutes from './routes/auth.routes';
import projectRoutes from './routes/project.routes';
import expenseRoutes from './routes/expense.routes';
import dashboardRoutes from './routes/dashboard.routes';
import splitRoutes from './routes/split.routes';
import groupRoutes from './routes/group.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Rate limiting
app.use('/api', rateLimiter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/splits', splitRoutes);
app.use('/api/groups', groupRoutes);

// Error handling
app.use(errorHandler);

// Connect to database and start server

const createDefaultAdmin = async () => {
  const adminEmail = 'admin@company.com';
  const adminPassword = 'password'; // Change after first login!
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({
      name: 'Admin',
      email: adminEmail,
      password: adminPassword, // Let Mongoose pre-save hook hash this
      role: 'Admin',
      isActive: true,
      requiresTwoFactor: false,
    });
    console.log('✅ Default admin user created:', adminEmail);
  } else {
    console.log('ℹ️ Default admin user already exists:', adminEmail);
  }
};

const createDefaultProjectManager = async () => {
  const pmEmail = 'pm@company.com';
  const pmPassword = 'pmPassword123';
  const existing = await User.findOne({ email: pmEmail });
  if (!existing) {
    await User.create({
      name: 'Project Manager',
      email: pmEmail,
      password: pmPassword,
      role: 'Project Manager',
      isActive: true,
      requiresTwoFactor: false,
    });
    console.log('✅ Default project manager created:', pmEmail);
  } else {
    console.log('ℹ️ Default project manager already exists:', pmEmail);
  }
};

const createDefaultTreasurer = async () => {
  const treasurerEmail = 'treasurer@company.com';
  const treasurerPassword = 'treasurer123';
  const existing = await User.findOne({ email: treasurerEmail });
  if (!existing) {
    await User.create({
      name: 'Treasurer',
      email: treasurerEmail,
      password: treasurerPassword,
      role: 'Treasurer',
      isActive: true,
      requiresTwoFactor: false,
    });
    console.log('✅ Default treasurer created:', treasurerEmail);
  } else {
    console.log('ℹ️ Default treasurer already exists:', treasurerEmail);
  }
};

const createDefaultEmployee = async () => {
  const employeeEmail = 'employee@company.com';
  const employeePassword = 'employee123';
  const existing = await User.findOne({ email: employeeEmail });
  if (!existing) {
    await User.create({
      name: 'Employee',
      email: employeeEmail,
      password: employeePassword,
      role: 'Employee',
      isActive: true,
      requiresTwoFactor: false,
    });
    console.log('✅ Default employee created:', employeeEmail);
  } else {
    console.log('ℹ️ Default employee already exists:', employeeEmail);
  }
};

const createDefaultAuditor = async () => {
  const auditorEmail = 'auditor@company.com';
  const auditorPassword = 'auditor123';
  const existing = await User.findOne({ email: auditorEmail });
  if (!existing) {
    await User.create({
      name: 'Auditor',
      email: auditorEmail,
      password: auditorPassword,
      role: 'Auditor',
      isActive: true,
      requiresTwoFactor: false,
    });
    console.log('✅ Default auditor created:', auditorEmail);
  } else {
    console.log('ℹ️ Default auditor already exists:', auditorEmail);
  }
};

let server: ReturnType<typeof app.listen> | null = null;

const startServer = async () => {
  try {
    await connectDB();
    await createDefaultAdmin();
    await createDefaultProjectManager();
    await createDefaultTreasurer();
    await createDefaultEmployee();
    await createDefaultAuditor();
    server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown to avoid EADDRINUSE on restarts
const gracefulShutdown = (signal?: string) => {
  if (server) {
    console.log(`🛑 Shutting down server${signal ? ` (signal: ${signal})` : ''}...`);
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
    // Force exit if close takes too long
    setTimeout(() => process.exit(1), 5000).unref();
  } else {
    process.exit(0);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
// nodemon sends SIGUSR2 for restarts on some platforms
process.once('SIGUSR2', () => {
  gracefulShutdown('SIGUSR2');
  process.kill(process.pid, 'SIGUSR2');
});

startServer();

export default app;
