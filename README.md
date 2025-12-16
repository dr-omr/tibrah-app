# طِبرَا - تطبيق الطب الوظيفي 🌿

<div align="center">

![طِبرَا](https://img.shields.io/badge/طِبرَا-الطب_الوظيفي-2D9B83?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38B2AC?style=flat-square&logo=tailwind-css)

**تطبيق صحي شامل للطب الوظيفي مع مساعد ذكي باللهجة اليمنية**

</div>

---

## ✨ المميزات

- 🤖 **مساعد ذكي** - مدعوم بـ Google Gemini AI باللهجة اليمنية
- 🗺️ **خريطة الجسم** - الطب الشعوري واكتشاف الأسباب النفسية للأمراض
- 📚 **دورات تعليمية** - تعلم الطب الوظيفي
- 🎵 **ترددات شفائية** - Rife Frequencies للعلاج بالصوت
- 🛒 **متجر المكملات** - منتجات صحية موثوقة
- 📅 **حجز المواعيد** - جلسات تشخيصية مع د. عمر العماد
- 📱 **PWA** - يعمل كتطبيق على الهاتف

## 🚀 التثبيت

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/tibrah-medical.git
cd tibrah-medical

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Add your API keys to .env.local

# Run development server
npm run dev
```

## ⚙️ Environment Variables

```env
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_APP_NAME=طِبرَا
NEXT_PUBLIC_WHATSAPP_NUMBER=967771447111
```

## 📁 Project Structure

```
├── components/          # React components
│   ├── ai/             # AI integration (Gemini)
│   ├── common/         # Shared components
│   ├── home/           # Homepage components
│   ├── navigation/     # Header, Footer, BottomNav
│   └── ui/             # UI primitives
├── pages/              # Next.js pages
├── styles/             # Global CSS
├── contexts/           # React contexts
├── hooks/              # Custom hooks
└── public/             # Static assets
```

## 🔧 Tech Stack

- **Framework:** Next.js 14 (Pages Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **AI:** Google Gemini 1.5 Flash
- **State:** React Query
- **UI:** Custom components + Radix UI

## 📱 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy! 🚀

## 👨‍⚕️ About

Created for **د. عمر العماد** - Functional Medicine Specialist

📞 WhatsApp: +967 771 447 111
📧 Email: dr.omaralemad@gmail.com
📍 Location: Yemen

---

<div align="center">
Made with ❤️ in Yemen 🇾🇪
</div>
