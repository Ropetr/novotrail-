import type { Context } from 'hono';
import type { HonoContext } from '../../shared/cloudflare/types';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';

const ACCESS_TOKEN_COOKIE = 'trail_access';
const REFRESH_TOKEN_COOKIE = 'trail_refresh';

/**
 * Opções de cookie seguras para produção.
 * httpOnly: previne acesso via JavaScript (proteção XSS)
 * secure: apenas HTTPS
 * sameSite: Strict para proteção CSRF
 */
function getCookieOptions(maxAge: number, isProduction: boolean) {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'Strict' as const,
    path: '/',
    maxAge,
  };
}

/**
 * Define os cookies de autenticação na resposta.
 */
export function setAuthCookies(
  c: Context<HonoContext>,
  accessToken: string,
  refreshToken: string
): void {
  const isProduction = c.env.ENVIRONMENT === 'production';

  setCookie(c, ACCESS_TOKEN_COOKIE, accessToken, getCookieOptions(
    15 * 60, // 15 minutos
    isProduction
  ));

  setCookie(c, REFRESH_TOKEN_COOKIE, refreshToken, getCookieOptions(
    7 * 24 * 60 * 60, // 7 dias
    isProduction
  ));
}

/**
 * Recupera o access token do cookie ou do header Authorization (fallback).
 */
export function getAccessToken(c: Context<HonoContext>): string | undefined {
  // Prioridade 1: Cookie httpOnly
  const cookieToken = getCookie(c, ACCESS_TOKEN_COOKIE);
  if (cookieToken) return cookieToken;

  // Prioridade 2: Header Authorization (compatibilidade)
  const authHeader = c.req.header('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return undefined;
}

/**
 * Recupera o refresh token do cookie.
 */
export function getRefreshToken(c: Context<HonoContext>): string | undefined {
  return getCookie(c, REFRESH_TOKEN_COOKIE);
}

/**
 * Remove os cookies de autenticação (logout).
 */
export function clearAuthCookies(c: Context<HonoContext>): void {
  deleteCookie(c, ACCESS_TOKEN_COOKIE, { path: '/' });
  deleteCookie(c, REFRESH_TOKEN_COOKIE, { path: '/' });
}
