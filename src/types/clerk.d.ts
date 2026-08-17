// Augment Clerk's session claims so TypeScript knows about the metadata.role field
// that is injected via Clerk's session token customization (publicMetadata → session token).
declare global {
  interface CustomJwtSessionClaims {
    metadata?: {
      role?: string;
    };
  }
}

export {};
