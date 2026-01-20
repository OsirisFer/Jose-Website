
import styles from './ImmediateHelp.module.css';

export default function ImmediateHelp() {
    return (
        <section className={styles.section}>
            <div className="container">
                <h2 className={styles.title}>Ayuda Inmediata</h2>
                <p className={styles.disclaimer}>
                    Si estás en riesgo o necesitás ayuda urgente, podés comunicarte gratuitamente con:
                </p>

                <div className={styles.resources}>
                    <a href="tel:08000767" className={styles.card}>
                        <span className={styles.label}>Línea de Prevención del Suicidio</span>
                        <span className={styles.number}>0800 0767 / *0767</span>
                    </a>

                    <a href="tel:08001920" className={styles.card}>
                        <span className={styles.label}>Línea de Apoyo Emocional</span>
                        <span className={styles.number}>0800 1920</span>
                    </a>
                </div>

                <p className={styles.emergencyNote}>
                    En caso de emergencia médica inmediata, contactá a los servicios de emergencia de tu localidad (911).
                </p>
            </div>
        </section>
    );
}
