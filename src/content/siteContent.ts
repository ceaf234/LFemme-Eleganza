export const siteContent = {
  brand: {
    name: "L'Femme",
    accent: "Eleganza",
    tagline: "SPA & BELLEZA",
    subtitle: "STUDIO ESPECIALIZADO EN CEJAS, PESTAÑAS Y CUIDADO DE LA PIEL",
    motto: "Elegancia en Cada Detalle",
  },

  nav: {
    links: [
      { label: "Nuestros Servicios", href: "#servicios", icon: "sparkles" },
      { label: "Dónde Ubicarnos", href: "#contacto", icon: "location" },
      { label: "Mándanos un Mensaje", href: "#contacto", icon: "message" },
    ],
    cta: {
      label: "Reserva tu Cita",
      href: "#contacto",
    },
  },

  hero: {
    headline: {
      line1: "L'Femme",
      line2: "Eleganza",
    },
    subheadline: "Elegancia en Cada Detalle",
    cta: "RESERVA TU CITA",
  },

  about: {
    label: "NUESTRA HISTORIA",
    heading: "Sobre Nosotros",
    paragraphs: [
      {
        text: "En L'Femme Eleganza, nos dedicamos a realzar tu belleza natural con tratamientos exclusivos y un servicio personalizado. Tu bienestar es nuestra prioridad.",
        highlight: "L'Femme Eleganza",
      },
      {
        text: "Cada visita es una experiencia única donde el lujo y el cuidado se fusionan para brindarte momentos de pura relajación y transformación.",
        highlight: null,
      },
    ],
  },

  services: {
    label: "LO QUE OFRECEMOS",
    heading: "Nuestros Servicios",
    items: [
      {
        id: "faciales",
        title: "Faciales",
        description:
          "Tratamientos de limpieza profunda, hidratación y rejuvenecimiento para una piel radiante.",
        icon: "facial",
      },
      {
        id: "masajes",
        title: "Masajes",
        description:
          "Masajes relajantes y terapéuticos que liberan tensiones y restauran tu energía vital.",
        icon: "massage",
      },
      {
        id: "corporales",
        title: "Tratamientos Corporales",
        description:
          "Exfoliaciones, envolturas y tratamientos reductivos para un cuerpo renovado.",
        icon: "body",
      },
      {
        id: "cejas-pestanas",
        title: "Cejas y Pestañas",
        description:
          "Diseño de cejas, laminado, lifting y extensiones para una mirada impactante.",
        icon: "eye",
      },
    ],
    cta: "VER MÁS",
  },

  socials: {
    label: "CONECTA CON NOSOTROS",
    heading: "Síguenos en Redes Sociales",
    handle: "@lfemme.eleganza",
    links: [
      { platform: "instagram", url: "https://instagram.com/lfemme.eleganza", label: "Instagram" },
      { platform: "facebook", url: "https://facebook.com/lfemmeeleganza", label: "Facebook" },
      { platform: "whatsapp", url: "https://wa.me/50223456789", label: "WhatsApp" },
      { platform: "tiktok", url: "https://tiktok.com/@lfemme.eleganza", label: "TikTok" },
    ],
  },

  contact: {
    label: "ESTAMOS PARA TI",
    heading: "Contáctanos",
    cta: "AGENDA TU CITA",
    items: [
      {
        id: "ubicacion",
        title: "Ubicación",
        icon: "location",
        lines: ["Zona 10, Ciudad de Guatemala", "Centro Comercial Eleganza, Local 205"],
      },
      {
        id: "telefono",
        title: "Teléfono",
        icon: "phone",
        lines: ["+502 2345-6789", "WhatsApp disponible"],
      },
      {
        id: "correo",
        title: "Correo Electrónico",
        icon: "email",
        lines: ["info@lfemmeeleganza.com", "Respuesta en 24 horas"],
      },
      {
        id: "horario",
        title: "Horario de Atención",
        icon: "clock",
        lines: ["Lunes a Sábado: 9:00 - 19:00", "Domingo: Cerrado"],
      },
    ],
  },

  footer: {
    copyright: "© 2024 L'Femme Eleganza. Todos los derechos reservados.",
  },
};

export type SiteContent = typeof siteContent;
