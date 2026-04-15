import AnimatedLogo from './Logo/AnimatedLogo';
import styles from './Profile.module.css';

export default function Profile() {
    return (
        <section className={`section-padding ${styles.profile}`}>
            <div className="container">
<div className={styles.grid}>
                    <div className={styles.bio}>
                        <h2 className={styles.heading}>Sobre mí</h2>
                        <p className={styles.text}>
                            Licenciada en Psicología desde un enfoque clínico integral.
                            <br />
                            Como psicóloga, crear un espacio seguro y cercano es primordial, por eso, he creado este espacio para ti.
                            <br />
                            Mi trabajo se centra en acompañar procesos de autoconocimiento, gestión emocional y búsqueda de bienestar.
                            <br />
                            Creo que la terapia es un proceso colaborativo. Juntos, trabajamos para descubrir los patrones que ya no te sirven y construir nuevos caminos hacia una vida más auténtica y plena.
                        </p>
                        <div className={styles.credentials}>
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
                        {/* Ambient butterfly watermark — behind the quote */}
                        <AnimatedLogo mode="section-ambient" />
                        <h3 className={styles.subHeading}>Mi Filosofía</h3>
                        <blockquote className={styles.quote}>
                            &ldquo;La psicoterapia es un espacio construído por la escucha, la reflexión y el compromiso por el cambio.
                            Un lugar en donde cada individuo es acompañado desde una mirada integral y respetuosa desde la singularidad.
                            Porque cada proceso es único y merece ser acompañado desde el cuidado y el respeto, priorizando siempre el bienestar y enfatizando la salud mental.&rdquo;
                        </blockquote>
                    </div>
                </div>
            </div>
        </section>
    );
}
