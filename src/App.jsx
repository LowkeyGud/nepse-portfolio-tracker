import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/clerk-react";
import { Activity, ArrowDown, ArrowUp, Plus, Search, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import AddStockModal from './components/AddStockModal';
import StockCard from './components/StockCard';
import { stocks as initialStocks } from './data/stocks';

function App() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [stocks, setStocks] = useState(initialStocks);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isLive, setIsLive] = useState(true);

  // Portfolio State
  const [userPortfolio, setUserPortfolio] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load Portfolio (Guest: LocalStorage, User: MongoDB)
  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && user) {
      // Fetch from Backend
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      fetch(`${apiUrl}/api/portfolio/${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setUserPortfolio(data);
        })
        .catch(err => console.error("Failed to load portfolio", err));
    } else {
      // Load from LocalStorage for guests
      const saved = localStorage.getItem('nepse-portfolio');
      if (saved) setUserPortfolio(JSON.parse(saved));
    }
  }, [isLoaded, isSignedIn, user]);

  // Save Portfolio
  useEffect(() => {
    if (!isLoaded) return;

    console.log('💾 Save Portfolio Effect Triggered', {
      isSignedIn,
      userId: user?.id,
      portfolioLength: userPortfolio.length
    });

    if (isSignedIn && user) {
      // Save to Backend
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      console.log('📤 Sending portfolio to backend...', userPortfolio);
      fetch(`${apiUrl}/api/portfolio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, stocks: userPortfolio })
      })
        .then(res => res.json())
        .then(data => console.log('✅ Portfolio saved to backend:', data))
        .catch(err => console.error("❌ Failed to save portfolio to backend:", err));
    } else {
      // Save to LocalStorage
      console.log('💾 Saving to localStorage...', userPortfolio);
      localStorage.setItem('nepse-portfolio', JSON.stringify(userPortfolio));
    }
  }, [userPortfolio, isLoaded, isSignedIn, user]);

  // Fetch live market data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/api/stocks`);
        const data = await response.json();

        if (data && data.length > 0) {
          const mergedData = data.map(scrapedStock => {
            const existing = initialStocks.find(s => s.symbol === scrapedStock.symbol);
            return {
              ...scrapedStock,
              name: existing ? existing.name : scrapedStock.symbol,
              sector: existing ? existing.sector : 'Others'
            };
          });

          setStocks(mergedData);
          setLastUpdated(new Date());
        }
      } catch (error) {
        console.error("Failed to fetch from proxy:", error);
        if (isLive) {
          setStocks(currentStocks =>
            currentStocks.map(stock => {
              if (Math.random() > 0.3) {
                const volatility = 0.005;
                const change = stock.currentPrice * (Math.random() * volatility * 2 - volatility);
                return {
                  ...stock,
                  currentPrice: Number((stock.currentPrice + change).toFixed(2))
                };
              }
              return stock;
            })
          );
          setLastUpdated(new Date());
        }
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [isLive]);

  const addToPortfolio = ({ symbol, quantity, note }) => {
    setUserPortfolio(prev => {
      const existing = prev.find(p => p.symbol === symbol);
      if (existing) {
        return prev.map(p => p.symbol === symbol ? { ...p, quantity: p.quantity + quantity, note: note || p.note } : p);
      }
      return [...prev, { symbol, quantity, note: note || '' }];
    });
  };

  const removeFromPortfolio = (symbol) => {
    setUserPortfolio(prev => prev.filter(p => p.symbol !== symbol));
  };

  const updateNote = (symbol, newNote) => {
    setUserPortfolio(prev => prev.map(p => p.symbol === symbol ? { ...p, note: newNote } : p));
  };

  // Filter stocks to only show portfolio items
  const portfolioStocks = userPortfolio.map(item => {
    const stockData = stocks.find(s => s.symbol === item.symbol) || {
      symbol: item.symbol,
      name: item.symbol,
      currentPrice: 0,
      previousPrice: 0,
      sector: 'Unknown'
    };
    return { ...stockData, quantity: item.quantity, note: item.note || '' };
  }).filter(stock =>
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate Portfolio Totals
  const portfolioTotalValue = portfolioStocks.reduce((acc, stock) => acc + (stock.currentPrice * stock.quantity), 0);
  const portfolioDailyChange = portfolioStocks.reduce((acc, stock) => acc + ((stock.currentPrice - stock.previousPrice) * stock.quantity), 0);
  const isPortfolioPositive = portfolioDailyChange >= 0;

  return (
    <div className="container">
      <header style={{ marginBottom: '3rem' }}>
        <div className="flex justify-between items-center" style={{ marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div className="flex items-center gap-2">
            <div style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              padding: '0.75rem',
              borderRadius: '12px',
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)'
            }}>
              <Wallet color="white" size={28} />
            </div>
            <div>
              <h1 style={{ fontSize: '2rem', margin: 0, fontWeight: 800, letterSpacing: '-0.03em' }}>
                My <span style={{ color: 'var(--accent-primary)' }}>Portfolio</span>
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-muted" style={{ fontSize: '0.875rem' }}>
                  Real-time NEPSE Wealth Tracker
                </span>
                {isLive && (
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.75rem',
                    color: 'var(--accent-success)',
                    background: 'rgba(16, 185, 129, 0.1)',
                    padding: '0.1rem 0.5rem',
                    borderRadius: '999px'
                  }}>
                    <span className="animate-pulse" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></span>
                    LIVE
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setIsLive(!isLive)}
                className="glass-panel"
                style={{
                  padding: '0.75rem 1.25rem',
                  color: isLive ? 'var(--accent-success)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s',
                  borderColor: isLive ? 'var(--accent-success)' : 'var(--glass-border)'
                }}
              >
                <Activity size={18} />
                <span>{isLive ? 'Live' : 'Paused'}</span>
              </button>

              <button
                onClick={() => setIsModalOpen(true)}
                className="glass-panel"
                style={{
                  padding: '0.75rem 1.25rem',
                  background: 'var(--accent-primary)',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: 600
                }}
              >
                <Plus size={18} />
                <span>Add Stock</span>
              </button>
            </div>

            {/* Auth Buttons */}
            <div style={{ marginLeft: '1rem' }}>
              <SignedOut>
                <SignInButton mode="modal">
                  <button
                    style={{
                      padding: '0.75rem 1.75rem',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
                      transition: 'all 0.2s ease',
                      letterSpacing: '0.02em'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
                    }}
                  >
                    Sign In
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </div>
        </div>

        {/* Portfolio Summary Card */}
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)' }}>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="text-muted">Total Portfolio Value</div>
              <SignedOut>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-danger)', background: 'rgba(239,68,68,0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                  Guest Mode (Not Saved)
                </span>
              </SignedOut>
            </div>
            <div style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1 }}>
              Rs. {portfolioTotalValue.toLocaleString()}
            </div>
            <div className={`flex items-center gap-2 ${isPortfolioPositive ? 'text-success' : 'text-danger'}`} style={{ fontSize: '1.1rem', fontWeight: 500 }}>
              {isPortfolioPositive ? <ArrowUp size={24} /> : <ArrowDown size={24} />}
              <span>Rs. {Math.abs(portfolioDailyChange).toLocaleString()}</span>
              <span className="text-muted" style={{ fontSize: '0.9rem' }}>Today's Change</span>
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem', maxWidth: '500px' }}>
          <Search size={20} className="text-muted" />
          <input
            type="text"
            placeholder="Search your holdings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              width: '100%',
              padding: '0.5rem 0',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
        </div>
      </header>

      {userPortfolio.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          <div style={{ marginBottom: '1rem' }}>
            <Wallet size={48} style={{ opacity: 0.5 }} />
          </div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Your portfolio is empty</h3>
          <p>Click "Add Stock" to start tracking your investments.</p>
        </div>
      ) : (
        <main style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '1.5rem'
        }}>
          {portfolioStocks.map((stock, index) => (
            <StockCard
              key={stock.symbol}
              stock={stock}
              index={index}
              quantity={stock.quantity}
              onDelete={removeFromPortfolio}
              onUpdateNote={updateNote}
            />
          ))}
        </main>
      )}

      <AddStockModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={addToPortfolio}
        availableStocks={stocks}
      />
    </div>
  );
}

export default App;
