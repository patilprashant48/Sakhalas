# Planning Insights - Frontend Web Application

A comprehensive project financial management system built with React, TypeScript, Material UI, and Vite.

## Features

- **Authentication & Authorization**
  - Email/password login
  - Two-factor authentication (OTP)
  - Role-based access control (Admin, Project Manager, Employee, Treasurer, Auditor)
  - JWT token management with auto-logout

- **Project Management**
  - Create, edit, and archive projects
  - Budget tracking and utilization
  - Team member management
  - Project dashboards with analytics

- **Expense Management**
  - Create expenses with bill uploads
  - Draft and submit workflows
  - Multi-level approval system
  - Category and vendor tracking
  - Overdue expense alerts

- **Payment Processing**
  - Track full and partial payments
  - Payment proof uploads
  - Reminder system
  - Due date management

- **Dashboards & Analytics**
  - Company-wide KPIs
  - Project-specific insights
  - Budget vs spent charts
  - Expense categorization
  - Overdue payment tracking

- **Reports & Export**
  - PDF and CSV export
  - Date range filtering
  - Project-specific reports
  - Role-based access

- **Responsive Design**
  - Mobile-first approach
  - Adaptive layouts
  - Touch-friendly interfaces

## Tech Stack

- **React 18** with **TypeScript**
- **Vite** for blazing-fast development
- **Material UI (MUI)** for UI components
- **React Router v6** for navigation
- **Axios** for API calls
- **React Hook Form** + **Zod** for form validation
- **Recharts** for data visualization
- **date-fns** for date formatting

## Project Structure

```
src/
├── api/                 # API integration layer
├── auth/                # Authentication components
├── components/
│   ├── common/          # Reusable components
│   └── forms/           # Form components
├── pages/               # Page components
│   ├── public/
│   ├── dashboard/
│   ├── projects/
│   ├── expenses/
│   ├── payments/
│   └── reports/
├── hooks/               # Custom React hooks
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── App.tsx              # Main app component with routing
├── main.tsx             # Application entry point
└── theme.ts             # MUI theme configuration
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Backend API running (see backend documentation)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd planning-insight-web-app
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env
```

Edit `.env` and set your backend API URL:
```
VITE_API_BASE_URL=http://localhost:5000/api
```

4. Start the development server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` folder.

## User Roles & Permissions

| Feature | Admin | PM | Employee | Treasurer | Auditor |
|---------|-------|-----|----------|-----------|---------|
| View Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create Projects | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create Expenses | ✅ | ✅ | ✅ | ❌ | ❌ |
| Approve Expenses | ✅ | ✅ | ❌ | ✅ | ❌ |
| Add Payments | ✅ | ❌ | ❌ | ✅ | ❌ |
| Export Reports | ✅ | ✅ | ❌ | ✅ | ✅ |
| Manage Users | ✅ | ❌ | ❌ | ❌ | ❌ |

## API Integration

The frontend expects the following API endpoints:

### Authentication
- `POST /api/auth/login`
- `POST /api/auth/verify-2fa`
- `GET /api/auth/me`
- `POST /api/auth/logout`

### Projects
- `GET /api/projects`
- `GET /api/projects/:id`
- `POST /api/projects`
- `PUT /api/projects/:id`
- `PATCH /api/projects/:id/archive`

### Expenses
- `GET /api/expenses`
- `GET /api/expenses/:id`
- `POST /api/expenses`
- `PUT /api/expenses/:id`
- `POST /api/expenses/approve`
- `POST /api/expenses/:id/payments`

### Dashboard
- `GET /api/dashboard/company/kpis`
- `GET /api/dashboard/company/expenses-by-project`
- `GET /api/dashboard/company/expenses-by-category`
- `GET /api/dashboard/project/:id`
- `GET /api/public/today-payments`

### Reports
- `GET /api/reports/export`

## Development

### Code Style

- TypeScript strict mode enabled
- ESLint for code quality
- Prettier for code formatting

### Component Guidelines

- Use functional components with hooks
- Implement proper TypeScript typing
- Follow Material UI best practices
- Ensure mobile responsiveness
- Handle loading and error states

## Security Features

- JWT token stored in localStorage
- Automatic token expiration handling
- Role-based route protection
- Permission-based UI elements
- Secure file uploads

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is proprietary and confidential.

## Support

For issues and questions, please contact the development team.
