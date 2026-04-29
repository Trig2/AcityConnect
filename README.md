# ACity Connect Backend

Node.js + PostgreSQL backend for the ACity Connect Smart Campus Marketplace.

## Project Structure

```
src/
├── server.js              # Main server entry point
├── db/
│   ├── connection.js      # PostgreSQL connection pool
│   └── init.js           # Database schema initialization
├── routes/               # API route handlers
│   ├── userRoutes.js
│   ├── itemRoutes.js
│   ├── skillRoutes.js
│   └── interactionRoutes.js
├── controllers/          # Business logic
│   ├── userController.js
│   ├── itemController.js
│   ├── skillController.js
│   └── interactionController.js
└── middleware/
    └── auth.js          # JWT authentication middleware
```

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Database
- Install PostgreSQL locally or use a hosted service
- Copy `.env.example` to `.env` and update with your database credentials:
  ```
  DB_HOST=localhost
  DB_PORT=5432
  DB_NAME=acity_connect
  DB_USER=postgres
  DB_PASSWORD=your_password
  JWT_SECRET=your_secret_key
  ```

### 3. Initialize Database
```bash
npm run db:init
```

### 4. Run Development Server
```bash
npm run dev
```

Server will start at `http://localhost:5000`

## API Endpoints

### Users
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile/:id` - Get user profile
- `PUT /api/users/profile/:id` - Update profile
- `GET /api/users/:id/skills` - Get user skills
- `POST /api/users/:id/skills` - Add skill
- `DELETE /api/users/skills/:skillId` - Delete skill

### Items
- `GET /api/items` - Get all items (with filters: category, status, search)
- `POST /api/items` - Create new item
- `GET /api/items/:id` - Get item details
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item
- `GET /api/items/user/:userId` - Get user's items

### Skills Exchange
- `GET /api/skills` - Get all skill exchanges
- `POST /api/skills` - Create skill exchange
- `GET /api/skills/:id` - Get skill exchange details
- `PUT /api/skills/:id` - Update skill exchange
- `DELETE /api/skills/:id` - Delete skill exchange

### Interactions
- `POST /api/interactions/interest` - Express interest in item
- `GET /api/interactions/item/:itemId` - Get interests on item
- `GET /api/interactions/user/:userId` - Get user's interactions
- `POST /api/interactions/message` - Send message
- `GET /api/interactions/messages/:userId` - Get user's messages
- `POST /api/interactions/report` - Report content

## Authentication

Protected routes require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

## Database Schema

The following tables are created:
- **users** - User accounts
- **skills** - User skills
- **items** - Marketplace items
- **skill_exchanges** - Skill offers/requests
- **interactions** - Item interests
- **messages** - User messages
- **notifications** - User notifications
- **reports** - Content reports

## Next Steps

- Set up frontend (React + Vite)
- Configure environment for deployment (Render)
- Add more advanced features (admin panel, analytics)
- Implement real-time notifications (Socket.io)
