const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { MongoClient, ObjectId } = require('mongodb');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

dotenv.config();

const app = express();

// Add this more permissive CORS setup
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://finance-coach.vercel.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).json({
      body: "OK"
    });
  }
  
  next();
});

app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

let db;

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});

async function connectToDb() {
  try {
    const client = new MongoClient(MONGODB_URI, {
      retryWrites: true,
      w: "majority",
      tls: true,
      serverSelectionTimeoutMS: 5000,
      useNewUrlParser: true
    });
  await client.connect();
  db = client.db('finance-coach');
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Helper function to categorize expenses
function categorizeExpense(description) {
  const categories = {
    food: ['restaurant', 'grocery', 'food', 'meal', 'dinner', 'lunch', 'breakfast'],
    transport: ['gas', 'fuel', 'uber', 'taxi', 'bus', 'train', 'transport'],
    utilities: ['electricity', 'water', 'internet', 'phone', 'utility'],
    entertainment: ['movie', 'game', 'netflix', 'spotify', 'entertainment'],
    shopping: ['clothes', 'shoes', 'amazon', 'shopping'],
    health: ['doctor', 'medicine', 'medical', 'health', 'fitness'],
  };

  const desc = description.toLowerCase();
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => desc.includes(keyword))) {
      return category;
    }
  }
  return 'other';
}

// Enhanced expense analysis
function analyzeExpenses(expenses) {
  const categorized = expenses.reduce((acc, exp) => {
    const category = categorizeExpense(exp.description);
    if (!acc[category]) acc[category] = [];
    acc[category].push(exp);
    return acc;
  }, {});

  // Add spending patterns analysis
  const patterns = analyzeSpendingPatterns(expenses);
  const habits = analyzeHabits(expenses);
  const predictions = predictFutureExpenses(expenses);
  const savings = calculatePotentialSavings(expenses);
  
  return {
    patterns,
    habits,
    predictions,
    savings,
    recommendations: generateSmartRecommendations(expenses, patterns, habits)
  };
}

function analyzeSpendingPatterns(expenses) {
  const patterns = {
    weekday: { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 },
    timeOfDay: { morning: 0, afternoon: 0, evening: 0, night: 0 },
    frequency: {},
    highSpendDays: []
  };

  expenses.forEach(expense => {
    const date = new Date(expense.date);
    const day = date.toLocaleString('en-US', { weekday: 'short' });
    const hour = date.getHours();
    const amount = Number(expense.amount);

    // Track weekday spending
    patterns.weekday[day] += amount;

    // Track time of day spending
    if (hour >= 5 && hour < 12) patterns.timeOfDay.morning += amount;
    else if (hour >= 12 && hour < 17) patterns.timeOfDay.afternoon += amount;
    else if (hour >= 17 && hour < 22) patterns.timeOfDay.evening += amount;
    else patterns.timeOfDay.night += amount;

    // Track frequent expenses
    const key = `${expense.description.toLowerCase()}-${amount}`;
    patterns.frequency[key] = (patterns.frequency[key] || 0) + 1;

    // Track high-spend days
    if (amount > 100) {
      patterns.highSpendDays.push({
        date: expense.date,
        amount,
        description: expense.description
      });
    }
  });

  return patterns;
}

function analyzeHabits(expenses) {
  const habits = {
    impulseBuying: [],
    regularExpenses: [],
    potentialSavings: [],
    spendingTriggers: []
  };

  // Detect impulse buying (multiple purchases in short time)
  expenses.sort((a, b) => new Date(a.date) - new Date(b.date));
  for (let i = 0; i < expenses.length - 1; i++) {
    const timeDiff = new Date(expenses[i + 1].date) - new Date(expenses[i].date);
    if (timeDiff < 1000 * 60 * 60 * 2) { // 2 hours
      habits.impulseBuying.push({
        date: expenses[i].date,
        items: [expenses[i], expenses[i + 1]]
      });
    }
  }

  // Identify regular expenses
  const frequencyMap = {};
  expenses.forEach(expense => {
    const key = expense.description.toLowerCase();
    if (!frequencyMap[key]) frequencyMap[key] = [];
    frequencyMap[key].push(expense);
  });

  Object.entries(frequencyMap).forEach(([desc, exps]) => {
    if (exps.length >= 3) {
      habits.regularExpenses.push({
        description: desc,
        frequency: exps.length,
        averageAmount: exps.reduce((sum, exp) => sum + Number(exp.amount), 0) / exps.length
      });
    }
  });

  return habits;
}

