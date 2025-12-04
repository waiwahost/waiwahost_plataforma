// Utilidad cn local (copiada y adaptada)
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ');
}

/**
 * Copia texto al portapapeles de manera robusta, con fallback para entornos no seguros (HTTP).
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  try {
    // Intento 1: API moderna (requiere contexto seguro HTTPS o localhost)
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    throw new Error('Clipboard API not available');
  } catch (err) {
    // Intento 2: Fallback clásico con textarea (funciona en HTTP)
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;

      // Asegurar que el textarea no sea visible
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      document.body.appendChild(textArea);

      textArea.focus();
      textArea.select();

      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);

      return successful;
    } catch (fallbackErr) {
      console.error('Fallback copy failed:', fallbackErr);
      return false;
    }
  }
}
