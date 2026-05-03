"use client";

function isLocalhost(): boolean {
  try {
    return window.location.hostname.includes("localhost");
  } catch {
    return false;
  }
}

function buildAttributes(maxAge: number): string {
  const parts = [`max-age=${maxAge}`, "path=/", "SameSite=Lax"];
  if (!isLocalhost()) {
    parts.push("domain=.aiskill-market.com");
    parts.push("Secure");
  }
  return parts.join("; ");
}

export function getCookie(name: string): string | null {
  try {
    const match = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${name}=`));
    return match ? decodeURIComponent(match.split("=")[1]) : null;
  } catch {
    return null;
  }
}

export function setCookie(name: string, value: string, maxAge = 31536000): void {
  try {
    document.cookie = `${name}=${encodeURIComponent(value)}; ${buildAttributes(maxAge)}`;
  } catch {}
}

/** Read from cookie; if absent, migrate from localStorage and write cookie. */
export function getCookieWithMigration(name: string): string | null {
  const cookieVal = getCookie(name);
  if (cookieVal !== null) return cookieVal;
  try {
    const lsVal = localStorage.getItem(name);
    if (lsVal !== null) {
      setCookie(name, lsVal);
      return lsVal;
    }
  } catch {}
  return null;
}
