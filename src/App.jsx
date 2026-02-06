import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, BookOpen } from 'lucide-react';
import { EntryCard } from './components/EntryCard';
import { NewEntryForm } from './components/NewEntryForm';
import { Auth } from './components/Auth';
import { LogOut } from 'lucide-react';
import { VoiceAssistant } from './components/VoiceAssistant';

// Firebase Imports
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, addDoc, query, where, onSnapshot, orderBy, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';

function App() {
  const [user, setUser] = useState(null);
  const [entries, setEntries] = useState([]);
  const [isWriting, setIsWriting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({
          uid: currentUser.uid,
          username: currentUser.displayName || currentUser.email.split('@')[0],
          email: currentUser.email
        });
      } else {
        setUser(null);
        setEntries([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Firestore Listener (Real-time updates)
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "entries"),
      where("userId", "==", user.uid)
      // orderBy("date", "desc") removed to avoid manual index creation
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Sort client-side
      notes.sort((a, b) => new Date(b.date) - new Date(a.date));
      setEntries(notes);
    }, (error) => {
      console.error("Error fetching notes:", error);
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogout = () => {
    signOut(auth);
  };

  const handleSave = async (content, audio, image) => {
    if (!user) return;
    try {
      await addDoc(collection(db, "entries"), {
        userId: user.uid,
        content,
        audio: audio || null,
        image: image || null,
        date: new Date().toISOString()
      });
      setIsWriting(false);
    } catch (e) {
      console.error("Error adding document: ", e);
      alert("Error al guardar en la nube.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "entries", id));
    } catch (e) {
      console.error("Error deleting doc", e);
    }
  };

  const handleUpdate = async (id, newContent, mode = 'replace') => {
    try {
      const entryRef = doc(db, "entries", id);
      // We need current content if appending, but 'entries' state has it.
      const currentEntry = entries.find(e => e.id === id);
      if (!currentEntry) return;

      const finalContent = mode === 'append'
        ? (currentEntry.content ? currentEntry.content + ' ' + newContent : newContent)
        : newContent;

      await updateDoc(entryRef, {
        content: finalContent
      });
    } catch (e) {
      console.error("Error updating doc", e);
    }
  };

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>Cargando...</div>;
  }

  if (!user) {
    return <Auth onLogin={() => { }} />;
  }

  return (
    <div style={{ paddingBottom: '80px' }}>
      <header style={{
        marginBottom: '32px',
        paddingTop: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
          >
            <div style={{
              background: 'linear-gradient(135deg, var(--primary-color), #c084fc)',
              padding: '10px',
              borderRadius: '12px',
              display: 'flex'
            }}>
              <BookOpen color="white" size={24} />
            </div>
            <div>
              <h1 style={{ marginBottom: 0, fontSize: '1.75rem' }}>Hola, {user.username}</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {entries.length} {entries.length === 1 ? 'recuerdo' : 'recuerdos'} guardados
              </p>
            </div>
          </motion.div>
        </div>

        <button
          onClick={handleLogout}
          className="btn-ghost"
          style={{ color: 'var(--danger-color)' }}
        >
          <LogOut size={24} />
        </button>
      </header>

      <main>
        <AnimatePresence mode="popLayout">
          {entries.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: 'var(--text-secondary)'
              }}
            >
              <p style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Tu diario está vacío.</p>
              <p>Empieza a escribir tus recuerdos hoy.</p>
            </motion.div>
          ) : (
            entries.map((entry, index) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                index={index}
                onDelete={handleDelete}
              />
            ))
          )}
        </AnimatePresence>
      </main>

      {/* Voice Assistant */}
      <VoiceAssistant user={user} entries={entries} onSave={handleSave} onUpdate={handleUpdate} onDelete={handleDelete} />

      {/* Floating Action Button */}
      <motion.button
        className="btn-primary"
        onClick={() => setIsWriting(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        style={{
          position: 'fixed',
          bottom: '32px',
          right: '24px',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 30px rgba(139, 92, 246, 0.5)',
          zIndex: 40
        }}
      >
        <Plus size={32} />
      </motion.button>

      {/* Writing Modal */}
      <AnimatePresence>
        {isWriting && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsWriting(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(4px)',
                zIndex: 45
              }}
            />
            <NewEntryForm
              onSave={handleSave}
              onCancel={() => setIsWriting(false)}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
