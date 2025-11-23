import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/clerk-react";
import { Activity, ArrowDown, ArrowUp, Plus, Search, Wallet } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import AddStockModal from './components/AddStockModal';
import LanguageToggle from './components/LanguageToggle';
import ProfileManagerModal from './components/ProfileManagerModal';
import StockCard from './components/StockCard';
import { stocks as initialStocks } from './data/stocks';
import { useLanguage } from './LanguageContext';

function App() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [stocks, setStocks] = useState(initialStocks);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isLive, setIsLive] = useState(true);

  // Portfolio State
  const [profiles, setProfiles] = useState([{ id: 'default', name: 'Main Portfolio', stocks: [] }]);
  const [activeProfileId, setActiveProfileId] = useState('all');
  const [isPortfolioInitialized, setIsPortfolioInitialized] = useState(false);
  const [isMarketLoading, setIsMarketLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileManagerOpen, setIsProfileManagerOpen] = useState(false);

  // Load Portfolio (Guest: LocalStorage, User: MongoDB)
  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && user) {
      // Fetch from Backend
      // In production (Vercel), use relative path /api/...
      // In development, use VITE_API_URL or localhost:3001
      const apiUrl = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:3001');
      fetch(`${apiUrl}/api/portfolio/${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            // Check if data is new format (profiles) or old format (stocks)
            if (data.length > 0 && data[0].stocks) {
              setProfiles(data);
            } else {
              // Legacy or empty
              setProfiles([{ id: 'default', name: 'Main Portfolio', stocks: data }]);
            }
          }
        })
        .catch(err => console.error("Failed to load portfolio", err))
        .finally(() => setIsPortfolioInitialized(true));
    } else {
      // Load from LocalStorage for guests
      const saved = localStorage.getItem('nepse-portfolio');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Handle legacy localstorage
        if (Array.isArray(parsed) && parsed.length > 0 && !parsed[0].stocks) {
          setProfiles([{ id: 'default', name: 'Main Portfolio', stocks: parsed }]);
        } else {
          setProfiles(parsed);
        }
      }
      setIsPortfolioInitialized(true);
    }
  }, [isLoaded, isSignedIn, user]);

  // Save Portfolio
  useEffect(() => {
    if (!isLoaded || !isPortfolioInitialized) return;

    // console.log('💾 Save Portfolio Effect Triggered', {
    //   isSignedIn,
    //   userId: user?.id,
    //   portfolioLength: userPortfolio.length
    // });

    if (isSignedIn && user) {
      // Save to Backend
      const apiUrl = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:3001');
      console.log('📤 Sending profiles to backend...', profiles);
      fetch(`${apiUrl}/api/portfolio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, profiles })
      })
        .then(res => res.json())
        .then(data => console.log('✅ Portfolio saved to backend:', data))
        .catch(err => console.error("❌ Failed to save portfolio to backend:", err));
    } else {
      // Save to LocalStorage for guests
      console.log('💾 Saving to localStorage...', profiles);
      localStorage.setItem('nepse-portfolio', JSON.stringify(profiles));
    }
  }, [profiles, isLoaded, isSignedIn, user, isPortfolioInitialized]);

  // Fetch live market data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:3001');
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

  const addToPortfolio = (newStock) => {
    setProfiles(currentProfiles => {
      const targetProfileId = activeProfileId === 'all' ? currentProfiles[0].id : activeProfileId;

      return currentProfiles.map(profile => {
        if (profile.id !== targetProfileId) return profile;

        const existingIndex = profile.stocks.findIndex(s => s.symbol === newStock.symbol);
        if (existingIndex >= 0) {
          const updatedStocks = [...profile.stocks];
          updatedStocks[existingIndex] = {
            ...updatedStocks[existingIndex],
            quantity: updatedStocks[existingIndex].quantity + newStock.quantity,
            note: newStock.note || updatedStocks[existingIndex].note
          };
          return { ...profile, stocks: updatedStocks };
        } else {
          return { ...profile, stocks: [...profile.stocks, newStock] };
        }
      });
    });
  };

  const removeFromPortfolio = (symbol, profileId) => {
    setProfiles(currentProfiles => {
      return currentProfiles.map(profile => {
        if (profileId && profile.id !== profileId) return profile;
        return {
          ...profile,
          stocks: profile.stocks.filter(s => s.symbol !== symbol)
        };
      });
    });
  };

  const updateNote = (symbol, newNote, profileId) => {
    setProfiles(currentProfiles => {
      return currentProfiles.map(profile => {
        if (profileId && profile.id !== profileId) return profile;
        return {
          ...profile,
          stocks: profile.stocks.map(s =>
            s.symbol === symbol ? { ...s, note: newNote } : s
          )
        };
      });
    });
  };

  // Filter stocks to only show portfolio items
  const displayedStocks = useMemo(() => {
    if (activeProfileId === 'all') {
      return profiles.flatMap(p => p.stocks.map(s => ({ ...s, profileName: p.name, profileId: p.id })));
    }
    const profile = profiles.find(p => p.id === activeProfileId);
    return profile ? profile.stocks.map(s => ({ ...s, profileName: profile.name, profileId: profile.id })) : [];
  }, [profiles, activeProfileId]);

  const portfolioStocks = useMemo(() => {
    return displayedStocks.map(stock => {
      const marketData = stocks.find(s => s.symbol === stock.symbol) || {
        currentPrice: 0,
        previousPrice: 0,
        sector: 'Unknown',
        name: stock.symbol
      };
      return {
        ...stock,
        ...marketData, // This overrides name/sector from portfolio if available in market data
        // Ensure we keep the portfolio specific fields
        quantity: stock.quantity,
        note: stock.note,
        profileName: stock.profileName,
        profileId: stock.profileId
      };
    }).filter(stock =>
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [displayedStocks, stocks, searchTerm]);

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
                <span style={{ color: 'var(--accent-primary)' }}>{t('myPortfolio')}</span>
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-muted" style={{ fontSize: '0.875rem' }}>
                  {t('subtitle')}
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
                    {t('live')}
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
                <span>{isLive ? t('live') : t('paused')}</span>
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
                <span>{t('addStock')}</span>
              </button>
            </div>

            {/* Language Toggle */}
            <LanguageToggle />

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
                    {t('signIn')}
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
              <div className="text-muted">{t('totalPortfolioValue')}</div>
              <SignedOut>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-danger)', background: 'rgba(239,68,68,0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                  {t('guestMode')}
                </span>
              </SignedOut>
            </div>
            <div style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1 }}>
              Rs. {portfolioTotalValue.toLocaleString()}
            </div>
            <div className={`flex items-center gap-2 ${isPortfolioPositive ? 'text-success' : 'text-danger'}`} style={{ fontSize: '1.1rem', fontWeight: 500 }}>
              {isPortfolioPositive ? <ArrowUp size={24} /> : <ArrowDown size={24} />}
              <span>Rs. {Math.abs(portfolioDailyChange).toLocaleString()}</span>
              <span className="text-muted" style={{ fontSize: '0.9rem' }}>{t('todaysChange')}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem', maxWidth: '500px' }}>
            <Search size={20} className="text-muted" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
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

          <select
            value={activeProfileId}
            onChange={(e) => {
              if (e.target.value === 'manage') {
                setIsProfileManagerOpen(true);
              } else {
                setActiveProfileId(e.target.value);
              }
            }}
            className="glass-panel"
            style={{
              padding: '0.75rem',
              color: 'var(--text-primary)',
              border: '1px solid var(--glass-border)',
              outline: 'none',
              cursor: 'pointer',
              background: 'var(--bg-card)'
            }}
          >
            <option value="all" style={{ background: '#1e293b' }}>{t('allPortfolios')}</option>
            {profiles.map(p => (
              <option key={p.id} value={p.id} style={{ background: '#1e293b' }}>{p.name}</option>
            ))}
            <option value="manage" style={{ background: '#1e293b' }}>⚙️ {t('manageProfiles')}</option>
          </select>
        </div>
      </header>

      {
        portfolioStocks.length === 0 && !isMarketLoading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
            <div style={{ marginBottom: '1rem' }}>
              <Wallet size={48} style={{ opacity: 0.5 }} />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{t('portfolioEmpty')}</h3>
            <p>{t('portfolioEmptyDesc')}</p>
          </div>
        ) : (
          <main style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '1.5rem'
          }}>
            {portfolioStocks.map((stock, index) => (
              <StockCard
                key={`${stock.symbol}-${stock.profileId}`}
                stock={stock}
                index={index}
                quantity={stock.quantity}
                onDelete={(symbol) => removeFromPortfolio(symbol, stock.profileId)}
                onUpdateNote={(symbol, note) => updateNote(symbol, note, stock.profileId)}
                isLoading={isMarketLoading && stocks.length === 0}
                profileName={activeProfileId === 'all' ? stock.profileName : null}
              />
            ))}
          </main>
        )
      }

      <AddStockModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={addToPortfolio}
        availableStocks={stocks}
      />

      <ProfileManagerModal
        isOpen={isProfileManagerOpen}
        onClose={() => setIsProfileManagerOpen(false)}
        profiles={profiles}
        onUpdateProfiles={setProfiles}
        activeProfileId={activeProfileId}
        onSetActiveProfile={setActiveProfileId}
      />
    </div >
  );
}

export default App;
