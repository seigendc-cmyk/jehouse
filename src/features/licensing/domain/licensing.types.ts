export type LicenceStatus =
  | "PENDING"
  | "ACTIVE"
  | "SUSPENDED"
  | "REVOKED"
  | "EXPIRED";

export type ActivationCodeStatus =
  | "GENERATED"
  | "SENT"
  | "PARTIALLY_REDEEMED"
  | "FULLY_REDEEMED"
  | "EXPIRED"
  | "REVOKED";

export type PaymentVerificationStatus =
  | "PAYMENT_PENDING"
  | "POP_SUBMITTED"
  | "UNDER_REVIEW"
  | "VERIFIED"
  | "REJECTED";

export interface BookEntitlement {
  entitlementId: string;
  readerId: string;
  bookId: string;
  releaseId: string;
  status: LicenceStatus;
  maximumDevices: number;
  activatedDeviceCount: number;
  offlineReadingAllowed: boolean;
  reDownloadAllowed: boolean;
  issuedAt: string;
  expiresAt: string | null;
  issuedByUserId: string;
}

export interface ActivationCodeRecord {
  activationCodeId: string;
  entitlementId: string;
  codeHash: string;
  codeLastFour: string;
  status: ActivationCodeStatus;
  maximumRedemptions: number;
  redemptionCount: number;
  generatedAt: string;
  expiresAt: string;
  generatedByUserId: string;
  sentAt: string | null;
  revokedAt: string | null;
  revokedByUserId: string | null;
}

export interface ReaderDevice {
  deviceId: string;
  readerId: string;
  displayName: string;
  platform: string;
  applicationVersion: string;
  registeredAt: string;
  lastSeenAt: string;
  status: "ACTIVE" | "BLOCKED" | "REMOVED";
}

export interface OfflineBookLicence {
  licenceId: string;
  entitlementId: string;
  readerId: string;
  deviceId: string;
  bookId: string;
  releaseId: string;
  status: LicenceStatus;
  offlineReadingAllowed: boolean;
  issuedAt: string;
  expiresAt: string | null;
  signatureAlgorithm: string;
  signingKeyId: string;
  signedLicenceToken: string;
}
