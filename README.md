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

## 🏗️ Building the Project

### 🔧 Backend Build

```bash
cd backend

# 📦 Install dependencies
npm install

# 🚀 Development build (with hot reload)
npm run dev

# 🏭 Production build
npm run build

# ▶️ Start production server
npm start
```

### 🌐 Frontend Build

```bash
cd frontend

# 📦 Install dependencies
npm install

# 🚀 Development server (with hot reload)
npm start

# 🏭 Production build
npm run build

# 🧪 Serve production build locally for testing
npx serve -s build -l 3000
```

### 📱 Mobile App Build

```bash
cd ElderlinkMobile

# 📦 Install dependencies
npm install

# 🚀 Start Expo development server
npm start

# 🤖 Build for Android APK
expo build:android

# 🍎 Build for iOS IPA
expo build:ios

# ⚡ Or use EAS Build (recommended for production)
npx eas build --platform android
npx eas build --platform ios
```

### 🐳 Docker Build (Full Stack)

```bash
# From project root

# 🏗️ Build all services
docker-compose build

# 🎯 Build specific service
docker-compose build backend
docker-compose build frontend

# 🔄 Build with no cache
docker-compose build --no-cache
```

### 📂 Build Artifacts

After building, you'll find:

- **🔙 Backend**: Compiled JavaScript in `backend/dist/` (if using build script)
- **🌐 Frontend**: Production build in `frontend/build/`
- **📱 Mobile**: APK/IPA files in Expo dashboard or EAS
- **🐳 Docker**: Container images tagged with project name

### ⚙️ Build Configuration

#### Environment Variables for Production

**🔙 Backend (.env.production):**
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your-production-jwt-secret
EMAIL_USER=your-production-email@gmail.com
EMAIL_PASSWORD=your-production-app-password
```

**🌐 Frontend (.env.production):**
```env
REACT_APP_API_URL=https://your-api-domain.com
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

#### 🚀 Build Optimization

- **🔙 Backend**: Uses PM2 for process management in production
- **🌐 Frontend**: Minified bundle with code splitting
- **📱 Mobile**: Optimized bundles for app stores
- **🐳 Docker**: Multi-stage builds for smaller images

### 🔧 Troubleshooting Builds

#### Common Backend Build Issues 🔧
```bash
# 🗑️ Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# 🧹 Clear npm cache
npm cache clean --force

# 🔍 Check Node.js version
node --version
```

#### Common Frontend Build Issues 🌐
```bash
# 🗑️ Clear build cache
rm -rf build node_modules/.cache

# 🔍 Check React version compatibility
npm ls react

# 🛠️ Fix dependency conflicts
npm audit fix
```

#### Common Mobile Build Issues 📱
```bash
# 🧹 Clear Expo cache
expo r -c

# 🧹 Clear Metro bundler cache
npx react-native start --reset-cache

# 🔍 Check Expo CLI version
expo --version
```

#### Docker Build Issues 🐳
```bash
# 🔍 Check Docker version
docker --version

# 🧹 Clean Docker system
docker system prune -a

# 🔄 Rebuild without cache
docker-compose build --no-cache
```

## 🏛️ System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    ElderLink Platform                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Web App   │  │ Mobile App  │  │ Admin Panel│            │
│  │  (React)    │  │(React Native)│  │  (React)   │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │       API Gateway      │
                    │     (Express.js)       │
                    └────────────┬───────────┘
                                 │
                    ┌────────────▼────────────┐
                    │    Business Logic      │
                    │   (Services Layer)     │
                    └────────────┬───────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          │                      │                      │
┌─────────▼────────┐   ┌─────────▼────────┐   ┌─────────▼────────┐
│   PostgreSQL     │   │     Redis        │   │   File Storage   │
│  (Primary DB)    │   │  (Cache/Sessions)│   │   (AWS S3)       │
└──────────────────┘   └──────────────────┘   └──────────────────┘
```

### Component Breakdown

#### Frontend Layer
- **Web Application**: React-based SPA for family members, doctors, staff, and pharmacists
- **Mobile Application**: React Native app for elders and on-the-go access
- **Admin Dashboard**: Comprehensive management interface for system administrators

#### Backend Layer
- **API Server**: RESTful API built with Express.js and Node.js
- **Authentication**: JWT-based authentication with role-based access control
- **Real-time Communication**: Socket.IO for instant notifications and updates
- **External Integrations**: Zoom API, Stripe payments, email services

#### Data Layer
- **Primary Database**: PostgreSQL with Sequelize ORM
- **Caching**: Redis for session management and performance optimization
- **File Storage**: AWS S3 or local storage for documents and images

#### Infrastructure
- **Containerization**: Docker for consistent deployment
- **Orchestration**: Docker Compose for multi-service management
- **Process Management**: PM2 for production server management

### Data Flow

1. **User Authentication**: JWT tokens issued and validated
2. **API Requests**: RESTful endpoints with proper authorization
3. **Business Logic**: Services handle complex operations
4. **Database Operations**: CRUD operations with data validation
5. **Real-time Updates**: WebSocket connections for live data
6. **External APIs**: Integration with Zoom, Stripe, and notification services

## 🔒 Security Considerations

### Authentication & Authorization

#### JWT Implementation
- **Token Expiration**: 7-day expiration for access tokens
- **Refresh Tokens**: Secure token rotation mechanism
- **Password Security**: bcrypt hashing with salt rounds
- **Role-Based Access**: Admin, Doctor, Staff, Family, Elder, Pharmacist roles

#### Security Headers
```javascript
// Backend security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

