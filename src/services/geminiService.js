import { replacePhoneNumbersInText, findRemainingPhoneNumbers } from '../utils/phoneToWords.js';
import { pcmBase64ToMp3Blob } from './audioUtils.js';

// רשימת קולות Google AI Studio רשמיים
export const GEMINI_VOICES = [
  { id: 'Puck', name: 'Puck', gender: 'גברי', style: 'אנרגטי וקצבי', desc: 'מתאים לתשדירים קצביים, מבצעים ופתיחים בולטים', recommended: true },
  { id: 'Aoede', name: 'Aoede', gender: 'נשי', style: 'נעימה וזורמת', desc: 'קול חם, טבעי ואמין מאוד, מעולה למגוון תחומים', recommended: true },
  { id: 'Fenrir', name: 'Fenrir', gender: 'גברי', style: 'נלהב ודרמטי', desc: 'נוכחות ועוצמה ווקאלית, מתאים לאירועים מיוחדים', recommended: true },
  { id: 'Charon', name: 'Charon', gender: 'גברי', style: 'סמכותי ומקצועי', desc: 'קול עמוק ומשכנע, מותאם לשירותים מקצועיים' },
  { id: 'Kore', name: 'Kore', gender: 'נשי', style: 'תקיפה וברורה', desc: 'דיקציה מודגשת וסמכותית, מצוין להודעות רשמיות' },
  { id: 'Zephyr', name: 'Zephyr', gender: 'נשי', style: 'בהירה ואופטימית', desc: 'קול רענן, קליל ומזמין לסגנון חיים ושירותים' },
  { id: 'Leda', name: 'Leda', gender: 'נשי', style: 'צעירה ועכשווית', desc: 'קול דינמי ומודרני, מותאם לקהל רחב' },
  { id: 'Orus', name: 'Orus', gender: 'גברי', style: 'יציב ובטוח', desc: 'משדר אמינות גבוהה ויציבות' },
  { id: 'Despina', name: 'Despina', gender: 'נשי', style: 'יוקרתית וחלקה', desc: 'קול עדין ואלגנטי למותגי איכות' },
  { id: 'Algieba', name: 'Algieba', gender: 'גברי', style: 'רדיופוני וחלק', desc: 'טון קלאסי של קריין רדיו' },
  { id: 'Callirrhoe', name: 'Callirrhoe', gender: 'נשי', style: 'חמה וידידותית', desc: 'טון מזמין ואישי, מתאים לעסקים מקומיים' },
  { id: 'Algenib', name: 'Algenib', gender: 'גברי', style: 'עמוק ומיושב', desc: 'נוכחות גברית סמכותית' },
  { id: 'Laomedeia', name: 'Laomedeia', gender: 'נשי', style: 'קצבית וחיה', desc: 'קול חי וקצבי' },
  { id: 'Rasalgethi', name: 'Rasalgethi', gender: 'גברי', style: 'חד וקרייני', desc: 'דיקציה חדה וממוקדת' },
];

export const TTS_MODELS = [
  {
    id: 'gemini-2.5-flash-preview-tts',
    name: 'Gemini 2.5 Flash TTS',
    badge: 'מהיר (מומלץ)',
    desc: 'זמן תגובה מהיר, איכות צליל גבוהה וזמינות מלאה',
    isDefault: true,
  },
  {
    id: 'gemini-2.5-pro-preview-tts',
    name: 'Gemini 2.5 Pro TTS',
    badge: 'Studio Pro',
    desc: 'איכות צליל מקסימלית ועומק ווקאלי (דורש מכסת Pro)',
    isDefault: false,
  },
  {
    id: 'gemini-3.1-flash-tts-preview',
    name: 'Gemini 3.1 Flash TTS',
    badge: 'גרסה 3.1',
    desc: 'מודל דור הבא להבעות קוליות מתקדמות',
    isDefault: false,
  }
];

export const AD_STYLES = [
  { id: 'energetic', name: 'אנרגטי ומכירתי', promptDesc: 'קצבי, נלהב, יוצר עניין ומניע לפעולה' },
  { id: 'luxury', name: 'יוקרתי ואלגנטי', promptDesc: 'טון רגוע, מוקפד, סמכותי ויוקרתי' },
  { id: 'urgent', name: 'מבצע בזק ודחיפות', promptDesc: 'הדגשת זמן מוגבל והנעה מיידית לפעולה' },
  { id: 'friendly', name: 'חם וקהילתי', promptDesc: 'בגובה העיניים, לבבי, חם ומזמין' },
  { id: 'informative', name: 'סמכותי ומקצועי', promptDesc: 'מדויק, אמין, בהיר וסמכותי' },
];

