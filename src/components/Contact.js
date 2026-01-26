import styles from './Contact.module.css';

export default function Contact() {
    return (
        <section className={`section-padding ${styles.contact}`}>
            <div className="container">
                <h2 className={styles.heading}>Contacto</h2>
                <div className={styles.content}>
                    <div className={styles.info}>
                        <h3>Ubicación</h3>
                        <p>123 Wellness Blvd, Suite 200<br />Ciudad, CP 12345</p>
                    </div>
                    <div className={styles.info}>
                        <h3>Contacto</h3>
                        <p>Email: majogdrd@gmail.com <br />Teléfono: (555) 123-4567</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
