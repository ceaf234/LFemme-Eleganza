// All booking flow UI strings (Spanish) and placeholder data

export const bookingContent = {
  layout: {
    brandName: "L'Femme",
    brandAccent: 'Eleganza',
    backLabel: 'Volver al inicio',
    steps: [
      { key: 'services', label: 'Servicios', path: '/book' },
      { key: 'schedule', label: 'Horario', path: '/book/schedule' },
      { key: 'confirm', label: 'Datos', path: '/book/confirm' },
      { key: 'payment', label: 'Pago', path: '/book/payment' },
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
      { id: 'facial-basico', name: 'Facial Básico', description: 'Limpieza profunda y revitalización facial.', duration: 60, price: 350, category: 'faciales' },
      { id: 'facial-premium', name: 'Facial Premium', description: 'Tratamiento facial completo con productos premium.', duration: 90, price: 550, category: 'faciales' },
      { id: 'masaje-relajante', name: 'Masaje Relajante', description: 'Masaje corporal para aliviar tensión y estrés.', duration: 60, price: 400, category: 'masajes' },
      { id: 'laminado-cejas', name: 'Laminado de Cejas', description: 'Laminado y diseño profesional de cejas.', duration: 45, price: 250, category: 'cejas-pestañas' },
      { id: 'extensiones-pestanas', name: 'Extensiones de Pestañas', description: 'Extensiones de pestañas pelo a pelo.', duration: 90, price: 500, category: 'cejas-pestañas' },
      { id: 'exfoliacion-corporal', name: 'Exfoliación Corporal', description: 'Exfoliación completa para una piel renovada.', duration: 60, price: 450, category: 'corporales' },
    ],
  },

  schedule: {
    heading: 'Elige Fecha y Hora',
    staffLabel: 'Selecciona tu especialista',
    staffPlaceholder: 'Elige un especialista',
    loadingStaff: 'Cargando especialistas...',
    dateLabel: 'Selecciona una fecha',
    timeLabel: 'Horarios disponibles',
    noSlots: 'Selecciona un horario para continuar.',
    loadingSlots: 'Cargando horarios...',
    noSlotsForDay: 'No hay horarios disponibles para este día',
    errorLoadingSlots: 'Error al cargar horarios. Intenta de nuevo.',
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
      phone: { label: 'Teléfono', placeholder: 'XXXX-XXXX' },
      email: { label: 'Correo electrónico (opcional)', placeholder: 'tu@email.com' },
      notes: { label: 'Notas (opcional)', placeholder: 'Alergias, preferencias...' },
    },
    requiredMessage: 'Este campo es obligatorio.',
    backLabel: 'REGRESAR',
    submitLabel: 'CONTINUAR',
  },

  payment: {
    heading: 'Metodo de Pago',
    optionFullLabel: 'Pago completo',
    optionFullDescription: 'Paga el monto total de tu cita',
    optionDepositLabel: 'Deposito del 50%',
    optionDepositDescription: 'Paga la mitad ahora, el resto en tu cita',
    selectedLabel: 'Monto a pagar',
    // Payment type selection
    paymentTypeLabel: 'Selecciona como deseas pagar',
    cardLabel: 'Tarjeta de credito / debito',
    cardDescription: 'Pago en linea seguro',
    transferLabel: 'Transferencia bancaria',
    transferDescription: 'Deposito o transferencia a cuenta',
    // Credit card placeholder
    cardComingSoon: 'Pago con tarjeta proximamente',
    cardComingSoonDescription: 'Estamos trabajando para habilitar pagos con tarjeta. Por ahora, selecciona transferencia bancaria o confirma tu cita y paga al llegar.',
    // Bank transfer
    bankInfoTitle: 'Datos bancarios para transferencia',
    bankInfoNotConfigured: 'Datos bancarios no disponibles. Contactanos por WhatsApp para coordinar tu pago.',
    // Voucher upload
    voucherLabel: 'Comprobante de pago (opcional)',
    voucherDescription: 'Sube una foto o captura de tu comprobante',
    voucherSelectButton: 'Seleccionar imagen',
    voucherChangeButton: 'Cambiar',
    voucherMaxSize: 'Max 1MB — JPG, PNG o WebP',
    voucherTooLarge: 'El archivo excede el limite de 1MB',
    voucherInvalidType: 'Formato no soportado. Usa JPG, PNG o WebP',
    // Actions
    confirmWithoutPayment: 'CONFIRMAR CITA',
    backLabel: 'REGRESAR',
  },

  success: {
    heading: '¡Cita Confirmada!',
    message: 'Hemos recibido tu solicitud. Te contactaremos para confirmar los detalles.',
    codeLabel: 'Código de confirmación',
    backLabel: 'VOLVER AL INICIO',
  },
};

export type BookingContent = typeof bookingContent;