function predictFutureExpenses(expenses) {
  const monthlyTotals = {};
  const categories = {};
  
  expenses.forEach(expense => {
    const month = new Date(expense.date).toLocaleString('default', { month: 'long' });
    const category = categorizeExpense(expense.description);
    
    // Track monthly totals
    monthlyTotals[month] = (monthlyTotals[month] || 0) + Number(expense.amount);
    
    // Track category trends
    if (!categories[category]) {
      categories[category] = {
        total: 0,
        count: 0,
        amounts: []
      };
    }
    categories[category].total += Number(expense.amount);
    categories[category].count++;
    categories[category].amounts.push(Number(expense.amount));
  });

  // Calculate predictions
  const predictions = {
    nextMonth: {},
    trends: {},
    alerts: []
  };

  Object.entries(categories).forEach(([category, data]) => {
    const avg = data.total / data.count;
    const trend = calculateTrend(data.amounts);
    
    predictions.nextMonth[category] = avg + trend;
    predictions.trends[category] = trend > 0 ? 'increasing' : 'decreasing';
    
    if (trend > avg * 0.1) { // 10% increase
      predictions.alerts.push(`Warning: ${category} expenses are trending up significantly`);
    }
  });

  return predictions;
}

function calculatePotentialSavings(expenses) {
  const savings = {
    opportunities: [],
    totalPotential: 0,
    subscriptions: [],
    duplicates: []
  };

  // Find potential subscription services
  const frequentSmallExpenses = expenses.filter(exp => 
    Number(exp.amount) < 50 && 
    /subscription|monthly|netflix|spotify|amazon/i.test(exp.description)
  );

  if (frequentSmallExpenses.length > 0) {
    savings.subscriptions = frequentSmallExpenses;
    savings.opportunities.push({
      type: 'subscription',
      description: 'Review your subscription services',
      potentialSavings: frequentSmallExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0)
    });
  }

  // Find duplicate expenses (similar amounts in short time periods)
  expenses.forEach((exp1, i) => {
    expenses.slice(i + 1).forEach(exp2 => {
      if (
        Math.abs(Number(exp1.amount) - Number(exp2.amount)) < 1 &&
        Math.abs(new Date(exp1.date) - new Date(exp2.date)) < 1000 * 60 * 60 * 24 * 3 // 3 days
      ) {
        savings.duplicates.push({ exp1, exp2 });
      }
    });
  });

  return savings;
}

function generateSmartRecommendations(expenses, patterns, habits) {
  const recommendations = [];

  // Analyze spending patterns
  const highestSpendingDay = Object.entries(patterns.weekday)
    .sort(([,a], [,b]) => b - a)[0];
  
  recommendations.push({
    type: 'pattern',
    title: 'Spending Pattern Alert',
    text: `You tend to spend more on ${highestSpendingDay[0]}s. Consider planning your expenses better on these days.`,
    priority: 'high',
    action: 'Plan ahead for your high-spending days'
  });

  // Analyze time-based patterns
  const { timeOfDay } = patterns;
  const highestTimeOfDay = Object.entries(timeOfDay)
    .sort(([,a], [,b]) => b - a)[0];

  recommendations.push({
    type: 'timing',
    title: 'Time-based Spending Pattern',
    text: `You spend most during ${highestTimeOfDay[0]} hours. This might be due to ${
      highestTimeOfDay[0] === 'evening' ? 'impulse buying after work' :
      highestTimeOfDay[0] === 'night' ? 'late-night shopping' :
      'unplanned purchases'
    }.`,
    priority: 'medium',
    action: 'Set spending limits for different times of day'
  });

  // Analyze regular expenses
  habits.regularExpenses.forEach(regular => {
    recommendations.push({
      type: 'regular',
      title: 'Regular Expense Optimization',
      text: `You spend an average of $${regular.averageAmount.toFixed(2)} on ${regular.description} ${regular.frequency} times. Consider finding a better deal or bulk purchase options.`,
      priority: regular.averageAmount > 100 ? 'high' : 'medium',
      action: 'Research alternatives or bulk deals'
    });
  });

  // Add personalized challenges
  recommendations.push({
    type: 'challenge',
    title: 'Monthly Saving Challenge',
    text: `Based on your spending patterns, you could save ${calculateSavingsChallenge(expenses)} by taking our 30-day saving challenge!`,
    priority: 'medium',
    action: 'Start 30-day saving challenge'
  });

  return recommendations;
}

