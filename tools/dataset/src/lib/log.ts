// Log simples do pipeline (stdout/stderr). DATASET_QUIET=1 silencia info (usado nos testes).
const quiet = () => process.env.DATASET_QUIET === "1";

export const log = {
  info(message: string): void {
    if (!quiet()) console.log(message);
  },
  warn(message: string): void {
    if (!quiet()) console.warn(`aviso: ${message}`);
  },
  error(message: string): void {
    console.error(`erro: ${message}`);
  },
};
