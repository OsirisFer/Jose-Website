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

                <div className={styles.formation}>
                    <h3 className={styles.formationHeading}>Formación</h3>
                    <div className={styles.formationGrid}>

                        <div className={styles.formationGroup}>
                            <span className={styles.formationLabel}>Posgrado</span>
                            <p className={styles.formationTitle}>Maestría Oficial Universitaria en Dirección y Gestión de Recursos Humanos</p>
                            <p className={styles.formationMeta}>Universidad Internacional de la Rioja (UNIR), España · 2026–2027</p>
                        </div>

                        <div className={styles.formationGroup}>
                            <span className={styles.formationLabel}>Grado</span>
                            <p className={styles.formationTitle}>Licenciatura en Psicología</p>
                            <p className={styles.formationMeta}>Instituto Universitario Francisco de Asís (UNIFA), Maldonado · 2025</p>
                        </div>

                        <div className={styles.formationGroup}>
                            <span className={styles.formationLabel}>Formación complementaria</span>
                            <ul className={styles.formationList}>
                                <li>Taller intensivo — Práctica Profesional en la Salud Mental, Lic. Daniela Figueiras Gamarra <span>(2025)</span></li>
                                <li>Seminario Académico sobre Prevención de la Conducta Suicida, Cure, Maldonado <span>(2024)</span></li>
                                <li>Curso Psicodiagnóstico Infantil, Centro Referencia, Uruguay <span>(2023)</span></li>
                                <li>Curso Prevención de Suicidios, Rotary Club Isla Gorriti, Uruguay <span>(2023)</span></li>
                                <li>Congreso de Delitos Sexuales, Centro de Formación de la Fiscalía General de la Nación, Uruguay <span>(2023)</span></li>
                                <li>Congreso Internacional de Prevención del Suicidio, Grupo Departamental de Prevención del Suicidio de Maldonado <span>(2022)</span></li>
                                <li>Curso de Maternología, Facultad de Psicología UdelaR <span>(2021)</span></li>
                                <li>Curso de Prevención del Suicidio en Personas Mayores, Resistiré ONG, Uruguay <span>(2020)</span></li>
                            </ul>
                        </div>

                    </div>
                </div>

            </div>
        </section>
    );
}
