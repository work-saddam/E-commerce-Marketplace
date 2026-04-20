const parseDelayMin = (value, fallback) => {
  const minutes = Number(value);
  return Number.isFinite(minutes) && minutes > 0 ? minutes : fallback;
};

const ORDER_RESERVATION_DELAY_MS = parseDelayMin(
  process.env.ORDER_RESERVATION_DELAY_MIN,
  15,
);

const AUTHORIZED_PAYMENT_GRACE_MS = parseDelayMin(
  process.env.AUTHORIZED_PAYMENT_GRACE_MIN,
  10,
);

const getReservationExpiryDate = (
  from = new Date(),
  delayMs = ORDER_RESERVATION_DELAY_MS,
) => new Date(from.getTime() + delayMs);

const isReservationExpired = (reservationExpiresAt, now = new Date()) => {
  if (!reservationExpiresAt) {
    return false;
  }

  return new Date(reservationExpiresAt).getTime() <= now.getTime();
};

module.exports = {
  AUTHORIZED_PAYMENT_GRACE_MS,
  ORDER_RESERVATION_DELAY_MS,
  getReservationExpiryDate,
  isReservationExpired,
};
