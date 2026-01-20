import { useState } from 'react';
import styles from './BookingWizard.module.css';

export default function BookingCodeInput({ onValidCode, onBack }) {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/patient/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            });

            const data = await res.json();

            if (res.ok && data.valid) {
                onValidCode(code);
            } else {
                setError('Código inválido o inactivo. Intenta nuevamente.');
            }
        } catch (err) {
            setError('Error al verificar. Intenta más tarde.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.step}>
            <h3>Acceso Pacientes</h3>
            <p>Ingresa tu código de paciente para reservar un turno.</p>

            <form onSubmit={handleVerify} className={styles.formGroup}>
                <input
                    type="text"
                    placeholder="Ej: JF-001"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className={styles.input}
                />
                {error && <p className={styles.error}>{error}</p>}

                <div className={styles.buttons}>
                    <button type="button" className={styles.backBtn} onClick={onBack}>Atrás</button>
                    <button type="submit" className="btn-primary" disabled={!code || loading}>
                        {loading ? 'Verificando...' : 'Continuar'}
                    </button>
                </div>
            </form>
        </div>
    );
}
