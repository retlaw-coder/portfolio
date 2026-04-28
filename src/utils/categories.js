
export const CATEGORIES_ORDER = ["apps", "3d", "design", "motion", "drawing"];

const BASE = import.meta.env.BASE_URL;

export const CATEGORIES_CONFIG = {
    "apps": { title: "Apps & Webs", title_en: "Apps & Webs", img: `${BASE}assets/p10_1_thumb.webp` },
    "3d": { title: "3D", title_en: "3D", img: `${BASE}assets/p1_0_thumb.webp` },
    "design": { title: "Diseño", title_en: "Design", img: `${BASE}assets/p6_0_thumb.webp` },
    "motion": { title: "Motion", title_en: "Motion", img: `${BASE}assets/p3_0_thumb.webp` },
    "drawing": { title: "Dibujo", title_en: "Drawing", img: `${BASE}assets/p5_0_thumb.webp` },
    // "editing" hidden until assets are ready
};
