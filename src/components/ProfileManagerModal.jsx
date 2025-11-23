import { motion } from 'framer-motion';
import { Check, Edit2, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../LanguageContext';

const ProfileManagerModal = ({ isOpen, onClose, profiles, onUpdateProfiles, activeProfileId, onSetActiveProfile }) => {
    const { t } = useLanguage();
    const [newProfileName, setNewProfileName] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');

    const handleAdd = (e) => {
        e.preventDefault();
        if (newProfileName.trim()) {
            const newId = Date.now().toString();
            const newProfiles = [...profiles, { id: newId, name: newProfileName.trim(), stocks: [] }];
            onUpdateProfiles(newProfiles);
            setNewProfileName('');
            onSetActiveProfile(newId);
        }
    };

    const handleEdit = (profile) => {
        setEditingId(profile.id);
        setEditName(profile.name);
    };

    const handleSaveEdit = (id) => {
        if (editName.trim()) {
            const newProfiles = profiles.map(p => p.id === id ? { ...p, name: editName.trim() } : p);
            onUpdateProfiles(newProfiles);
            setEditingId(null);
        }
    };

    const handleDelete = (id) => {
        if (confirm(t('confirmDeleteProfile'))) {
            const newProfiles = profiles.filter(p => p.id !== id);
            onUpdateProfiles(newProfiles);
            if (activeProfileId === id) {
                onSetActiveProfile('all');
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '500px', padding: '2rem', margin: '1rem', background: '#1e293b' }}
            >
                <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{t('manageProfiles')}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                <div className="flex flex-col gap-4">
                    {/* Add New Profile */}
                    <form onSubmit={handleAdd} className="flex gap-2">
                        <input
                            type="text"
                            placeholder={t('newProfileName')}
                            value={newProfileName}
                            onChange={(e) => setNewProfileName(e.target.value)}
                            className="glass-panel"
                            style={{ flex: 1, padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none' }}
                        />
                        <button type="submit" style={{ padding: '0.75rem', background: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                            <Plus size={20} />
                        </button>
                    </form>

                    {/* Profile List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
                        {profiles.map(profile => (
                            <div key={profile.id} className="glass-panel" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)' }}>
                                {editingId === profile.id ? (
                                    <div className="flex gap-2" style={{ flex: 1 }}>
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            style={{ flex: 1, padding: '0.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'white', outline: 'none' }}
                                            autoFocus
                                        />
                                        <button onClick={() => handleSaveEdit(profile.id)} style={{ background: 'var(--accent-success)', border: 'none', borderRadius: '4px', padding: '0.5rem', color: 'white', cursor: 'pointer' }}>
                                            <Check size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <span style={{ fontWeight: 500 }}>{profile.name}</span>
                                )}

                                <div className="flex gap-2">
                                    {editingId !== profile.id && (
                                        <button onClick={() => handleEdit(profile)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                            <Edit2 size={16} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(profile.id)}
                                        style={{ background: 'none', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer' }}
                                        disabled={profiles.length <= 1}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ProfileManagerModal;