### Data Protection

#### Encryption
- **Database**: Sensitive data encrypted at rest
- **Transmission**: HTTPS/TLS 1.3 for all communications
- **API Keys**: Environment variables, never in code
- **File Storage**: Encrypted uploads to cloud storage

#### Privacy Compliance
- **GDPR**: Data minimization and user consent
- **HIPAA**: Healthcare data protection standards
- **Data Retention**: Configurable data lifecycle management
- **Audit Logging**: Comprehensive activity tracking

### Security Best Practices

#### Input Validation
- **Sanitization**: All user inputs sanitized
- **Validation**: Joi/Yup schemas for data validation
- **SQL Injection**: Parameterized queries only
- **XSS Protection**: Content Security Policy headers

#### Rate Limiting
```javascript
// API rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
```

#### Monitoring & Logging
- **Security Events**: Failed login attempts logged
- **Intrusion Detection**: Suspicious activity monitoring
- **Regular Audits**: Security assessments and penetration testing
- **Incident Response**: Defined procedures for security breaches

## ⚡ Performance & Scalability

### Performance Optimization

#### Backend Optimization
- **Database Indexing**: Optimized queries with proper indexes
- **Caching Strategy**: Redis caching for frequently accessed data
- **Compression**: Gzip compression for API responses
- **Connection Pooling**: Database connection pooling

#### Frontend Optimization
- **Code Splitting**: Dynamic imports for route-based splitting
- **Image Optimization**: WebP format with lazy loading
- **Bundle Analysis**: Webpack bundle analyzer for size optimization
- **CDN Integration**: Static assets served via CDN

### Scalability Features

#### Horizontal Scaling
- **Load Balancing**: Nginx reverse proxy for distribution
- **Microservices Ready**: Modular architecture for service separation
- **Database Sharding**: Support for database partitioning
- **Caching Layers**: Multi-level caching strategy

#### Monitoring & Metrics
```javascript
// Performance monitoring
const responseTime = require('response-time');
app.use(responseTime((req, res, time) => {
  console.log(`${req.method} ${req.url} took ${time}ms`);
}));
```

### Resource Management

#### Memory Management
- **Garbage Collection**: Node.js optimization
- **Memory Leaks**: Regular monitoring and fixes
- **Connection Limits**: Database connection pooling
- **File Upload Limits**: Configurable size restrictions

#### Database Optimization
- **Query Optimization**: EXPLAIN ANALYZE for slow queries
- **Connection Pooling**: Efficient database connections
- **Read Replicas**: Separate read/write databases
- **Backup Strategy**: Automated daily backups

## ❓ FAQ

### General Questions

**Q: What is ElderLink?**
A: ElderLink is a comprehensive elder care management platform that connects immigrant families with healthcare providers through technology, enabling remote monitoring and care coordination.

**Q: Who can use ElderLink?**
A: ElderLink supports multiple user roles: Administrators, Family Members, Doctors, Staff, Elders, and Pharmacists, each with role-specific features and permissions.

**Q: Is ElderLink HIPAA compliant?**
A: Yes, ElderLink implements HIPAA-compliant security measures including data encryption, access controls, and audit logging.

### Technical Questions

**Q: What technologies does ElderLink use?**
A: ElderLink uses Node.js/Express for backend, React for web frontend, React Native for mobile, PostgreSQL for database, and integrates with Zoom, Stripe, and other services.

**Q: Can ElderLink be deployed on-premises?**
A: Yes, ElderLink can be deployed on-premises or in the cloud. Docker containers make deployment flexible across different environments.

**Q: How does real-time communication work?**
A: ElderLink uses Socket.IO for real-time notifications, enabling instant alerts for health monitoring, emergency responses, and system updates.

### Usage Questions

