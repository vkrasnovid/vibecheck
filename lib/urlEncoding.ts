export function encodeText(text: string): string {
  return btoa(encodeURIComponent(text))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export function decodeText(encoded: string): string {
  const padded = encoded + '==='.slice((encoded.length + 3) % 4);
  return decodeURIComponent(atob(padded.replace(/-/g, '+').replace(/_/g, '/')));
}
