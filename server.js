// require('dotenv').config({ path: './config/config.env' });
// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const cookieParser = require('cookie-parser');
// const errorHandler = require('./middleware/error');

// // Import routes
// const auth = require('./routes/auth');
// const bookings = require('./routes/bookingRoutes');

// // Initialize app
// const app = express();

// // Database connection
// const connectDB = require('./config/db');
// connectDB();

// // Middleware
// app.use(express.json());
// app.use(cookieParser());
// app.use(cors({
//   origin: process.env.CLIENT_URL || 'http://bookingbheema.netlify.app/',
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE']
// }));

// app.use('/api/v1/auth', auth); // Verify this line exists

// // Mount routers
// // app.use('/api/v1/auth', auth);
// app.use('/api/v1/bookings', bookings);

// // Error handling middleware
// app.use(errorHandler);

// const PORT = process.env.PORT || 5000;
// const server = app.listen(PORT, () => {
//   console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
// });

// // Handle unhandled promise rejections
// process.on('unhandledRejection', (err, promise) => {
//   console.error(`Error: ${err.message}`);
//   server.close(() => process.exit(1));
// });



require('dotenv').config({ path: './config/config.env' });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/error');

// Import routes
const auth = require('./routes/auth');
const bookings = require('./routes/bookingRoutes');

// Initialize app
const app = express();

// Database connection with enhanced error handling
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
    // Exit process with failure
    process.exit(1);
  }
};
connectDB();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Enhanced CORS configuration
const corsOptions = {
  origin: process.env.CLIENT_URL?.replace(/\/$/, '') || 'https://bookingbheema.netlify.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Mount routers
app.use('/api/v1/auth', auth);
app.use('/api/v1/bookings', bookings);

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Enhanced error handling
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection at: ${promise}, reason: ${err.message}`);
  console.error(err.stack);
  server.close(() => process.exit(1));
});

// Handle SIGTERM for graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});