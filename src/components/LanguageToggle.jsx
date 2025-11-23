import { Languages } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const LanguageToggle = () => {
    const { language, toggleLanguage } = useLanguage();

    return (
        <button
            onClick={toggleLanguage}
            style={{
                padding: '0.75rem 1.25rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                transition: 'all 0.2s ease',
                backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                e.target.style.transform = 'translateY(0)';
            }}
        >
            <Languages size={18} />
            <span>{language === 'en' ? 'नेपाली' : 'English'}</span>
        </button>
    );
};

export default LanguageToggle;
