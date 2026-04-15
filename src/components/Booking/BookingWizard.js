'use client';

import { useState, useEffect } from 'react';
import styles from './BookingWizard.module.css';
import { getAvailableSlots, bookAppointment } from '@/lib/booking';

export default function BookingWizard({ patientCode, isFirstInterviewDone, onCancel }) {
    const [step, setStep] = useState(1);
    const [date, setDate] = useState('');
    const [slots, setSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', honeypot: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const sessionType = isFirstInterviewDone ? 'Sesión Standard (60 min)' : 'Primera Entrevista (30 min)';

    // Fetch slots when date changes
    useEffect(() => {
        if (date && patientCode) {
            setLoading(true);
            setError('');
            getAvailableSlots(date, patientCode).then(data => {
                setLoading(false);
                if (data.error) {
                    setError('Error al cargar turnos. Verifica tu código.');
                    setSlots([]);
                } else {
                    setSlots(data.slots || data); // Handle object or array return
                }
            }).catch(() => {
                setLoading(false);
                setError('Error de conexión.');
            });
        }
    }, [date, patientCode]);

    const handleDateChange = (e) => {
        setDate(e.target.value);
        setSelectedSlot(null);
    };

    const handleSlotSelect = (slot) => {
        setSelectedSlot(slot);
    };

    const handleNext = () => {
        if (step === 1 && date && selectedSlot) {
            setStep(2);
        } else if (step === 2) {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await bookAppointment({ date, time: selectedSlot, ...formData }, patientCode);
            setStep(3);
        } catch (err) {
            alert('Error al reservar: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.wizard}>
            {step === 1 && (
                <div className={styles.step}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3>Paso 1: Elige un Horario</h3>
                        <button onClick={onCancel} className={styles.textBtn}>✕ Cancelar</button>
                    </div>

                    <p style={{ marginBottom: '1rem', color: 'var(--foreground)', background: '#f0f0f0', padding: '0.5rem', borderRadius: '8px', fontSize: '0.9rem' }}>
                        <strong>Tipo de turno:</strong> {sessionType}
                    </p>

                    <div className={styles.controls}>
                        <label className={styles.label}>
                            Selecciona una fecha:
                            <input
                                type="date"
                                className={styles.dateInput}
                                value={date}
                                onChange={handleDateChange}
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </label>
                    </div>

                    {loading && <p>Buscando disponibilidad...</p>}
                    {error && <p className={styles.error}>{error}</p>}

                    {!loading && date && !error && (
                        <div className={styles.slots}>
                            {slots.length > 0 ? (
                                slots.map(slot => (
                                    <button
                                        key={slot}
                                        className={`${styles.slotBtn} ${selectedSlot === slot ? styles.active : ''}`}
                                        onClick={() => handleSlotSelect(slot)}
                                    >
                                        {slot}
                                    </button>
                                ))
                            ) : (
                                <p>No hay turnos disponibles. (Fines de semana cerrado).</p>
                            )}
                        </div>
                    )}

                    <button
                        className="btn-primary"
                        disabled={!selectedSlot}
                        onClick={handleNext}
                        style={{ marginTop: '2rem', display: 'block', marginLeft: 'auto' }}
                    >
                        Continuar
                    </button>
                </div>
            )}

            {step === 2 && (
                <div className={styles.step}>
                    <h3>Paso 2: Tus Datos</h3>
                    <div className={styles.formGroup}>
                        <input
                            placeholder="Nombre Completo"
                            className={styles.input}
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                        <input
                            placeholder="Email"
                            type="email"
                            className={styles.input}
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                        <input
                            placeholder="Teléfono"
                            type="tel"
                            className={styles.input}
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        />
                        {/* Honeypot */}
                        <input
                            type="text"
                            style={{ display: 'none' }}
                            value={formData.honeypot}
                            onChange={e => setFormData({ ...formData, honeypot: e.target.value })}
                        />
                    </div>
                    <div className={styles.buttons}>
                        <button className={styles.backBtn} onClick={() => setStep(1)}>Atrás</button>
                        <button
                            className="btn-primary"
                            disabled={!formData.name || !formData.email || loading}
                            onClick={handleSubmit}
                            style={{  }}
                        >
                            {loading ? 'Reservando...' : 'Confirmar Reserva'}
                        </button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className={styles.success}>
                    <div className={styles.checkmark}>✓</div>
                    <h3>¡Reserva Confirmada!</h3>
                    <p>
                        Tu cita con Josefina está agendada para el <strong>{new Date(`${date}T12:00:00`).toLocaleDateString('es-UY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} a las {selectedSlot}</strong>.
                    </p>
                    <p>Se ha enviado un correo de confirmación a {formData.email}.</p>
                    <button className={styles.backBtn} onClick={onCancel}>Volver al inicio</button>
                </div>
            )}
        </div>
    );
}