export const AD_DURATIONS = [
  { id: '15s', label: '15 שניות', desc: 'טיזר קצר וקולע' },
  { id: '30s', label: '30 שניות', desc: 'אורך רדיו קלאסי', default: true },
  { id: '45s', label: '45 שניות', desc: 'תשדיר מפורט' },
  { id: '60s', label: '60 שניות', desc: 'תשדיר שמע מלא' },
];

/**
 * קבלת מפתח API אישי של המשתמש מהדפדפן שלו (ללא מפתח משותף גלובלי)
 */
export function getStoredApiKey() {
  const custom = localStorage.getItem('advoice_gemini_api_key');
  if (custom && custom.trim()) return custom.trim();
  return '';
}

/**
 * שמירת מפתח ה-API האישי ב-LocalStorage של המשתמש
 */
export function setStoredApiKey(key) {
  if (key && key.trim()) {
    localStorage.setItem('advoice_gemini_api_key', key.trim());
  } else {
    localStorage.removeItem('advoice_gemini_api_key');
  }
}

/**
 * מחולל תסריט מקומי חכם (Fallback) במקרה של חריגה ממכסת ה-API של גוגל
 */
export function generateLocalAdScript({ rawContent, styleId = 'energetic' }) {
  const cleanContent = rawContent.trim();
  const convertedContent = replacePhoneNumbersInText(cleanContent);
  const phones = findRemainingPhoneNumbers(cleanContent);

  let phoneCallout = '';
  if (phones.length > 0) {
    const spoken = formatSinglePhoneNumberToWords(phones[0]);
    phoneCallout = `להזמנות ופרטים נוספים, חייגו עכשיו: ${spoken}. שוב, חייגו: ${spoken}. אל תפספסו!`;
  } else {
    phoneCallout = 'לפרטים נוספים והזמנות פנו אלינו עוד היום!';
  }

  let hook = 'שימו לב להודעה הזאת!';
  if (styleId === 'urgent') hook = 'מבצע בזק לזמן מוגבל, הקשיבו עכשיו!';
  else if (styleId === 'luxury') hook = 'איכות, יוקרה וסטנדרט חדש מחכים לכם.';
  else if (styleId === 'friendly') hook = 'שלום לכולם, יש לנו בשורה נהדרת במיוחד בשבילכם.';
  else if (styleId === 'informative') hook = 'הודעה חשובה לכל המאזינים.';

  const spokenScript = `${hook} ${convertedContent}. ${phoneCallout}`;

  return {
    spokenScript,
    headline: 'תשדיר פרסום מותאם',
    callToAction: phoneCallout,
    estimatedDurationSec: 30,
    isFallback: true
  };
}

