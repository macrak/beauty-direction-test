// 양조장 사진이 없을 때 쓰는 에디토리얼 일러스트 — 양조장 성격에 맞는 테마를 관리자에서 선택
// 실존 장소·인물을 묘사하지 않는 추상 풍경입니다.

export const VISUAL_THEMES = {
  hanok: "한옥 처마와 옹기",
  field: "논과 들판",
  still: "소줏고리 증류",
  island: "섬과 돌담",
  orchard: "과수원",
  mountain: "산과 계곡",
  lake: "호수와 새벽 안개",
  courtyard: "장독대 마당",
  snow: "설원과 고원",
  herb: "약초 말리는 처마",
} as const;

export type VisualTheme = keyof typeof VISUAL_THEMES;

const C = {
  ivory: "#F7F4EE",
  beige: "#ECE5D8",
  sand: "#DED3BF",
  clay: "#8A5A44",
  clayDark: "#5A3A2A",
  burgundy: "#4C202B",
  gold: "#B69A68",
  charcoal: "#202020",
  sage: "#8C9A7E",
  mist: "#E6E1D6",
};

function pickTheme(theme: string | null | undefined, seed: number): VisualTheme {
  if (theme && theme in VISUAL_THEMES) return theme as VisualTheme;
  const keys = Object.keys(VISUAL_THEMES) as VisualTheme[];
  return keys[Math.abs(seed) % keys.length];
}

export default function BreweryVisual({
  theme,
  seed = 0,
  className = "",
  ratio = "wide",
}: {
  theme?: string | null;
  seed?: number;
  className?: string;
  ratio?: "wide" | "tall";
}) {
  const t = pickTheme(theme, seed);
  const vb = ratio === "tall" ? "60 0 480 600" : "0 0 600 420";
  return (
    <svg viewBox={vb} preserveAspectRatio="xMidYMid slice" className={`h-auto w-full bg-beige ${className}`} role="img" aria-label={`${VISUAL_THEMES[t]} 일러스트`}>
      <rect x="0" y="-200" width="600" height="900" fill={C.beige} />
      {SCENES[t]}
    </svg>
  );
}

const Jar = ({ x, y, s = 1, tone = C.clay }: { x: number; y: number; s?: number; tone?: string }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx="0" cy="62" rx="40" ry="6" fill={C.charcoal} opacity="0.08" />
    <path d="M-30 0 Q-46 34 -24 60 L24 60 Q46 34 30 0 Q0 -10 -30 0 Z" fill={tone} />
    <ellipse cx="0" cy="0" rx="30" ry="5" fill={C.clayDark} />
    <path d="M-36 22 Q0 30 36 22" stroke={C.ivory} strokeOpacity="0.18" strokeWidth="2" fill="none" />
  </g>
);

