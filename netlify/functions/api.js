const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Helper functions
function generateReferralCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

async function hasUserCompletedTask(userId, taskId) {
  // In a real implementation, this would check the database
  return false;
}

function maskEmail(email) {
  const [name, domain] = email.split('@');
  const maskedName = name.slice(0, 2) + '*'.repeat(name.length - 2);
  return `${maskedName}@${domain}`;
}

// Mock data
const users = [
  {
    id: 1,
    email: 'user@example.com',
    name: 'Demo User',
    role: 'user',
    walletBalance: 5000,
    withdrawableBalance: 2500,
    referralCode: 'QR123456',
    isEmailVerified: true,
    isBanned: false
  }
];

const tasks = [
  {
    id: 1,
    name: 'Complete Marketing Survey',
    description: 'Fill out a brief survey about your shopping habits.',
    ownerId: 2,
    ownerEmail: 'business@example.com',
    pricePerUser: 500,
    totalSlots: 100,
    filledSlots: 45,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    name: 'App Testing Feedback',
    description: 'Test our new app and provide detailed feedback.',
    ownerId: 3,
    ownerEmail: 'developer@example.com',
    pricePerUser: 1200,
    totalSlots: 50,
    filledSlots: 23,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Social Media Content Review',
    description: 'Review content for our social media campaign.',
    ownerId: 4,
    ownerEmail: 'marketing@example.com',
    pricePerUser: 800,
    totalSlots: 30,
    filledSlots: 8,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  // In a real implementation, you would validate credentials against the database
  const user = users.find(u => u.email === email);
  
  if (user) {
    res.json(user);
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.post('/api/auth/signup', (req, res) => {
  const { email, name, password } = req.body;
  
  // Check if user already exists
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'User already exists' });
  }
  
  // In a real implementation, you would hash the password and store in the database
  const newUser = {
    id: users.length + 1,
    email,
    name,
    role: 'user',
    walletBalance: 0,
    withdrawableBalance: 0,
    referralCode: generateReferralCode(),
    isEmailVerified: false,
    isBanned: false
  };
  
  users.push(newUser);
  res.status(201).json(newUser);
});

app.get('/api/tasks', (req, res) => {
  // Return only active tasks
  const activeTasks = tasks.filter(task => task.isActive);
  res.json(activeTasks);
});

app.get('/api/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const task = tasks.find(t => t.id === taskId);
  
  if (task) {
    res.json(task);
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});

// Export the serverless function
export const handler = serverless(app);