import { motion } from 'framer-motion';
import { Plus, Search, X } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../LanguageContext';

const AddStockModal = ({ isOpen, onClose, onAdd, availableStocks }) => {
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStock, setSelectedStock] = useState(null);
    const [quantity, setQuantity] = useState('10');
    const [note, setNote] = useState('');

    const filteredStocks = availableStocks.filter(stock =>
        stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedStock && quantity > 0) {
            onAdd({
                symbol: selectedStock.symbol,
                quantity: Number(quantity),
                note: note.trim()
            });
            setSearchTerm('');
            setSelectedStock(null);
            setQuantity('10');
            setNote('');
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '500px', padding: '2rem', margin: '1rem', background: '#1e293b' }}
            >
                <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{t('addToPortfolio')}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {!selectedStock ? (
                        <div className="flex flex-col gap-2">
                            <label className="text-muted">{t('searchStock')}</label>
                            <div className="glass-panel" style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.2)' }}>
                                <Search size={18} className="text-muted" />
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder={t('searchPlaceholder')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none' }}
                                />
                            </div>

                            <div style={{ maxHeight: '200px', overflowY: 'auto', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {filteredStocks.slice(0, 5).map(stock => (
                                    <div
                                        key={stock.symbol}
                                        onClick={() => setSelectedStock(stock)}
                                        style={{
                                            padding: '0.75rem',
                                            borderRadius: '8px',
                                            background: 'rgba(255,255,255,0.05)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <div>
                                            <div style={{ fontWeight: 'bold' }}>{stock.symbol}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{stock.name}</div>
                                        </div>
                                        <Plus size={16} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <>
                            <div style={{
                                padding: '1rem',
                                background: 'rgba(59, 130, 246, 0.1)',
                                borderRadius: '8px',
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{selectedStock.symbol}</div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{selectedStock.name}</div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedStock(null)}
                                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem' }}
                                >
                                    {t('change')}
                                </button>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-muted">{t('quantity')}</label>
                                <input
                                    type="number"
                                    min="1"
                                    required
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    className="glass-panel"
                                    style={{
                                        padding: '1rem',
                                        background: 'rgba(0,0,0,0.2)',
                                        border: '1px solid var(--glass-border)',
                                        color: 'white',
                                        fontSize: '1.2rem',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-muted">{t('noteOptional')}</label>
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder={t('notePlaceholder')}
                                    className="glass-panel"
                                    style={{
                                        padding: '1rem',
                                        background: 'rgba(0,0,0,0.2)',
                                        border: '1px solid var(--glass-border)',
                                        color: 'white',
                                        fontSize: '0.95rem',
                                        outline: 'none',
                                        minHeight: '80px',
                                        resize: 'vertical',
                                        fontFamily: 'inherit'
                                    }}
                                />
                            </div>

                            <button
                                type="submit"
                                style={{
                                    marginTop: '1rem',
                                    padding: '1rem',
                                    background: 'var(--accent-primary)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                }}
                            >
                                {t('addToPortfolio')}
                            </button>
                        </>
                    )}
                </form>
            </motion.div>
        </div>
    );
};

export default AddStockModal;
