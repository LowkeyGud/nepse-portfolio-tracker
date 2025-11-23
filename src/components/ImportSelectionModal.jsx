import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../LanguageContext';

const ImportSelectionModal = ({ isOpen, onClose, importedProfiles, onConfirm }) => {
    const { t } = useLanguage();
    const [selectedIds, setSelectedIds] = useState(importedProfiles.map(p => p.id));

    const toggleSelection = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
        );
    };

    const handleConfirm = () => {
        const selectedProfiles = importedProfiles.filter(p => selectedIds.includes(p.id));
        onConfirm(selectedProfiles);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100
        }}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '500px', padding: '2rem', margin: '1rem', background: '#1e293b' }}
            >
                <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{t('selectProfilesToImport')}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                <div className="flex flex-col gap-2" style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1.5rem' }}>
                    {importedProfiles.map(profile => (
                        <div
                            key={profile.id}
                            onClick={() => toggleSelection(profile.id)}
                            className="glass-panel"
                            style={{
                                padding: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                cursor: 'pointer',
                                background: selectedIds.includes(profile.id) ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.03)',
                                border: selectedIds.includes(profile.id) ? '1px solid var(--accent-primary)' : '1px solid var(--glass-border)'
                            }}
                        >
                            <div style={{
                                width: '20px', height: '20px', borderRadius: '4px',
                                border: '2px solid var(--text-secondary)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: selectedIds.includes(profile.id) ? 'var(--accent-primary)' : 'transparent',
                                borderColor: selectedIds.includes(profile.id) ? 'var(--accent-primary)' : 'var(--text-secondary)'
                            }}>
                                {selectedIds.includes(profile.id) && <Check size={14} color="white" />}
                            </div>
                            <div>
                                <div style={{ fontWeight: 600 }}>{profile.name}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    {profile.stocks.length} {t('stocks')}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end gap-4">
                    <button onClick={onClose} style={{ padding: '0.75rem 1.5rem', background: 'transparent', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer' }}>
                        {t('cancel')}
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={selectedIds.length === 0}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: 'var(--accent-primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: selectedIds.length === 0 ? 'not-allowed' : 'pointer',
                            opacity: selectedIds.length === 0 ? 0.5 : 1
                        }}
                    >
                        {t('importSelected')}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default ImportSelectionModal;
