/**
 * Configuración oficial de identidad y propuesta comercial de Findex.
 * Fuente: Presentación corporativa Findex ("Claridad financiera, cada semana").
 */

export interface FindexModuleItem {
  number: string;
  id: string;
  title: string;
  summary: string;
  details: string;
  icon: string;
  highlights: string[];
}

export interface FindexProblemItem {
  title: string;
  description: string;
  icon: "clock" | "spreadsheet" | "user-x";
  alert?: boolean;
}

export interface FindexValuePropItem {
  title: string;
  subtitle: string;
  icon: string;
}

export interface FindexFlowStep {
  title: string;
  subtitle: string;
  icon: string;
  featured?: boolean;
}

export interface FindexTimelineStep {
  phase: string;
  week: string;
  description: string;
}

export interface FindexSecurityItem {
  title: string;
  description: string;
  icon: string;
}

export interface FindexComparisonRow {
  criterion: string;
  excel: string;
  analyst: string;
  consulting: string;
  findex: string;
}

export interface FindexTeamRole {
  title: string;
  description: string;
  icon: string;
}

export const siteConfig = {
  companyName: process.env.NEXT_PUBLIC_COMPANY_NAME || "Findex",
  shortName: "Findex",
  tagline:
    process.env.NEXT_PUBLIC_COMPANY_TAGLINE ||
    "Claridad financiera, cada semana",
  legalName: "Findex",
  description:
    "Paneles de gestión y análisis con IA para medianas empresas que usan ERP. En marcha en 5 semanas, sin cambiar de sistema.",

  // Lámina 1 — Portada / Hero
  hero: {
    eyebrow: "CONTROL DE GESTIÓN CON INTELIGENCIA ARTIFICIAL",
    title: "Claridad financiera, cada semana",
    subtitle:
      "Paneles de gestión y análisis con IA para medianas empresas que usan ERP. En marcha en 5 semanas, sin cambiar de sistema.",
    primaryCta: "Solicitar demo sin costo",
    secondaryCta: "Ver los 5 módulos",
  },

  // Lámina 2 — El Problema
  problem: {
    eyebrow: "EL PROBLEMA",
    title: "La gerencia se entera del margen cuando ya es tarde",
    items: [
      {
        title: "Números al cierre de mes",
        description:
          "El resultado de cada proyecto se conoce semanas después, cuando ya no se puede corregir.",
        icon: "clock",
      },
      {
        title: "Horas en planillas",
        description:
          "Finanzas arma informes en Excel a mano, cada mes, y nadie confía del todo en ellos.",
        icon: "spreadsheet",
      },
      {
        title: "Sin quien los analice",
        description:
          "No hay área de control de gestión, y contratar y retener un analista es caro y difícil.",
        icon: "user-x",
        alert: true,
      },
    ] as FindexProblemItem[],
    statHighlight: "44 %",
    statText:
      "de las medianas empresas chilenas menciona falta de talento especializado para usar IA (SAP, 2025).",
  },

  // Lámina 3 — Qué Hacemos
  whatWeDo: {
    eyebrow: "QUÉ HACEMOS",
    title: "Arrendamos control de gestión con IA, sobre su ERP",
    pillars: [
      {
        title: "Margen por proyecto cada semana",
        subtitle: "sin contratar un analista",
        icon: "TrendingUp",
      },
      {
        title: "IA que explica las cifras",
        subtitle: "y propone acciones a gerentes no financieros",
        icon: "Cpu",
      },
      {
        title: "Sobre su ERP",
        subtitle: "sin cambiar de ERP ni de procesos",
        icon: "Database",
      },
      {
        title: "En marcha en 5 semanas",
        subtitle: "y sin licencias Power BI para sus usuarios",
        icon: "Activity",
      },
      {
        title: "Arriendo mensual, datos en Chile",
        subtitle: "usted es dueño de sus datos; nosotros los cuidamos",
        icon: "ShieldCheck",
      },
    ] as FindexValuePropItem[],
    whatYouReceiveTitle: "Lo que recibe",
    whatYouReceive: [
      "5 módulos de control de gestión",
      "Intranet con su marca y sus usuarios",
      "Informe mensual con IA",
      "Actualización automática diaria",
      "Soporte y mejoras continuas",
    ],
  },

  // Lámina 4 — Cómo Funciona
  howItWorks: {
    eyebrow: "CÓMO FUNCIONA",
    title: "Sus datos del ERP, convertidos en decisiones",
    steps: [
      {
        title: "Su ERP",
        subtitle: "contabilidad, inventario, remuneraciones",
        icon: "Database",
      },
      {
        title: "Conector seguro",
        subtitle: "solo lectura, en su empresa",
        icon: "Layers",
      },
      {
        title: "Plataforma Findex",
        subtitle: "Microsoft Azure, en Chile",
        icon: "Globe",
        featured: true,
      },
      {
        title: "Intranet Findex",
        subtitle: "con su marca y sus usuarios",
        icon: "BarChart3",
      },
      {
        title: "Su gerencia",
        subtitle: "decide con datos al día",
        icon: "UserCheck",
      },
    ] as FindexFlowStep[],
    aiBranchTitle: "Inteligencia artificial",
    aiBranchText:
      "analiza cifras agregadas y redacta el informe mensual",
    footnote:
      "No reemplazamos su ERP ni su contabilidad: trabajamos sobre lo que ya registra.",
  },

  // Lámina 5 — 5 Módulos
  modules: {
    eyebrow: "MÓDULOS",
    title: "Cinco módulos probados en operación real",
    footnote: "Cada panel lleva los colores y el logo de su empresa.",
    items: [
      {
        number: "01",
        id: "estados-financieros",
        title: "Estados financieros",
        summary:
          "Resultado y balance por empresa y centro de costo, hasta la cuenta.",
        details:
          "Estado de resultados y balance general estructurados según su plan de cuentas en el ERP, con apertura por empresa, unidad de negocio y centro de costo hasta el nivel de cuenta contable.",
        icon: "Landmark",
        highlights: [
          "Estado de resultados y balance general",
          "Apertura por empresa y centro de costo",
          "Trazabilidad hasta la cuenta contable",
        ],
      },
      {
        number: "02",
        id: "indicadores-financieros",
        title: "Indicadores financieros",
        summary:
          "Rentabilidad, liquidez, endeudamiento y capital de trabajo.",
        details:
          "Monitoreo ejecutivo de ratios financieros críticos, evolución de márgenes, liquidez corriente, endeudamiento y necesidades de capital de trabajo.",
        icon: "Activity",
        highlights: [
          "Rentabilidad y márgenes operacionales",
          "Liquidez y capital de trabajo",
          "Estructura de endeudamiento",
        ],
      },
      {
        number: "03",
        id: "personal",
        title: "Personal",
        summary:
          "Dotación, rotación y costo laboral por cargo y centro de costo.",
        details:
          "Visibilidad directa desde remuneraciones del ERP sobre dotación activa, rotación, ausentismo y costo empresa desglosado por cargo y centro de costo.",
        icon: "Users",
        highlights: [
          "Dotación y rotación mensual",
          "Costo laboral por cargo",
          "Distribución por centro de costo",
        ],
      },
      {
        number: "04",
        id: "inventario",
        title: "Inventario",
        summary:
          "Stock valorizado, alertas de quiebre y consumo por proyecto.",
        details:
          "Control continuo de bodegas, inventario valorizado, detección temprana de artículos críticos bajo stock mínimo y consumo imputado por obra o proyecto.",
        icon: "Layers",
        highlights: [
          "Stock valorizado en tiempo real",
          "Alertas tempranas de quiebre de stock",
          "Consumo de materiales por proyecto",
        ],
      },
      {
        number: "05",
        id: "proyectos",
        title: "Proyectos",
        summary: "Presupuesto contra real, valor ganado y carta Gantt.",
        details:
          "Control semanal de margen por proyecto comparando presupuesto aprobado contra costo real, avance físico, valor ganado y carta Gantt integrada.",
        icon: "FolderKanban",
        highlights: [
          "Presupuesto contra ejecución real",
          "Análisis de valor ganado y desviaciones",
          "Seguimiento con carta Gantt",
        ],
      },
    ] as FindexModuleItem[],
  },

  // Lámina 6 — Informe Mensual con IA
  aiReport: {
    eyebrow: "INFORME MENSUAL CON IA",
    title: "Cada mes, sus números explicados en simple",
    sampleLabel: "EJEMPLO ILUSTRATIVO · EMPRESA FICTICIA",
    sampleHeading: "Resumen de marzo",
    sampleSummary:
      "Las ventas superaron el presupuesto en 8 %, pero el margen bruto bajó de 23 % a 21 % por mayores costos de materiales.",
    sampleAlerts: [
      "Proyecto A: materiales 14 % sobre lo presupuestado.",
      "Bodega: 6 repuestos críticos bajo su stock mínimo.",
    ],
    sampleRecommendations: [
      "Renegociar el pedido de materiales del proyecto A antes de la etapa 3.",
      "Reponer los 6 repuestos esta semana para no detener mantenciones.",
    ],
    sampleFootnote: "Cada afirmación enlaza a la cifra que la respalda.",
    benefits: [
      {
        title: "Para gerentes no financieros",
        description: "Lenguaje simple, sin siglas contables.",
      },
      {
        title: "Alertas a tiempo",
        description:
          "Desvíos de margen y quiebres de stock antes de que cuesten.",
      },
      {
        title: "Sin datos personales",
        description: "La IA solo ve cifras agregadas de la empresa.",
      },
    ],
  },

  // Lámina 7 — Implementación en 5 semanas
  implementation: {
    eyebrow: "IMPLEMENTACIÓN",
    title: "En marcha en 5 semanas, con cifras cuadradas antes de entregar",
    steps: [
      {
        phase: "Diagnóstico",
        week: "Semana 0",
        description: "Su ERP, plan de cuentas, centros de costo y accesos",
      },
      {
        phase: "Conexión",
        week: "Semana 1",
        description: "Datos cargados y actualizándose solos",
      },
      {
        phase: "Primer borrador",
        week: "Semana 2",
        description: "Paneles con sus datos reales y su marca",
      },
      {
        phase: "Cuadratura",
        week: "Semanas 3 y 4",
        description: "Cada cifra contra su contabilidad",
      },
      {
        phase: "Puesta en marcha",
        week: "Semana 5",
        description: "Capacitación, guías y acta de entrega",
      },
    ] as FindexTimelineStep[],
    neededFromYou: {
      title: "Lo que necesitamos de usted",
      description:
        "Un usuario de solo lectura en su ERP, un equipo para el conector y una persona que valide cifras.",
    },
    afterGoLive: {
      title: "Después de la puesta en marcha",
      description:
        "Actualización diaria, soporte en 2 días hábiles, reunión mensual y mejoras continuas.",
    },
  },

  // Lámina 8 — Seguridad
  security: {
    eyebrow: "SEGURIDAD",
    title: "Sus datos, protegidos y en Chile",
    items: [
      {
        title: "Solo lectura",
        description: "Nunca modificamos los registros de su ERP.",
        icon: "KeyRound",
      },
      {
        title: "Alojados en Chile",
        description:
          "En la región de Microsoft Azure en Chile, separados de los de otros clientes.",
        icon: "Globe",
      },
      {
        title: "Acceso en dos pasos",
        description:
          "Cada persona ve solo lo que le corresponde según su perfil.",
        icon: "Lock",
      },
      {
        title: "Ley de datos personales",
        description:
          "Acuerdo de tratamiento conforme a la Ley N° 21.719 y aviso de incidentes en 24 horas.",
        icon: "ShieldCheck",
      },
    ] as FindexSecurityItem[],
  },

  // Lámina 9 — Comparativa "Por qué Findex"
  comparison: {
    eyebrow: "POR QUÉ FINDEX",
    title: "Más rápido y económico que las alternativas",
    rows: [
      {
        criterion: "Cuándo tiene la información",
        excel: "Al cierre de mes",
        analyst: "Según la persona",
        consulting: "Al final del proyecto",
        findex: "Cada semana",
      },
      {
        criterion: "Costo",
        excel: "Horas del equipo",
        analyst: "Sueldo mensual completo",
        consulting: "Proyecto por horas",
        findex: "Arriendo mensual fijo",
      },
      {
        criterion: "Tiempo para partir",
        excel: "—",
        analyst: "Selección y aprendizaje",
        consulting: "Meses",
        findex: "5 semanas",
      },
      {
        criterion: "Explicaciones con IA",
        excel: "No",
        analyst: "Depende",
        consulting: "Rara vez",
        findex: "Sí, cada mes",
      },
      {
        criterion: "Si alguien se va",
        excel: "Se pierde el conocimiento",
        analyst: "Se pierde el conocimiento",
        consulting: "Hay que volver a contratar",
        findex: "El servicio sigue",
      },
    ] as FindexComparisonRow[],
  },

  // Lámina 10 — Modalidad y Planes (sin montos públicos)
  pricing: {
    eyebrow: "MODALIDAD Y PLANES",
    title: "Un servicio simple, sin licencias que comprar",
    planName: "Plan Completo · 5 módulos",
    headline: "Arriendo mensual",
    subheadline: "Implementación en 5 semanas · Propuesta según su operación",
    included: [
      "5 módulos e intranet con su marca",
      "Informe mensual con IA",
      "Plan base para equipos de hasta 20 usuarios",
      "Soporte, mantención y ajustes mensuales incluidos",
    ],
    addonsTitle: "Opcionales y escalamiento",
    addons: [
      {
        label: "Empresas adicionales en el consolidado",
        detail: "Consolidación multiempresa",
      },
      {
        label: "Usuarios adicionales sobre el plan base",
        detail: "Escalable según su organización",
      },
      {
        label: "Desarrollos y paneles a medida",
        detail: "Según requerimiento",
      },
      {
        label: "Modalidad anual",
        detail: "Condiciones preferenciales",
      },
    ],
    termsNote:
      "Contrato inicial de 12 meses, renovable mes a mes. El ERP y el equipo del conector son de cargo del cliente.",
  },

  // Lámina 11 — Equipo
  team: {
    eyebrow: "EQUIPO",
    title: "Gestión, tecnología y contabilidad en un mismo equipo",
    lead: "Combinamos control de gestión, ingeniería en inteligencia de negocios y rigor contable para entregar cifras cuadradas y accionables desde el primer mes.",
    members: [
      {
        title: "Control de gestión",
        description:
          "Ingeniero civil industrial (PUC), con experiencia liderando control de gestión y de proyectos. Define qué mirar y cómo usarlo.",
        icon: "UserCheck",
      },
      {
        title: "Desarrollo BI",
        description:
          "Especialista en Power BI y modelos de datos. Construye las conexiones y los paneles, y los mantiene funcionando.",
        icon: "Cpu",
      },
      {
        title: "Contabilidad",
        description:
          "Contador colegiado. Asegura que cada cifra de los paneles cuadre con sus estados financieros.",
        icon: "FileSpreadsheet",
      },
    ] as FindexTeamRole[],
  },

  // Lámina 12 — Siguiente Paso & Contacto
  nextStep: {
    eyebrow: "SIGUIENTE PASO",
    title: "Veamos sus números",
    subtitle:
      "Le mostramos el módulo de estados financieros con la información de su empresa, sin costo, antes de que decida.",
  },

  contact: {
    contactPerson: "Equipo Findex",
    contactRole: "Control de Gestión · Findex",
    email: "contacto@findex.cl",
    phone: "+56 9 0000 0000",
    address: "Santiago, Chile · Datos alojados en Microsoft Azure Chile",
    hours: "Lunes a Viernes, 08:30 – 18:30 hrs (Soporte en 2 días hábiles)",
  },

  navLinks: [
    { label: "Inicio", href: "/" },
    { label: "Módulos y Solución", href: "/servicios" },
    { label: "Planes y Modalidad", href: "/proyectos" },
    { label: "Equipo y Seguridad", href: "/nosotros" },
    { label: "Contacto", href: "/contacto" },
  ],
};
