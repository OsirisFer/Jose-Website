'use client';

import { useState } from 'react';
import styles from './BookingWizard.module.css';
import { cancelRecurring } from '@/lib/booking';

export default function RecurringManagement({ patientCode, recurring, onCancelled, onModified, onCancel }) {
    const [loading, setLoading] = useState(false);
    const [pendingAction, setPendingAction] = useState(null); // 'cancel' | 'modify' | null
    const [error, setError] = useState('');

    const handleCancel = async () => {
        setLoading(true);
        setError('');
        try {
            await cancelRecurring(patientCode);
            onCancelled();
        } catch (err) {
            setError('Error al cancelar: ' + err.message);
            setLoading(false);
        }
    };

    const handleModify = async () => {
        setLoading(true);
        setError('');
        try {
            await cancelRecurring(patientCode);
            onModified();
        } catch (err) {
            setError('Error al modificar: ' + err.message);
            setLoading(false);
        }
    };

    return (
        <div className={styles.step}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Tu horario fijo semanal</h3>
                <button onClick={onCancel} className={styles.textBtn}>✕ Cerrar</button>
            </div>

            <div style={{ background: '#f5f0eb', padding: '1.25rem', borderRadius: '12px', margin: '1.5rem 0' }}>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '1.05rem' }}>
                    <strong>📅 Día:</strong> Todos los {recurring.day}
                </p>
                <p style={{ margin: 0, fontSize: '1.05rem' }}>
                    <strong>🕐 Hora:</strong> {recurring.time} hs
                </p>
            </div>

            {!pendingAction && (
                <>
                    <p style={{ color: 'var(--foreground)', marginBottom: '1rem' }}>
                        Ya tenés un horario fijo reservado. ¿Querés modificarlo o cancelarlo?
                    </p>
                    {error && <p className={styles.error}>{error}</p>}
                    <div className={styles.buttons}>
                        <button className={styles.backBtn} onClick={() => setPendingAction('cancel')}>
                            Cancelar horario fijo
                        </button>
                        <button className="btn-primary" onClick={() => setPendingAction('modify')}>
                            Modificar horario
                        </button>
                    </div>
                </>
            )}

            {pendingAction === 'cancel' && (
                <>
                    <p style={{ color: 'var(--foreground)', marginBottom: '1rem' }}>
                        ¿Confirmás cancelar tu horario fijo semanal? Vas a perder tu lugar reservado y todas las sesiones futuras se eliminarán del calendario.
                    </p>
                    {error && <p className={styles.error}>{error}</p>}
                    <div className={styles.buttons}>
                        <button className={styles.backBtn} onClick={() => setPendingAction(null)} disabled={loading}>
                            ← Volver
                        </button>
                        <button
                            className="btn-primary"
                            onClick={handleCancel}
                            disabled={loading}
                            style={{ background: '#b14b3a' }}
                        >
                            {loading ? 'Cancelando...' : 'Sí, cancelar definitivamente'}
                        </button>
                    </div>
                </>
            )}

            {pendingAction === 'modify' && (
                <>
                    <p style={{ color: 'var(--foreground)', marginBottom: '1rem' }}>
                        Para modificar tu horario, vamos a cancelar el actual y vas a poder elegir uno nuevo. ¿Continuamos?
                    </p>
                    {error && <p className={styles.error}>{error}</p>}
                    <div className={styles.buttons}>
                        <button className={styles.backBtn} onClick={() => setPendingAction(null)} disabled={loading}>
                            ← Volver
                        </button>
                        <button
                            className="btn-primary"
                            onClick={handleModify}
                            disabled={loading}
                        >
                            {loading ? 'Procesando...' : 'Sí, elegir otro horario'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
