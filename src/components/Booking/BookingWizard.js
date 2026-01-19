'use client';

import { useState, useEffect } from 'react';
import styles from './BookingWizard.module.css';
import { getAvailableSlots, bookAppointment } from '@/lib/booking';

export default function BookingWizard() {
    const [step, setStep] = useState(1);
    const [date, setDate] = useState('');
    const [slots, setSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch slots when date changes
    useEffect(() => {
        if (date) {
            setLoading(true);
            getAvailableSlots(date).then(data => {
                setSlots(data);
                setLoading(false);
            });
        }
    }, [date]);

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
        await bookAppointment({ date, time: selectedSlot, ...formData });
        setLoading(false);
        setStep(3);
    };

    return (
        <section id="book" className={`section-padding ${styles.booking}`}>
            <div className="container">
                <h2 className={styles.heading}>Reservar Turno</h2>
                <div className={styles.wizard}>

                    {step === 1 && (
                        <div className={styles.step}>
                            <h3>Paso 1: Elige un Horario</h3>
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

                            {!loading && date && (
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
                                        <p>No hay turnos disponibles para esta fecha. Por favor intenta otro día (fines de semana cerrado).</p>
                                    )}
                                </div>
                            )}

                            <button
                                className="btn-primary"
                                disabled={!selectedSlot}
                                onClick={handleNext}
                                style={{ marginTop: '2rem' }}
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
                            </div>
                            <div className={styles.buttons}>
                                <button className={styles.backBtn} onClick={() => setStep(1)}>Atrás</button>
                                <button
                                    className="btn-primary"
                                    disabled={!formData.name || !formData.email}
                                    onClick={handleSubmit}
                                >
                                    Confirmar Reserva
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className={styles.success}>
                            <div className={styles.checkmark}>✓</div>
                            <h3>¡Reserva Confirmada!</h3>
                            <p>
                                Tu cita con Josefina está agendada para el <strong>{date} a las {selectedSlot}</strong>.
                            </p>
                            <p>Se ha enviado un correo de confirmación a {formData.email}.</p>
                        </div>
                    )}

                </div>
            </div>
        </section>
    );
}
