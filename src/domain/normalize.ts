// Contrato compartilhado (Onda 0, B1.5, congelado): normalizacao unica de busca.
// Usada pelo pipeline (B2.2, searchKey) e pelo runtime (B6.5, search.ts), para os dois normalizarem igual.

// Marcas diacriticas combinantes (U+0300 a U+036F), montadas por codigo para ficar legivel em qualquer editor.
const COMBINING_MARKS = new RegExp(`[${String.fromCharCode(0x300)}-${String.fromCharCode(0x36f)}]`, "g");

/** NFD, remove acentos, minusculo, trim. "Pântano" -> "pantano"; "" -> "". */
export function normalizeSearch(s: string): string {
  return s.normalize("NFD").replace(COMBINING_MARKS, "").toLowerCase().trim();
}
