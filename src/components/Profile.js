import styles from './Profile.module.css';

export default function Profile() {
    return (
        <section className={`section-padding ${styles.profile}`}>
            <div className="container">
                <div className={styles.grid}>
                    <div className={styles.bio}>
                        <h2 className={styles.heading}>Sobre Josefina</h2>
                        <p className={styles.text}>
                            Como psicóloga licenciada con más de 10 años de experiencia, me dedico a ayudar a las personas a navegar los desafíos de la vida con resiliencia y empatía. Mi práctica se basa en la escucha activa, técnicas basadas en evidencia y un profundo respeto por el camino único de cada persona.
                        </p>
                        <p className={styles.text}>
                            Creo que la terapia es un proceso colaborativo. Juntos, trabajamos para descubrir los patrones que ya no te sirven y construir nuevos caminos hacia una vida más auténtica y plena.
                        </p>
                        <div className={styles.credentials}>
                            <div>
                                <strong>Licencia</strong>
                                <p>123456</p>
                            </div>
                            <div>
                                <strong>Educación</strong>
                                <p>Lic. Psicología Clínica</p>
                            </div>
                            <div>
                                <strong>Enfoque</strong>
                                <p>Ansiedad, Depresión, Crecimiento Personal</p>
                            </div>
                        </div>
                    </div>
                    <div className={styles.philosophy}>
                        <h3 className={styles.subHeading}>Mi Filosofía</h3>
                        <blockquote className={styles.quote}>
                            "Sanar no se trata de convertirte en alguien más, sino de dejar de ser todo lo que no eres realmente."
                        </blockquote>
                    </div>
                </div>
            </div>
        </section>
    );
}
