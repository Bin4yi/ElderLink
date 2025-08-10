# ElderLink - Smart Elder Care Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12+-blue.svg)](https://www.postgresql.org/)

A comprehensive elder care management platform that connects immigrant families with their elderly parents through technology and healthcare services. Built with modern web technologies and designed for scalability and ease of use.

![ElderLink Banner](https://via.placeholder.com/800x200/3B82F6/FFFFFF?text=ElderLink+-+Smart+Elder+Care+Platform)

## 🌟 Features

### Core Functionality
- **Multi-Role User System**: Admin, Family Members, Doctors, Staff, Elders, Pharmacists
- **Health Monitoring**: Real-time vital signs tracking and health alerts
- **Appointment Management**: Schedule and manage doctor appointments
- **Prescription Management**: Digital prescriptions with pharmacy integration
- **Medicine Delivery**: Monthly prescription delivery and smart pill dispensers
- **Emergency Response**: 24/7 emergency alerts and rapid response system

### Advanced Features
- **Zoom Integration**: Video consultations for monthly health sessions
- **Real-time Notifications**: Socket.IO powered instant alerts
- **Payment Processing**: Stripe integration for subscription management
- **Mobile Application**: React Native app for on-the-go access
- **Analytics Dashboard**: Comprehensive reporting and analytics
- **File Upload**: Document and image management system

### Communication & Collaboration
- **Family Connection**: Real-time health dashboard for remote family members
- **Staff Coordination**: Multi-role staff management and assignment
- **Doctor Portal**: Patient management and session scheduling
- **Pharmacy Integration**: Prescription fulfillment and delivery tracking

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.IO
- **File Upload**: Multer
- **Email**: Nodemailer
- **Payments**: Stripe
- **Video**: Zoom API Integration

### Frontend
- **Framework**: React 18 with Hooks
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **Charts**: Chart.js & Recharts
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **State Management**: React Context + Hooks

### Mobile
- **Framework**: React Native with Expo
- **Navigation**: React Navigation
- **Storage**: AsyncStorage
- **Maps**: React Native Maps
- **Camera**: Expo Camera
- **Notifications**: Expo Notifications

### DevOps & Tools
- **Containerization**: Docker & Docker Compose
- **Process Management**: PM2 (production)
- **Testing**: Jest
- **Linting**: ESLint
- **Version Control**: Git

## 📋 Prerequisites

Before running ElderLink, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **PostgreSQL** (v12 or higher) - [Download here](https://www.postgresql.org/download/)
- **Git** - [Download here](https://git-scm.com/)
- **Docker** (optional, for containerized deployment) - [Download here](https://www.docker.com/)

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/elderlink.git
cd elderlink
```

### 2. Environment Configuration

#### Backend Configuration
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your configuration:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/elderlink

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# Email Configuration (for notifications)
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password

# Zoom Integration (optional)
ZOOM_ACCOUNT_ID=your_zoom_account_id
ZOOM_CLIENT_ID=your_zoom_client_id
ZOOM_CLIENT_SECRET=your_zoom_client_secret

# Stripe Payment (optional)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

#### Frontend Configuration
```bash
cd ../frontend
cp .env.example .env
```

Edit `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

#### Mobile Configuration
```bash
cd ../ElderlinkMobile
cp .env.example .env
```

Edit `ElderlinkMobile/.env`:

```env
API_URL=http://YOUR_LOCAL_IP:5000/api
```

### 3. Database Setup

#### Option A: Using Docker (Recommended)
```bash
# From project root
docker-compose up -d postgres
```

#### Option B: Local PostgreSQL
```bash
# Create database
createdb elderlink

# Or using psql
psql -U postgres -c "CREATE DATABASE elderlink;"
```

### 4. Install Dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd ../frontend
npm install
```

#### Mobile
```bash
cd ../ElderlinkMobile
npm install
```

### 5. Database Initialization

```bash
cd backend

# Run migrations
npm run db:migrate

# Seed initial data (optional)
npm run db:seed
npm run db:seed:users
npm run db:seed:packages
```

### 6. Start the Application

#### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

**Terminal 3 - Mobile:**
```bash
cd ElderlinkMobile
npm start
```

#### Production Mode

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
serve -s build -l 3000
```

## 📱 Usage Guide

### User Roles & Access

#### 1. Admin Dashboard
- **URL**: `/admin`
- **Features**: User management, analytics, system configuration
- **Permissions**: Full system access

#### 2. Family Member Portal
- **URL**: `/family`
- **Features**: Elder health monitoring, appointment booking, emergency alerts
- **Permissions**: View elder data, manage subscriptions

#### 3. Doctor Portal
- **URL**: `/doctor`
- **Features**: Patient management, appointment scheduling, Zoom consultations
- **Permissions**: Medical records access, prescription creation

#### 4. Staff Portal
- **URL**: `/staff`
- **Features**: Care management, health monitoring, emergency response
- **Permissions**: Elder care activities, vital signs tracking

#### 5. Elder Mobile App
- **Features**: Health tracking, medication reminders, emergency SOS
- **Platform**: iOS & Android via Expo

#### 6. Pharmacist Portal
- **URL**: `/pharmacist`
- **Features**: Prescription management, delivery scheduling, inventory
- **Permissions**: Pharmacy operations, medication dispensing

### Key Workflows

#### Health Monitoring
1. Staff logs vital signs through mobile app or web portal
2. System checks for abnormal values and triggers alerts
3. Family members receive real-time notifications
4. Doctors can review historical health data

#### Appointment Booking
1. Family member schedules appointment via portal
2. System assigns available doctor and time slot
3. Confirmation sent via email and mobile notification
4. Doctor receives patient details and medical history

#### Emergency Response
1. Elder or family member triggers emergency alert
2. System notifies nearest staff and emergency contacts
3. GPS location shared with responders
4. Incident logged for follow-up care

#### Prescription Management
1. Doctor creates prescription during consultation
2. System routes to assigned pharmacy
3. Pharmacist prepares medication
4. Delivery scheduled based on elder's location
5. Family member receives delivery confirmation

## 📚 API Documentation

### Authentication Endpoints

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "family_member"
}
```

### Elder Management

#### Get All Elders
```http
GET /api/elders
Authorization: Bearer <token>
```

#### Create Elder Profile
```http
POST /api/elders
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "dateOfBirth": "1950-01-01",
  "subscriptionId": "subscription-uuid"
}
```

### Health Monitoring

#### Record Vital Signs
```http
POST /api/vitals
Authorization: Bearer <token>
Content-Type: application/json

{
  "elderId": "elder-uuid",
  "bloodPressure": "120/80",
  "heartRate": 72,
  "temperature": 98.6,
  "oxygenSaturation": 98
}
```

#### Get Health Alerts
```http
GET /api/health-alerts
Authorization: Bearer <token>
```

### Appointments

#### Get Doctor Schedule
```http
GET /api/appointments/doctor/:doctorId
Authorization: Bearer <token>
```

#### Book Appointment
```http
POST /api/appointments
Authorization: Bearer <token>
Content-Type: application/json

{
  "doctorId": "doctor-uuid",
  "elderId": "elder-uuid",
  "appointmentDate": "2024-01-15T10:00:00Z",
  "reason": "Regular checkup"
}
```

### Zoom Integration

#### Create Meeting
```http
POST /api/monthly-sessions/:sessionId/create-zoom
Authorization: Bearer <doctor_token>
```

#### Send Meeting Links
```http
POST /api/monthly-sessions/:sessionId/send-links
Authorization: Bearer <doctor_token>
```

### Prescription Management

#### Get Prescriptions
```http
GET /api/prescriptions
Authorization: Bearer <token>
```

#### Create Prescription
```http
POST /api/prescriptions
Authorization: Bearer <doctor_token>
Content-Type: application/json

{
  "elderId": "elder-uuid",
  "medications": [
    {
      "name": "Lisinopril",
      "dosage": "10mg",
      "frequency": "Once daily",
      "duration": "30 days"
    }
  ],
  "pharmacyId": "pharmacy-uuid"
}
```

## 🏗️ Project Structure

```
elderlink/
├── backend/                          # Node.js/Express API server
│   ├── config/                       # Database and service configuration
│   │   ├── database.js              # Sequelize database connection
│   │   ├── jwt.js                   # JWT configuration
│   │   └── stripe.js                # Payment configuration
│   ├── controllers/                  # Route controllers
│   │   ├── authController.js        # Authentication logic
│   │   ├── elderController.js       # Elder management
│   │   ├── doctorController.js      # Doctor operations
│   │   └── ...
│   ├── models/                      # Sequelize data models
│   │   ├── User.js                  # User model
│   │   ├── Elder.js                 # Elder model
│   │   ├── Appointment.js           # Appointment model
│   │   └── ...
│   ├── routes/                      # API route definitions
│   │   ├── auth.js                  # Authentication routes
│   │   ├── elders.js                # Elder routes
│   │   └── ...
│   ├── middleware/                  # Express middleware
│   │   ├── auth.js                  # JWT authentication
│   │   └── validation.js            # Input validation
│   ├── services/                    # Business logic services
│   │   ├── emailService.js          # Email notifications
│   │   ├── zoomService.js           # Zoom integration
│   │   └── notificationService.js   # Push notifications
│   ├── scripts/                     # Database scripts
│   ├── uploads/                     # File uploads directory
│   ├── .env                         # Environment variables
│   ├── server.js                    # Main server file
│   └── package.json                 # Dependencies
├── frontend/                        # React web application
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── components/              # Reusable React components
│   │   │   ├── common/             # Shared components
│   │   │   ├── admin/              # Admin-specific components
│   │   │   ├── doctor/             # Doctor components
│   │   │   └── ...
│   │   ├── pages/                  # Page components
│   │   ├── services/               # API service functions
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── utils/                  # Utility functions
│   │   ├── App.js                  # Main app component
│   │   └── index.js                # App entry point
│   ├── .env                        # Frontend environment
│   └── package.json                # Dependencies
├── ElderlinkMobile/                # React Native mobile app
│   ├── src/
│   │   ├── screens/                # App screens
│   │   ├── components/             # Mobile components
│   │   ├── services/               # Mobile API services
│   │   └── navigation/             # Navigation configuration
│   ├── app.json                    # Expo configuration
│   └── package.json                # Mobile dependencies
├── docker-compose.yml              # Docker services
├── .gitignore                      # Git ignore rules
├── README.md                       # This file
├── PORT_FIX_SUMMARY.md             # Port configuration guide
├── ZOOM_SETUP_GUIDE.md             # Zoom integration setup
└── ZOOM_IMPLEMENTATION_SUMMARY.md  # Zoom features summary
```

## 🔧 Development

### Available Scripts

#### Backend Scripts
```bash
cd backend

# Development server with auto-reload
npm run dev

# Production build
npm run build

# Start production server
npm start

# Database operations
npm run db:migrate          # Run migrations
npm run db:seed            # Seed database
npm run db:seed:users      # Seed users only
npm run db:seed:packages   # Seed subscription packages

# Testing
npm test                   # Run tests
npm run test:watch         # Watch mode tests
```

#### Frontend Scripts
```bash
cd frontend

# Development server
npm start

# Production build
npm run build

# Testing
npm test

# Eject from Create React App
npm run eject
```

#### Mobile Scripts
```bash
cd ElderlinkMobile

# Start Expo development server
npm start

# Android development
npm run android

# iOS development
npm run ios

# Web development
npm run web
```

### Code Quality

#### Linting
```bash
# Backend linting
cd backend && npm run lint

# Frontend linting
cd frontend && npm run lint
```

#### Testing
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

### Database Management

#### Creating Migrations
```bash
cd backend
npx sequelize-cli migration:generate --name add-column-to-table
```

#### Running Migrations
```bash
npx sequelize-cli db:migrate
```

#### Creating Seeders
```bash
npx sequelize-cli seed:generate --name demo-users
```

## 🚀 Deployment

### Docker Deployment

#### Build and Run
```bash
# Build all services
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### Environment Variables for Docker
Create a `docker-compose.override.yml` for local development:

```yaml
version: '3.8'
services:
  backend:
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/elderlink
    volumes:
      - ./backend:/app
      - /app/node_modules

  frontend:
    environment:
      - REACT_APP_API_URL=http://localhost:5000
    volumes:
      - ./frontend:/app
      - /app/node_modules
```

### Manual Deployment

#### Backend Deployment
```bash
cd backend

# Install production dependencies
npm ci --only=production

# Build application
npm run build

# Start with PM2
pm2 start ecosystem.config.js --env production
```

#### Frontend Deployment
```bash
cd frontend

# Build for production
npm run build

# Serve static files (using nginx, apache, or static server)
serve -s build -l 3000
```

#### Mobile Deployment
```bash
cd ElderlinkMobile

# Build for production
expo build:android
expo build:ios

# Or use EAS Build
eas build --platform android
eas build --platform ios
```

## 🤝 Contributing

We welcome contributions to ElderLink! Please follow these guidelines:

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes** following our coding standards
4. **Write tests** for new functionality
5. **Update documentation** if needed
6. **Commit your changes**: `git commit -m 'Add some feature'`
7. **Push to the branch**: `git push origin feature/your-feature-name`
8. **Open a Pull Request**

### Coding Standards

#### JavaScript/TypeScript
- Use ES6+ features
- Follow Airbnb JavaScript Style Guide
- Use meaningful variable and function names
- Add JSDoc comments for functions
- Write unit tests for business logic

#### React Components
- Use functional components with hooks
- Follow component composition patterns
- Use TypeScript for type safety
- Implement proper error boundaries
- Write component tests

#### Database
- Use migrations for schema changes
- Follow naming conventions
- Add proper indexes
- Use transactions for complex operations

### Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Testing
- `chore`: Maintenance

### Pull Request Process

1. **Title**: Clear, descriptive title
2. **Description**: Detailed explanation of changes
3. **Testing**: How to test the changes
4. **Screenshots**: UI changes screenshots
5. **Breaking Changes**: List any breaking changes

### Reporting Issues

When reporting bugs, please include:
- **Steps to reproduce**
- **Expected behavior**
- **Actual behavior**
- **Environment** (OS, browser, Node version)
- **Error messages** and stack traces
- **Screenshots** if applicable

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** for the amazing frontend library
- **Express.js Community** for the robust backend framework
- **Sequelize Team** for the excellent ORM
- **PostgreSQL** for the reliable database
- **Open Source Community** for endless learning resources

## 📞 Support

For support and questions:

- **Documentation**: Check our [Wiki](https://github.com/your-username/elderlink/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-username/elderlink/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/elderlink/discussions)
- **Email**: support@elderlink.com

## 🔄 Version History

### v1.0.0 (Current)
- Complete elder care management system
- Multi-role user authentication
- Real-time health monitoring
- Zoom video consultation integration
- Mobile application
- Payment processing with Stripe
- Comprehensive API
- Docker containerization

### Future Releases
- [ ] AI-powered health insights
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Offline mobile capabilities
- [ ] Integration with wearable devices

---

**Made with ❤️ for families and healthcare providers worldwide**

*Empowering elder care through technology* 🏥👴👵
