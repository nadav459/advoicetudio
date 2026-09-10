# AdVoice Studio

סטודיו מתקדם ליצירת פרסומות קוליות (TTS) לקווי שמע והודעות שידור, מעוצב בדיוק לפי מפרט **Apple iOS 18 UI Kit** (Light Theme) עם טיפוגרפיית **SF Pro Text** ו-**פלוני אאא**.

🌐 **אתר חי באוויר:** [https://advoicestudio.onrender.com](https://advoicestudio.onrender.com)  
📦 **מאגר GitHub:** [https://github.com/nadav459/advoicetudio](https://github.com/nadav459/advoicetudio)

---

## תכונות עיקריות

- **קופירייטינג רדיופוני מבוסס AI**: שכתוב הודעה גולמית לתשדיר רדיו קליט, קצבי ומניע לפעולה בעברית.
- **המרת מספרי טלפון למילים בעברית**: כל מספר טלפון (סלולרי, נייח, כוכבית, 1-800) מומר אוטומטית למילים מדוברות (למשל `052-5021055` מומר ל-`״אפס חמש שתיים, חמש אפס שתיים, אחת אפס חמש חמש״`) כדי להבטיח הגייה מושלמת בקווי שמע.
- **קריינות Google AI Studio TTS**: תמיכה במודלי `gemini-2.5-flash-preview-tts` ו-`gemini-2.5-pro-preview-tts` עם מגוון קולות רשמיים (Puck, Aoede, Charon, Fenrir, Kore ועוד).
- **ייצוא MP3 אמיתי (128kbps)**: המרה פנימית ישירה באמצעות LAME מנתוני ה-PCM של גוגל לקובץ MP3 קל, איכותי ותואם לכל מרכזיה או טלפון.
- **שיתוף בלחיצה אחת**: שיתוף ישיר של קובץ השמע ל-WhatsApp ו-Telegram (תמיכה מלאה ב-Web Share API בנייד והורדה מהירה בדסקטופ).
- **שמירה מקומית (IndexedDB)**: שמירת היסטוריית התשדירים וההקלטות במכשיר המשתמש ללא צורך ברישום.
- **פרטיות ואבטחה מוחלטת**: המערכת פועלת כולה בצד הלקוח (Client-Side). כל משתמש מגדיר את מפתח ה-API האישי שלו שנשמר מקומית ב-`localStorage` בלבד ואינו נשלח לשום שרת צד שלישי.

---

## מבנה הפרויקט

```
├── public/
│   ├── favicon.svg              # אייקון Squircle לפי Apple HIG
│   ├── favicon-32.png           # אייקון דפדפן
│   ├── favicon-64.png           # אייקון רטינה
│   ├── apple-touch-icon.png     # אייקון למסך הבית ב-iOS (180x180)
│   └── fonts/                   # גופני SF Pro Text ופלוני אאא
├── src/
│   ├── components/              # רכיבי ממשק לפי תקן Apple HIG
│   │   ├── Header.jsx           # סרגל עליון עם כפתור מפתח והיסטוריה
│   │   ├── StepIndicator.jsx    # מחוון שלבים
│   │   ├── InputStep.jsx        # הזנת פרטי הפרסומת ובחירת סגנון
│   │   ├── ScriptReviewStep.jsx # עריכת התסריט ואישורו
│   │   ├── VoiceStudioStep.jsx  # בחירת קול קריין ומודל
│   │   ├── AudioPlayer.jsx      # נגן אודיו מותאם ל-iOS
│   │   ├── AudioResultStep.jsx  # נגן, הורדת MP3 ושיתוף לוואטסאפ/טלגרם
│   │   ├── HistoryDrawer.jsx    # מגירת היסטוריית הקלטות מקומית
│   │   └── SettingsModal.jsx    # הזנת מפתח API ומדריך הוצאת מפתח
│   ├── services/
│   │   ├── audioUtils.js        # מפענח PCM וממיר MP3 (128kbps)
│   │   ├── geminiService.js     # אינטגרציה עם Gemini TTS וקופירייטינג
│   │   └── storageService.js    # ניהול היסטוריה ב-IndexedDB
│   ├── utils/
│   │   └── phoneToWords.js      # מנוע המרת מספרי טלפון למילים בעברית
│   ├── App.jsx                  # ניהול מצב האפליקציה (Step Flow)
│   ├── index.css                # עיצוב Apple Light Theme וטיפוגרפיה
│   └── main.jsx
├── render.yaml                  # קובץ הגדרות פריסה מהירה ל-Render
├── index.html
└── package.json
```

---

## הרצה מקומית

```bash
# שכפול המאגר
git clone https://github.com/nadav459/advoicetudio.git
cd advoicetudio

# התקנת תלויות
npm install

# הרצת שרת פיתוח
npm run dev
```

## בנייה (Production Build)

```bash
npm run build
```

התוצרים ייבנו לתיקיית `dist/` ומוכנים לפריסה סטטית ב-Render או בכל שרת סטטי אחר.
