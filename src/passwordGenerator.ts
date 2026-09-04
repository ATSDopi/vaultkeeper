const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";

export interface PasswordOptions {
  length: number;
  lowercase: boolean;
  uppercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
}

export const DEFAULT_OPTIONS: PasswordOptions = {
  length: 20,
  lowercase: true,
  uppercase: true,
  numbers: true,
  symbols: true,
  excludeAmbiguous: true,
};

const AMBIGUOUS_CHARS = "il1Lo0O";

function getCharset(options: PasswordOptions): string {
  let charset = "";
  if (options.lowercase) charset += LOWERCASE;
  if (options.uppercase) charset += UPPERCASE;
  if (options.numbers) charset += NUMBERS;
  if (options.symbols) charset += SYMBOLS;

  if (options.excludeAmbiguous) {
    charset = charset
      .split("")
      .filter((c) => !AMBIGUOUS_CHARS.includes(c))
      .join("");
  }

  return charset;
}

function getSecureRandom(max: number): number {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] % max;
}

export function generatePassword(options: PasswordOptions = DEFAULT_OPTIONS): string {
  const charset = getCharset(options);
  if (!charset) return "";

  let password = "";
  for (let i = 0; i < options.length; i++) {
    password += charset[getSecureRandom(charset.length)];
  }

  return password;
}

export function generatePassphrase(
  wordCount: number = 4,
  separator: string = "-",
  capitalize: boolean = true
): string {
  const words = [
    "apple", "brave", "cloud", "dance", "eagle", "flame", "grace", "heart",
    "ivory", "jungle", "kneel", "lemon", "mango", "noble", "ocean", "pearl",
    "quest", "river", "storm", "tiger", "ultra", "vivid", "whisper", "xenon",
    "yacht", "zebra", "alpha", "blaze", "coral", "delta", "ember", "frost",
    "globe", "haven", "index", "joker", "karma", "lotus", "magic", "nexus",
    "orbit", "prism", "quartz", "radar", "solar", "theta", "unity", "vapor",
    "wave", "xray", "yield", "zenith", "arrow", "bloom", "crest", "dawn",
    "echo", "fable", "gleam", "honor", "iris", "jewel", "knight", "lunar",
    "mist", "onyx", "pulse", "quill", "ridge", "spark", "trace", "umbra",
    "vault", "wired", "xerox", "yearn", "zonal", "amber", "birch", "cliff",
    "drift", "elfin", "forge", "giant", "hedge", "ionic", "jolly", "knack",
  ];

  const selected: string[] = [];
  for (let i = 0; i < wordCount; i++) {
    const word = words[getSecureRandom(words.length)];
    selected.push(capitalize ? word.charAt(0).toUpperCase() + word.slice(1) : word);
  }

  return selected.join(separator);
}

export function calculateEntropy(password: string): number {
  let charsetSize = 0;
  if (/[a-z]/.test(password)) charsetSize += 26;
  if (/[A-Z]/.test(password)) charsetSize += 26;
  if (/[0-9]/.test(password)) charsetSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 24;

  if (charsetSize === 0) return 0;
  return Math.round(password.length * Math.log2(charsetSize));
}

export function getStrengthLabel(entropy: number): {
  label: string;
  color: string;
  percentage: number;
} {
  if (entropy < 28) return { label: "Very Weak", color: "#ef4444", percentage: 10 };
  if (entropy < 36) return { label: "Weak", color: "#f97316", percentage: 25 };
  if (entropy < 60) return { label: "Fair", color: "#eab308", percentage: 50 };
  if (entropy < 128) return { label: "Strong", color: "#22c55e", percentage: 75 };
  return { label: "Very Strong", color: "#16a34a", percentage: 100 };
}
