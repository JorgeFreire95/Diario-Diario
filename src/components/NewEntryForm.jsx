import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Save, X, Mic, Square, Trash2, Image as ImageIcon } from 'lucide-react';

export function NewEntryForm({ onSave, onCancel }) {
    const [content, setContent] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState(null);
    const [audioBase64, setAudioBase64] = useState(null);
    const [imgPreview, setImgPreview] = useState(null);
    const [imgBase64, setImgBase64] = useState(null);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const fileInputRef = useRef(null);

    const [isThinking, setIsThinking] = useState(false);
    const recognitionRef = useRef(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(audioBlob);
                setAudioUrl(url);

                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = () => {
                    setAudioBase64(reader.result);
                };
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);

            if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = true;
                recognitionRef.current.interimResults = true;
                recognitionRef.current.lang = 'es-ES';

                recognitionRef.current.onresult = (event) => {
                    let transcript = '';
                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            transcript += event.results[i][0].transcript + ' ';
                        }
                    }
                    if (transcript) {
                        setContent(prev => prev + transcript);
                    }
                };

                try {
                    recognitionRef.current.start();
                } catch (e) {
                    console.warn("Recognition already started or error", e);
                }
            }

        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("No se pudo acceder al micrófono.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    };

    const deleteRecording = () => {
        setAudioUrl(null);
        setAudioBase64(null);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    // Create a canvas to compress the image
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const MAX_WIDTH = 800; // Limit width to 800px to keep file size low
                    const MAX_HEIGHT = 800;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Compress to JPEG with 0.6 quality
                    const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);

                    // console.log("Original size:", event.target.result.length);
                    // console.log("Compressed size:", compressedBase64.length);

                    if (compressedBase64.length > 950000) {
                        alert("La imagen es demasiado compleja incluso comprimida. Por favor usa otra.");
                    } else {
                        setImgPreview(compressedBase64);
                        setImgBase64(compressedBase64);
                    }
                };
            };
        }
    };

    const removeImage = () => {
        setImgPreview(null);
        setImgBase64(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!content.trim() && !audioBase64 && !imgBase64) return;
        onSave(content, audioBase64, imgBase64);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="glass"
            style={{
                padding: '24px',
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                height: '90vh',
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
                zIndex: 50,
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 -10px 40px rgba(0,0,0,0.5)'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px' }}>Nuevo Recuerdo</h2>
                    <p style={{ color: 'var(--primary-color)', fontSize: '0.9rem', fontWeight: 500 }}>
                        {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <button onClick={onCancel} className="btn-ghost" style={{ padding: '8px' }}>
                    <X size={24} />
                </button>
            </div>

            <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
                <textarea
                    autoFocus
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="¿Qué pasó hoy? Escribe tus pensamientos..."
                    className="input-field"
                    style={{
                        flex: 1,
                        resize: 'none',
                        fontSize: '1.2rem',
                        lineHeight: '1.6',
                        background: 'transparent',
                        border: 'none',
                        padding: 0,
                        minHeight: '100px'
                    }}
                />

                {/* Media Controls */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>

                    {/* Audio Controls */}
                    {!audioUrl && !isRecording && (
                        <button type="button" onClick={startRecording} className="btn" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '10px 16px', borderRadius: '50px' }}>
                            <Mic size={18} /> Audio
                        </button>
                    )}
                    {isRecording && (
                        <button type="button" onClick={stopRecording} className="btn" style={{ background: '#ef4444', color: 'white', padding: '10px 16px', borderRadius: '50px', animation: 'pulse 1.5s infinite' }}>
                            <Square size={18} fill="currentColor" /> Detener
                        </button>
                    )}
                    {audioUrl && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--surface-color)', padding: '6px 12px', borderRadius: '20px' }}>
                            <audio src={audioUrl} controls style={{ height: '24px', width: '150px' }} />
                            <button type="button" onClick={deleteRecording} className="btn-ghost" style={{ padding: '4px', color: '#ef4444' }}><Trash2 size={16} /></button>
                        </div>
                    )}

                    {/* Image Controls */}
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current.click()}
                        className="btn"
                        style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '10px 16px', borderRadius: '50px' }}
                    >
                        <ImageIcon size={18} /> Foto
                    </button>
                </div>

                {/* Image Preview */}
                {imgPreview && (
                    <div style={{ position: 'relative', width: 'fit-content', maxWidth: '100%' }}>
                        <img
                            src={imgPreview}
                            alt="Vista previa"
                            style={{
                                maxHeight: '200px',
                                borderRadius: '12px',
                                border: '1px solid var(--glass-border)'
                            }}
                        />
                        <button
                            type="button"
                            onClick={removeImage}
                            style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                background: 'rgba(0,0,0,0.6)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                padding: '6px',
                                cursor: 'pointer',
                                display: 'flex'
                            }}
                        >
                            <X size={14} />
                        </button>
                    </div>
                )}

                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 'auto' }}>
                    <Save size={20} />
                    Guardar Recuerdo
                </button>
            </form>
        </motion.div>
    );
}

// Global style for pulse animation
const style = document.createElement('style');
style.innerHTML = `
@keyframes pulse {
    0% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.05); }
    100% { opacity: 1; transform: scale(1); }
}`;
document.head.appendChild(style);
