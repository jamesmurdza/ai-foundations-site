import { customAlphabet } from "nanoid";

const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
const nano = customAlphabet(alphabet, 16);

/** Short, url-safe, prefixed id e.g. `sub_8f2k...`. */
export function newId(prefix: string): string {
  return `${prefix}_${nano()}`;
}
