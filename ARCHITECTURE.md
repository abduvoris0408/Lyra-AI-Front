# Lyra AI — Arxitektura

ChatGPT uslubidagi chat assistant. Gemini modellariga ulanadi, javoblar real vaqtda (SSE streaming) chiqadi.

## Texnologiyalar

| Qatlam      | Texnologiya                                              |
| ----------- | ------------------------------------------------------- |
| Frontend    | Next.js (App Router), TypeScript, Tailwind             |
| Backend     | NestJS, TypeScript                                      |
| DB          | PostgreSQL + Prisma ORM                                 |
| Auth        | Google OAuth 2.0 + JWT (access + refresh)               |
| AI          | Google Gemini (`@google/generative-ai`) — backend orqali |
| Streaming   | Server-Sent Events (SSE)                                |

> **Muhim:** Gemini API kaliti faqat backendda turadi. Frontend hech qachon Gemini'ga to'g'ridan-to'g'ri murojaat qilmaydi — barchasi NestJS orqali o'tadi (xavfsizlik + suhbatni saqlash).

## Umumiy ko'rinish

```
┌─────────────────┐   HTTPS / SSE    ┌──────────────────┐   SQL    ┌────────────┐
│  Next.js (web)  │ ───────────────► │   NestJS (API)   │ ───────► │ PostgreSQL │
│  - chat UI      │ ◄─────────────── │   - auth         │ ◄─────── │            │
│  - SSE oqim     │                  │   - chat/msg     │          └────────────┘
└─────────────────┘                  │   - gemini       │
                                     └────────┬─────────┘
                                              │ HTTPS (stream)
                                              ▼
                                     ┌──────────────────┐
                                     │  Google Gemini   │
                                     └──────────────────┘
```

Ikki alohida loyiha (alohida repo yoki monorepo):
- `lyra-web/`  → Next.js
- `lyra-api/`  → NestJS

---

## Backend (NestJS)

### Modullar

```
src/
├── main.ts
├── app.module.ts
├── prisma/
│   ├── prisma.module.ts
│   └── prisma.service.ts
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts        # /auth/google, /auth/google/callback, /auth/refresh, /auth/logout
│   ├── auth.service.ts
│   ├── strategies/
│   │   ├── google.strategy.ts    # passport-google-oauth20
│   │   └── jwt.strategy.ts
│   └── guards/jwt-auth.guard.ts
├── users/
│   ├── users.module.ts
│   └── users.service.ts
├── conversations/
│   ├── conversations.module.ts
│   ├── conversations.controller.ts   # CRUD: suhbatlar ro'yxati, yaratish, o'chirish, nomini o'zgartirish
│   └── conversations.service.ts
├── messages/
│   ├── messages.module.ts
│   ├── messages.controller.ts        # GET tarix, POST yangi xabar (SSE stream)
│   └── messages.service.ts
└── gemini/
    ├── gemini.module.ts
    └── gemini.service.ts             # generateContentStream wrapper
```

### Auth oqimi (Google OAuth)

1. Frontend `GET /auth/google` ga yuboradi → NestJS Google'ga redirect qiladi.
2. Foydalanuvchi Google'da tasdiqlaydi → `GET /auth/google/callback`.
3. Backend user'ni topadi yoki yaratadi (`googleId` bo'yicha), so'ng JWT yaratadi.
4. **Access token** (qisqa, ~15 daqiqa) + **Refresh token** (uzoq, ~7 kun) beriladi.
5. Tokenlar `httpOnly` + `Secure` cookie'da saqlanadi (XSS'dan himoya).
6. `/auth/refresh` access token'ni yangilaydi.

### Streaming (SSE)

Yangi xabar yuborilganda:

```
POST /conversations/:id/messages   (body: { content })
  → user xabarini DB ga saqlash
  → Gemini geminiService.streamChat(history) ni chaqirish
  → har bir chunk ni SSE orqali frontend ga uzatish:
        data: {"delta": "..."}\n\n
  → oqim tugagach to'liq assistant xabarini DB ga saqlash
        data: {"done": true, "messageId": "..."}\n\n
```

