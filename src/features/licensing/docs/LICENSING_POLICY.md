# Book Licensing Policy

## Authority

Book Publisher is the administrative interface for payment verification,
entitlement creation, activation-code administration and licence management.

Security-sensitive operations must execute on a trusted backend.

## Data pack responsibility

A protected data pack contains:

- book ID;
- release ID;
- licence requirement;
- publisher signature;
- content hashes;
- minimum reader version.

A data pack must not contain:

- a universal activation code;
- a reusable master licence;
- private signing keys;
- WhatsApp credentials;
- payment-provider credentials.

## Activation code responsibility

An activation code is a temporary redemption credential.

It is not the permanent offline licence.

The backend must enforce:

- expiry;
- redemption limits;
- entitlement status;
- device limits;
- revocation;
- audit logging.

## Offline licence responsibility

After successful activation, the backend issues a signed licence bound to:

- entitlement;
- reader;
- device;
- book;
- release;
- validity period.

The offline shell stores and validates this signed licence locally.

## Proof-of-payment rule

Uploading proof of payment must never grant access automatically.

Only an explicitly VERIFIED payment may permit entitlement creation.

## Frontend restrictions

Frontend code must never:

- generate production activation codes;
- possess private signing keys;
- directly issue device licences;
- approve payments without backend authorization;
- directly change redemption counts.

## Audit requirement

Every privileged licensing action must create an audit event.
