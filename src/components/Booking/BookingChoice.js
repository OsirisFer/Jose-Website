'use client';

import { useState } from 'react';
import BookingWizard from './BookingWizard';
import RecurringWizard from './RecurringWizard';
import RecurringManagement from './RecurringManagement';
import BookingTypeSelector from './BookingTypeSelector';
import FirstTimeForm from './FirstTimeForm';
import BookingCodeInput from './BookingCodeInput';
import styles from './BookingWizard.module.css';

export default function BookingChoice({ whatsappNumber, whatsappMessage }) {
    // LANDING | FIRST_TIME | CODE_ENTRY | TYPE_SELECTOR | BOOKING | RECURRING | MANAGE_RECURRING
    const [mode, setMode] = useState('LANDING');
    const [patientCode, setPatientCode] = useState(null);
    const [isFirstInterviewDone, setIsFirstInterviewDone] = useState(true);
    const [recurring, setRecurring] = useState(null);

    const handlePatientCodeValid = (code, firstInterviewDone, recurringSchedule) => {
        setPatientCode(code);
        setIsFirstInterviewDone(firstInterviewDone);
        setRecurring(recurringSchedule || null);
        if (recurringSchedule) {
            setMode('MANAGE_RECURRING');
        } else {
            setMode('TYPE_SELECTOR');
        }
    };

    const resetToLanding = () => {
        setMode('LANDING');
        setPatientCode(null);
        setRecurring(null);
    };

    return (
        <section id="book" className={`section-padding ${styles.booking}`}>
            <div className="container">

                {(mode === 'LANDING' || mode === 'CODE_ENTRY') && (
                    <h2 className={styles.heading}>Reservar Turno</h2>
                )}

                <div className={styles.wizard}>

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

                    {mode === 'FIRST_TIME' && (
                        <FirstTimeForm
                            onBack={() => setMode('LANDING')}
                            whatsappNumber={whatsappNumber}
                            whatsappMessage={whatsappMessage}
                        />
                    )}

                    {mode === 'CODE_ENTRY' && (
                        <BookingCodeInput
                            onValidCode={handlePatientCodeValid}
                            onBack={() => setMode('LANDING')}
                        />
                    )}

                    {mode === 'TYPE_SELECTOR' && (
                        <BookingTypeSelector
                            onChooseSingle={() => setMode('BOOKING')}
                            onChooseRecurring={() => setMode('RECURRING')}
                            onCancel={resetToLanding}
                        />
                    )}

                    {mode === 'BOOKING' && (
                        <BookingWizard
                            patientCode={patientCode}
                            isFirstInterviewDone={isFirstInterviewDone}
                            onCancel={resetToLanding}
                        />
                    )}

                    {mode === 'RECURRING' && (
                        <RecurringWizard
                            patientCode={patientCode}
                            onCancel={resetToLanding}
                            onBackToTypeSelector={() => setMode('TYPE_SELECTOR')}
                        />
                    )}

                    {mode === 'MANAGE_RECURRING' && recurring && (
                        <RecurringManagement
                            patientCode={patientCode}
                            recurring={recurring}
                            onCancelled={() => {
                                setRecurring(null);
                                setMode('TYPE_SELECTOR');
                            }}
                            onModified={() => {
                                setRecurring(null);
                                setMode('RECURRING');
                            }}
                            onCancel={resetToLanding}
                        />
                    )}

                </div>
            </div>
        </section>
    );
}
