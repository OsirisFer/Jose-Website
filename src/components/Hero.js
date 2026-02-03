import Image from 'next/image';
import styles from './Hero.module.css';

export default function Hero() {
    return (
        <section className={styles.hero}>
            <div className={`container ${styles.content}`}>
                <div className={styles.textContent}>
                    <h1 className={styles.title}>
                        Un espacio seguro creado para ti <br></br><span className={styles.highlight}>  Psicología Clínica Integral</span>
                    </h1>
                    {/* <p className={styles.subtitle}>
                        Lic. Josefina García da Rosa

                    </p> */}
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
