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

                    <div className={styles.formationDegrees}>
                        <div className={styles.degreeCard}>
                            <span className={styles.degreeTag}>Posgrado</span>
                            <p className={styles.degreeTitle}>Maestría Oficial Universitaria en Dirección y Gestión de Recursos Humanos</p>
                            <p className={styles.degreeMeta}>Universidad Internacional de la Rioja (UNIR) · España · 2026–2027</p>
                        </div>
                        <div className={styles.degreeCard}>
                            <span className={styles.degreeTag}>Grado</span>
                            <p className={styles.degreeTitle}>Licenciatura en Psicología</p>
                            <p className={styles.degreeMeta}>Instituto Universitario Francisco de Asís (UNIFA) · Maldonado · 2025</p>
                        </div>
                    </div>

                    <div className={styles.complementary}>
                        <p className={styles.complementaryLabel}>Formación complementaria</p>
                        <div className={styles.timeline}>
                            {[
                                { year: '2025', text: 'Taller intensivo — Práctica Profesional en la Salud Mental, Lic. Daniela Figueiras Gamarra' },
                                { year: '2024', text: 'Seminario Académico sobre Prevención de la Conducta Suicida, Cure, Maldonado' },
                                { year: '2023', text: 'Curso Psicodiagnóstico Infantil, Centro Referencia, Uruguay' },
                                { year: '2023', text: 'Curso Prevención de Suicidios, Rotary Club Isla Gorriti, Uruguay' },
                                { year: '2023', text: 'Congreso de Delitos Sexuales, Centro de Formación de la Fiscalía General de la Nación, Uruguay' },
                                { year: '2022', text: 'Congreso Internacional de Prevención del Suicidio, Grupo Departamental de Prevención del Suicidio de Maldonado' },
                                { year: '2021', text: 'Curso de Maternología, Facultad de Psicología UdelaR' },
                                { year: '2020', text: 'Curso de Prevención del Suicidio en Personas Mayores, Resistiré ONG, Uruguay' },
                            ].map((item, i) => (
                                <div key={i} className={styles.timelineItem}>
                                    <span className={styles.timelineDot} />
                                    <p className={styles.timelineText}>{item.text} <span className={styles.timelineYear}>({item.year})</span></p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
