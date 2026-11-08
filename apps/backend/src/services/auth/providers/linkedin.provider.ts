import { HttpException } from '@nestjs/common';
import {
  AuthProvider,
  AuthProviderAbstract,
} from '@gitroom/backend/services/auth/providers.interface';

// Same redirect URI as the LinkedIn channel integration, so the app needs no
// extra registration; the frontend proxy routes `state=login-*` to sign-in.
const defaultRedirect = () =>
  `${process.env.FRONTEND_URL}/integrations/social/linkedin`;

// "Sign In with LinkedIn using OpenID Connect" (a product on the LinkedIn app)
@AuthProvider({ provider: 'LINKEDIN' })
export class LinkedinProvider extends AuthProviderAbstract {
  generateLink(query?: { redirect_uri?: string; state?: string }) {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: process.env.LINKEDIN_CLIENT_ID!,
      redirect_uri: query?.redirect_uri || defaultRedirect(),
      state: query?.state || 'login',
      scope: 'openid profile email',
    });
    return `https://www.linkedin.com/oauth/v2/authorization?${params}`;
  }

  async getToken(code: string, redirectUri?: string) {
    const { access_token } = await (
      await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri || defaultRedirect(),
          client_id: process.env.LINKEDIN_CLIENT_ID!,
          client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
        }),
      })
    ).json();

    if (!access_token) {
      throw new HttpException(
        'LinkedIn sign-in expired, please sign in again',
        400
      );
    }

    return access_token as string;
  }

  async getUser(providerToken: string) {
    const data = await (
      await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: { Authorization: `Bearer ${providerToken}` },
      })
    ).json();

    if (!data?.sub) {
      throw new HttpException('LinkedIn sign-in failed, please try again', 400);
    }

    if (!data.email) {
      throw new HttpException(
        'Your LinkedIn account has no email address to sign in with',
        400
      );
    }

    return { id: String(data.sub), email: data.email as string };
  }
}
