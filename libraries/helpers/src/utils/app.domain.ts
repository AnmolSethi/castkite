// this deployment's own domain, from FRONTEND_URL; never throws (Stripe webhook code calls it)
export const appDomain = () => {
  try {
    return new URL(process.env.FRONTEND_URL || '').hostname || 'localhost';
  } catch {
    return 'localhost';
  }
};
