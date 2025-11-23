import axios from 'axios';
import * as cheerio from 'cheerio';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';

console.log('🚀 Server script starting...');
dotenv.config();
console.log('✅ Environment variables loaded');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// MongoDB Connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nepse-tracker';
console.log('Attempting to connect to MongoDB...');
console.log('MongoDB URI:', mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')); // Hide credentials in log

mongoose.connect(mongoUri)
  .then(() => {
    console.log('✅ Successfully connected to MongoDB');
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
  });

// Portfolio Schema
const PortfolioSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  // Legacy field support
  stocks: [{
    symbol: String,
    quantity: Number,
    note: { type: String, default: '' }
  }],
  // New Profiles field
  profiles: [{
    id: String,
    name: String,
    stocks: [{
      symbol: String,
      quantity: Number,
      note: { type: String, default: '' }
    }]
  }]
}, { timestamps: true });

const Portfolio = mongoose.model('Portfolio', PortfolioSchema);

// Portfolio Routes
app.get('/api/portfolio/:userId', async (req, res) => {
  try {
    console.log('📥 Fetching portfolio for user:', req.params.userId);
    const portfolio = await Portfolio.findOne({ userId: req.params.userId });
    
    if (portfolio) {
      if (portfolio.profiles && portfolio.profiles.length > 0) {
        console.log(`📦 Found ${portfolio.profiles.length} profiles`);
        res.json(portfolio.profiles);
      } else if (portfolio.stocks && portfolio.stocks.length > 0) {
        console.log('📦 Found legacy stocks, migrating to default profile');
        // Migration: Return legacy stocks as a default profile
        res.json([{
          id: 'default',
          name: 'Main Portfolio',
          stocks: portfolio.stocks
        }]);
      } else {
        console.log('📦 Empty portfolio');
        res.json([]);
      }
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('❌ Error fetching portfolio:', error.message);
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
});

app.post('/api/portfolio', async (req, res) => {
  try {
    const { userId, profiles } = req.body;
    console.log('💾 Saving profiles for user:', userId, '| Profiles:', profiles?.length);
    
    const portfolio = await Portfolio.findOneAndUpdate(
      { userId },
      { profiles }, // Only save to profiles field
      { new: true, upsert: true }
    );
    console.log('✅ Portfolio saved successfully');
    res.json(portfolio.profiles);
  } catch (error) {
    console.error('❌ Error saving portfolio:', error.message);
    res.status(500).json({ error: 'Failed to save portfolio' });
  }
});

app.get('/api/stocks', async (req, res) => {
  try {
    // Switching to Merolagani as ShareSansar data seems stale
    const url = 'https://merolagani.com/LatestMarket.aspx';
    
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(data);
    const stocks = [];

    // Merolagani usually has a table with id 'ctl00_ContentPlaceHolder1_LiveTrading' or similar
    // We'll look for the main table with class 'table-hover' or 'live-trading'
    const table = $('table.table-hover').first(); 
    
    // Map headers to indices
    const headers = {};
    table.find('thead tr th').each((i, el) => {
      const text = $(el).text().trim().toLowerCase();
      headers[text] = i;
    });

    console.log('Found headers (Merolagani):', headers);

    const getIndex = (keys) => {
      for (const key of keys) {
        if (headers[key] !== undefined) return headers[key];
        const found = Object.keys(headers).find(h => h.includes(key));
        if (found) return headers[found];
      }
      return -1;
    };

    const idxSymbol = getIndex(['symbol']);
    const idxClose = getIndex(['ltp', 'last price']); 
    const idxPrevClose = getIndex(['prev. close', 'previous closing']); // Merolagani might not show Prev Close in Live table directly?
    // Merolagani Live Table Columns: Symbol, LTP, % Change, Open, High, Low, Qty, PClo (Previous Close might be hidden or named differently)
    // Let's check common Merolagani columns: Symbol, LTP, % Change, Open, High, Low, Qty
    
    // If Prev Close is missing, we can calculate it: LTP / (1 + %Change/100)
    const idxPercentChange = getIndex(['% change', 'change']);
    const idxDiff = getIndex(['diff', 'difference']);
    const idxOpen = getIndex(['open']);

    console.log('Indices:', { idxSymbol, idxClose, idxPercentChange, idxDiff, idxOpen });

    table.find('tbody tr').each((i, el) => {
      const tds = $(el).find('td');
      if (tds.length > 0) {
        const getText = (idx) => idx >= 0 ? $(tds[idx]).text().trim() : '';
        const parseNum = (str) => parseFloat(str.replace(/,/g, '')) || 0;

        const symbol = getText(idxSymbol);
        const currentPrice = parseNum(getText(idxClose));
        const percentChange = parseNum(getText(idxPercentChange));
        const diff = parseNum(getText(idxDiff));
        const openPrice = parseNum(getText(idxOpen));
        
        // Calculate Previous Price if not explicitly found
        let previousPrice = 0;
        if (diff !== 0) {
           previousPrice = currentPrice - diff;
        } else if (percentChange !== 0) {
           previousPrice = currentPrice / (1 + (percentChange / 100));
        } else {
           // If no change, Prev = Current
           previousPrice = currentPrice;
        }

        if (symbol && currentPrice > 0) {
          stocks.push({
            symbol,
            name: symbol,
            currentPrice,
            previousPrice: Number(previousPrice.toFixed(2)),
            openPrice,
            sector: 'Unknown'
          });
        }
      }
    });

    if (stocks.length > 0) {
      console.log('First scraped stock:', stocks[0]);
    } else {
      console.log('No stocks found. Table selector might be wrong.');
    }

    res.json(stocks);
  } catch (error) {
    console.error('Scraping failed:', error.message);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Proxy server running on http://localhost:${PORT}`);
  });
}

// For Vercel
export default app;
