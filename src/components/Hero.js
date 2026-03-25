import AnimatedLogo from './Logo/AnimatedLogo';
import styles from './Hero.module.css';

export default function Hero() {
    return (
        <section className={styles.hero}>
            <div className={`container ${styles.content}`}>
                <div className={styles.logoWrap}>
                    <AnimatedLogo mode="hero" className={styles.heroLogo} hideText />
                </div>
                <div className={styles.textBlock}>
                    <h1 className={styles.title}>
                        Un espacio seguro{' '}
                        <span className={styles.highlight}>para ti</span>
                    </h1>
                    <p className={styles.subtitle}>Psicología Clínica Integral</p>
                    <div className={styles.actions}>
                        <a href="#book" className="btn-primary">Reservar turno</a>
                        <a href="#services" className={styles.learnMore}>Conocer mi enfoque</a>
                    </div>
                </div>
            </div>
        </section>
    );
}
