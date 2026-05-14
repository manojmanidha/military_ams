const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use(morgan('dev'));

// Routes (we'll add these one by one)
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/dashboard',   require('./routes/dashboard'));
app.use('/api/purchases',   require('./routes/purchases'));
app.use('/api/transfers',   require('./routes/transfers'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/audit-logs',  require('./routes/auditLogs'));

// Health check
app.get('/', (req, res) => res.json({ status: 'Military AMS API running' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));