**Q: How do family members monitor their elders?**
A: Family members can access real-time health dashboards, receive notifications about vital signs, schedule appointments, and communicate with healthcare providers.

**Q: What emergency features are available?**
A: The system includes 24/7 emergency alerts, GPS location sharing, automated staff notifications, and rapid response coordination.

**Q: How does prescription management work?**
A: Doctors create digital prescriptions, which are routed to pharmacies, prepared, and delivered monthly to elders' locations with tracking and confirmation.

### Support Questions

**Q: What if I forget my password?**
A: Use the "Forgot Password" link on the login page. A reset link will be sent to your registered email address.

**Q: How do I report a bug or request a feature?**
A: Use GitHub Issues for bug reports and feature requests, or contact our support team at support@elderlink.com.

**Q: Is training available for new users?**
A: Yes, we provide comprehensive documentation, video tutorials, and onboarding support for all user roles.

## 🔧 Troubleshooting Guide

### Common Issues & Solutions

#### Backend Issues

**Issue: Database Connection Failed**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solutions:**
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start PostgreSQL service
sudo systemctl start postgresql

# Verify connection
psql -U elderlink -d elderlink -h localhost

# Check environment variables
cat backend/.env | grep DATABASE_URL
```

**Issue: JWT Token Invalid**
```
Error: JsonWebTokenError: invalid signature
```
**Solutions:**
```bash
# Check JWT secret in environment
echo $JWT_SECRET

# Regenerate JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Update .env file and restart server
```

#### Frontend Issues

**Issue: Build Fails with Module Not Found**
```
Module not found: Can't resolve 'axios'
```
**Solutions:**
```bash
# Clear node_modules and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install

# Check package.json for missing dependencies
npm ls axios

# Install missing package
npm install axios
```

**Issue: CORS Errors in Development**
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solutions:**
```javascript
// Add to backend server.js
const cors = require('cors');
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://yourdomain.com'
    : 'http://localhost:3000',
  credentials: true
}));
```

#### Mobile Issues

**Issue: Metro Bundler Not Starting**
```
error: bundler: Error: EMFILE: too many open files
```
**Solutions:**
```bash
# Increase file watcher limit
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Clear Metro cache
cd ElderlinkMobile
npx react-native start --reset-cache
```

**Issue: Android Build Fails**
```
> Task :app:mergeDebugResources FAILED
```
**Solutions:**
```bash
# Clean Gradle cache
cd ElderlinkMobile/android
./gradlew clean

# Clear Android cache
rm -rf ~/.gradle/caches/

# Rebuild
cd ..
npx react-native run-android
```

#### Database Issues

**Issue: Migration Fails**
```
ERROR: relation "users" already exists
```
**Solutions:**
```bash
# Check migration status
cd backend
npx sequelize-cli db:migrate:status

# Undo last migration
npx sequelize-cli db:migrate:undo

# Reset all migrations
npx sequelize-cli db:migrate:undo:all

# Fresh start
npx sequelize-cli db:drop
npx sequelize-cli db:create
npx sequelize-cli db:migrate
```

**Issue: Seeder Data Not Loading**
```
No seeders found
```
**Solutions:**
```bash
# Check seeder files
ls backend/seeders/

# Run specific seeder
npx sequelize-cli db:seed --seed 20240101120000-demo-users.js

# Run all seeders
npx sequelize-cli db:seed:all
```

#### Docker Issues

**Issue: Container Won't Start**
```
ERROR: Couldn't connect to Docker daemon
```
**Solutions:**
```bash
# Start Docker service
sudo systemctl start docker

# Add user to docker group
sudo usermod -aG docker $USER

# Restart Docker
sudo systemctl restart docker
```

**Issue: Port Already in Use**
```
ERROR: Port 5000 is already allocated
```
**Solutions:**
```bash
# Find process using port
lsof -i :5000

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml
ports:
  - "5001:5000"
```

### Performance Issues

**Issue: Slow API Response Times**
**Solutions:**
```bash
# Check database indexes
psql -d elderlink -c "SELECT * FROM pg_indexes WHERE tablename = 'users';"

# Enable query logging
# Add to .env: DEBUG=sequelize:*

# Check Redis connection
redis-cli ping
```

**Issue: Memory Usage High**
**Solutions:**
```bash
# Monitor memory usage
pm2 monit

# Check for memory leaks
node --inspect --expose-gc server.js

# Restart PM2 process
pm2 restart all
```

### Getting Help

If you encounter issues not covered here:

1. **Check Logs**: Review application and server logs
2. **GitHub Issues**: Search existing issues or create new ones
3. **Documentation**: Refer to our detailed API documentation
4. **Community**: Join our Discord server for community support
5. **Professional Support**: Contact support@elderlink.com for enterprise support

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