const SCENES: Record<VisualTheme, React.ReactNode> = {
  snow: (
    <g>
      <rect x="0" y="0" width="600" height="420" fill="#ECEAE4" />
      <circle cx="140" cy="100" r="40" fill={C.gold} opacity="0.22" />
      <path d="M-20 250 L120 120 L200 190 L310 90 L430 210 L520 140 L640 250 Z" fill="#C9CDCB" />
      <path d="M120 120 L96 146 L120 140 L140 152 Z M310 90 L284 118 L308 112 L332 124 Z M520 140 L500 160 L522 156 L540 166 Z" fill={C.ivory} />
      <path d="M-20 300 Q150 250 300 280 T640 270 V420 H-20 Z" fill={C.ivory} />
      {[[90, 300], [130, 310], [170, 296], [430, 300], [470, 292]].map(([x, y]) => (
        <g key={x}>
          <path d={`M${x} ${y} l12 -46 l12 46 Z`} fill={C.sage} opacity="0.85" />
          <path d={`M${x + 4} ${y - 20} l8 -18 l8 18 Z`} fill={C.ivory} opacity="0.9" />
        </g>
      ))}
      <rect x="300" y="300" width="70" height="44" fill={C.burgundy} />
      <path d="M290 302 l45 -26 l45 26 Z" fill={C.charcoal} opacity="0.85" />
      <path d="M290 302 l45 -26 l45 26" stroke={C.ivory} strokeWidth="5" fill="none" />
      <rect x="326" y="318" width="18" height="26" fill={C.gold} opacity="0.7" />
      {Array.from({ length: 30 }).map((_, i) => (
        <circle key={i} cx={(i * 97) % 600} cy={(i * 53) % 260} r={1.6 + (i % 3) * 0.6} fill={C.ivory} opacity="0.9" />
      ))}
      <rect x="0" y="372" width="600" height="60" fill={C.mist} />
    </g>
  ),
  herb: (
    <g>
      <circle cx="480" cy="300" r="70" fill={C.gold} opacity="0.18" />
      <path d="M0 60 Q300 0 600 60 L600 84 Q300 24 0 84 Z" fill={C.charcoal} opacity="0.85" />
      <rect x="0" y="84" width="600" height="6" fill={C.burgundy} />
      <path d="M40 128 H560" stroke={C.clayDark} strokeWidth="3" />
      {Array.from({ length: 9 }).map((_, i) => {
        const x = 70 + i * 58;
        const h = 70 + ((i * 17) % 40);
        const tone = i % 3 === 0 ? C.burgundy : i % 3 === 1 ? C.sage : "#A8382E";
        return (
          <g key={i}>
            <path d={`M${x} 128 v14`} stroke={C.clayDark} strokeWidth="2" />
            <path d={`M${x - 14} 142 Q${x} ${142 + h} ${x + 14} 142 Z`} fill={tone} opacity="0.85" />
            {[0, 1, 2].map((j) => (
              <path key={j} d={`M${x - 8 + j * 8} 150 q-6 ${h / 2} 0 ${h - 10}`} stroke={C.ivory} strokeOpacity="0.25" fill="none" />
            ))}
          </g>
        );
      })}
      <rect x="0" y="300" width="600" height="20" fill={C.charcoal} opacity="0.15" />
      <path d="M240 300 h130 l-14 40 h-102 Z" fill={C.clay} />
      {[262, 290, 318, 344].map((x, i) => (
        <circle key={x} cx={x} cy="296" r="9" fill={i % 2 ? C.burgundy : "#A8382E"} />
      ))}
      <Jar x={470} y={262} s={0.9} tone={C.clayDark} />
      <rect x="0" y="352" width="600" height="80" fill={C.sand} />
    </g>
  ),
  hanok: (
    <g>
      <circle cx="470" cy="110" r="52" fill={C.gold} opacity="0.32" />
      <path d="M30 196 Q300 112 570 196 L570 210 Q300 132 30 210 Z" fill={C.burgundy} />
      <path d="M30 196 Q12 186 8 176 M570 196 Q588 186 592 176" stroke={C.burgundy} strokeWidth="6" strokeLinecap="round" />
      <rect x="96" y="210" width="408" height="7" fill={C.burgundy} opacity="0.85" />
      {[130, 220, 300, 380, 470].map((x) => (
        <rect key={x} x={x} y="217" width="7" height="120" fill={C.burgundy} opacity="0.7" />
      ))}
      <rect x="140" y="240" width="72" height="80" fill={C.ivory} opacity="0.55" />
      <path d="M140 280 H212 M176 240 V320" stroke={C.burgundy} strokeOpacity="0.3" />
      <Jar x={300} y={290} />
      <Jar x={392} y={300} s={0.82} tone="#9A6A50" />
      <rect x="0" y="352" width="600" height="80" fill={C.sand} />
    </g>
  ),
  field: (
    <g>
      <circle cx="140" cy="96" r="44" fill={C.gold} opacity="0.35" />
      <path d="M0 210 Q150 160 300 196 T600 180 V420 H0 Z" fill={C.sage} opacity="0.35" />
      <path d="M0 250 Q160 214 320 240 T600 230 V420 H0 Z" fill={C.sage} opacity="0.55" />
      {Array.from({ length: 9 }).map((_, i) => (
        <path key={i} d={`M${-40 + i * 80} 420 L${260 + i * 12} 250`} stroke={C.ivory} strokeOpacity="0.45" strokeWidth="1.5" />
      ))}
      {Array.from({ length: 22 }).map((_, i) => {
        const x = 40 + i * 25;
        const h = 26 + ((i * 7) % 14);
        return (
          <g key={i} stroke={C.gold} strokeWidth="1.6" strokeLinecap="round" fill="none">
            <path d={`M${x} 360 Q${x + 2} ${360 - h / 2} ${x + 8} ${360 - h}`} />
            <path d={`M${x + 8} ${360 - h} q3 -6 0 -12`} />
          </g>
        );
      })}
      <path d="M440 236 l20 -24 l20 24 Z" fill={C.burgundy} />
      <rect x="444" y="236" width="32" height="22" fill={C.ivory} />
      <rect x="0" y="372" width="600" height="60" fill={C.sand} />
    </g>
  ),
  still: (
    <g>
      <rect x="0" y="0" width="600" height="420" fill="#E4DACA" />
      <circle cx="300" cy="140" r="150" fill={C.gold} opacity="0.12" />
      {/* 소줏고리 */}
      <path d="M220 300 Q210 230 250 210 L350 210 Q390 230 380 300 Z" fill={C.clay} />
      <path d="M240 210 Q240 160 300 150 Q360 160 360 210 Z" fill={C.clayDark} />
      <ellipse cx="300" cy="150" rx="36" ry="8" fill={C.charcoal} opacity="0.5" />
      <path d="M360 186 L452 220" stroke={C.clayDark} strokeWidth="8" strokeLinecap="round" />
      <path d="M452 220 v18" stroke={C.clayDark} strokeWidth="4" />
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M452 ${250 + i * 20} q-4 6 0 10 q4 -4 0 -10`} fill={C.gold} opacity={0.9 - i * 0.25} />
      ))}
      <path d="M432 318 Q430 290 452 286 Q474 290 472 318 Z" fill={C.ivory} opacity="0.85" />
      {/* 아궁이 불빛 */}
      <rect x="200" y="300" width="200" height="56" fill={C.charcoal} opacity="0.85" />
      <path d="M270 352 q12 -26 30 -30 q18 4 30 30 Z" fill={C.burgundy} />
      <path d="M288 352 q6 -14 12 -16 q8 4 12 16 Z" fill={C.gold} />
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M${280 + i * 22} 140 q-10 -30 6 -56 q12 -20 0 -44`} stroke={C.ivory} strokeOpacity="0.5" strokeWidth="2" fill="none" />
      ))}
      <rect x="0" y="356" width="600" height="80" fill={C.sand} />
    </g>
  ),
  island: (
    <g>
      <rect x="0" y="0" width="600" height="230" fill="#E7E3DA" />
      <circle cx="460" cy="96" r="40" fill={C.gold} opacity="0.35" />
      <path d="M60 214 Q140 120 230 214 Z" fill={C.sage} opacity="0.55" />
      <path d="M170 214 Q250 150 330 214 Z" fill={C.sage} opacity="0.75" />
      <rect x="0" y="214" width="600" height="60" fill="#B9C3C2" opacity="0.6" />
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d={`M${40 + i * 140} ${236 + (i % 2) * 14} q20 -6 40 0 t40 0`} stroke={C.ivory} strokeWidth="1.5" fill="none" opacity="0.8" />
      ))}
      <rect x="0" y="270" width="600" height="160" fill={C.sand} />
      {/* 돌담 */}
      {Array.from({ length: 34 }).map((_, i) => {
        const row = Math.floor(i / 12);
        const x = (i % 12) * 52 + (row % 2) * 26 - 10;
        const y = 300 + row * 30;
        return <ellipse key={i} cx={x} cy={y} rx={24} ry={13} fill={C.charcoal} opacity={0.62 + ((i * 13) % 5) * 0.06} />;
      })}
      <circle cx="520" cy="262" r="14" fill="#E3A23B" opacity="0.9" />
      <circle cx="546" cy="270" r="11" fill="#E3A23B" opacity="0.8" />
    </g>
  ),
  orchard: (
    <g>
      <circle cx="120" cy="90" r="46" fill={C.gold} opacity="0.3" />
      <path d="M0 260 Q300 220 600 260 V420 H0 Z" fill={C.sage} opacity="0.4" />
      {[110, 300, 490].map((x, i) => (
        <g key={x}>
          <rect x={x - 6} y={210 - i * 6} width="12" height={120 + i * 6} fill={C.clayDark} />
          <circle cx={x} cy={170 - i * 6} r={74 - i * 4} fill={C.sage} opacity="0.85" />
          <circle cx={x - 34} cy={190 - i * 6} r="40" fill={C.sage} />
          {[-30, 8, 34, -6, 20].map((dx, j) => (
            <circle key={j} cx={x + dx} cy={150 + ((j * 23) % 50) - i * 6} r="8" fill={j % 2 ? C.burgundy : "#A8382E"} />
          ))}
        </g>
      ))}
      <path d="M210 352 h70 l-8 40 h-54 Z" fill={C.clay} />
      {[226, 244, 262].map((x) => (
        <circle key={x} cx={x} cy="348" r="9" fill="#A8382E" />
      ))}
      <rect x="0" y="380" width="600" height="60" fill={C.sand} />
    </g>
  ),
  mountain: (
    <g>
      <circle cx="430" cy="110" r="46" fill={C.gold} opacity="0.3" />
      <path d="M-20 300 L120 130 L220 240 L330 100 L470 260 L560 170 L640 300 Z" fill={C.charcoal} opacity="0.22" />
      <path d="M-20 330 L90 210 L200 300 L320 190 L440 310 L560 230 L640 330 Z" fill={C.charcoal} opacity="0.38" />
      <rect x="0" y="292" width="600" height="18" fill={C.mist} opacity="0.75" />
      <path d="M260 420 Q300 360 280 330 Q260 300 300 280" stroke="#9FB1B5" strokeWidth="14" fill="none" opacity="0.7" strokeLinecap="round" />
      {[[90, 360], [150, 372], [440, 356], [500, 370]].map(([x, y]) => (
        <path key={x} d={`M${x} ${y} l14 -40 l14 40 Z`} fill={C.sage} />
      ))}
      <g transform="translate(360 340)">
        <circle r="7" fill={C.burgundy} />
        <circle cx="14" cy="4" r="6" fill="#A8382E" />
        <circle cx="4" cy="12" r="6" fill={C.burgundy} />
      </g>
      <rect x="0" y="380" width="600" height="60" fill={C.sand} />
    </g>
  ),
  lake: (
    <g>
      <rect x="0" y="0" width="600" height="420" fill="#E9E5DC" />
      <circle cx="300" cy="150" r="58" fill={C.gold} opacity="0.28" />
      <path d="M-20 230 L110 150 L210 210 L320 140 L450 200 L640 150 V240 H-20 Z" fill={C.charcoal} opacity="0.2" />
      <rect x="0" y="236" width="600" height="120" fill="#C9D0CC" opacity="0.7" />
      <ellipse cx="300" cy="262" rx="58" ry="8" fill={C.gold} opacity="0.25" />
      {Array.from({ length: 7 }).map((_, i) => (
        <path key={i} d={`M${60 + ((i * 83) % 480)} ${258 + i * 12} h${40 + (i % 3) * 20}`} stroke={C.ivory} strokeWidth="1.5" opacity="0.8" />
      ))}
      <rect x="0" y="196" width="600" height="30" fill={C.ivory} opacity="0.55" />
      <rect x="0" y="352" width="600" height="80" fill={C.sand} />
      <path d="M380 352 v-34 h44 v34" fill={C.burgundy} />
      <path d="M372 320 l30 -18 l30 18 Z" fill={C.charcoal} opacity="0.8" />
    </g>
  ),
  courtyard: (
    <g>
      <circle cx="500" cy="80" r="40" fill={C.gold} opacity="0.3" />
      <rect x="0" y="150" width="600" height="18" fill={C.burgundy} opacity="0.85" />
      <rect x="0" y="168" width="600" height="120" fill={C.ivory} opacity="0.5" />
      {Array.from({ length: 13 }).map((_, i) => (
        <rect key={i} x={i * 48} y="168" width="2" height="120" fill={C.burgundy} opacity="0.25" />
      ))}
      <rect x="40" y="300" width="520" height="18" fill={C.charcoal} opacity="0.25" />
      {[90, 170, 250, 330, 410, 490].map((x, i) => (
        <Jar key={x} x={x} y={i % 2 ? 254 : 246} s={i % 2 ? 0.72 : 0.86} tone={i % 3 === 0 ? C.clayDark : C.clay} />
      ))}
      {[130, 290, 450].map((x) => (
        <Jar key={x} x={x} y={330} s={0.62} tone="#9A6A50" />
      ))}
      <rect x="0" y="380" width="600" height="60" fill={C.sand} />
    </g>
  ),
};