NestJS'da `@Sse()` dekoratori yoki `res.write()` bilan `text/event-stream`. Gemini SDK `model.generateContentStream()` chunklarni beradi.

---

## Database sxemasi (Prisma)

```prisma
model User {
  id            String         @id @default(cuid())
  email         String         @unique
  name          String?
  avatarUrl     String?
  googleId      String         @unique
  conversations Conversation[]
  createdAt     DateTime       @default(now())
}

model Conversation {
  id        String    @id @default(cuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  title     String    @default("New chat")
  model     String    @default("gemini-1.5-flash")
  messages  Message[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

enum Role {
  user
  assistant
}

model Message {
  id             String       @id @default(cuid())
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  role           Role
  content        String
  createdAt      DateTime     @default(now())

  @@index([conversationId])
}
```

> Kelajakda RAG kerak bo'lsa: `pgvector` extension + `Document` / `Chunk` modellari qo'shiladi.

---

## Frontend (Next.js, App Router)

```
app/
├── layout.tsx
├── page.tsx                 # landing / redirect
├── login/page.tsx           # "Google bilan kirish" tugmasi
└── chat/
    ├── layout.tsx           # sidebar (suhbatlar ro'yxati)
    └── [id]/page.tsx        # bitta suhbat oynasi
components/
├── ChatWindow.tsx
├── MessageBubble.tsx
├── MessageInput.tsx
└── Sidebar.tsx
lib/
├── api.ts                   # backend ga fetch wrapper (cookie bilan)
└── useChatStream.ts         # SSE / ReadableStream o'qish hook
```

- **State:** server data uchun TanStack Query (yoki SWR), UI uchun Zustand (yengil).
- **Streaming o'qish:** `fetch()` + `response.body.getReader()` yoki `EventSource`. Har bir `delta` kelganda oxirgi xabarga qo'shib boriladi.
- **Auth:** "Google bilan kirish" → backend `/auth/google` ga redirect. Cookie `httpOnly` bo'lgani uchun frontend tokenni ushlamaydi; `credentials: 'include'` bilan so'rov yuboriladi.

---

## API endpointlar (qisqacha)

| Metod | Yo'l                              | Vazifa                          |
| ----- | --------------------------------- | ------------------------------- |
| GET   | `/auth/google`                    | OAuth boshlash                  |
| GET   | `/auth/google/callback`           | OAuth qaytishi                  |
| POST  | `/auth/refresh`                   | Token yangilash                 |
| POST  | `/auth/logout`                    | Chiqish                         |
| GET   | `/me`                             | Joriy foydalanuvchi             |
| GET   | `/conversations`                  | Suhbatlar ro'yxati              |
| POST  | `/conversations`                  | Yangi suhbat                    |
| PATCH | `/conversations/:id`              | Nomini o'zgartirish             |
| DELETE| `/conversations/:id`              | O'chirish                       |
| GET   | `/conversations/:id/messages`     | Suhbat tarixi                   |
| POST  | `/conversations/:id/messages`     | Xabar yuborish (SSE javob)      |

---

## Environment o'zgaruvchilar

**Backend (`lyra-api/.env`)**
```
DATABASE_URL=postgresql://user:pass@localhost:5432/lyra
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
GEMINI_API_KEY=...
FRONTEND_URL=http://localhost:3000
```

**Frontend (`lyra-web/.env.local`)**
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## Bosqichma-bosqich reja

1. **Setup:** `lyra-api` (NestJS) + `lyra-web` (Next.js) loyihalarini yaratish, PostgreSQL ko'tarish (Docker).
2. **DB:** Prisma schema + birinchi migration.
3. **Auth:** Google OAuth + JWT + cookie.
4. **Conversations/Messages:** CRUD endpointlar.
5. **Gemini:** `GeminiModule` + streaming.
6. **Frontend:** login → chat UI → SSE oqimni ulash.
7. **Polish:** xatoliklarni boshqarish, loading holatlar, suhbat nomini avtomatik yaratish.
```
