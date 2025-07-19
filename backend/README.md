# Typing Test Backend API

A comprehensive Express.js backend for the Typing Test application with MongoDB integration, user authentication, and real-time statistics.

## Features

- 🔐 **User Authentication**: JWT-based authentication with registration and login
- 📊 **Statistics & Analytics**: Detailed user statistics and global analytics
- 🏆 **Leaderboards**: Rankings and hall of fame
- 📝 **Test Management**: Submit and retrieve typing test results
- 🎯 **Achievements**: Automatic achievement system
- 🚀 **Performance**: Optimized MongoDB queries with proper indexing
- 🔒 **Security**: Rate limiting, CORS, helmet protection

## API Endpoints

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile (auth required)
- `PUT /api/users/profile` - Update user profile (auth required)
- `GET /api/users/stats` - Get user statistics (auth required)
- `PUT /api/users/change-password` - Change password (auth required)
- `DELETE /api/users/account` - Delete account (auth required)
- `GET /api/users/verify-token` - Verify JWT token (auth required)

### Typing Tests
- `GET /api/tests/text` - Get random text for typing test
- `POST /api/tests/submit` - Submit typing test result
- `GET /api/tests/history` - Get user's test history (auth required)
- `GET /api/tests/:testId` - Get specific test details
- `DELETE /api/tests/:testId` - Delete a test (auth required)
- `GET /api/tests/meta/options` - Get test categories and options

### Statistics
- `GET /api/stats/user` - Get detailed user statistics (auth required)
- `GET /api/stats/global` - Get global statistics
- `GET /api/stats/compare` - Compare user stats with global averages (auth required)

### Leaderboards
- `GET /api/leaderboard` - Get leaderboard (various filters available)
- `GET /api/leaderboard/rank/:userId?` - Get user's ranking
- `GET /api/leaderboard/hall-of-fame` - Get all-time records

### Admin (Development)
- `POST /api/admin/seed` - Seed database with sample data
- `POST /api/admin/reset` - Reset database (WARNING: Deletes all data)
- `GET /api/admin/stats` - Get database statistics

### Health Check
- `GET /api/health` - API health check

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file with:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/typing-test-db
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d
   FRONTEND_URL=http://localhost:5173
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

3. **Start MongoDB:**
   Make sure MongoDB is running on your system.

4. **Start the server:**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## Database Schema

### User Model
- Personal information and preferences
- Statistics (WPM, accuracy, total tests, etc.)
- Achievements system
- Theme preferences

### TypingTest Model
- Test configuration and content
- Detailed results and keystroke data
- WPM and accuracy history
- Performance analytics

### TextContent Model
- Practice texts with categorization
- Difficulty levels and language support
- Usage statistics and ratings

## Query Parameters

### Leaderboard Filters
- `timeframe`: all, daily, weekly, monthly, yearly
- `metric`: wpm, accuracy, consistency, tests
- `limit`: number of results (default: 50)
- `category`: filter by test category

### Statistics Filters
- `timeframe`: all, today, week, month, year
- `groupBy`: hour, day, week, month

## Response Format

All API responses follow this format:
```json
{
  "message": "Operation successful",
  "data": { ... },
  "error": "Error message (if any)"
}
```

## Error Handling

The API includes comprehensive error handling for:
- Validation errors
- Authentication failures
- Database errors
- Rate limiting
- Not found resources

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Prevents API abuse
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: Mongoose schema validation

## Performance Optimizations

- **Database Indexes**: Optimized for common queries
- **Aggregation Pipelines**: Efficient data processing
- **Pagination**: Large dataset handling
- **Query Optimization**: Minimal data transfer

## Development

### Seed Database
```bash
POST /api/admin/seed
```

### Reset Database (Development Only)
```bash
POST /api/admin/reset
Content-Type: application/json

{
  "confirm": "DELETE_ALL_DATA"
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment mode | development |
| PORT | Server port | 5000 |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/typing-test-db |
| JWT_SECRET | JWT signing secret | (required) |
| JWT_EXPIRE | Token expiration time | 7d |
| FRONTEND_URL | Frontend URL for CORS | http://localhost:5173 |
| RATE_LIMIT_WINDOW_MS | Rate limit window | 900000 (15 min) |
| RATE_LIMIT_MAX_REQUESTS | Max requests per window | 100 |

## Contributing

1. Follow the existing code style
2. Add proper error handling
3. Include input validation
4. Update documentation
5. Test your changes

## License

MIT License