// ─── 제조 과정 일러스트 (사진이 없을 때) ─────────────────────────

export const PROCESS_STEPS = [
  { key: "rice", label: "쌀 씻기", en: "Rice" },
  { key: "steam", label: "고두밥 찌기", en: "Steam" },
  { key: "nuruk", label: "누룩 빚기", en: "Nuruk" },
  { key: "ferment", label: "발효", en: "Ferment" },
  { key: "distill", label: "증류 · 거르기", en: "Distill" },
  { key: "age", label: "숙성", en: "Age" },
] as const;

export function ProcessArt({ step }: { step: (typeof PROCESS_STEPS)[number]["key"] }) {
  const art: Record<string, React.ReactNode> = {
    rice: (
      <g>
        <path d="M40 120 Q100 170 160 120 Z" fill={C.clay} />
        {Array.from({ length: 26 }).map((_, i) => (
          <ellipse key={i} cx={58 + ((i * 37) % 86)} cy={112 - ((i * 13) % 22)} rx="4" ry="2.2" fill={C.ivory} transform={`rotate(${(i * 47) % 180} ${58 + ((i * 37) % 86)} ${112 - ((i * 13) % 22)})`} />
        ))}
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M${80 + i * 20} 40 q-4 8 0 14 q4 -6 0 -14`} fill="#9FB1B5" />
        ))}
      </g>
    ),
    steam: (
      <g>
        <rect x="50" y="100" width="100" height="44" rx="6" fill={C.clay} />
        <rect x="44" y="92" width="112" height="12" rx="4" fill={C.clayDark} />
        {[70, 100, 130].map((x) => (
          <path key={x} d={`M${x} 86 q-12 -20 4 -36 q12 -14 0 -30`} stroke={C.charcoal} strokeOpacity="0.35" strokeWidth="2.5" fill="none" />
        ))}
      </g>
    ),
    nuruk: (
      <g>
        {[[70, 110], [120, 96], [96, 136]].map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="26" fill={C.gold} />
            <circle cx={x} cy={y} r="26" fill="none" stroke={C.clayDark} strokeOpacity="0.3" strokeDasharray="2 4" strokeWidth="6" />
          </g>
        ))}
      </g>
    ),
    ferment: (
      <g>
        <Jar x={100} y={74} s={1.1} />
        {[[86, 60], [104, 48], [118, 62], [96, 36]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={3 + (i % 2) * 2} fill="none" stroke={C.clayDark} strokeOpacity="0.5" strokeWidth="1.5" />
        ))}
      </g>
    ),
    distill: (
      <g>
        <path d="M60 140 Q54 100 76 90 L124 90 Q146 100 140 140 Z" fill={C.clay} />
        <path d="M72 90 Q72 62 100 56 Q128 62 128 90 Z" fill={C.clayDark} />
        <path d="M128 76 L168 92 v12" stroke={C.clayDark} strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M168 114 q-3 5 0 8 q3 -3 0 -8" fill={C.gold} />
      </g>
    ),
    age: (
      <g>
        <Jar x={64} y={86} s={0.66} tone={C.clayDark} />
        <Jar x={136} y={86} s={0.66} />
        <Jar x={100} y={110} s={0.7} tone="#9A6A50" />
      </g>
    ),
  };
  return (
    <svg viewBox="0 0 200 180" className="h-auto w-full bg-beige" role="img" aria-label="제조 과정 일러스트">
      <rect width="200" height="180" fill={C.beige} />
      {art[step]}
    </svg>
  );
}

// 장인 사진 자리 — 인물 대신 손과 도구를 암시하는 실루엣
export function ArtisanArt() {
  return (
    <svg viewBox="0 0 400 500" className="h-auto w-full bg-beige" role="img" aria-label="장인 사진 자리 일러스트">
      <rect width="400" height="500" fill={C.beige} />
      <circle cx="300" cy="110" r="60" fill={C.gold} opacity="0.25" />
      <path d="M90 500 Q100 330 200 300 Q300 330 310 500 Z" fill={C.charcoal} opacity="0.82" />
      <circle cx="200" cy="230" r="58" fill={C.charcoal} opacity="0.82" />
      <path d="M130 420 Q200 390 270 420 L262 446 Q200 424 138 446 Z" fill={C.sand} />
      <ellipse cx="200" cy="408" rx="58" ry="10" fill={C.clayDark} />
      <path d="M150 408 Q200 470 250 408" fill={C.clay} />
    </svg>
  );
}
