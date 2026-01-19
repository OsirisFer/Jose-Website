import styles from './TherapeuticApproach.module.css';

export default function TherapeuticApproach() {
    return (
        <section className={`section-padding ${styles.approach}`}>
            <div className="container">
                <div className={styles.content}>
                    <h2 className={styles.heading}>Mi Enfoque</h2>
                    <p className={styles.text}>
                        Integro la <strong>Terapia Cognitivo-Conductual (TCC)</strong> con <strong>Mindfulness (Atención Plena)</strong> para ayudarte a comprender la conexión entre tus pensamientos, sentimientos y comportamientos.
                    </p>
                    <p className={styles.text}>
                        Mis sesiones están centradas en el cliente, lo que significa que avanzamos a tu ritmo. Ya sea que estés lidiando con estrés agudo, trauma o navegando una transición de vida, ofrezco un espacio cálido y sin juicios donde puedes sentirte escuchado y apoyado.
                    </p>
                    <div className={styles.tags}>
                        <span className={styles.tag}>Empatía</span>
                        <span className={styles.tag}>Evidencia Científica</span>
                        <span className={styles.tag}>Holístico</span>
                        <span className={styles.tag}>Confidencialidad</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
