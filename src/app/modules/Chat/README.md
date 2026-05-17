# Chat (Socket.IO) Spec

Website feature reference:

- Dashboard/Website: `src/app/(main-route)/chat/page.tsx`
- Ad detail CTA links to `/chat` from `src/app/(main-route)/ads/[id]/page.tsx`

Chat is **real-time via Socket.IO**. REST is optional (fallback) and **Socket is the source of truth**.

Conversations are buyer↔vendor threads tied to an Ad.

---

## Socket endpoint

- **Transport**: Socket.IO (WebSocket + fallback)
- **Namespace**: `/chat`
- **Recommended URL**: `/socket.io` (default) + namespace `/chat`

---

## Authentication

Required roles: `ROLE.BUYER`, `ROLE.VENDOR`, `ROLE.ADMIN`, `ROLE.SUPER_ADMIN`

Use JWT access token during socket handshake:

```ts
io('/chat', {
  auth: {
    token: '<accessToken>',
  },
});
```

Server should:

- Verify token using the same logic as HTTP auth middleware.
- Attach `socket.user`.
- Reject unauthenticated sockets.

---

## Event naming convention

- Client → Server: `chat:*`
- Server → Client: `chat:*`

All client emits should use **ack callbacks**:

```ts
socket.emit('chat:conversation:upsert', payload, (ack) => {
  // ack = { success, message, data, errorSources? }
});
```

### Ack format (recommended)

```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

Error (match global error format style):

```json
{
  "success": false,
  "message": "Validation error",
  "errorSources": [{ "path": "", "message": "..." }]
}
```

---

## Core events

### 1) Create or get a conversation for an ad

- **Client emit**: `chat:conversation:upsert`

Payload:

```json
{
  "adId": "ad_123",
  "participantId": "user_456"
}
```

Notes:

- If a conversation already exists for `(adId, me, participantId)`, return it.

---

### 2) List my conversations (sidebar)

- **Client emit**: `chat:conversation:list`

Payload:

```json
{ "searchTerm": "", "page": 1, "limit": 20 }
```

Response items should include:

- `id`, `name` (other participant), `avatar`, `lastMessage`, `lastTime`, `unreadCount`, optional `adSummary`

---

### 3) Join a conversation room

- **Client emit**: `chat:conversation:join`

Payload:

```json
{ "conversationId": "conv_123" }
```

Server behavior:

- Verify requester is a participant.
- `socket.join(conversationId)`.

---

### 4) Get messages in a conversation

- **Client emit**: `chat:message:list`

Payload (choose one approach):

```json
{ "conversationId": "conv_123", "cursor": "msg_999", "limit": 30 }
```

or

```json
{ "conversationId": "conv_123", "page": 1, "limit": 30 }
```

---

### 5) Send a message (text)

- **Client emit**: `chat:message:send`

Payload:

```json
{ "conversationId": "conv_123", "text": "Assalamu Alaikum, available?" }
```

Server should broadcast to the room:

- **Server emit**: `chat:message:new`

---

### 6) Typing indicator

- **Client emit**: `chat:typing`

Payload:

```json
{ "conversationId": "conv_123", "isTyping": true }
```

Server broadcasts to others in room:

- **Server emit**: `chat:typing`

---

### 7) Mark conversation as read

- **Client emit**: `chat:conversation:read`

Payload:

```json
{ "conversationId": "conv_123" }
```

Server can broadcast:

- `chat:conversation:read` (e.g., update unreadCount)

---

### 8) Attachment upload (image/file)

Socket itself should not carry large files.

Recommended approach:

- Upload file via HTTP (e.g. existing multer + Cloudinary)
- Then send message with attachment URL over socket.

Client emit example:

```json
{
  "conversationId": "conv_123",
  "attachment": {
    "type": "image",
    "url": "https://...",
    "name": "photo.jpg",
    "size": 12345
  }
}
```

---

## Optional REST (fallback)

If you still need REST for SSR/history/debug, keep these as optional:

- `GET /api/v1/chat/conversation/my`
- `GET /api/v1/chat/conversation/:conversationId/messages`

But **do not** treat REST as authoritative for real-time state.
