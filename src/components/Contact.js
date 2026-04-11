import styles from './Contact.module.css';

export default function Contact() {
    return (
        <section className={`section-padding ${styles.contact}`}>
            <div className="container">
                <h2 className={styles.heading}>Contacto</h2>
                <div className={styles.content}>
                    <div className={styles.info}>
                        <h3>Ubicación</h3>
                        <p>Maldonado, Uruguay<br />San Carlos, Uruguay</p>
                        <p className={styles.locationNote}>(dirección exacta del consultorio<br />coordinada por contacto)</p>
                    </div>
                    <div className={styles.info}>
                        <h3>Contacto</h3>
                        <p>Email: psicjosefinagdrd@gmail.com<br />Teléfono: +598 98 076 531</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
