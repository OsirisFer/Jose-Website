'use client';

import { useState, useEffect } from 'react';
import AnimatedLogo from './Logo/AnimatedLogo';
import styles from './Header.module.css';

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('hero');

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const sectionIds = ['hero', 'profile', 'services', 'approach', 'contact'];
        const observers = sectionIds.map(id => {
            const el = document.getElementById(id);
            if (!el) return null;
            const observer = new IntersectionObserver(
                ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
                { rootMargin: '-40% 0px -55% 0px' }
            );
            observer.observe(el);
            return observer;
        });
        return () => observers.forEach(o => o && o.disconnect());
    }, []);

    const toggleMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const closeMenu = () => {
        setMobileMenuOpen(false);
    };

    const navLinks = [
        { name: 'Inicio', href: '#hero', id: 'hero' },
        { name: 'Sobre Mí', href: '#profile', id: 'profile' },
        { name: 'Servicios', href: '#services', id: 'services' },
        { name: 'Enfoque', href: '#approach', id: 'approach' },
        { name: 'Contacto', href: '#contact', id: 'contact' },
    ];

    return (
        <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
            <div className={`container ${styles.container}`}>
                <div className={styles.logo}>
                    <a href="#hero" onClick={closeMenu}>
                        <AnimatedLogo mode="navbar" className={styles.navbarLogo} />
                    </a>
                </div>

                <nav className={`${styles.nav} ${mobileMenuOpen ? styles.mobileOpen : ''}`}>
                    <ul className={styles.navList}>
                        {navLinks.map((link) => (
                            <li key={link.name}>
                                <a
                                    href={link.href}
                                    className={`${styles.navLink} ${activeSection === link.id ? styles.navLinkActive : ''}`}
                                    onClick={closeMenu}
                                >
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
