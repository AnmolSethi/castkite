import { createHash, createHmac } from 'crypto';
import { HttpException } from '@nestjs/common';
import {
  AuthProvider,
  AuthProviderAbstract,
} from '@gitroom/backend/services/auth/providers.interface';

// Same redirect URI as the X channel integration, so the app needs no extra
// registration; the frontend proxy routes `state=login-*` to sign-in.
const defaultRedirect = () =>
  `${process.env.X_URL || process.env.FRONTEND_URL}/integrations/social/x`;

// X requires PKCE. The verifier is derived from the per-login random state
// (already checked against the oauth_state cookie), so nothing is stored.
const codeVerifier = (state: string) =>
  createHmac('sha256', process.env.JWT_SECRET!)
    .update(state)
    .digest('base64url');

// OAuth 2.0 sign-in: needs X_CLIENT_ID / X_CLIENT_SECRET (OAuth 2.0 keys, not
// the X_API_KEY pair) and "Request email from users" enabled on the X app.
@AuthProvider({ provider: 'X' })
export class XProvider extends AuthProviderAbstract {
  generateLink(query?: { redirect_uri?: string; state?: string }) {
    const state = query?.state || 'login';
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: process.env.X_CLIENT_ID!,
      redirect_uri: query?.redirect_uri || defaultRedirect(),
      state,
      scope: 'users.read tweet.read users.email',
      code_challenge: createHash('sha256')
        .update(codeVerifier(state))
        .digest('base64url'),
      code_challenge_method: 'S256',
    });
    return `https://x.com/i/oauth2/authorize?${params}`;
  }

  async getToken(code: string, redirectUri?: string, state?: string) {
    if (!state) {
      throw new HttpException('X sign-in expired, please sign in again', 400);
    }

    const { access_token } = await (
      await fetch('https://api.x.com/2/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(
            `${process.env.X_CLIENT_ID}:${process.env.X_CLIENT_SECRET}`
          ).toString('base64')}`,
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri || defaultRedirect(),
          code_verifier: codeVerifier(state),
        }),
      })
    ).json();

    if (!access_token) {
      throw new HttpException('X sign-in expired, please sign in again', 400);
    }

    return access_token as string;
  }

  async getUser(providerToken: string) {
    const { data } = await (
      await fetch('https://api.x.com/2/users/me?user.fields=confirmed_email', {
        headers: { Authorization: `Bearer ${providerToken}` },
      })
    ).json();

    if (!data?.id) {
      throw new HttpException('X sign-in failed, please try again', 400);
    }

    if (!data.confirmed_email) {
      throw new HttpException(
        'Your X account has no confirmed email address to sign in with',
        400
      );
    }

    return { id: String(data.id), email: data.confirmed_email as string };
  }
}
