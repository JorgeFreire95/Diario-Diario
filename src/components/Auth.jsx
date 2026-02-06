import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, User, ArrowRight, Mail } from 'lucide-react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../firebaseConfig';

export function Auth({ onLogin }) {
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState(''); // Only for display name on register
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!email || !password) {
            setError('Por favor completa todos los campos');
            setLoading(false);
            return;
        }

        try {
            if (isRegistering) {
                if (!username) {
                    setError('El nombre de usuario es requerido para el registro');
                    setLoading(false);
                    return;
                }
                // Register
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                // Update display name
                await updateProfile(userCredential.user, {
                    displayName: username
                });
                // We can pass user here, but App.js handles state change
            } else {
                // Login
                await signInWithEmailAndPassword(auth, email, password);
            }
        } catch (err) {
            console.error(err);
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setError('Correo o contraseña incorrectos.');
            } else if (err.code === 'auth/email-already-in-use') {
                setError('Este correo ya está registrado.');
            } else if (err.code === 'auth/weak-password') {
                setError('La contraseña debe tener al menos 6 caracteres.');
            } else {
                setError('Error de autenticación. Revisa configuración de Firebase.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            padding: '20px'
        }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass"
                style={{
                    width: '100%',
                    maxWidth: '400px',
                    padding: '40px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}
            >
                <div style={{
                    background: 'linear-gradient(135deg, var(--primary-color), #c084fc)',
                    padding: '20px',
                    borderRadius: '20px',
                    marginBottom: '24px',
                    boxShadow: '0 10px 25px rgba(139, 92, 246, 0.3)'
                }}>
                    <Lock color="white" size={40} />
                </div>

                <h2 style={{ fontSize: '2rem', marginBottom: '8px', textAlign: 'center' }}>
                    {isRegistering ? 'Crear Cuenta' : 'Bienvenido'}
                </h2>

                <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', textAlign: 'center' }}>
                    {isRegistering
                        ? 'Comienza a guardar tus recuerdos hoy.'
                        : 'Tu espacio personal y seguro.'}
                </p>

                <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    {/* USERNAME FIELD (Only for Register) */}
                    {isRegistering && (
                        <div style={{ position: 'relative' }}>
                            <User size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type="text"
                                placeholder="Nombre de Usuario"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="input-field"
                                style={{ paddingLeft: '48px' }}
                            />
                        </div>
                    )}

                    {/* EMAIL FIELD */}
                    <div style={{ position: 'relative' }}>
                        <Mail size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                            type="email"
                            placeholder="Correo Electrónico"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-field"
                            style={{ paddingLeft: '48px' }}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Lock size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                            type="password"
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-field"
                            style={{ paddingLeft: '48px' }}
                        />
                    </div>

                    {error && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{ color: 'var(--danger-color)', fontSize: '0.9rem', textAlign: 'center' }}
                        >
                            {error}
                        </motion.p>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ marginTop: '8px', justifyContent: 'center' }}
                        disabled={loading}
                    >
                        {loading ? 'Cargando...' : (isRegistering ? 'Registrarse' : 'Entrar')}
                        {!loading && <ArrowRight size={20} />}
                    </button>
                </form>

                <button
                    onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
                    className="btn-ghost"
                    style={{ marginTop: '24px', textDecoration: 'underline', fontSize: '0.9rem' }}
                >
                    {isRegistering
                        ? '¿Ya tienes cuenta? Inicia sesión'
                        : '¿No tienes cuenta? Regístrate gratis'}
                </button>

            </motion.div>
        </div>
    );
}
