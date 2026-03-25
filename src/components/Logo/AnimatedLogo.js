'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import styles from './AnimatedLogo.module.css';

/**
 * AnimatedLogo — GdRD layered logo with 4 animation modes.
 *
 * mode: 'hero'           — scroll-reveal (fade + 3 flaps + float forever)
 *       'navbar'         — hover-interactive, no text layer
 *       'ambient'        — fixed fullscreen watermark (mobile: hidden)
 *       'section-ambient'— absolute watermark inside a positioned section
 *       'parallax'       — scroll-driven parallax + velocity flap
 *
 * PNGs → /public/logo/
 *   beige_bg · left_wing · right_wing · jdot · text_gdrd
 */
export default function AnimatedLogo({ mode = 'hero', className = '', hideText = false }) {
  const containerRef = useRef(null);
  const [animState, setAnimState] = useState('idle');
  const [parallaxOffset, setParallaxOffset] = useState(0);
  const [scrollFlap, setScrollFlap] = useState(false);

  // Hero: reveal on viewport entry
  useEffect(() => {
    if (mode !== 'hero') return;
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimState('revealed');
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [mode]);

  // Parallax: scroll tracking (desktop only)
  useEffect(() => {
    if (mode !== 'parallax') return;
    if (typeof window === 'undefined' || window.innerWidth < 768) return;

    let rafId;
    let lastY = window.scrollY;
    let flapTimer;

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const el = containerRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        setParallaxOffset((vh / 2 - (rect.top + rect.height / 2)) * 0.2);
        const velocity = Math.abs(window.scrollY - lastY);
        lastY = window.scrollY;
        if (velocity > 4) {
          setScrollFlap(true);
          clearTimeout(flapTimer);
          flapTimer = setTimeout(() => setScrollFlap(false), 700);
        }
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafId);
      clearTimeout(flapTimer);
    };
  }, [mode]);

  // Navbar: hover
  const handleMouseEnter = useCallback(() => {
    if (mode === 'navbar') setAnimState('hovering');
  }, [mode]);

  const handleMouseLeave = useCallback(() => {
    if (mode === 'navbar') setAnimState('idle');
  }, [mode]);

  // navbar and hero (when explicitly hidden) show only the butterfly
  const showText = mode !== 'navbar' && !hideText;

  const containerClass = [
    styles.logo,
    styles[`mode_${mode.replace('-', '_')}`],
    animState !== 'idle' && styles[`state_${animState}`],
    !showText && styles.centeredMode,
    className,
  ].filter(Boolean).join(' ');

  const wingsWrapperClass = [
    styles.wingsWrapper,
    mode === 'parallax' && styles.floating,
  ].filter(Boolean).join(' ');

  const leftWingClass = [
    styles.wing,
    styles.leftWing,
    mode === 'parallax' && scrollFlap && styles.flapLeft,
  ].filter(Boolean).join(' ');

  const rightWingClass = [
    styles.wing,
    styles.rightWing,
    mode === 'parallax' && scrollFlap && styles.flapRight,
  ].filter(Boolean).join(' ');

  const parallaxStyle =
    mode === 'parallax'
      ? { transform: `translateY(${parallaxOffset}px)` }
      : undefined;

  return (
    <div
      ref={containerRef}
      className={containerClass}
      style={parallaxStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <img
        className={styles.beigebg}
        src="/logo/beige_bg.png"
        alt=""
        aria-hidden="true"
        draggable={false}
      />

      <div className={wingsWrapperClass}>
        <img
          className={leftWingClass}
          src="/logo/left_wing.png"
          alt=""
          aria-hidden="true"
          draggable={false}
        />
        <img
          className={rightWingClass}
          src="/logo/right_wing.png"
          alt=""
          aria-hidden="true"
          draggable={false}
        />
        <img
          className={styles.jdot}
          src="/logo/jdot.png"
          alt="GdRD"
          draggable={false}
        />
      </div>

      {showText && (
        <img
          className={styles.textGdrd}
          src="/logo/text_gdrd.png"
          alt=""
          aria-hidden="true"
          draggable={false}
        />
      )}
    </div>
  );
}
