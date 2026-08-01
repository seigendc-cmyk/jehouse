import type {
  ActivationCodeRecord,
  ActivationCodeStatus,
} from "./licensing.types";

const allowedTransitions: Record<
  ActivationCodeStatus,
  readonly ActivationCodeStatus[]
> = {
  GENERATED: [
    "SENT",
    "PARTIALLY_REDEEMED",
    "FULLY_REDEEMED",
    "EXPIRED",
    "REVOKED",
  ],
  SENT: [
    "PARTIALLY_REDEEMED",
    "FULLY_REDEEMED",
    "EXPIRED",
    "REVOKED",
  ],
  PARTIALLY_REDEEMED: [
    "FULLY_REDEEMED",
    "EXPIRED",
    "REVOKED",
  ],
  FULLY_REDEEMED: [],
  EXPIRED: [],
  REVOKED: [],
};

export function canTransitionActivationCode(
  currentStatus: ActivationCodeStatus,
  nextStatus: ActivationCodeStatus,
): boolean {
  return allowedTransitions[currentStatus].includes(nextStatus);
}

export function transitionActivationCode(
  record: ActivationCodeRecord,
  nextStatus: ActivationCodeStatus,
): ActivationCodeRecord {
  if (!canTransitionActivationCode(record.status, nextStatus)) {
    throw new Error(
      `Invalid activation-code transition: ${record.status} -> ${nextStatus}`,
    );
  }

  return {
    ...record,
    status: nextStatus,
  };
}
