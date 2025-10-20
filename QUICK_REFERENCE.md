# 🚀 ElderLink Quick Reference Card

## 📦 One-Line Setup

```bash
git clone https://github.com/Bin4yi/ElderLink.git && cd ElderLink && npm install && cd backend && npm install && cd ../frontend && npm install && cd ..
```

## ⚡ Start Development

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm start

# Terminal 3 - Mobile (Optional)
cd ElderlinkMobile && npm start
```

## 🔑 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@elderlink.com | Admin@123 |
| Doctor | doctor@elderlink.com | Doctor@123 |
| Staff | staff@elderlink.com | Staff@123 |
| Family | family@elderlink.com | Family@123 |
| Pharmacist | pharmacist@elderlink.com | Pharmacy@123 |

## 🌐 URLs

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Database: localhost:5432

## 🛠️ Essential Commands

### Backend
```bash
npm run dev              # Start development server
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed database with initial data
npm test                 # Run tests
```

### Frontend
```bash
npm start                # Start development server
npm run build            # Build for production
npm test                 # Run tests
```

### Database
```bash
createdb elderlink                    # Create database
psql -U postgres -d elderlink        # Connect to database
npm run db:migrate                   # Run migrations
npm run db:seed                      # Seed data
```

## 🐛 Quick Fixes

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :5000
kill -9 <PID>
```

### Email Connection Error
```env
# In backend/.env
EMAIL_ENABLED=false
```

### Database Connection Failed
```env
# Use local PostgreSQL in backend/.env
DATABASE_URL=postgresql://postgres:password@localhost:5432/elderlink
```

### API 404 Errors
```javascript
// Fix service files to use shared api instance
import api from './api';
// NOT: const api = axios.create({ baseURL: API_URL });
```

### Clear All Caches
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json build
npm install

# Database
npm run db:migrate:undo:all
npm run db:migrate
npm run db:seed
```

## 📁 Important Files

| File | Purpose |
|------|---------|
| `backend/.env` | Backend environment variables |
| `frontend/.env.local` | Frontend environment variables |
| `backend/server.js` | Backend entry point |
| `frontend/src/App.js` | Frontend entry point |
| `backend/config/database.js` | Database configuration |
| `frontend/src/services/api.js` | API client configuration |

## 🔐 Environment Variables

### Backend (`.env`)
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/elderlink
JWT_SECRET=your-secret-key-here
PORT=5000
EMAIL_ENABLED=false
```

### Frontend (`.env.local`)
```env
REACT_APP_API_URL=http://localhost:5000
```

## 📚 Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/register` | User registration |
| GET | `/api/elders` | Get all elders |
| GET | `/api/appointments` | Get appointments |
| GET | `/api/prescriptions` | Get prescriptions |
| GET | `/api/coordinator/dashboard` | Coordinator overview |
| GET | `/api/drivers` | Get all drivers |
| GET | `/api/ambulance` | Get ambulances |

## 🎯 Useful Scripts

### Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Create New Migration
```bash
cd backend
npx sequelize-cli migration:generate --name add-your-feature
```

### Create New Model
```bash
npx sequelize-cli model:generate --name ModelName --attributes field1:string,field2:integer
```

### Check Database Status
```bash
psql -U postgres -l                  # List databases
psql -U postgres -d elderlink -c "\dt"  # List tables
```

## 🔍 Debugging

### Enable Debug Logs
```env
# In backend/.env
DEBUG=*
LOG_LEVEL=debug
```

### Check API Calls
```javascript
// In frontend service files
console.log('API Call:', endpoint, data);
```

### Database Queries
```env
# In backend/.env
DEBUG=sequelize:*
```

## 📞 Getting Help

- 📖 [Full Documentation](README.md)
- 🐛 [Report Bug](https://github.com/Bin4yi/ElderLink/issues)
- 💬 [Discussions](https://github.com/Bin4yi/ElderLink/discussions)
- 🔧 [Troubleshooting Guide](README.md#-troubleshooting-guide)

## 💡 Pro Tips

1. **Always check .env files** - Most issues are configuration-related
2. **Restart servers** after environment changes
3. **Use local PostgreSQL** for development
4. **Keep node_modules updated** with `npm install`
5. **Check console logs** for detailed error messages
6. **Use shared api instance** in all service files
7. **Test API with Postman** before frontend integration

---

**Last Updated**: October 20, 2025
**For detailed documentation, see [README.md](README.md)**
