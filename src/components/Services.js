import styles from './Services.module.css';

export default function Services() {
    const services = [
        {
            title: "Terapia Individual",
            description: "Sesiones uno a uno para ayudarte a trabajar la ansiedad, depresión o desafíos personales en un espacio seguro."
        },
        {
            title: "Terapia Sistémica",
            description: "Un enfoque orientado a comprender y trabajar las dificultades a partir de los vínculos y contextos de cada persona. Acompaño procesos en pareja, familias y grupos de trabajo ayudando a mejorar la comunicación y promoviendo relaciones más saludables."
        },
        {
            title: "Orientación Vocacional",
            description: "Un espacio de acompañamiento para explorar tus intereses, talentos, habilidades, dudas y proyectos personales, facilitando la toma de decisiones académicas y laborales de manera más clara y consciente."
        },
        {
            title: "Consultas Online",
            description: "Además de la modalidad presencial, contamos con sesiones por videollamada flexibles y seguras para quienes prefieren conectarse desde la comodidad de su hogar."
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