function calculateSavingsChallenge(expenses) {
  const avgDaily = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0) / 30;
  const challengeTarget = avgDaily * 0.8; // 20% reduction target
  return `$${(avgDaily - challengeTarget).toFixed(2)} per day`;
}

// Add these functions for manual recommendations

function generateFinancialAdvice(expenses, patterns, habits) {
  const recommendations = [];
  const insights = [];
  const investmentIdeas = [];
  const challenges = [];

  // 1. Enhanced Assets vs Liabilities Analysis
  const totalMonthlyExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const monthlyIncome = 5000;
  const expenseRatio = (totalMonthlyExpenses / monthlyIncome) * 100;

  // Cash Flow Quadrant Analysis
  insights.push({
    title: "Cash Flow Quadrant Position",
    description: `You're currently in the ${expenseRatio > 80 ? 'E (Employee)' : expenseRatio > 60 ? 'S (Self-employed)' : 'B/I (Business/Investor)'} quadrant`,
    action: expenseRatio > 60 ? "Move towards B/I quadrant by acquiring assets" : "Continue building your asset column"
  });

  // 2. Enhanced Expense Categories
  const expenseCategories = {
    goodDebt: ['investment', 'business', 'education', 'rental'],
    badDebt: ['car loan', 'credit card', 'consumer debt'],
    necessities: ['rent', 'utilities', 'groceries'],
    luxuries: ['entertainment', 'dining', 'shopping']
  };

  // 3. Expanded Investment Opportunities
  const investmentCategories = {
    realEstate: {
      threshold: 2000,
      ideas: [
        {
          type: "Real Estate Investment",
          description: "Consider house hacking - buy a duplex, live in one unit, rent the other",
          potentialReturn: "20-30",
          riskLevel: "medium"
        },
        {
          type: "REIT Investment",
          description: "Start with REITs to learn real estate market",
          potentialReturn: "8-12",
          riskLevel: "low"
        }
      ]
    },
    business: {
      threshold: 1000,
      ideas: [
        {
          type: "Online Business",
          description: "Start a dropshipping or print-on-demand business",
          potentialReturn: "25-40",
          riskLevel: "medium"
        },
        {
          type: "Service Business",
          description: "Leverage your skills into a consulting business",
          potentialReturn: "30-50",
          riskLevel: "low"
        }
      ]
    },
    paperAssets: {
      threshold: 500,
      ideas: [
        {
          type: "Dividend Stocks",
          description: "Build a dividend portfolio for passive income",
          potentialReturn: "4-8",
          riskLevel: "medium"
        },
        {
          type: "Index Funds",
          description: "Start with low-cost index funds",
          potentialReturn: "7-10",
          riskLevel: "low"
        }
      ]
    }
  };

  // 4. Enhanced Financial Challenges
  const richDadChallenges = [
    {
      name: "Asset Acquisition Sprint",
      duration: "90 days",
      target: "Acquire your first income-generating asset",
      steps: [
        "Identify potential assets under $1000",
        "Research and analyze 3 investment options",
        "Make your first investment"
      ],
      reward: "First step to financial freedom"
    },
    {
      name: "Liability Elimination",
      duration: "60 days",
      target: "Convert one liability into an asset",
      steps: [
        "List all current liabilities",
        "Identify one that could become an asset",
        "Create conversion plan"
      ],
      reward: "Improved cash flow"
    },
    {
      name: "Financial IQ Boost",
      duration: "30 days",
      target: "Learn key financial concepts",
      steps: [
        "Read Rich Dad Poor Dad",
        "Learn basic accounting",
        "Study investment basics"
      ],
      reward: "Enhanced financial knowledge"
    }
  ];

  // 5. Passive Income Strategies
  const passiveIncomeIdeas = [
    {
      type: "Digital Products",
      description: "Create and sell online courses or ebooks",
      initialInvestment: "Time + $100-500",
      potentialReturn: "Unlimited"
    },
    {
      type: "Rental Income",
      description: "Rent out a spare room or parking space",
      initialInvestment: "Existing Asset",
      potentialReturn: "$200-1000/month"
    },
    {
      type: "Dividend Portfolio",
      description: "Build a portfolio of dividend-paying stocks",
      initialInvestment: "$1000+",
      potentialReturn: "4-8% annually"
    }
  ];

  // 6. Rich Dad Principles Implementation
  if (expenseRatio > 60) {
    recommendations.push({
      title: "Mind Your Business",
      description: "Start a side business in your expertise area",
      priority: "high",
      steps: [
        "Identify your marketable skills",
        "Create a basic business plan",
        "Start with one client"
      ]
    });
  }

  // Add all components to the response
  return {
    keyInsights: insights,
    recommendations,
    investmentIdeas: investmentCategories,
    challenges: richDadChallenges,
    passiveIncome: passiveIncomeIdeas,
    cashFlowAnalysis: {
      expenseRatio,
      monthlyFlow: calculateMonthlyFlow(expenses),
      suggestions: generateCashFlowSuggestions(expenseRatio)
    }
  };
}

