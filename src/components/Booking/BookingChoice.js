'use client';

import { useState } from 'react';
import BookingWizard from './BookingWizard';
import FirstTimeForm from './FirstTimeForm';
import BookingCodeInput from './BookingCodeInput';
import styles from './BookingWizard.module.css';

export default function BookingChoice({ whatsappNumber, whatsappMessage }) {
    const [mode, setMode] = useState('LANDING'); // LANDING, FIRST_TIME, CODE_ENTRY, BOOKING
    const [patientCode, setPatientCode] = useState(null);
    const [isFirstInterviewDone, setIsFirstInterviewDone] = useState(true);


    const handlePatientCodeValid = (code, firstInterviewDone) => {
        setPatientCode(code);
        setIsFirstInterviewDone(firstInterviewDone);
        setMode('BOOKING');
    };

    return (
        <section id="book" className={`section-padding ${styles.booking}`}>
            <div className="container">

                {(mode === 'LANDING' || mode === 'CODE_ENTRY') && (
                    <h2 className={styles.heading}>Reservar Turno</h2>
                )}

                <div className={styles.wizard}>

                    {/* INITIAL CHOICE SCREEN */}
                    {mode === 'LANDING' && (
                        <div className={styles.choiceContainer}>
                            <p className={styles.subtitle} style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                Selecciona una opción para continuar:
                            </p>
                            <div className={styles.choiceButtons}>
                                <button
                                    className={styles.choiceBtn}
                                    onClick={() => setMode('FIRST_TIME')}
                                >
                                    <strong>Primera vez</strong>
                                    <small>Solicitar entrevista</small>
                                </button>

                                <button
                                    className={styles.choiceBtn}
                                    onClick={() => setMode('CODE_ENTRY')}
                                >
                                    <strong>Ya soy paciente</strong>
                                    <small>Reservar sesión</small>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* FIRST TIME FLOW */}
                    {mode === 'FIRST_TIME' && (
                        <FirstTimeForm
                            onBack={() => setMode('LANDING')}
                            whatsappNumber={whatsappNumber}
                            whatsappMessage={whatsappMessage}
                        />
                    )}

                    {/* EXISTING PATIENT: CODE ENTRY */}
                    {mode === 'CODE_ENTRY' && (
                        <BookingCodeInput
                            onValidCode={handlePatientCodeValid}
                            onBack={() => setMode('LANDING')}
                        />
                    )}

                    {/* EXISTING PATIENT: BOOKING WIZARD */}
                    {mode === 'BOOKING' && (
                        <BookingWizard
                            patientCode={patientCode}
                            isFirstInterviewDone={isFirstInterviewDone} // Pass prop
                            onCancel={() => {
                                setMode('LANDING');
                                setPatientCode(null);
                            }}
                        />
                    )}

                </div>
            </div>
        </section>
    );
}
