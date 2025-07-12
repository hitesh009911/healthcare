# Life Aid Healthcare Backend Setup

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/life-aid-healthcare

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=30d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

## Database Setup

1. Make sure MongoDB is running locally or use a cloud instance
2. Update the `MONGODB_URI` in your `.env` file
3. The application will automatically create the necessary collections

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

## API Endpoints

The server will be available at `http://localhost:5000`

### Health Check
- `GET /health` - Check if the server is running

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)

### Users
- `GET /api/users` - Get all users (admin only)
- `POST /api/users` - Create user (admin only)
- `GET /api/users/:id` - Get user by ID (admin only)
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

### Diagnostic Centers
- `GET /api/diagnostic-centers` - Get all centers
- `GET /api/diagnostic-centers/:id` - Get center by ID
- `POST /api/diagnostic-centers` - Create center (admin only)
- `PUT /api/diagnostic-centers/:id` - Update center (admin only)
- `DELETE /api/diagnostic-centers/:id` - Delete center (admin only)

### Diagnostic Tests
- `GET /api/diagnostic-tests` - Get all tests
- `GET /api/diagnostic-tests/center/:centerId` - Get tests by center
- `POST /api/diagnostic-tests` - Create test (admin/center admin)
- `PUT /api/diagnostic-tests/:id` - Update test (admin/center admin)
- `DELETE /api/diagnostic-tests/:id` - Delete test (admin/center admin)

### Appointments
- `POST /api/appointments` - Create appointment (authenticated)
- `GET /api/appointments/user` - Get user appointments (authenticated)
- `GET /api/appointments/center/:centerId` - Get center appointments (admin/center admin)
- `PUT /api/appointments/:id/status` - Update appointment status (admin/center admin)

## User Roles

- `patient` - Can book appointments and view their own data
- `diagnostic_center_admin` - Can manage their center's tests and appointments
- `admin` - Can manage all centers, tests, and appointments
- `super_admin` - Full system access including user management

## ES6 Features Used

- ES6 Modules (import/export)
- Arrow Functions
- Template Literals
- Destructuring
- Async/Await
- Spread/Rest Operators
- Optional Chaining
- Nullish Coalescing

## Project Structure

```
├── config/          # Database configuration
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/          # Mongoose models
├── routes/          # Express routes
├── scripts/         # Utility scripts
└── index.js         # Main server file
```

## Security Features

- JWT Authentication
- Role-based Authorization
- Password Hashing (bcrypt)
- CORS Protection
- Input Validation
- Error Handling

## Error Handling

The application includes comprehensive error handling:
- Global error handler middleware
- Try-catch blocks in all async operations
- Proper HTTP status codes
- Detailed error messages for debugging 