'use client';

import { useState, useEffect } from 'react';
import styles from './BookingWizard.module.css';
import recurringStyles from './RecurringWizard.module.css';
import { getWeeklyAvailability, bookRecurring } from '@/lib/booking';

const WEEKDAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

export default function RecurringWizard({ patientCode, onCancel, onBackToTypeSelector }) {
    const [step, setStep] = useState(1);
    const [days, setDays] = useState([]);
    const [selectedDay, setSelectedDay] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', honeypot: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!patientCode) return;
        setLoading(true);
        setError('');
        getWeeklyAvailability(patientCode).then(data => {
            setLoading(false);
            if (data.error) {
                setError('Error al cargar la disponibilidad semanal.');
            } else {
                setDays(data.days || []);
            }
        }).catch(() => {
            setLoading(false);
            setError('Error de conexión.');
        });
    }, [patientCode]);

    const handleSelectSlot = (day, slot) => {
        setSelectedDay(day);
        setSelectedSlot(slot);
    };

    const handleNext = () => {
        if (step === 1 && selectedDay && selectedSlot) {
            setStep(2);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        try {
            await bookRecurring({
                firstDate: selectedDay.date,
                time: selectedSlot,
                dayName: selectedDay.day,
                ...formData,
            }, patientCode);
            setStep(3);
        } catch (err) {
            setError('Error al reservar: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.wizard}>
            {step === 1 && (
                <div className={styles.step}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3>Paso 1: Elegí tu horario fijo</h3>
                        <button onClick={onCancel} className={styles.textBtn}>✕ Cancelar</button>
                    </div>

                    <p style={{ marginBottom: '1rem', color: 'var(--foreground)', background: '#f0f0f0', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem' }}>
                        Elegí el día y hora que quieras como tu lugar fijo. Tu sesión se repetirá todas las semanas en ese mismo horario.
                    </p>

                    {loading && <p>Cargando disponibilidad semanal...</p>}
                    {error && <p className={styles.error}>{error}</p>}

                    {!loading && !error && (
                        <div className={recurringStyles.weekGrid}>
                            {WEEKDAYS.map(dayName => {
                                const day = days.find(d => d.day === dayName);
                                return (
                                    <div key={dayName} className={recurringStyles.dayColumn}>
                                        <div className={recurringStyles.dayHeader}>{dayName}</div>
                                        {!day || !day.active ? (
                                            <p className={recurringStyles.empty}>Sin atención</p>
                                        ) : day.slots.length === 0 ? (
                                            <p className={recurringStyles.empty}>Sin disponibilidad</p>
                                        ) : (
                                            <div className={recurringStyles.daySlots}>
                                                {day.slots.map(slot => {
                                                    const isActive = selectedDay?.day === day.day && selectedSlot === slot;
                                                    return (
                                                        <button
                                                            key={`${day.day}-${slot}`}
                                                            className={`${styles.slotBtn} ${isActive ? styles.active : ''}`}
                                                            onClick={() => handleSelectSlot(day, slot)}
                                                        >
                                                            {slot}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className={styles.buttons}>
                        <button className={styles.backBtn} onClick={onBackToTypeSelector}>← Atrás</button>
                        <button
                            className="btn-primary"
                            disabled={!selectedSlot}
                            onClick={handleNext}
                        >
                            Continuar
                        </button>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className={styles.step}>
                    <h3>Paso 2: Tus Datos</h3>
                    <p style={{ background: '#f5f0eb', padding: '0.75rem', borderRadius: '8px', fontSize: '0.95rem', marginBottom: '1rem' }}>
                        Tu horario fijo: <strong>todos los {selectedDay.day} a las {selectedSlot} hs</strong>.<br />
                        Primera sesión: <strong>{new Date(`${selectedDay.date}T12:00:00`).toLocaleDateString('es-UY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong>.
                    </p>
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
                        <input
                            type="text"
                            style={{ display: 'none' }}
                            value={formData.honeypot}
                            onChange={e => setFormData({ ...formData, honeypot: e.target.value })}
                        />
                    </div>
                    {error && <p className={styles.error}>{error}</p>}
                    <div className={styles.buttons}>
                        <button className={styles.backBtn} onClick={() => setStep(1)}>Atrás</button>
                        <button
                            className="btn-primary"
                            disabled={!formData.name || !formData.email || loading}
                            onClick={handleSubmit}
                        >
                            {loading ? 'Reservando...' : 'Confirmar horario fijo'}
                        </button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className={styles.success}>
                    <div className={styles.checkmark}>✓</div>
                    <h3>¡Horario fijo confirmado!</h3>
                    <p>
                        Tu sesión semanal con Josefina queda fijada todos los <strong>{selectedDay.day} a las {selectedSlot} hs</strong>.
                    </p>
                    <p>
                        Primera sesión: <strong>{new Date(`${selectedDay.date}T12:00:00`).toLocaleDateString('es-UY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong>.
                    </p>
                    <p>Se envió un correo de confirmación a {formData.email}.</p>
                    <button className={styles.backBtn} onClick={onCancel}>Volver al inicio</button>
                </div>
            )}
        </div>
    );
}
