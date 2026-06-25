'use client';

import styles from './BookingWizard.module.css';

export default function BookingTypeSelector({ onChooseSingle, onChooseRecurring, onCancel }) {
    return (
        <div className={styles.step}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>¿Cómo querés reservar?</h3>
                <button onClick={onCancel} className={styles.textBtn}>✕ Cancelar</button>
            </div>

            <p style={{ color: 'var(--foreground)', marginBottom: '1.5rem' }}>
                Elegí la modalidad que mejor se adapte a vos.
            </p>

            <div className={styles.choiceButtons}>
                <button className={styles.choiceBtn} onClick={onChooseSingle}>
                    <strong>Solo por esta semana</strong>
                    <small>Reservá una sesión puntual eligiendo la fecha</small>
                </button>

                <button className={styles.choiceBtn} onClick={onChooseRecurring}>
                    <strong>Fijar horario semanal</strong>
                    <small>Reservá tu lugar fijo todas las semanas</small>
                </button>
            </div>
        </div>
    );
}