function generateCashFlowSuggestions(expenseRatio) {
  const suggestions = [];
  if (expenseRatio > 80) {
    suggestions.push({
      title: "Emergency Cash Flow Fix",
      steps: [
        "Immediate 25% expense reduction",
        "Sell unnecessary assets",
        "Find additional income source"
      ]
    });
  } else if (expenseRatio > 60) {
    suggestions.push({
      title: "Cash Flow Optimization",
      steps: [
        "Reduce expenses by 15%",
        "Start a side hustle",
        "Learn about passive income"
      ]
    });
  }
  return suggestions;
}

// Add these category definitions
const ASSET_CATEGORIES = {
  realEstate: {
    name: 'Real Estate',
    examples: ['Primary Home', 'Rental Property', 'Land', 'Commercial Property'],
    type: 'physical'
  },
  business: {
    name: 'Business',
    examples: ['Online Store', 'Consulting Practice', 'Franchise', 'Startup'],
    type: 'active'
  },
  investments: {
    name: 'Paper Assets',
    examples: ['Stocks', 'Bonds', 'Mutual Funds', 'ETFs', 'Cryptocurrencies'],
    type: 'paper'
  },
  cashFlow: {
    name: 'Cash Flow Assets',
    examples: ['Rental Income', 'Dividend Stocks', 'Royalties', 'Online Courses'],
    type: 'passive'
  },
  intellectual: {
    name: 'Intellectual Property',
    examples: ['Patents', 'Trademarks', 'Copyrights', 'Brand Names'],
    type: 'intellectual'
  }
};

const LIABILITY_CATEGORIES = {
  shortTerm: {
    name: 'Short-term Debt',
    examples: ['Credit Card Debt', 'Personal Loans', 'Medical Bills'],
    priority: 'high'
  },
  longTerm: {
    name: 'Long-term Debt',
    examples: ['Mortgage', 'Student Loans', 'Business Loans'],
    priority: 'medium'
  },
  consumer: {
    name: 'Consumer Debt',
    examples: ['Car Loans', 'Appliance Financing', 'Electronics Payment Plans'],
    priority: 'high'
  },
  recurring: {
    name: 'Recurring Liabilities',
    examples: ['Subscriptions', 'Memberships', 'Insurance Premiums'],
    priority: 'medium'
  }
};

// Add user model
const userSchema = {
  email: String,
  password: String, // hashed
  isActive: Boolean,
  createdAt: Date
};

// Add user limit middleware
const checkUserLimit = async (req, res, next) => {
  const userCount = await db.collection('users').countDocuments();
  if (userCount >= 10) {
    return res.status(403).json({ 
      error: 'User limit reached. Currently in beta with limited users.' 
    });
  }
  next();
};

// Add authentication middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error('No token provided');
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    
    if (!user) throw new Error('User not found');
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate' });
  }
};

// Add login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.collection('users').findOne({ email });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user._id }, JWT_SECRET);
    res.json({ token, email: user.email });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update registration endpoint
