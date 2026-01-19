import styles from './Services.module.css';

export default function Services() {
    const services = [
        {
            title: "Terapia Individual",
            description: "Sesiones uno a uno para ayudarte a trabajar la ansiedad, depresión o desafíos personales en un espacio seguro."
        },
        {
            title: "Terapia de Pareja",
            description: "Navegando dinámicas de relación para mejorar la comunicación, la confianza y la intimidad."
        },
        {
            title: "Consultas Online",
            description: "Sesiones de video flexibles y seguras para quienes prefieren conectarse desde la comodidad de su hogar."
        }
    ];

    return (
        <section className={`section-padding ${styles.services}`}>
            <div className="container">
                <h2 className={styles.heading}>Mis Servicios</h2>
                <div className={styles.grid}>
                    {services.map((service, index) => (
                        <div key={index} className={styles.card}>
                            <h3 className={styles.cardTitle}>{service.title}</h3>
                            <p className={styles.cardText}>{service.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
