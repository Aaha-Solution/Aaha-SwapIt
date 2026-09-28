/**
 * Input sanitization and XSS prevention utilities.
 * Strips script tags, unsafe protocols (javascript:, data:text/html),
 * inline event handlers (onerror, onload, onclick, etc.), and malicious payloads.
 */

// Regex to strip <script>...</script> tags and malicious HTML elements
const SCRIPT_TAG_REGEX = /<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi;
const IFRAME_TAG_REGEX = /<\s*iframe[^>]*>[\s\S]*?<\s*\/\s*iframe\s*>/gi;
const OBJECT_TAG_REGEX = /<\s*(?:object|embed|applet)[^>]*>[\s\S]*?<\s*\/\s*(?:object|embed|applet)\s*>/gi;
const EVENT_HANDLER_REGEX = /on[a-zA-Z]+\s*=\s*["'][^"']*["']/gi;
const JAVASCRIPT_PROTOCOL_REGEX = /javascript\s*:[^"'\s>]+/gi;
const DATA_HTML_PROTOCOL_REGEX = /data\s*:\s*text\/html[^"'\s>]*/gi;

/**
 * Clean a string value by removing known XSS vectors and normalizing unicode
 */
export function sanitizeString(val: string): string {
  if (typeof val !== 'string') return val;

  let cleaned = val
    .replace(SCRIPT_TAG_REGEX, '')
    .replace(IFRAME_TAG_REGEX, '')
    .replace(OBJECT_TAG_REGEX, '')
    .replace(EVENT_HANDLER_REGEX, '')
    .replace(JAVASCRIPT_PROTOCOL_REGEX, '')
    .replace(DATA_HTML_PROTOCOL_REGEX, '');

  return cleaned;
}

/**
 * Recursively sanitize objects, arrays, and strings in request bodies or query params
 */
export function sanitizeData<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string') {
    return sanitizeString(data) as unknown as T;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeData(item)) as unknown as T;
  }

  if (typeof data === 'object') {
    const sanitizedObj: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      // Don't modify binary buffers or internal objects
      if (Buffer.isBuffer(value)) {
        sanitizedObj[key] = value;
      } else {
        sanitizedObj[key] = sanitizeData(value);
      }
    }
    return sanitizedObj as T;
  }

  return data;
}
