import WaveDivider from './WaveDivider';
import styles from './FirmaSection.module.css';

/**
 * FirmaSection — transitional section between Hero and Profile.
 * Wave transition from --background into --soft-beige, firma SVG centered.
 * Merges visually with Profile (same --soft-beige background).
 */
export default function FirmaSection() {
  return (
    <div className={styles.wrapper}>
      <WaveDivider bg="var(--background)" fill="var(--soft-beige)" variant={1} height={80} />
      <div className={styles.inner}>
        <div className={styles.firmaClip}>
          <img
            src="/firma.svg"
            alt="Firma Josefina García da Rosa"
            className={styles.firma}
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}
