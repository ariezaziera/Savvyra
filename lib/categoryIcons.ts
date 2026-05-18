// lib/categoryIcons.ts
// Auto-assigns icons by keyword match. Used as fallback when no DB icon exists.

export const CATEGORY_ICON_MAP: Record<string, string> = {
  // ── Income ──────────────────────────────────────────
  salary: "💼",
  paycheck: "💼",
  wages: "💼",
  freelance: "💻",
  consulting: "🤝",
  business: "🏢",
  investment: "📈",
  dividend: "📊",
  interest: "🏦",
  bonus: "🎁",
  gift: "🎁",
  refund: "🔄",
  rental: "🏠",
  rent: "🏠",
  commission: "💰",
  allowance: "💸",
  scholarship: "🎓",
  grant: "📋",
  pension: "👴",

  // ── Food & Drink ──────────────────────────────────
  food: "🍔",
  meal: "🍽️",
  restaurant: "🍽️",
  lunch: "🥗",
  dinner: "🍛",
  breakfast: "🥞",
  coffee: "☕",
  cafe: "☕",
  drinks: "🧃",
  groceries: "🛒",
  grocery: "🛒",
  market: "🛒",
  fastfood: "🍟",
  snacks: "🍿",
  dessert: "🍰",
  boba: "🧋",
  bubble: "🧋",

  // ── Transport ─────────────────────────────────────
  transport: "🚗",
  transportation: "🚗",
  grab: "🚕",
  taxi: "🚕",
  uber: "🚕",
  bus: "🚌",
  train: "🚆",
  lrt: "🚇",
  mrt: "🚇",
  commute: "🚇",
  flight: "✈️",
  travel: "✈️",
  toll: "🛣️",
  parking: "🅿️",
  petrol: "⛽",
  fuel: "⛽",
  car: "🚗",
  bike: "🚲",
  motorcycle: "🏍️",

  // ── Shopping ──────────────────────────────────────
  shopping: "🛍️",
  clothes: "👕",
  clothing: "👕",
  fashion: "👗",
  shoes: "👟",
  accessories: "💍",
  electronics: "📱",
  gadget: "⌚",
  furniture: "🛋️",
  online: "📦",
  lazada: "📦",
  shopee: "📦",

  // ── Bills & Utilities ─────────────────────────────
  bill: "📄",
  bills: "📄",
  utilities: "💡",
  electric: "⚡",
  electricity: "⚡",
  water: "💧",
  internet: "🌐",
  wifi: "📶",
  phone: "📱",
  mobile: "📱",
  telco: "📡",
  subscription: "🔔",
  netflix: "🎬",
  spotify: "🎵",
  streaming: "📺",
  insurance: "🛡️",

  // ── Health ────────────────────────────────────────
  health: "💊",
  medical: "🏥",
  doctor: "👨‍⚕️",
  clinic: "🏥",
  pharmacy: "💊",
  medicine: "💊",
  dental: "🦷",
  gym: "💪",
  fitness: "🏋️",
  sport: "⚽",
  sports: "⚽",
  yoga: "🧘",

  // ── Housing ───────────────────────────────────────
  housing: "🏠",
  house: "🏠",
  home: "🏠",
  mortgage: "🏦",
  maintenance: "🔧",
  repair: "🔧",
  renovation: "🏗️",
  cleaning: "🧹",
  laundry: "🧺",

  // ── Entertainment ─────────────────────────────────
  entertainment: "🎮",
  games: "🎮",
  gaming: "🎮",
  movie: "🎬",
  cinema: "🎬",
  concert: "🎶",
  music: "🎵",
  book: "📚",
  books: "📚",
  hobby: "🎨",
  art: "🎨",

  // ── Education ─────────────────────────────────────
  education: "🎓",
  school: "🏫",
  tuition: "📝",
  course: "📚",
  class: "📝",
  study: "📖",
  exam: "📝",

  // ── Savings & Finance ─────────────────────────────
  savings: "🏦",
  saving: "🏦",
  emergency: "🚨",
  tax: "📑",
  zakat: "🌙",
  sedekah: "🤲",
  charity: "❤️",
  donation: "❤️",

  // ── Debt ──────────────────────────────────────────
  loan: "🏦",
  debt: "💳",
  credit: "💳",
  borrowed: "🤝",
  hutang: "💳",

  // ── Investment ────────────────────────────────────
  stocks: "📈",
  crypto: "🪙",
  property: "🏗️",
  "unit trust": "📊",
  asnb: "📊",
  epf: "👴",
  kwsp: "👴",

  // ── Commitment ────────────────────────────────────
  commitment: "📄",
  monthly: "🔔",

  // ── Social ────────────────────────────────────────
  family: "👨‍👩‍👧‍👦",
  wedding: "💍",
  birthday: "🎂",
  party: "🥳",
  holiday: "🏖️",
  vacation: "🏖️",

  // ── Personal Care ─────────────────────────────────
  personal: "🪥",
  haircut: "💈",
  salon: "💅",
  skincare: "🧴",
  beauty: "💄",

  // ── Pets ──────────────────────────────────────────
  pet: "🐾",
  pets: "🐾",
  cat: "🐱",
  dog: "🐶",
  vet: "🐾",

  // ── Other ─────────────────────────────────────────
  other: "📌",
  misc: "📌",
  miscellaneous: "📌",
  general: "📌",
};

