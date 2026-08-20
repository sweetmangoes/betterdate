/** Only allow in-app relative paths as post-login redirects. */
export function safeNextPath(path: string | null | undefined): string {
  if (!path || !path.startsWith('/') || path.startsWith('//') || path.includes('\\')) {
    return '/'
  }
  return path
}
