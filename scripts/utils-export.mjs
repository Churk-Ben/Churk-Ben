/** 导出命令共用的文本格式化与清洗工具。 */

export function sleep(ms) {
  return new Promise((done) => setTimeout(done, ms));
}

export function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function truncate(text, max) {
  const characters = [...text];
  return characters.length > max ? `${characters.slice(0, max - 1).join("")}…` : text;
}

export function displayWidth(text) {
  let width = 0;
  for (const character of text) {
    width += /[\u1100-\u115f\u2e80-\ua4cf\uac00-\ud7a3\uf900-\ufaff\ufe30-\ufe4f\uff00-\uff60\uffe0-\uffe6]/.test(
      character,
    )
      ? 2
      : 1;
  }
  return width;
}

export function padDisplay(text, width) {
  return `${text}${" ".repeat(Math.max(0, width - displayWidth(text)))}`;
}

export function formatDate(value, withTime = false) {
  const date = new Date(Number(value) || Date.now());
  const pad = (number) => String(number).padStart(2, "0");
  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  return withTime ? `${day} ${pad(date.getHours())}:${pad(date.getMinutes())}` : day;
}

/** 尖括号保持实体形式，避免正文里的 &lt;script&gt; 变成真的 HTML 标签。 */
function numericEntity(match, codePoint) {
  if (!Number.isInteger(codePoint) || codePoint === 60 || codePoint === 62) return match;
  try {
    return String.fromCodePoint(codePoint);
  } catch {
    return match;
  }
}

export function decodeEntities(text) {
  const named = { amp: "&", apos: "'", nbsp: " ", quot: '"' };
  return text.replace(/&(#x?[\da-f]+|amp|apos|nbsp|quot);/gi, (match, code) => {
    const key = code.toLowerCase();
    if (key.startsWith("#x")) return numericEntity(match, Number.parseInt(key.slice(2), 16));
    if (key.startsWith("#")) return numericEntity(match, Number.parseInt(key.slice(1), 10));
    return named[key] ?? match;
  });
}

export function plainText(value) {
  return decodeEntities(String(value).replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

export function slugify(title, id, date) {
  const words = String(title)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .split("-")
    .filter(Boolean)
    .slice(0, 6)
    .join("-");
  const suffix = String(id)
    .replace(/[^a-z0-9]/gi, "")
    .slice(-8)
    .toLowerCase();

  return `${date}-${words || suffix || "note"}`;
}

const IMAGE_EXTENSIONS = {
  "image/avif": "avif",
  "image/gif": "gif",
  "image/heic": "heic",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/svg+xml": "svg",
  "image/webp": "webp",
};

export function imageExtension(mime) {
  return IMAGE_EXTENSIONS[mime.split(";")[0].trim().toLowerCase()] ?? "jpg";
}
