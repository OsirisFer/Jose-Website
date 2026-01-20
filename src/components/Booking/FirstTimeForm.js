import { useState } from 'react';
import styles from './BookingWizard.module.css'; // Reusing styles

export default function FirstTimeForm({ onBack }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: '',
        honeypot: ''
    });
    const [status, setStatus] = useState('idle'); // idle, submitting, success, error

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('submitting');

        try {
            const res = await fetch('/api/first-time', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setStatus('success');
            } else {
                setStatus('error');
            }
        } catch (error) {
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <div className={styles.success}>
                <div className={styles.checkmark}>✓</div>
                <h3>¡Solicitud Enviada!</h3>
                <p>Hemos recibido tus datos correctamente.</p>
                <p>Josefina se pondrá en contacto contigo a la brevedad para coordinar una entrevista telefónica.</p>
                <button className={styles.backBtn} onClick={onBack}>Volver al inicio</button>
            </div>
        );
    }

    return (
        <div className={styles.step}>
            <h3>Solicitar Entrevista (Primera Vez)</h3>
            <p style={{ marginBottom: '1rem' }}>
                Para garantizar la mejor atención, Josefina realiza una breve entrevista telefónica antes de la primera sesión. Por favor completa tus datos.
            </p>

            <div className={styles.formGroup}>
                <label>Nombre Completo</label>
                <input
                    type="text"
                    placeholder="Tu nombre"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
            </div>

            <div className={styles.formGroup}>
                <label>Email</label>
                <input
                    type="email"
                    placeholder="tucorreo@ejemplo.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
            </div>

            <div className={styles.formGroup}>
                <label>Teléfono</label>
                <input
                    type="tel"
                    placeholder="Número de contacto"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
            </div>

            <div className={styles.formGroup}>
                <label>Mensaje Breve (Opcional)</label>
                <textarea
                    rows={3}
                    placeholder="Motivo de consulta..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className={styles.textarea}
                />
            </div>

            {/* Honeypot */}
            <input
                type="text"
                style={{ display: 'none' }}
                value={formData.honeypot}
                onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
            />

            {status === 'error' && <p className={styles.error}>Hubo un error al enviar. Intenta nuevamente.</p>}

            <div className={styles.buttons}>
                <button className={styles.backBtn} onClick={onBack}>Atrás</button>
                <button
                    className="btn-primary"
                    onClick={handleSubmit}
                    disabled={!formData.name || !formData.email || !formData.phone || status === 'submitting'}
                >
                    {status === 'submitting' ? 'Enviando...' : 'Enviar Solicitud'}
                </button>
            </div>
        </div>
    );
}