app.post('/api/register', checkUserLimit, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const result = await db.collection('users').insertOne({
      email,
      password: hashedPassword,
      isActive: true,
      createdAt: new Date()
    });
    
    const token = jwt.sign({ userId: result.insertedId }, JWT_SECRET);
    res.status(201).json({ token, email });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Routes
app.post('/api/expenses', async (req, res) => {
  try {
    const expense = {
      ...req.body,
      category: categorizeExpense(req.body.description),
      createdAt: new Date()
    };
    await db.collection('expenses').insertOne(expense);
    res.status(201).json({ message: 'Expense added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/expenses', auth, async (req, res) => {
  try {
    const expenses = await db.collection('expenses')
      .find({ userId: req.user._id })
      .sort({ date: -1 })
      .toArray();
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/analyze', async (req, res) => {
  try {
    const { expenses } = req.body;
    if (!Array.isArray(expenses)) {
      throw new Error('Expenses must be an array');
    }
    const patterns = analyzeSpendingPatterns(expenses);
    const habits = analyzeHabits(expenses);
    const advice = generateFinancialAdvice(expenses, patterns, habits);
    
    res.json({
      patterns,
      habits,
      advice
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

// New endpoint for expense categories
app.get('/api/categories', async (req, res) => {
  try {
    const expenses = await db.collection('expenses').find().toArray();
    // Calculate category totals directly instead of using analyzeExpenses
    const categoryTotals = expenses.reduce((acc, expense) => {
      const category = categorizeExpense(expense.description);
      acc[category] = (acc[category] || 0) + Number(expense.amount);
      return acc;
    }, {});
    res.json(categoryTotals);
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete expense
app.delete('/api/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('expenses').deleteOne({ _id: new ObjectId(id) });
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update expense
app.put('/api/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedExpense = {
      ...req.body,
      category: categorizeExpense(req.body.description),
      updatedAt: new Date()
    };
    await db.collection('expenses').updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedExpense }
    );
    res.json({ message: 'Expense updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get monthly summary
app.get('/api/summary/monthly', async (req, res) => {
  try {
    const expenses = await db.collection('expenses').find().toArray();
    const monthlyData = expenses.reduce((acc, expense) => {
      const month = new Date(expense.date).toLocaleString('default', { month: 'long' });
      if (!acc[month]) acc[month] = 0;
      acc[month] += Number(expense.amount);
      return acc;
    }, {});
    res.json(monthlyData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a helper function to calculate trend
function calculateTrend(amounts) {
  if (amounts.length < 2) return 0;
  const changes = [];
  for (let i = 1; i < amounts.length; i++) {
    changes.push(amounts[i] - amounts[i-1]);
  }
  return changes.reduce((sum, change) => sum + change, 0) / changes.length;
}

// Add routes for the new asset/liability tracking
app.post('/api/assets', async (req, res) => {
  try {
    const asset = {
      ...req.body,
      createdAt: new Date(),
      type: ASSET_CATEGORIES[req.body.category]?.type || 'other'
    };
    await db.collection('assets').insertOne(asset);
    res.status(201).json({ message: 'Asset added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/liabilities', async (req, res) => {
  try {
    const liability = {
      ...req.body,
      createdAt: new Date(),
      priority: LIABILITY_CATEGORIES[req.body.category]?.priority || 'medium'
    };
    await db.collection('liabilities').insertOne(liability);
    res.status(201).json({ message: 'Liability added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add these routes
app.get('/api/assets', async (req, res) => {
  try {
    const assets = await db.collection('assets').find().toArray();
    res.json(assets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/liabilities', async (req, res) => {
  try {
    const liabilities = await db.collection('liabilities').find().toArray();
    res.json(liabilities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add simple analytics
const analytics = {
  trackUser: async (userId, action) => {
    await db.collection('analytics').insertOne({
      userId,
      action,
      timestamp: new Date()
    });
  },
  
  getActiveUsers: async () => {
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return await db.collection('analytics')
      .distinct('userId', { timestamp: { $gte: last24h } });
  }
};

app.post('/api/waitlist', async (req, res) => {
  try {
    const { email } = req.body;
    await db.collection('waitlist').insertOne({
      email,
      registeredAt: new Date()
    });
    res.json({ message: 'Added to waitlist successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add this near your other routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Finance Coach API is running',
    status: 'healthy',
    timestamp: new Date()
  });
});

// Add this to prevent spin down (optional)
const keepAlive = () => {
  setInterval(async () => {
    try {
      await axios.get('https://finance-coach-backend.onrender.com/');
      console.log('Keep alive ping sent');
    } catch (error) {
      console.error('Keep alive error:', error);
    }
  }, 840000); // 14 minutes
};

connectToDb()
  .then(() => {
    console.log('Database connection successful');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      keepAlive(); // Start the keep-alive pings
    });
  })
  .catch((error) => {
    console.error('Database connection failed:', error);
    process.exit(1);
});