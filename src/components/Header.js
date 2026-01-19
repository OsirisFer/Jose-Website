'use client';

import { useState, useEffect } from 'react';
import styles from './Header.module.css';

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const closeMenu = () => {
        setMobileMenuOpen(false);
    };

    const navLinks = [
        { name: 'Inicio', href: '#hero' },
        { name: 'Sobre Mí', href: '#profile' },
        { name: 'Servicios', href: '#services' },
        { name: 'Enfoque', href: '#approach' },
        { name: 'Contacto', href: '#contact' },
    ];

    return (
        <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
            <div className={`container ${styles.container}`}>
                <div className={styles.logo}>
                    <a href="#hero" onClick={closeMenu}>Josefina</a>
                </div>

                <nav className={`${styles.nav} ${mobileMenuOpen ? styles.mobileOpen : ''}`}>
                    <ul className={styles.navList}>
                        {navLinks.map((link) => (
                            <li key={link.name}>
                                <a href={link.href} className={styles.navLink} onClick={closeMenu}>
                                    {link.name}
                                </a>
                            </li>
                        ))}
                        <li>
                            <a href="#book" className={`btn-primary ${styles.bookBtn}`} onClick={closeMenu}>
                                Reservar
                            </a>
                        </li>
                    </ul>
                </nav>

                <button className={styles.hamburger} onClick={toggleMenu} aria-label="Menu">
                    <span className={`${styles.bar} ${mobileMenuOpen ? styles.open : ''}`}></span>
                    <span className={`${styles.bar} ${mobileMenuOpen ? styles.open : ''}`}></span>
                    <span className={`${styles.bar} ${mobileMenuOpen ? styles.open : ''}`}></span>
                </button>
            </div>
        </header>
    );
}
