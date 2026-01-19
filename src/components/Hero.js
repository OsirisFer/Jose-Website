import Image from 'next/image';
import styles from './Hero.module.css';

export default function Hero() {
    return (
        <section className={styles.hero}>
            <div className={`container ${styles.content}`}>
                <div className={styles.textContent}>
                    <h1 className={styles.title}>
                        Encuentra Equilibrio y Claridad con <span className={styles.highlight}>Josefina</span>
                    </h1>
                    <p className={styles.subtitle}>
                        Psicóloga licenciada dedicada a tu bienestar emocional.
                        Un espacio seguro para el crecimiento, la sanación y el autodescubrimiento.
                    </p>
                    <div className={styles.actions}>
                        <a href="#book" className="btn-primary">Reservar turno</a>
                        <a href="#services" className={styles.learnMore}>Conocer mi enfoque</a>
                    </div>
                </div>
                <div className={styles.imageWrapper}>
                    {/* Placeholder for professional photo */}
                    <div className={styles.photoPlaceholder}>
                        <Image
                            src="/logo.png"
                            alt="Josefina - Psicóloga"
                            width={300}
                            height={300}
                            className={styles.tempImage}
                            priority
                        />
                        <span className={styles.caption}>Foto Profesional Aquí</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