/**
 * Auto-assigns an icon based on category name keyword match.
 * Case-insensitive. Accepts both uppercase ("EXPENSE") and
 * title-case ("Expense") for the type param.
 */
export function getIconForCategory(
  name: string,
  type: string = "EXPENSE"
): string {
  // ✅ Normalize type to uppercase for consistent comparison
  const normalizedType = type.toUpperCase();

  if (!name) return normalizedType === "INCOME" ? "💰" : "📌";

  const lower = name.toLowerCase().replace(/\s+/g, "");

  // Try exact match first
  if (CATEGORY_ICON_MAP[lower]) return CATEGORY_ICON_MAP[lower];

  // Try keyword includes
  for (const [keyword, icon] of Object.entries(CATEGORY_ICON_MAP)) {
    if (lower.includes(keyword) || keyword.includes(lower)) {
      return icon;
    }
  }

  // ✅ Type-based fallback with full TransactionType support
  switch (normalizedType) {
    case "INCOME":     return "💰";
    case "DEBT":       return "💳";
    case "SAVINGS":    return "🏦";
    case "INVESTMENT": return "📈";
    case "COMMITMENT": return "🔔";
    default:           return "📌"; // EXPENSE + fallback
  }
}

/** Grouped icons for the icon picker UI */
export const ICON_PICKER_GROUPS = [
  {
    label: "Money & Finance",
    icons: ["💰", "💵", "💳", "🏦", "📈", "📉", "📊", "💸", "🪙", "💎"],
  },
  {
    label: "Food & Drink",
    icons: ["🍔", "🍽️", "🍛", "🥗", "☕", "🧃", "🍵", "🛒", "🍟", "🍰", "🧋", "🍿"],
  },
  {
    label: "Transport",
    icons: ["🚗", "🚕", "🚌", "🚇", "✈️", "⛽", "🅿️", "🛣️", "🚲", "🏍️", "🚆", "🛳️"],
  },
  {
    label: "Shopping",
    icons: ["🛍️", "👕", "👗", "👟", "💍", "📱", "⌚", "🛋️", "📦", "🎒", "🧥", "👜"],
  },
  {
    label: "Health & Fitness",
    icons: ["💊", "🏥", "👨‍⚕️", "🦷", "💪", "🏋️", "🧘", "⚽", "🩺", "🧬", "🩹", "🏃"],
  },
  {
    label: "Home & Bills",
    icons: ["🏠", "⚡", "💧", "🌐", "📶", "🔧", "🧹", "🏗️", "🛡️", "📄", "🔔", "🏡"],
  },
  {
    label: "Entertainment",
    icons: ["🎮", "🎬", "🎵", "🎶", "📚", "🎨", "🎭", "🎪", "🎯", "🎲", "🎸", "🎤"],
  },
  {
    label: "Education",
    icons: ["🎓", "📝", "📖", "🏫", "✏️", "🔬", "🧪", "📐", "💡", "🖊️", "📓", "🖥️"],
  },
  {
    label: "Social & Family",
    icons: ["👨‍👩‍👧‍👦", "❤️", "🎂", "🥳", "💍", "🤝", "🌍", "🏖️", "🎁", "🤲", "🙏", "🌙"],
  },
  {
    label: "Work & Income",
    icons: ["💼", "💻", "🏢", "📋", "📊", "🤝", "👔", "📞", "🖨️", "🗂️", "📬", "⚙️"],
  },
  {
    label: "Personal Care & Pets",
    icons: ["🪥", "💈", "💅", "🧴", "💄", "🐾", "🐱", "🐶", "🪞", "🧖", "🛁", "🌿"],
  },
  {
    label: "Misc",
    icons: ["📌", "🚨", "📑", "🔄", "⭐", "🔑", "📍", "🗺️", "🎯", "🧩", "💬", "🌀"],
  },
];