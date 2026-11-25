/**
 * Configuración centralizada de identidad corporativa (Placeholders editables).
 * Modifique este archivo o configure las variables NEXT_PUBLIC_COMPANY_* para
 * personalizar el nombre, textos, servicios, proyectos y datos de contacto.
 */

export interface CorporateServiceItem {
  id: string;
  title: string;
  summary: string;
  description: string;
  icon: string;
  highlights: string[];
}

export interface CorporateProjectItem {
  id: string;
  title: string;
  client: string;
  sector: string;
  year: string;
  metric: string;
  summary: string;
  tags: string[];
}

export interface CorporateStatItem {
  label: string;
  value: string;
  detail: string;
}

export const siteConfig = {
  companyName: process.env.NEXT_PUBLIC_COMPANY_NAME || "Corporación Meridian",
  shortName: "Meridian",
  tagline:
    process.env.NEXT_PUBLIC_COMPANY_TAGLINE ||
    "Ingeniería, Gestión y Analítica Estratégica",
  legalName: "Corporación Meridian S.A.",
  description:
    "Soluciones integrales de ingeniería, gestión de proyectos e inteligencia de negocios diseñadas para potenciar la toma de decisiones ejecutivas.",
  hero: {
    badge: "Excelencia Operacional & Gobierno de Datos",
    title: "Impulsamos decisiones estratégicas con ingeniería y precisión analítica",
    subtitle:
      "Acompañamos a organizaciones líderes en la planificación, ejecución y control de proyectos complejos, integrando tecnología, trazabilidad financiera y control de gestión en tiempo real.",
    primaryCta: "Solicitar reunión",
    secondaryCta: "Conocer servicios",
  },
  about: {
    title: "Más de una década transformando operación en resultados medibles",
    lead: "Somos una firma multidisciplinaria comprometida con el rigor técnico, la transparencia financiera y la innovación aplicada a proyectos de alto impacto.",
    story:
      "Desde nuestra fundación, hemos desarrollado metodologías propias de gestión integral que conectan la operación en terreno con los indicadores estratégicos de la dirección ejecutiva. Nuestro equipo combina experiencia en ingeniería, finanzas corporativas y analítica avanzada.",
    mission:
      "Entregar soluciones de ingeniería, gestión y analítica de clase mundial que generen valor sostenible, eficiencia operacional y claridad estratégica para nuestros clientes y aliados.",
    vision:
      "Consolidarnos como el socio estratégico referente en la región por nuestra rigurosidad técnica, transparencia en la gestión y adopción de plataformas digitales de vanguardia.",
    values: [
      {
        title: "Rigor Técnico",
        description:
          "Cada recomendación y entregable se sustenta en metodologías probadas y datos verificables.",
      },
      {
        title: "Transparencia",
        description:
          "Trazabilidad total en indicadores financieros, avances de proyectos y cumplimiento de compromisos.",
      },
      {
        title: "Seguridad y Confidencialidad",
        description:
          "Protegemos la información corporativa bajo los más altos estándares de gobierno y acceso controlado.",
      },
      {
        title: "Mejora Continua",
        description:
          "Evolucionamos nuestros procesos incorporando automatización e inteligencia de negocios.",
      },
    ],
  },
  stats: [
    {
      label: "Proyectos Ejecutados",
      value: "+140",
      detail: "En infraestructura, energía, minería y servicios corporativos",
    },
    {
      label: "Cumplimiento de Plazos",
      value: "98.4%",
      detail: "Control continuo mediante curvas S e hitos trazables",
    },
    {
      label: "Clientes Corporativos",
      value: "+45",
      detail: "Relaciones de largo plazo con directorios y gerencias",
    },
    {
      label: "Años de Trayectoria",
      value: "14+",
      detail: "Equipo senior multidisciplinario certificado",
    },
  ] as CorporateStatItem[],
  services: [
    {
      id: "gestion-proyectos",
      title: "Gestión Integral de Proyectos (PMO)",
      summary:
        "Planificación, control físico-financiero y gobierno de carteras complejas bajo estándares PMI.",
      description:
        "Implementamos oficinas de gestión de proyectos orientadas a resultados, asegurando visibilidad sobre plazos, costos, riesgos y entregables críticos desde la ingeniería conceptual hasta la puesta en marcha.",
      icon: "FolderKanban",
      highlights: [
        "Control de avance y curvas S",
        "Gestión de riesgos y cambios",
        "Reportabilidad ejecutiva periódica",
      ],
    },
    {
      id: "inteligencia-negocios",
      title: "Inteligencia de Negocios y Analítica",
      summary:
        "Arquitectura de datos y tableros ejecutivos en Power BI para monitorear KPIs críticos en tiempo real.",
      description:
        "Diseñamos ecosistemas analíticos centralizados que integran ERP, tesorería, recursos humanos y control de operaciones, facilitando acceso seguro por perfil y toma de decisiones oportuna.",
      icon: "BarChart3",
      highlights: [
        "Modelamiento financiero y operacional",
        "Gobierno de acceso por roles",
        "Automatización de reportes gerenciales",
      ],
    },
    {
      id: "finanzas-corporativas",
      title: "Control Financiero y Presupuestario",
      summary:
        "Estructuración presupuestaria, flujo de caja proyectado y análisis de márgenes por centro de costo.",
      description:
        "Acompañamos a gerencias de administración y finanzas en el control exhaustivo de estados de resultados, conciliación bancaria y proyecciones de liquidez.",
      icon: "Landmark",
      highlights: [
        "Estados de resultados consolidados",
        "Flujo bancario y tesorería",
        "Control de desviaciones presupuestarias",
      ],
    },
    {
      id: "ingenieria-operaciones",
      title: "Ingeniería y Optimización Operacional",
      summary:
        "Diagnóstico de procesos, eficiencia en uso de horas hombre y rediseño de capacidades operativas.",
      description:
        "Evaluamos cuellos de botella en operaciones y contratos de servicios, estableciendo métricas claras de productividad, dotación óptima y estándares de calidad.",
      icon: "Cpu",
      highlights: [
        "Distribución y productividad de HH",
        "Auditoría de procesos operacionales",
        "Estándares de calidad y cumplimiento",
      ],
    },
  ] as CorporateServiceItem[],
  projects: [
    {
      id: "prj-01",
      title: "Transformación de Control de Gestión Corporativo",
      client: "Grupo Industrial Andino (Placeholder)",
      sector: "Energía e Infraestructura",
      year: "2025",
      metric: "-35% en tiempos de cierre mensual",
      summary:
        "Diseño e implementación de una plataforma centralizada de control presupuestario, flujo bancario y estado de resultados para 6 filiales operativas.",
      tags: ["Power BI", "Finanzas", "PMO"],
    },
    {
      id: "prj-02",
      title: "Oficina de Proyectos para Expansión Operacional",
      client: "Minera Pacífico Sur (Placeholder)",
      sector: "Minería y Recursos",
      year: "2024",
      metric: "99.1% de adherencia presupuestaria",
      summary:
        "Dirección y control físico-financiero de cartera de 18 contratos de ingeniería y construcción, con seguimiento semanal de horas hombre y riesgos.",
      tags: ["Control de Proyectos", "Distribución HH", "Ingeniería"],
    },
    {
      id: "prj-03",
      title: "Modernización de Analítica de Personas y Dotación",
      client: "Servicios Logísticos Austral (Placeholder)",
      sector: "Logística y Transporte",
      year: "2025",
      metric: "+22% en utilización productiva de HH",
      summary:
        "Estandarización de indicadores de recursos humanos, turnos y distribución de horas hombre en 12 centros de distribución a nivel nacional.",
      tags: ["RRHH", "Analítica", "Operaciones"],
    },
    {
      id: "prj-04",
      title: "Consolidación Financiera Multiempresa",
      client: "Holding Comercial Cordillera (Placeholder)",
      sector: "Retail y Servicios",
      year: "2024",
      metric: "100% trazabilidad de flujo de caja",
      summary:
        "Automatización de reportes consolidados de tesorería y márgenes por unidad de negocio con acceso segmentado para gerentes y directores.",
      tags: ["Tesorería", "Gobierno de Datos", "BI"],
    },
  ] as CorporateProjectItem[],
  contact: {
    email: "contacto@empresa-placeholder.com",
    phone: "+56 2 2000 0000",
    address: "Av. Apoquindo 4500, Piso 12, Santiago (Dirección Placeholder)",
    hours: "Lunes a Viernes, 08:30 – 18:30 hrs",
  },
  navLinks: [
    { label: "Inicio", href: "/" },
    { label: "Nosotros", href: "/nosotros" },
    { label: "Servicios", href: "/servicios" },
    { label: "Proyectos", href: "/proyectos" },
    { label: "Contacto", href: "/contacto" },
  ],
};
