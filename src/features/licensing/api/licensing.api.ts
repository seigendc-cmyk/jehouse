import type {
  ActivationCodeRecord,
  BookEntitlement,
  OfflineBookLicence,
} from "../domain/licensing.types";

export interface VerifyPaymentCommand {
  paymentVerificationId: string;
  verificationNote?: string;
}

export interface CreateEntitlementCommand {
  paymentVerificationId: string;
  maximumDevices: number;
  offlineReadingAllowed: boolean;
  reDownloadAllowed: boolean;
  expiresAt: string | null;
}

export interface GenerateActivationCodeCommand {
  entitlementId: string;
  expiresAt: string;
  maximumRedemptions: number;
}

export interface RedeemActivationCodeCommand {
  activationCode: string;
  deviceId: string;
  platform: string;
  applicationVersion: string;
}

export interface LicensingApi {
  verifyPayment(
    command: VerifyPaymentCommand,
  ): Promise<void>;

  createEntitlement(
    command: CreateEntitlementCommand,
  ): Promise<BookEntitlement>;

  generateActivationCode(
    command: GenerateActivationCodeCommand,
  ): Promise<ActivationCodeRecord>;

  redeemActivationCode(
    command: RedeemActivationCodeCommand,
  ): Promise<OfflineBookLicence>;

  revokeActivationCode(
    activationCodeId: string,
    reason: string,
  ): Promise<ActivationCodeRecord>;

  revokeLicence(
    licenceId: string,
    reason: string,
  ): Promise<OfflineBookLicence>;
}
