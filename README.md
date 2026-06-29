# Lyra AI — Frontend (Next.js)

Claude AI uslubidagi chat interfeysi. Gemini modellariga **Next.js server route**
(`/api/chat`) orqali ulanadi — API kaliti serverda qoladi, brauzerga chiqmaydi.
Keyinchalik NestJS backend tayyor bo'lsa, faqat `.env` o'zgaradi (kod o'zgarmaydi).

## Imkoniyatlar

- 🔐 **Google bilan kirish** (GIS) — `NEXT_PUBLIC_GOOGLE_CLIENT_ID` bo'lmasa demo rejim
- 🛬 **Landing**, **Login**, **Onboarding** sahifalari
- 💬 **Gemini streaming** (SSE) — javoblar real vaqtda oqadi
- 🌗 **Dark / Light / System** mavzu (Sozlamalar ichida, chaqnashsiz)
- 📐 **Yig'iladigan (collapsible) sidebar**
- 💾 Suhbatlar tarixi (localStorage)

## Ishga tushirish

```bash
pnpm install
cp .env.example .env.local   # va kalitlarni to'ldiring
pnpm dev
# http://localhost:3000
```

## Muhit o'zgaruvchilari (`.env.local`)

| O'zgaruvchi | Kerakmi | Tavsif |
| --- | --- | --- |
| `GEMINI_API_KEY` | Gemini uchun | Server tomonda. https://aistudio.google.com/apikey |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Real kirish uchun | Bo'sh → demo kirish |
| `NEXT_PUBLIC_CHAT_MODE` | yo'q | `mock` / `route` / `backend` (default: route) |
| `NEXT_PUBLIC_API_URL` | NestJS uchun | To'ldirilsa → backend rejimi |

> `GEMINI_API_KEY` sozlanmasa chatda tushunarli xato ko'rsatiladi; UI baribir
> ishlaydi. Sinov uchun `NEXT_PUBLIC_CHAT_MODE=mock` qo'ying.

## Struktura

```
src/
├── app/
│   ├── page.tsx            # Landing (/)
│   ├── login/              # Kirish
│   ├── onboarding/         # Tanishtiruv
│   ├── chat/               # Asosiy ilova (himoyalangan)
│   ├── api/chat/route.ts   # Gemini SSE proksi (server)
│   ├── layout.tsx          # shriftlar + theme provider + no-flash skript
│   └── globals.css         # dizayn tokenlari (light + dark)
├── components/
│   ├── auth/               # require-auth (guard)
│   ├── brand/              # lyra-mark, google-icon
│   ├── chat/               # chat-view, message-list, input, ...
│   ├── settings/           # settings-modal
│   ├── sidebar/            # sidebar (+collapse), conversation-item
│   └── theme/              # theme-provider, theme-toggle-button
├── hooks/                  # use-chat, use-auth
├── lib/
│   ├── api/                # ChatService: route / http / mock + sse
│   ├── auth/               # AuthService: google / demo
│   ├── config.ts           # modellar, rejimlar, env
│   ├── theme.ts            # mavzu yordamchilari
│   └── utils.ts
├── store/                  # chat-store, auth-store, ui-store (zustand)
└── types/chat.ts
```

## Ulanish rejimlari (`getChatService()`)

- **route** (default): `/api/chat` → Gemini. Kalit serverda.
- **backend**: `NEXT_PUBLIC_API_URL` to'ldirilsa → NestJS `POST /conversations/:id/messages` (SSE).
- **mock**: backendsiz UI sinovi.

Auth ham shunday: `getAuthService()` Google ID bo'lsa real GIS, bo'lmasa demo.
NestJS tayyor bo'lganda Google tokeni backendga yuborilib JWT sessiya yaratiladi.
