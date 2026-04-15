import styles from './TherapeuticApproach.module.css';

export default function TherapeuticApproach() {
    return (
        <section className={`section-padding ${styles.approach}`}>
            <div className="container">
                <div className={styles.content}>
                    <h2 className={styles.heading}>Mi Enfoque</h2>
                    <p className={styles.text}>
                        Mi enfoque es <strong style={{ color: 'var(--wing-salmon-dark)' }}>integral</strong> — entiendo a cada persona desde su historia, sus vínculos y su contexto, sin reducir el malestar a una sola causa.
                    </p>
                    <p className={styles.text}>
                        Trabajo desde una mirada que contempla la dimensión emocional, cognitiva y relacional de cada proceso, con un acompañamiento personalizado y desde el respeto por la singularidad.
                    </p>
                    <div className={styles.tags}>
                        <span className={styles.tag}>Empatía</span>
                        <span className={styles.tag}>Visión Integral</span>
                        <span className={styles.tag}>Confidencialidad</span>
                        <span className={styles.tag}>Respeto</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
