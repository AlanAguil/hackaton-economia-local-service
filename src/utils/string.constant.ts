export const stringConstants = {
  primaryColor: '#FF5A5F',
  characters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  none: 'None',
  incorrectAuth: 'Credenciales incorrectas',

  // Mensajes de validación
  validationMessages: {
    paymentExceedsTotal: 'El monto del pago excede el total pendiente de la orden',
    invalidPaymentAmount: 'El monto del pago no puede ser mayor al total de la orden',
    cannotReturnToVerification: 'No se puede regresar a verificación un pago que ya fue procesado (aceptado, rechazado o cancelado)'
  },

  ADMIN: 'ADMIN',
  MANAGEMENT_STAFF: 'MANAGEMENT_STAFF',
  MANAGEMENT: 'MANAGEMENT',
  MEDIC: 'MEDIC',
  PATIENT: 'PATIENT',

  tagVersion: '1.0.0',

  INSERT_DATA_ERROR: 'INSERT_DATA_ERROR',
  TABLE_NOT_FOUND: 'TABLE_NOT_FOUND',
  UNHANDLED_SQL_ERROR: 'UNHANDLED_SQL_ERROR',

  SALT_ROUNDS: 10,
  sendMailAssignamentSummary: "Send an email assignament ",
  sendMailAssignamentEmailSent: "Email Sent Successfully",
  sendMailAssignamentUserNotFound: "User not found",

  resourceNotFound: 'Recurso no encontrado',
  authNotFound: 'Autenticación no encontrada',
  mediaNotFound: 'Medio no encontrado',
  userNotFound: 'Usuario no encontrado',
  appointmentNotFound: 'Cita no encontrada',

  // Entity Types
  OS_ANDROID: 'ANDROID',
  OS_IOS: 'IOS',
  OS_WEB: 'WEB',
  FILE_TYPE_IMAGE: 'IMAGE',
  FILE_TYPE_PDF: 'PDF',
  FILE_TYPE_VIDEO: 'VIDEO',
  FILE_TYPE_OTHER: 'OTHER',
  ENTITY_TYPE_PRODUCT: 'PRODUCT',
  ENTITY_TYPE_PACK: 'PACK',
  ENTITY_TYPE_LINE: 'LINE',
  ENTITY_TYPE_MODEL: 'MODEL',
  
  whatsappTemplates: {
    welcome: {
      message: (name: string) => `¡Hola ${name}! 🎉
  
  Bienvenido a Central scrow. ¡Nos alegra mucho tenerte aquí!
  
  Tu cuenta ya está lista.
  
  Si necesitas algo, solo dinos. Estamos para ayudarte.
  
  – Equipo Central scrow`
    },
    paymentAccepted: {
      message: (name: string, amount: number, reference: string, pending: number) => `¡Hola ${name}! 🎉
  
  ¡Tu pago de $${amount} fue aceptado con éxito!
  
  📌 El pedido a nombre de: ${name}
  💵 Monto pendiente: $${pending}
  
  Gracias por confiar en nosotros.
  
  ¿Tienes dudas? Escríbenos cuando gustes.
  
  – Equipo Central scrow`
    },
    paymentRejected: {
      message: (name: string, amount: number, reference: string) => `¡Hola ${name}! 😔
  
  Tu pago de $${amount} fue rechazado.
  
  📌 El pedido a nombre de: ${name}
  
  Revisa los datos del pago o intenta con otro método.
  
  Si necesitas ayuda, estamos para apoyarte.
  
  – Equipo Central scrow`
    },
    paymentCancelled: {
      message: (name: string, amount: number, reference: string) => `¡Hola ${name}! 📝
  
  Se canceló el pago de $${amount}.
  
  📌 El pedido a nombre de: ${name}
  
  ¿Tienes alguna duda? No dudes en escribirnos.
  
  – Equipo Central scrow`
    },
    orderDelivered: {
      message: (name: string, orderReference: string) => `¡Hola ${name}! 🎓
  
  El pedido a nombre de ${name} ya fue entregado. ¡Gracias por confiar en Graduaciones Central scrow!
  
  Esperamos que lo disfrutes y que tu graduación sea increíble.
  
  Cualquier cosa, estamos aquí para ti.
  
  – Equipo Central scrow`
    },
    paymentRequest: {
      message: (name: string, orderId: bigint, amount: number) => `¡Hola ${name}! 💰
  
  Tienes un pago pendiente de $${amount} para el pedido a tu nombre.
  
  Cuando lo tengas listo, envíanos una imagen del comprobante con el texto: "Pago: $${amount}".
  
  ¿Te ayudamos con algo? Escríbenos.
  
  – Equipo Central scrow`
    },
    paymentReceived: {
      message: (name: string, orderId: bigint, amount: number, billId: bigint) => `¡Hola ${name}! ✅
  
  Recibimos tu comprobante por $${amount} para el pedido a tu nombre.
  
  Estamos verificando tu pago. Te avisamos en cuanto esté listo.
  
  – Equipo Central scrow`
    },
  }
  
};
