import { useState } from 'react';
import styles from './BookingWizard.module.css';

export default function FirstTimeForm({ onBack, whatsappNumber, whatsappMessage }) {
    const [name, setName] = useState('');

    const handleWhatsAppClick = () => {
        if (!whatsappNumber) {
            alert('El número de WhatsApp no está configurado.');
            return;
        }

        if (!name.trim()) {
            alert('Por favor ingresa tu nombre.');
            return;
        }

        // Clean number
        const phone = whatsappNumber.replace(/[^0-9+]/g, '');

        // Replace placeholder with name
        let rawText = whatsappMessage || 'Hola Josefina, soy [Nombre]. Quisiera coordinar una entrevista.';
        rawText = rawText.replace('[Nombre]', name);

        const text = encodeURIComponent(rawText);

        window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
    };

    return (
        <div className={styles.step}>
            <h3>Solicitar Entrevista (Primera Vez)</h3>

            <div className={styles.success} style={{ padding: '1rem 0' }}>
                <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem', lineHeight: '1.6' }}>
                    Comunicate por WhatsApp para coordinar tu <strong>entrevista de 30 minutos</strong> con Josefina — un espacio para conocerte y evaluar cómo acompañarte mejor.
                </p>

                <div style={{ maxWidth: '400px', margin: '0 auto 2rem auto', textAlign: 'left' }}>
                    <label className={styles.label}>Tu Nombre Completo</label>
                    <input
                        type="text"
                        className={styles.input}
                        placeholder="Ej: María Perez"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <button
                    className="btn-primary"
                    onClick={handleWhatsAppClick}
                    disabled={!name.trim()}
                    style={{
                        backgroundColor: name.trim() ? '#25D366' : '#ccc',
                        color: '#fff',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '1.1rem',
                        padding: '1rem 2rem',
                        cursor: name.trim() ? 'pointer' : 'not-allowed'
                    }}
                >
                    <span>💬</span> Contactar por WhatsApp
                </button>
            </div>

            <div className={styles.buttons} style={{ justifyContent: 'center' }}>
                <button className={styles.backBtn} onClick={onBack}>Volver al inicio</button>
            </div>
        </div>
    );
}
