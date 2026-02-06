import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Trash2 } from 'lucide-react';

export function EntryCard({ entry, onDelete, index }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="glass"
            style={{
                padding: '20px',
                marginBottom: '16px',
                position: 'relative'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-color)' }}>
                    <Calendar size={16} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                        {new Date(entry.date).toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </span>
                </div>
                <button
                    onClick={() => onDelete(entry.id)}
                    className="btn-ghost"
                    style={{ padding: '8px', color: 'var(--text-secondary)' }}
                >
                    <Trash2 size={18} />
                </button>
            </div>

            {/* 0. IMAGE VERSION */}
            {entry.image && (
                <div style={{ marginBottom: '20px' }}>
                    <img
                        src={entry.image}
                        alt="Recuerdo visual"
                        style={{
                            width: '100%',
                            borderRadius: '12px',
                            border: '1px solid var(--glass-border)',
                            objectFit: 'cover',
                            maxHeight: '300px'
                        }}
                    />
                </div>
            )}

            {/* 1. WRITTEN VERSION */}
            <div style={{ marginBottom: '20px' }}>
                <h3 style={{
                    fontSize: '0.85rem',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    color: 'var(--text-secondary)',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                }}>
                    <span>📝</span> Versión Escrita
                </h3>
                <p style={{
                    whiteSpace: 'pre-wrap',
                    color: 'var(--text-primary)',
                    fontSize: '1.05rem',
                    lineHeight: '1.6',
                    padding: '12px',
                    background: 'rgba(0,0,0,0.1)',
                    borderRadius: '8px'
                }}>
                    {entry.content || <span style={{ fontStyle: 'italic', opacity: 0.5 }}>Sin texto transcrito...</span>}
                </p>
            </div>

            {/* 2. AUDIO VERSION */}
            <div>
                <h3 style={{
                    fontSize: '0.85rem',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    color: 'var(--text-secondary)',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                }}>
                    <span>🎙️</span> Versión de Audio
                </h3>

                <div style={{
                    background: 'rgba(0,0,0,0.2)',
                    padding: '12px',
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                }}>
                    {entry.audio ? (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.8rem', color: '#4ade80' }}>Grabación Original</span>
                            </div>
                            <audio
                                controls
                                src={entry.audio}
                                style={{ width: '100%', height: '36px' }}
                            />
                        </>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                Lectura automática (TTS)
                            </span>
                            <button
                                className="btn-primary"
                                onClick={() => {
                                    if (window.speechSynthesis.speaking) {
                                        window.speechSynthesis.cancel();
                                    } else {
                                        const utterance = new SpeechSynthesisUtterance(entry.content || "Sin contenido para leer");
                                        utterance.lang = 'es-ES';
                                        window.speechSynthesis.speak(utterance);
                                    }
                                }}
                                style={{
                                    padding: '8px 16px',
                                    fontSize: '0.9rem',
                                    background: 'var(--primary-color)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                🔊 Reproducir
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
