# Translation Updates for App.jsx

Replace these hardcoded strings with t() function calls:

## Header Section (around line 150-180):

1. "My" → Keep as is, but "Portfolio" → {t('myPortfolio')}
   Change: `My <span>Portfolio</span>` 
   To: `<span>{t('myPortfolio')}</span>`

2. "Real-time NEPSE Wealth Tracker" → {t('subtitle')}

3. "LIVE" → {t('live')}

4. "Live" / "Paused" → {t('live')} / {t('paused')}

5. "Add Stock" → {t('addStock')}

6. "Sign In" → {t('signIn')}

## Portfolio Summary (around line 270-290):

7. "Total Portfolio Value" → {t('totalPortfolioValue')}

8. "Guest Mode (Not Saved)" → {t('guestMode')}

9. "Today's Change" → {t('todaysChange')}

## Search (around line 295):

10. "Search your holdings..." → {t('searchPlaceholder')}

## Empty State (around line 310-320):

11. "Your portfolio is empty" → {t('portfolioEmpty')}

12. "Click \"Add Stock\" to start tracking your investments." → {t('portfolioEmptyDesc')}

## Add Language Toggle Button

After the "Add Stock" button and before Auth buttons, add:
```jsx
<LanguageToggle />
```
