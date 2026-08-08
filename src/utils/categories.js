
export const CATEGORIES_ORDER = ["apps", "3d", "design", "editing", "drawing"];

const BASE = import.meta.env.BASE_URL;

export const CATEGORIES_CONFIG = {
    "apps": { 
        title: "Apps & Webs", 
        title_en: "Apps & Webs", 
        img: `${BASE}assets/p10_1_thumb.webp`,
        desc: "Proyectos enfocados en el desarrollo de aplicaciones web y de escritorio, optimización de interfaces de usuario y soluciones de software escalables.",
        desc_en: "Projects focused on web and desktop application development, user interface optimization, and scalable software solutions."
    },
    "3d": { 
        title: "3D", 
        title_en: "3D", 
        img: `${BASE}assets/p1_0_thumb.webp`,
        desc: "Exploración tridimensional que abarca desde visualización arquitectónica fotorrealista hasta animaciones procedurales y motion graphics.",
        desc_en: "Three-dimensional exploration ranging from photorealistic architectural visualization to procedural animations and motion graphics."
    },
    "design": { 
        title: "Diseño", 
        title_en: "Design", 
        img: `${BASE}assets/p6_0_thumb.webp`,
        desc: "Proceso completo de diseño de experiencia de usuario (UX) e interfaces de usuario (UI), incluyendo investigación, wireframing y prototipado interactivo.",
        desc_en: "Complete User Experience (UX) and User Interface (UI) design process, including research, wireframing, and interactive prototyping."
    },
    "editing": { 
        title: "Edición de video", 
        title_en: "Video Editing", 
        img: `${BASE}assets/p9_0_thumb.webp`,
        desc: "Post-producción audiovisual integral, destacando corrección de color profesional, motion graphics y diseño sonoro para piezas publicitarias y comerciales.",
        desc_en: "Comprehensive audiovisual post-production, highlighting professional color grading, motion graphics, and sound design for advertising and commercial pieces."
    },
    "drawing": { 
        title: "Dibujo", 
        title_en: "Drawing", 
        img: `${BASE}assets/p5_0_thumb.webp`,
        desc: "Ilustraciones y pinturas digitales creadas con tableta gráfica, explorando diversas técnicas y estilos visuales.",
        desc_en: "Digital illustrations and paintings created with a graphics tablet, exploring various techniques and visual styles."
    }
};

