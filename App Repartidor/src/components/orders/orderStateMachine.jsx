// src/utils/orderStateMachine.jsx

export const ORDER_STATUS = Object.freeze({
  PENDIENTE: 'Pendiente',
  ASIGNADO: 'Asignado',
  EN_CAMINO: 'En camino',
  PRODUCTO_RETIRADO: 'Producto retirado',
  ENTREGADO: 'Entregado',
});

export const TRANSITIONS = Object.freeze({
  [ORDER_STATUS.PENDIENTE]: [ORDER_STATUS.ASIGNADO],
  [ORDER_STATUS.ASIGNADO]: [ORDER_STATUS.EN_CAMINO],
  [ORDER_STATUS.EN_CAMINO]: [ORDER_STATUS.PRODUCTO_RETIRADO],
  [ORDER_STATUS.PRODUCTO_RETIRADO]: [ORDER_STATUS.ENTREGADO],
  [ORDER_STATUS.ENTREGADO]: [],
});

export const TRANSITION_RULES = Object.freeze({
  [`${ORDER_STATUS.EN_CAMINO}=>${ORDER_STATUS.PRODUCTO_RETIRADO}`]: {
    requiresPickupCode: true,
  },
});

export function canTransition(fromStatus, toStatus) {
  const allowed = TRANSITIONS[fromStatus] || [];
  return allowed.includes(toStatus);
}

export function getNextStatus(currentStatus) {
  const allowed = TRANSITIONS[currentStatus] || [];
  return allowed.length > 0 ? allowed[0] : null;
}

export function getTransitionRule(fromStatus, toStatus) {
  return TRANSITION_RULES[`${fromStatus}=>${toStatus}`] || {};
}

export function getPrimaryAction(order) {
  const next = getNextStatus(order?.status);
  if (!next) return null;

  const rule = getTransitionRule(order.status, next);

  return {
    type: 'ADVANCE_STATUS',
    label: next === ORDER_STATUS.ENTREGADO ? 'Entregar pedido' : `Marcar como: ${next}`,
    toStatus: next,
    requiresPickupCode: !!rule.requiresPickupCode,
  };
}

export function validateOrderForTransition(order, toStatus) {
  if (!order?.status) return { ok: false, reason: 'Pedido sin estado' };

  if (!canTransition(order.status, toStatus)) {
    return { ok: false, reason: `Transición inválida: ${order.status} → ${toStatus}` };
  }

  const rule = getTransitionRule(order.status, toStatus);
  if (rule.requiresPickupCode && !order.pickupCode) {
    return { ok: false, reason: 'Este pedido no tiene pickupCode configurado' };
  }

  return { ok: true };
}
