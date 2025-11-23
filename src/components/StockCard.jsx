import { motion } from 'framer-motion';
import { ArrowDown, ArrowUp, Edit2, Minus, Save, X } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../LanguageContext';

const StockCard = ({ stock, index, quantity, onDelete, onUpdateNote, isLoading, profileName }) => {
    const { t } = useLanguage();
    const { symbol, name, currentPrice, previousPrice, sector, note } = stock;

    if (isLoading) {
        return (
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
                <div className="flex justify-between items-start">
                    <div>
                        <div className="skeleton" style={{ width: '80px', height: '24px', marginBottom: '8px' }}></div>
                        <div className="skeleton" style={{ width: '150px', height: '16px' }}></div>
                    </div>
                    <div className="skeleton" style={{ width: '60px', height: '20px', borderRadius: '999px' }}></div>
                </div>
                <div style={{ marginTop: 'auto' }}>
                    <div className="skeleton" style={{ width: '120px', height: '32px', marginBottom: '8px' }}></div>
                    <div className="skeleton" style={{ width: '100px', height: '16px' }}></div>
                </div>
            </div>
        );
    }

    const [isEditingNote, setIsEditingNote] = useState(false);
    const [noteText, setNoteText] = useState(note || '');

    const diff = currentPrice - previousPrice;
    const percentChange = ((diff / previousPrice) * 100);
    const percentChangeFormatted = percentChange.toFixed(2);

    const isPositive = diff > 0;
    const isNegative = diff < 0;
    const isNeutral = diff === 0;

    // Circuit Breaker Detection (approx 10%)
    const isPositiveCircuit = percentChange >= 9.9;
    const isNegativeCircuit = percentChange <= -9.9;

    // Significant Change Detection (> 30 Rs)
    const isSignificantChange = Math.abs(diff) > 30;

    // Dynamic Background
    let backgroundStyle = 'var(--bg-card)';
    if (isSignificantChange) {
        if (isPositive) backgroundStyle = 'rgba(16, 185, 129, 0.2)'; // Stronger Green
        if (isNegative) backgroundStyle = 'rgba(239, 68, 68, 0.2)'; // Stronger Red
    }

    // Portfolio calculations
    const totalValue = quantity ? quantity * currentPrice : 0;
    const dailyGainLoss = quantity ? quantity * diff : 0;

    const handleSaveNote = () => {
        if (onUpdateNote) {
            onUpdateNote(symbol, noteText.trim());
        }
        setIsEditingNote(false);
    };

    const handleCancelEdit = () => {
        setNoteText(note || '');
        setIsEditingNote(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="glass-panel"
            style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                position: 'relative',
                overflow: 'hidden',
                background: backgroundStyle,
                transition: 'background 0.3s ease'
            }}
        >
            {/* Background decoration */}
            <div style={{
                position: 'absolute',
                top: '-50%',
                right: '-50%',
                width: '100%',
                height: '100%',
                background: isPositive
                    ? 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)'
                    : isNegative
                        ? 'radial-gradient(circle, rgba(239, 68, 68, 0.1) 0%, transparent 70%)'
                        : 'none',
                pointerEvents: 'none'
            }} />

            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2">
                        <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em' }}>{symbol}</h3>
                        {profileName && (
                            <span style={{ fontSize: '0.7rem', background: 'var(--accent-primary)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                                {profileName}
                            </span>
                        )}
                        {isPositiveCircuit && <span style={{ fontSize: '0.7rem', background: '#10b981', color: 'white', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>{t('positiveCircuit')}</span>}
                        {isNegativeCircuit && <span style={{ fontSize: '0.7rem', background: '#ef4444', color: 'white', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>{t('negativeCircuit')}</span>}
                    </div>
                    <p className="text-muted" style={{ margin: '0.25rem 0 0', fontSize: '0.875rem' }}>{name}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span style={{
                        fontSize: '0.75rem',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '999px',
                        background: 'rgba(255,255,255,0.05)',
                        color: 'var(--text-secondary)'
                    }}>
                        {sector}
                    </span>
                    {onDelete && (
                        <button
                            onClick={() => onDelete(symbol)}
                            style={{ fontSize: '0.75rem', color: 'var(--accent-danger)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                        >
                            {t('remove')}
                        </button>
                    )}
                </div>
            </div>

            <div style={{ marginTop: 'auto' }}>
                {quantity ? (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <div className="text-muted" style={{ fontSize: '0.75rem' }}>{t('holdings')}</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{quantity} <span style={{ fontSize: '0.8rem', fontWeight: 400 }}>{t('units')}</span></div>
                            </div>
                            <div>
                                <div className="text-muted" style={{ fontSize: '0.75rem' }}>{t('currentPrice')}</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>Rs. {currentPrice.toLocaleString()}</div>
                                <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: '2px' }}>
                                    {t('yesterday')}: Rs. {previousPrice.toLocaleString()}
                                </div>
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                            <div className="flex justify-between items-end">
                                <div>
                                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>{t('totalValue')}</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>Rs. {totalValue.toLocaleString()}</div>
                                </div>
                                <div className={`flex flex-col items-end ${isPositive ? 'text-success' : isNegative ? 'text-danger' : 'text-muted'}`}>
                                    <div className="flex items-center gap-1" style={{ fontWeight: 600 }}>
                                        {isPositive && <ArrowUp size={16} />}
                                        {isNegative && <ArrowDown size={16} />}
                                        <span>Rs. {Math.abs(dailyGainLoss).toLocaleString()}</span>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                                        {isPositive ? '+' : ''}{percentChangeFormatted}%
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Note Section */}
                        {(note || isEditingNote) && (
                            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1rem', marginTop: '1rem' }}>
                                <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
                                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>{t('note')}</div>
                                    {!isEditingNote && onUpdateNote && (
                                        <button
                                            onClick={() => setIsEditingNote(true)}
                                            style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                    )}
                                </div>
                                {isEditingNote ? (
                                    <div>
                                        <textarea
                                            value={noteText}
                                            onChange={(e) => setNoteText(e.target.value)}
                                            placeholder={t('notePlaceholder')}
                                            style={{
                                                width: '100%',
                                                padding: '0.5rem',
                                                background: 'rgba(0,0,0,0.2)',
                                                border: '1px solid var(--glass-border)',
                                                borderRadius: '4px',
                                                color: 'white',
                                                fontSize: '0.85rem',
                                                minHeight: '60px',
                                                resize: 'vertical',
                                                outline: 'none',
                                                fontFamily: 'inherit'
                                            }}
                                        />
                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                            <button
                                                onClick={handleSaveNote}
                                                style={{
                                                    padding: '0.4rem 0.8rem',
                                                    background: 'var(--accent-primary)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    fontSize: '0.8rem',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}
                                            >
                                                <Save size={14} /> {t('save')}
                                            </button>
                                            <button
                                                onClick={handleCancelEdit}
                                                style={{
                                                    padding: '0.4rem 0.8rem',
                                                    background: 'rgba(255,255,255,0.05)',
                                                    color: 'var(--text-secondary)',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    fontSize: '0.8rem',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}
                                            >
                                                <X size={14} /> {t('cancel')}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: note ? 'normal' : 'italic' }}>
                                        {note || t('noNote')}
                                    </div>
                                )}
                            </div>
                        )}
                        {!note && !isEditingNote && onUpdateNote && (
                            <button
                                onClick={() => setIsEditingNote(true)}
                                style={{
                                    marginTop: '0.5rem',
                                    padding: '0.5rem',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px dashed var(--glass-border)',
                                    borderRadius: '4px',
                                    color: 'var(--text-secondary)',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '4px'
                                }}
                            >
                                <Edit2 size={14} /> {t('addNote')}
                            </button>
                        )}
                    </>
                ) : (
                    <>
                        <div className="flex items-center gap-2">
                            <span style={{ fontSize: '2rem', fontWeight: 600 }}>
                                Rs. {currentPrice.toLocaleString()}
                            </span>
                        </div>

                        <div className="flex items-center gap-4" style={{ marginTop: '0.5rem' }}>
                            <div className={`flex items-center gap-2 ${isPositive ? 'text-success' : isNegative ? 'text-danger' : 'text-muted'}`}
                                style={{ fontWeight: 500 }}>
                                {isPositive && <ArrowUp size={20} />}
                                {isNegative && <ArrowDown size={20} />}
                                {isNeutral && <Minus size={20} />}
                                <span>{Math.abs(diff).toFixed(2)} ({Math.abs(percentChangeFormatted)}%)</span>
                            </div>
                            <div className="text-muted" style={{ fontSize: '0.875rem' }}>
                                {t('yesterdayLTP')}: Rs. {previousPrice.toLocaleString()}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </motion.div>
    );
};

export default StockCard;
