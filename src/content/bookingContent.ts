// All booking flow UI strings (Spanish) and placeholder data

export const bookingContent = {
  layout: {
    brandName: "L'Femme",
    brandAccent: 'Eleganza',
    backLabel: 'Volver al inicio',
    steps: [
      { key: 'services', label: 'Servicios', path: '/book' },
      { key: 'schedule', label: 'Horario', path: '/book/schedule' },
      { key: 'confirm', label: 'Confirmación', path: '/book/confirm' },
    ],
  },

  services: {
    heading: 'Selecciona tus Servicios',
    subheading: 'Elige uno o más tratamientos para tu visita',
    addLabel: 'Agregar',
    removeLabel: 'Quitar',
    cart: {
      title: 'Tu Selección',
      empty: 'No has seleccionado ningún servicio.',
      totalPrice: 'Total estimado',
      totalDuration: 'Duración estimada',
      continueLabel: 'CONTINUAR',
      minutesLabel: 'min',
    },
    items: [
      { id: 'facial-basico', name: 'Facial Básico', duration: 60, price: 350, category: 'faciales' },
      { id: 'facial-premium', name: 'Facial Premium', duration: 90, price: 550, category: 'faciales' },
      { id: 'masaje-relajante', name: 'Masaje Relajante', duration: 60, price: 400, category: 'masajes' },
      { id: 'laminado-cejas', name: 'Laminado de Cejas', duration: 45, price: 250, category: 'cejas-pestañas' },
      { id: 'extensiones-pestanas', name: 'Extensiones de Pestañas', duration: 90, price: 500, category: 'cejas-pestañas' },
      { id: 'exfoliacion-corporal', name: 'Exfoliación Corporal', duration: 60, price: 450, category: 'corporales' },
    ],
  },

  schedule: {
    heading: 'Elige Fecha y Hora',
    dateLabel: 'Selecciona una fecha',
    timeLabel: 'Horarios disponibles',
    noSlots: 'Selecciona un horario para continuar.',
    sundayClosed: 'Cerrado',
    backLabel: 'REGRESAR',
    continueLabel: 'CONTINUAR',
  },

  confirm: {
    heading: 'Confirma tu Cita',
    summaryTitle: 'Resumen de tu cita',
    servicesLabel: 'Servicios seleccionados',
    dateTimeLabel: 'Fecha y hora',
    totalLabel: 'Total estimado',
    formTitle: 'Tus datos de contacto',
    fields: {
      name: { label: 'Nombre completo', placeholder: 'Tu nombre completo' },
      phone: { label: 'Teléfono', placeholder: '+502 ...' },
      email: { label: 'Correo electrónico', placeholder: 'tu@email.com' },
      notes: { label: 'Notas (opcional)', placeholder: 'Alergias, preferencias...' },
    },
    requiredMessage: 'Este campo es obligatorio.',
    backLabel: 'REGRESAR',
    submitLabel: 'CONFIRMAR CITA',
  },

  success: {
    heading: '¡Cita Confirmada!',
    message: 'Hemos recibido tu solicitud. Te contactaremos para confirmar los detalles.',
    codeLabel: 'Código de confirmación',
    backLabel: 'VOLVER AL INICIO',
  },
};

export type BookingContent = typeof bookingContent;