export async function generateAdScript({
  rawContent,
  styleId = 'energetic',
  durationId = '30s',
  customInstructions = '',
  apiKey = null,
}) {
  const key = apiKey || getStoredApiKey();
  if (!key) {
    throw new Error('נדרש מפתח Google AI Studio אישי. אנא הזן את מפתח ה-API שלך בהגדרות.');
  }

  const selectedStyle = AD_STYLES.find(s => s.id === styleId) || AD_STYLES[0];
  const selectedDuration = AD_DURATIONS.find(d => d.id === durationId) || AD_DURATIONS[1];

  const systemPrompt = `אתה קופירייטר מקצועי לתשדירי רדיו והודעות שמע בישראל.
מטרתך: לשכתב הודעה גולמית לתסריט רדיופוני מקצועי, קליט ומניע לפעולה.

כלל ברזל קריטי ומוחלט שחובה לציית לו בכל תסריט:
כשיש מספר טלפון בגוף ההודעה – חובה להמיר אותו למילים מדוברות בעברית בלבד!
דוגמאות מחייבות:
- במקום 052-5021055 חובה לכתוב: "אפס חמש שתיים, חמש אפס שתיים, אחת אפס חמש חמש"
- במקום 03-6543210 חובה לכתוב: "אפס שלוש, שש חמש ארבע, שלוש שתיים אחת אפס"
- במקום *6050 חובה לכתוב: "כוכבית שש אפס חמש אפס"
- במקום 1-800-200-300 חובה לכתוב: "אחת שמונה מאות, שתיים אפס אפס, שלוש אפס אפס"
אסור בשום אופן להשאיר ספרות במספרי טלפון!

הנחיות:
1. סגנון: ${selectedStyle.name} (${selectedStyle.promptDesc}).
2. משך: ${selectedDuration.label} (${selectedDuration.desc}).
3. מבנה: פתיח מושך קשב, גוף תמציתי ומדויק, והנעה ברורה לפעולה הכוללת את הטלפון במילים.
4. הטקסט מיועד להקראת TTS רצופה של קריין יחיד:
   - אין לכלול שמות דוברים ("קריין 1:") ואין לכלול הערות מוזיקה/סאונד בסוגריים ("[מוזיקה]").
   - הטקסט להקראה יכיל אך ורק את המילים הנאמרות, ברצף טבעי וקולח.

החזר JSON תקין בלבד:
{
  "spokenScript": "הטקסט הנקי והרציף שיוקרא על ידי הקריין, ללא שום הערות בימוי או סוגריים, עם כל מספרי הטלפון מומרים למילים",
  "headline": "כותרת תמציתית",
  "callToAction": "משפט הנעה לפעולה",
  "estimatedDurationSec": 30
}`;

  const userMessage = `ההודעה הגולמית:
"""
${rawContent}
"""

${customInstructions ? `הנחיות נוספות: ${customInstructions}` : ''}
זכור: spokenScript נקי לחלוטין מכל הערות בסוגריים, וכל מספר טלפון מומר למילים בעברית.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\n---\n\n${userMessage}` }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const msg = errData?.error?.message || '';

      if (response.status === 429 || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
        const quotaError = new Error('אזלה מכסת הבקשות/הטוקנים (שגיאה 429) במפתח Google AI Studio הנוכחי. ניתן להמתין דקה, להזין מפתח חלופי בהגדרות, או להשתמש בניסוח המקומי המובנה.');
        quotaError.code = 'QUOTA_EXHAUSTED';
        throw quotaError;
      }

      throw new Error(`שגיאה ב-Google AI Studio (${response.status}): ${msg}`);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      throw new Error('לא התקבלה תשובה משרת ה-AI.');
    }

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (e) {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = { spokenScript: rawText, headline: 'פרסומת קולית', estimatedDurationSec: 30 };
      }
    }

    if (parsed.spokenScript) {
      parsed.spokenScript = replacePhoneNumbersInText(parsed.spokenScript);
      parsed.spokenScript = parsed.spokenScript.replace(/\[.*?\]/g, '').replace(/\(.*?\)/g, '').replace(/\s+/g, ' ').trim();
    }

    return parsed;
  } catch (error) {
    throw error;
  }
}

export async function generateTTSAudio({
  scriptText,
  voiceName = 'Puck',
  model = 'gemini-2.5-flash-preview-tts',
  apiKey = null,
}) {
  const key = apiKey || getStoredApiKey();
  if (!key) {
    throw new Error('נדרש מפתח Google AI Studio אישי. אנא הזן את מפתח ה-API שלך בהגדרות.');
  }

  if (!scriptText || !scriptText.trim()) {
    throw new Error('אין טקסט להקראה.');
  }

  const cleanScript = replacePhoneNumbersInText(scriptText.trim());

  const payload = {
    contents: [
      {
        parts: [
          { text: cleanScript }
        ]
      }
    ],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: voiceName
          }
        }
      }
    }
  };

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const msg = errData?.error?.message || '';

    if (response.status === 429) {
      if (model.includes('pro')) {
        throw new Error('מכסת מודל ה-Pro אזלה בחשבון זה. בחר במודל המהיר והזמין Gemini 2.5 Flash TTS.');
      }
      throw new Error('אזלה מכסת הבקשות ב-Google AI Studio (שגיאה 429). המתן דקה ונסה שוב.');
    }

    throw new Error(`שגיאה בהפקת השמע: ${msg || response.status}`);
  }

  const data = await response.json();
  const inlineData = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData;

  if (!inlineData?.data) {
    throw new Error('לא התקבלו נתוני שמע מהשרת.');
  }

  // קידוד ל-MP3 אמיתי ותקני (24kHz 128kbps)
  const mp3Blob = pcmBase64ToMp3Blob(inlineData.data, 24000, 128);
  const audioUrl = URL.createObjectURL(mp3Blob);

  return {
    blob: mp3Blob,
    audioUrl,
    voiceName,
    model,
    format: 'mp3',
    generatedAt: new Date().toISOString()
  };
}
