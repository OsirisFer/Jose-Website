/**
 * WaveDivider — double-layer organic SVG wave between sections.
 *
 * Two stacked paths create depth:
 *   back layer  → same fill at ~38% opacity (intermediate tone)
 *   front layer → solid fill (next section's color)
 *
 * bg:      CSS color matching the preceding section
 * fill:    CSS color matching the following section
 * variant: 1 | 2 | 3
 * flip:    mirrors horizontally for variety
 * height:  px (default 80)
 */

// Back path peaks higher → front path lower → creates layered depth
const BACK = {
  1: 'M0,28 C360,66 720,-2 1080,40 C1260,60 1390,16 1440,30 L1440,80 L0,80 Z',
  2: 'M0,14 C200,52 440,-2 720,34 C1000,70 1240,6  1440,42 L1440,80 L0,80 Z',
  3: 'M0,44 C280,6  600,62 920,20 C1140,-6 1320,50 1440,32 L1440,80 L0,80 Z',
};

const FRONT = {
  1: 'M0,46 C360,80 720,14 1080,56 C1260,74 1390,32 1440,48 L1440,80 L0,80 Z',
  2: 'M0,30 C200,68 440,14 720,50 C1000,80 1240,22 1440,58 L1440,80 L0,80 Z',
  3: 'M0,58 C280,22 600,76 920,36 C1140,10 1320,64 1440,48 L1440,80 L0,80 Z',
};

export default function WaveDivider({
  bg,
  fill,
  variant = 1,
  flip = false,
  height = 80,
}) {
  return (
    <div
      aria-hidden="true"
      style={{ background: bg, lineHeight: 0, overflow: 'hidden', display: 'block' }}
    >
      <svg
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        style={{
          display: 'block',
          width: '100%',
          height: `${height}px`,
          transform: flip ? 'scaleX(-1)' : 'none',
        }}
      >
        {/* Back layer — same fill at reduced opacity creates the intermediate tone */}
        <path d={BACK[variant]}  style={{ fill }} opacity="0.38" />
        {/* Front layer — solid */}
        <path d={FRONT[variant]} style={{ fill }} />
      </svg>
    </div>
  );
}
