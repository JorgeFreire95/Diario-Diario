import React, { useState, useRef, useEffect } from 'react';
import { Mic } from 'lucide-react';

export function VoiceAssistant({ user, entries, onSave, onUpdate, onDelete }) {
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);
    const synth = window.speechSynthesis;

    // Use refs to access latest data/funcs inside stable listeners
    const entriesRef = useRef(entries);
    // Add refs for handlers to avoid stale closures inside processCommand
    const onSaveRef = useRef(onSave);
    const onUpdateRef = useRef(onUpdate);
    const onDeleteRef = useRef(onDelete);
    const inactivityTimerRef = useRef(null);
    const userRef = useRef(user);

    useEffect(() => {
        entriesRef.current = entries;
        onSaveRef.current = onSave;
        onUpdateRef.current = onUpdate;
        onDeleteRef.current = onDelete;
        userRef.current = user;
    }, [entries, onSave, onUpdate, onDelete, user]);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.lang = 'es-ES';

            recognitionRef.current.onstart = () => {
                setIsListening(true);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current.onresult = (event) => {
                // Interaction detected, clear timeout
                if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);

                const transcript = event.results[0][0].transcript.toLowerCase();
                console.log("Comando detected:", transcript);
                processCommand(transcript);
            };

            recognitionRef.current.onerror = (event) => {
                console.error("Error voz:", event.error);
                setIsListening(false);
            };

            // Auto-start sequence
            const greetAndListen = () => {
                const fullUsername = userRef.current?.username || "amigo";
                const firstName = fullUsername.split(' ')[0];
                speak(`Hola ${firstName}, ¿en qué te puedo ayudar hoy?`, () => {
                    try {
                        recognitionRef.current.start();
                        // Start 4s inactivity timer
                        inactivityTimerRef.current = setTimeout(() => {
                            if (recognitionRef.current) {
                                recognitionRef.current.stop();
                                speak("Parece que no estás ahí. Me desactivaré por ahora.");
                            }
                        }, 4000);
                    } catch (e) {
                        console.error("Auto-start blocked", e);
                    }
                });
            };

            // Try to run auto-start (might be blocked by browser policy without interaction)
            // We wrap in a small timeout to ensure load
            setTimeout(greetAndListen, 1000);
        }

        return () => {
            if (recognitionRef.current) recognitionRef.current.abort();
            if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
        };
    }, []);

    const speak = (text, onEnd) => {
        if (synth.speaking) synth.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        if (onEnd) utterance.onend = onEnd;
        synth.speak(utterance);
    };

    const playAudio = (url, onEnd) => {
        const audio = new Audio(url);
        audio.onended = onEnd;
        audio.play().catch(e => {
            console.error("Error playing audio", e);
            if (onEnd) onEnd();
        });
    };

    const processCommand = (command) => {
        // Access latest state via refs
        const currentEntries = entriesRef.current;
        const currentSave = onSaveRef.current;
        const currentUpdate = onUpdateRef.current;
        const currentDelete = onDeleteRef.current;

        console.log("Procesando comando:", command);

        // --- PATRONES DE COMANDOS (REGEX MÁS FLEXIBLES) ---

        // 1. CREAR NOTA
        // Captura: "crear nota comprar leche", "nueva nota ir al medico", "anotar llamar a juan"
        // Permite "quisiera", "puedes", etc. al principio gracias al match.
        const createMatch = command.match(/(?:crear|nueva|escribir|anotar|apuntar)\s+nota\s+(.+)/i);
        if (createMatch) {
            const content = createMatch[1].trim();
            if (content) {
                currentSave(content);
                speak(`Anotado: ${content}`);
            }
            return;
        }
        // Caso: Usuario dice solo "crear nota" sin contenido
        if (/(crear|nueva|escribir|anotar)\s+nota$/.test(command)) {
            speak("¿Qué quieres que diga la nota?");
            return;
        }

        // 2. MODIFICAR/AGREGAR (Última nota)
        const modifyMatch = command.match(/(?:modificar|cambiar|editar|corregir)\s+(?:la\s+)?(?:última|ultima)\s+nota\s+(.+)/i);
        if (modifyMatch) {
            const content = modifyMatch[1].trim();
            if (currentEntries.length > 0) {
                currentUpdate(currentEntries[0].id, content, 'replace');
                speak("He actualizado la última nota.");
            } else {
                speak("No hay notas para modificar.");
            }
            return;
        }

        const appendMatch = command.match(/(?:agregar|añadir|sumar)\s+(?:a\s+)?(?:la\s+)?(?:última|ultima)\s+nota\s+(.+)/i);
        if (appendMatch) {
            const content = appendMatch[1].trim();
            if (currentEntries.length > 0) {
                currentUpdate(currentEntries[0].id, content, 'append');
                speak("Agregado a la última nota.");
            } else {
                speak("No tienes notas para agregar información.");
            }
            return;
        }

        // 3. BORRAR ÚLTIMA NOTA
        if (/(borrar|eliminar|quitar)\s+(?:la\s+)?(?:última|ultima)\s+nota/i.test(command)) {
            if (currentEntries.length > 0) {
                currentDelete(currentEntries[0].id);
                speak("Entendido, última nota eliminada.");
            } else {
                speak("No hay nada que borrar.");
            }
            return;
        }

        // 4. MANEJO DE FECHAS (LEER O BORRAR)
        let targetDate = null;

        // Detección flexible de fechas
        if (command.includes('hoy')) {
            targetDate = new Date();
        } else if (command.includes('ayer')) {
            targetDate = new Date();
            targetDate.setDate(targetDate.getDate() - 1);
        } else {
            const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
            const dateMatch = command.match(/(\d{1,2})\s+de\s+([a-z]+)/i);

            if (dateMatch) {
                const day = parseInt(dateMatch[1]);
                const monthStr = dateMatch[2].toLowerCase();
                const monthIndex = months.indexOf(monthStr);

                if (monthIndex !== -1) {
                    targetDate = new Date();
                    targetDate.setDate(day);
                    targetDate.setMonth(monthIndex);
                }
            }
        }

        if (targetDate) {
            // ¿Es para borrar?
            if (/(borrar|eliminar|quitar)/i.test(command)) {
                // Filtramos por fecha exacta (sin hora)
                const found = currentEntries.filter(e => {
                    const eDate = new Date(e.date);
                    return eDate.getDate() === targetDate.getDate() &&
                        eDate.getMonth() === targetDate.getMonth() &&
                        eDate.getFullYear() === targetDate.getFullYear();
                });

                if (found.length > 0) {
                    found.forEach(entry => currentDelete(entry.id));
                    speak(`He borrado los ${found.length} recuerdos de esa fecha.`);
                } else {
                    speak("No encontré notas de ese día para borrar.");
                }
            }
            // Si no es explícitamente borrar, asumimos que es LEER
            else {
                const dateString = targetDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
                speak(`Buscando recuerdos del ${dateString}...`, () => {
                    filterAndPlay(targetDate);
                });
            }
            return;
        }

        // Si llegamos aquí, no entendimos el comando
        speak("No te entendí bien. Prueba con: 'Crear nota [mensaje]', 'Borrar última nota' o 'Leer notas de hoy'.");
    };

    const filterAndPlay = (date) => {
        const currentEntries = entriesRef.current;
        const found = currentEntries.filter(e => {
            const eDate = new Date(e.date);
            return eDate.getDate() === date.getDate() &&
                eDate.getMonth() === date.getMonth() &&
                eDate.getFullYear() === date.getFullYear();
        });

        if (found.length === 0) {
            speak("No hay recuerdos guardados para ese día.");
            return;
        }

        speak(`Encontré ${found.length} recuerdos. Reproduciendo...`, () => {
            playSequence(found, 0);
        });
    };

    const playSequence = (list, index) => {
        if (index >= list.length) {
            speak("Fin de los recuerdos.");
            return;
        }

        const entry = list[index];
        const intro = `Recuerdo ${index + 1}.`;

        speak(intro, () => {
            if (entry.audio) {
                // Si tiene audio, lo reproducimos
                playAudio(entry.audio, () => {
                    // Pequeña pausa antes del siguiente
                    setTimeout(() => playSequence(list, index + 1), 1000);
                });
            } else {
                // Si es solo texto, lo leemos
                speak(entry.content || "Recuerdo vacío", () => {
                    setTimeout(() => playSequence(list, index + 1), 1000);
                });
            }
        });
    };

    const toggleListen = () => {
        if (!recognitionRef.current) {
            alert("Tu navegador no soporta reconocimiento de voz.");
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
            if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
        } else {
            speak("Escuchando...", () => {
                recognitionRef.current.start();
            });
        }
    };

    return (
        <button
            onClick={toggleListen}
            className={`glass`}
            style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: isListening ? '2px solid #ef4444' : '1px solid var(--glass-border)',
                background: isListening ? 'rgba(239, 68, 68, 0.2)' : 'var(--glass-bg)',
                zIndex: 100,
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(10px)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
            }}
            aria-label="Asistente de Voz"
        >
            <Mic
                size={28}
                color={isListening ? '#ef4444' : 'var(--primary-color)'}
                style={{ animation: isListening ? 'pulse 1.5s infinite' : 'none' }}
            />
        </button>
    );
}
