/**
 * מנוע המרת מספרי טלפון ישראליים למילים מדוברות בעברית (רדיופוני)
 * 
 * חוק בל יעבור:
 * לדוגמה: 050-1234567 -> "אפס חמש אפס, אחת שתיים שלוש, ארבע חמש שש שבע"
 */

export const DIGIT_WORDS_HE = {
  '0': 'אפס',
  '1': 'אחת',
  '2': 'שתיים',
  '3': 'שלוש',
  '4': 'ארבע',
  '5': 'חמש',
  '6': 'שש',
  '7': 'שבע',
  '8': 'שמונה',
  '9': 'תשע'
};

/**
 * ממיר רצף ספרות למילים מופרדות ברווח
 */
export function digitsToWords(digitsStr) {
  return digitsStr
    .split('')
    .map(d => DIGIT_WORDS_HE[d] || d)
    .join(' ');
}

/**
 * ממיר מספר טלפון בודד לקריאה רדיופונית קולחת עם פסיקים לקצב דיבור נכון
 */
export function formatSinglePhoneNumberToWords(rawNumber) {
  if (!rawNumber) return '';

  const clean = rawNumber.trim();

  // מקרה 1: מספר כוכבית (למשל *6050, *2222)
  if (clean.startsWith('*')) {
    const starDigits = clean.slice(1).replace(/\D/g, '');
    return `כוכבית ${digitsToWords(starDigits)}`;
  }

  // מקרה 2: 1-800 או 1-700
  if (clean.startsWith('1-800') || clean.startsWith('1800') || clean.startsWith('1-700') || clean.startsWith('1700')) {
    const is800 = clean.includes('800');
    const digitsOnly = clean.replace(/\D/g, '');
    const prefix = is800 ? 'אחת שמונה מאות' : 'אחת שבע מאות';
    const rest = digitsOnly.slice(4);
    if (rest.length === 6) {
      return `${prefix}, ${digitsToWords(rest.slice(0, 3))}, ${digitsToWords(rest.slice(3))}`;
    }
    return `${prefix}, ${digitsToWords(rest)}`;
  }

  // מנקים מקפים, רווחים ותווים שאינם ספרות
  const digits = clean.replace(/\D/g, '');

  // מקרה 3: סלולרי ישראלי (10 ספרות, מתחיל ב-05)
  if (digits.length === 10 && digits.startsWith('05')) {
    const group1 = digitsToWords(digits.slice(0, 3)); // 052 -> אפס חמש שתיים
    const group2 = digitsToWords(digits.slice(3, 6)); // 502 -> חמש אפס שתיים
    const group3 = digitsToWords(digits.slice(6));    // 1055 -> אחת אפס חמש חמש
    return `${group1}, ${group2}, ${group3}`;
  }

  // מקרה 4: קידומת 3 ספרות קווי/סלולרי (למשל 077, 072, 073) + 7 ספרות (סה"כ 10 ספרות)
  if (digits.length === 10 && digits.startsWith('07')) {
    const group1 = digitsToWords(digits.slice(0, 3));
    const group2 = digitsToWords(digits.slice(3, 6));
    const group3 = digitsToWords(digits.slice(6));
    return `${group1}, ${group2}, ${group3}`;
  }

  // מקרה 5: קווי ישראלי 9 ספרות (02, 03, 04, 08, 09 + 7 ספרות)
  if (digits.length === 9 && digits.startsWith('0')) {
    const group1 = digitsToWords(digits.slice(0, 2)); // 03 -> אפס שלוש
    const group2 = digitsToWords(digits.slice(2, 5)); // 123 -> אחת שתיים שלוש
    const group3 = digitsToWords(digits.slice(5));    // 4567 -> ארבע חמש שש שבע
    return `${group1}, ${group2}, ${group3}`;
  }

  // מקרה 6: מספר עם קידומת בינלאומית ישראלית 972...
  if (digits.startsWith('972') && digits.length >= 11) {
    const local = '0' + digits.slice(3);
    return formatSinglePhoneNumberToWords(local);
  }

  // מקרה ברירת מחדל: חלוקה לקבוצות קריאות של 3-4 ספרות
  if (digits.length >= 7) {
    const chunks = [];
    let i = 0;
    while (i < digits.length) {
      const chunkSize = (digits.length - i <= 4) ? (digits.length - i) : 3;
      chunks.push(digitsToWords(digits.slice(i, i + chunkSize)));
      i += chunkSize;
    }
    return chunks.join(', ');
  }

  // פחות מ-7 ספרות
  return digitsToWords(digits);
}

/**
 * ביטויים רגולריים לזיהוי מספרי טלפון ישראליים בתוך טקסט חופשי
 */
const PHONE_REGEX_PATTERNS = [
  // 1-800 / 1-700
  /\b1[- ]?(?:800|700)[- ]?\d{3}[- ]?\d{3}\b/g,
  // סלולרי עם או בלי מקף: 050-1234567, 052-0000000, 054 123 4567
  /\b05\d[- ]?\d{3}[- ]?\d{4}\b/g,
  /\b05\d{8}\b/g,
  // קווי עם מקף: 03-1234567, 02-1234567, 04-..., 08-..., 09-...
  /\b0[23489][- ]?\d{3}[- ]?\d{4}\b/g,
  /\b0[23489]\d{7}\b/g,
  // 072 / 073 / 074 / 076 / 077 / 078 / 079
  /\b07\d[- ]?\d{3}[- ]?\d{4}\b/g,
  /\b07\d{8}\b/g,
  // כוכבית + 4 ספרות: *6050, *2222
  /\*\d{4,5}\b/g,
];

/**
 * סורק טקסט שלם וממיר כל מספר טלפון שנמצא בו למילים בעברית.
 */
export function replacePhoneNumbersInText(text) {
  if (!text) return '';

  let result = text;

  for (const pattern of PHONE_REGEX_PATTERNS) {
    result = result.replace(pattern, (match) => {
      return formatSinglePhoneNumberToWords(match);
    });
  }

  return result;
}

/**
 * בודק האם בטקסט נותרו מספרי טלפון גולמיים שלא הומרו
 */
export function findRemainingPhoneNumbers(text) {
  if (!text) return [];
  const found = [];

  for (const pattern of PHONE_REGEX_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) {
      found.push(...matches);
    }
  }

  return [...new Set(found)];
}
