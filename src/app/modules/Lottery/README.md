# Lottery Module - সম্পূর্ণ বাংলা Documentation

**Base path:** `/api/v1/lottery`  
**Route file:** `src/app/modules/Lottery/lottery.routes.ts`

এই module টোকেন-ভিত্তিক লটারি সিস্টেম implement করে যেখানে প্রতিটি টিকেট একটি unique টোকেন নম্বর পায়।

---

## Table of Contents

1. [Public Routes](#public-routes)
2. [Authenticated User Routes](#authenticated-user-routes)
3. [Admin Routes](#admin-routes)
4. [Token System বুঝা](#token-system-বুঝা)

---

## Public Routes

### 1. সব Lotteries দেখা

**Method:** `GET`  
**Path:** `/api/v1/lottery/`  
**Auth:** লাগে না
**Validation:** `LotteryValidation.listLotteriesSchema`

**Query Parameters:**
- `status` - Lottery এর অবস্থা ("ACTIVE" | "COMPLETED" | "INACTIVE")
- `page` - Page number (default: 1)
- `limit` - Per page items (default: 10)

**কাজ কী:**
- সব active/completed lotteries list দেখাবে
- Filter করা যাবে status দিয়ে
- Pagination support আছে

**Example Request:**
```
GET /api/v1/lottery?status=ACTIVE&page=1&limit=10
```

**Response:**
```json
{
  "data": [
    {
      "_id": "...",
      "title": "Winter Festival Lottery 2025",
      "drawDate": "2025-01-15T00:00:00.000Z",
      "ticketPrice": 100,
      "totalTickets": 250,
      "participantsCount": 85,
      "prize": "Samsung Galaxy S24",
      "status": "ACTIVE"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPage": 1
  }
}
```

---

### 2. একটি Lottery এর Details

**Method:** `GET`  
**Path:** `/api/v1/lottery/:id`  
**Auth:** লাগে না

**কাজ কী:**
- নির্দিষ্ট lottery এর সব details দেখাবে
- Prize, draw date, ticket price সব তথ্য
- যদি COMPLETED হয় তাহলে winner info ও দেখাবে

**Example Request:**
```
GET /api/v1/lottery/507f1f77bcf86cd799439011
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Eid Special Lottery",
  "drawDate": "2025-04-10T10:00:00.000Z",
  "ticketPrice": 50,
  "totalTickets": 500,
  "participantsCount": 125,
  "prize": "iPhone 15 Pro",
  "image": "https://...",
  "status": "ACTIVE",
  "winnerToken": null
}
```

---

## Authenticated User Routes

এই routes গুলো login করা user (BUYER, VENDOR, ADMIN, SUPER_ADMIN) ব্যবহার করতে পারবে।

### 3. Lottery তে Join করা (Ticket কেনা)

**Method:** `POST`  
**Path:** `/api/v1/lottery/:id/join`  
**Auth:** Required (BUYER, VENDOR, ADMIN, SUPER_ADMIN)  
**Validation:** `LotteryValidation.joinLotterySchema`

**Request Body:**
```json
{
  "quantity": 3,
  "paymentMethod": "WALLET"
}
```

**কাজ কী:**
1. User যতটি ticket কিনতে চায় ততটি unique token number generate হবে
2. Token format: `TKN-XXXXXX` (6-digit random)
3. User এর existing entry থাকলে নতুন tokens append হবে, না থাকলে নতুন entry create হবে
4. Lottery এর `totalTickets` count বাড়বে
5. প্রথমবার join করলে `participantsCount` ও বাড়বে

**Response:**
```json
{
  "success": true,
  "tokenNumbers": ["TKN-123456", "TKN-789012", "TKN-345678"]
}
```

**Important Notes:**
- প্রতিটি token unique হবে per lottery
- একই user বারবার কিনতে পারবে, সব tokens একই entry-তে add হবে
- Lottery ACTIVE না থাকলে error দেবে

---

### 4. My Lottery Summary

**Method:** `GET`  
**Path:** `/api/v1/lottery/my/summary`  
**Auth:** Required

**কাজ কী:**
- এই মাসে কতবার lottery তে join করেছেন
- Total reward points
- কতবার জিতেছেন

**Response:**
```json
{
  "entriesThisMonth": 5,
  "rewardPoints": 100,
  "winsCount": 0
}
```

---

### 5. My Upcoming Draws

**Method:** `GET`  
**Path:** `/api/v1/lottery/my/upcoming`  
**Auth:** Required

**কাজ কী:**
- যেসব lottery তে join করেছেন এবং এখনো draw হয়নি
- Draw date অনুযায়ী sorted

**Response:**
```json
[
  {
    "lotteryId": "...",
    "title": "New Year Lottery",
    "drawDate": "2025-01-01T00:00:00.000Z",
    "status": "ACTIVE",
    "ticketPrice": 100
  }
]
```

---

### 6. My Rewards

**Method:** `GET`  
**Path:** `/api/v1/lottery/my/rewards`  
**Auth:** Required

**কাজ কী:**
- যেসব reward redeem করেছেন তার history
- Latest first (sorted by createdAt desc)

**Response:**
```json
[
  {
    "_id": "...",
    "user": "...",
    "rewardId": "PRIZE-PHONE",
    "quantity": 1,
    "createdAt": "2024-12-20T10:30:00.000Z"
  }
]
```

---

### 7. নিজের Tokens দেখা

**Method:** `GET`  
**Path:** `/api/v1/lottery/:id/my-tokens`  
**Auth:** Required

**কাজ কী:**
- নির্দিষ্ট lottery তে আপনি কী কী tokens কিনেছেন তা দেখাবে
- জিতেছেন কিনা সেটা indicate করবে
- Winner token কী সেটা দেখাবে (যদি draw হয়ে থাকে)

**Example Request:**
```
GET /api/v1/lottery/507f1f77bcf86cd799439011/my-tokens
```

**Response (যদি জিতে থাকেন):**
```json
{
  "tokenNumbers": ["TKN-123456", "TKN-789012", "TKN-555555"],
  "totalTokens": 3,
  "hasWon": true,
  "winningToken": "TKN-555555"
}
```

**Response (যদি না জিতে থাকেন):**
```json
{
  "tokenNumbers": ["TKN-111111", "TKN-222222"],
  "totalTokens": 2,
  "hasWon": false,
  "winningToken": "TKN-999999"
}
```

**Response (যদি join না করে থাকেন):**
```json
{
  "tokenNumbers": [],
  "totalTokens": 0,
  "hasWon": false
}
```

---

### 8. Reward Redeem করা

**Method:** `POST`  
**Path:** `/api/v1/lottery/reward/redeem`  
**Auth:** Required  
**Validation:** `LotteryValidation.redeemRewardSchema`

**Request Body:**
```json
{
  "rewardId": "PRIZE-IPHONE15",
  "quantity": 1
}
```

**কাজ কী:**
- Lottery জিতলে reward claim/redeem করা যাবে
- Reward redemption entry create হবে
- Tracking purposes জন্য record রাখা হবে

---

## Admin Routes

এই routes শুধুমাত্র ADMIN এবং SUPER_ADMIN ব্যবহার করতে পারবে।

### 9. Admin: সব Lotteries List

**Method:** `GET`  
**Path:** `/api/v1/lottery/admin`  
**Auth:** ADMIN, SUPER_ADMIN

**Query Parameters:**
- `status` - "active" | "inactive" | "completed" (lowercase)
- `page` - Page number
- `limit` - Per page items (default: 20)

**কাজ কী:**
- Admin dashboard জন্য সব lotteries দেখানো
- Status filter করা যাবে
- Pagination support

**Response:**
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPage": 3
  }
}
```

---

### 10. Admin: Lottery Create করা

**Method:** `POST`  
**Path:** `/api/v1/lottery/`  
**Auth:** ADMIN, SUPER_ADMIN  
**Validation:** `LotteryValidation.createLotterySchema`

**Request Body:**
```json
{
  "title": "Spring Festival Lottery",
  "drawDate": "2025-03-20T15:00:00.000Z",
  "ticketPrice": 150,
  "prize": "MacBook Air",
  "image": "https://...",
  "status": "INACTIVE"
}
```

**কাজ কী:**
- নতুন lottery তৈরি করা
- Initial status সাধারণত INACTIVE থাকে
- পরে activate করা যায়

---

### 11. Admin: Lottery Update করা

**Method:** `PATCH`  
**Path:** `/api/v1/lottery/:id`  
**Auth:** ADMIN, SUPER_ADMIN  
**Validation:** `LotteryValidation.updateLotterySchema`

**Request Body (partial update):**
```json
{
  "title": "Updated Title",
  "prize": "New Prize"
}
```

**কাজ কী:**
- Existing lottery এর information update করা
- Title, prize, image ইত্যাদি change করা যাবে

---

### 12. Admin: Lottery Status Change

**Method:** `PATCH`  
**Path:** `/api/v1/lottery/:id/status`  
**Auth:** ADMIN, SUPER_ADMIN  
**Validation:** `LotteryValidation.updateLotteryStatusSchema`

**Request Body:**
```json
{
  "status": "ACTIVE"
}
```

**Possible Values:**
- `ACTIVE` - Lottery চালু, user tickets কিনতে পারবে
- `INACTIVE` - Lottery বন্ধ, tickets কেনা যাবে না
- `COMPLETED` - Draw হয়ে গেছে (সাধারণত draw API নিজে করে)

**কাজ কী:**
- Lottery এর status manage করা
- ACTIVE করলে users tickets কিনতে পারবে
- INACTIVE করলে temporarily বন্ধ করা যাবে

---

### 13. Admin: Draw Run করা (Winner Select)

**Method:** `POST`  
**Path:** `/api/v1/lottery/:id/draw`  
**Auth:** ADMIN, SUPER_ADMIN

**কাজ কী:**

1. **সব tokens collect করা:**
   - সব entries থেকে সব tokenNumbers নেওয়া হয়
   - একটা বড় array তৈরি হয় সব tokens নিয়ে

2. **Random token selection:**
   - Random index generate করে
   - সেই index এর token select করা হয়

3. **Winner save করা:**
   - Lottery model-এ `winnerToken` field-এ winner token save হয়
   - Status `COMPLETED` করা হয়

4. **Winner entry খুঁজে বের করা:**
   - কোন entry-তে এই winning token আছে তা খুঁজে বের করা
   - User populate করে return করা

**Response:**
```json
{
  "lottery": {
    "_id": "...",
    "title": "Winter Lottery",
    "status": "COMPLETED",
    "winnerToken": "TKN-555555",
    ...
  },
  "winner": {
    "_id": "...",
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "photo": "..."
    },
    "tokenNumbers": ["TKN-123456", "TKN-555555", "TKN-789012"],
    "lottery": "..."
  },
  "winningToken": "TKN-555555"
}
```

**Important Notes:**
- Draw একবার হয়ে গেলে আবার run করলে same winner return হবে
- Re-draw হবে না (fair play নিশ্চিত করতে)
- যদি কোনো entry না থাকে তাহলে error দেবে
- Frontend এ spinning wheel animation এই response পেয়ে show করবে

---

## Token System বুঝা

### Token Generation Flow

```
User: "আমি 3টি ticket কিনতে চাই"
  ↓
System: 3টি unique token generate করবে
  → TKN-123456
  → TKN-789012
  → TKN-345678
  ↓
Database: LotteryEntry তে save
  { 
    user: "userId",
    lottery: "lotteryId",
    tokenNumbers: ["TKN-123456", "TKN-789012", "TKN-345678"]
  }
```

### Draw Process Flow

```
Admin: Draw button click করলো
  ↓
System: সব entries collect করলো
  Entry 1: ["TKN-111111", "TKN-222222"]
  Entry 2: ["TKN-333333", "TKN-444444", "TKN-555555"]
  Entry 3: ["TKN-666666"]
  ↓
System: সব tokens একসাথে করলো
  All Tokens: ["TKN-111111", "TKN-222222", "TKN-333333", 
               "TKN-444444", "TKN-555555", "TKN-666666"]
  ↓
System: Random selection
  Selected Index: 4
  Winning Token: "TKN-555555"
  ↓
System: Winner খুঁজলো
  Winner Entry: Entry 2 (যেটাতে TKN-555555 আছে)
  Winner User: Entry 2 এর user
  ↓
Database: Lottery তে save
  { winnerToken: "TKN-555555", status: "COMPLETED" }
```

### Database Structure

**Lottery:**
```json
{
  "_id": "lottery1",
  "title": "Winter Lottery",
  "ticketPrice": 100,
  "totalTickets": 6,
  "participantsCount": 3,
  "status": "COMPLETED",
  "winnerToken": "TKN-555555"
}
```

**LotteryEntry (per user):**
```json
{
  "_id": "entry1",
  "lottery": "lottery1",
  "user": "user1",
  "tokenNumbers": ["TKN-111111", "TKN-222222"]
},
{
  "_id": "entry2",
  "lottery": "lottery1",
  "user": "user2",
  "tokenNumbers": ["TKN-333333", "TKN-444444", "TKN-555555"]
}
```

---

## Frontend Integration Guide

### User Dashboard Example

```javascript
// Get user's tokens for a lottery
const myTokens = await fetch('/api/v1/lottery/507f.../my-tokens', {
  headers: { Authorization: `Bearer ${token}` }
});

const data = await myTokens.json();

// UI তে display করুন
if (data.hasWon) {
  showConfetti();
  alert(`আপনি জিতেছেন! Winning Token: ${data.winningToken}`);
} else if (data.totalTokens > 0) {
  displayTokens(data.tokenNumbers);
}
```

### Admin Draw UI Example

```javascript
// Admin draw button click
const runDraw = async (lotteryId) => {
  // Show spinning animation
  showSpinningWheel();
  
  const response = await fetch(`/api/v1/lottery/${lotteryId}/draw`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  
  const { winningToken, winner } = await response.json();
  
  // Animate for 5 seconds
  setTimeout(() => {
    hideSpinningWheel();
    showWinnerModal({
      token: winningToken,
      userName: winner.user.name,
      userPhoto: winner.user.photo
    });
  }, 5000);
};
```

---

## Error Handling

### Common Errors:

**1. Lottery না থাকলে:**
```json
{
  "statusCode": 404,
  "message": "Lottery not found!"
}
```

**2. ACTIVE না থাকলে join করতে গেলে:**
```json
{
  "statusCode": 400,
  "message": "Lottery is not active!"
}
```

**3. Draw করার সময় কোনো entry না থাকলে:**
```json
{
  "statusCode": 400,
  "message": "No entries found for this lottery!"
}
```

---

## Summary

এই Lottery module একটি সম্পূর্ণ টোকেন-ভিত্তিক লটারি সিস্টেম যেখানে:

✅ **Public:** যে কেউ lotteries দেখতে পারে  
✅ **Users:** Ticket কিনতে, tokens দেখতে, rewards claim করতে পারে  
✅ **Admin:** Lottery create/update করতে, draw run করতে পারে

**Total Routes:** 13  
**Token Format:** TKN-XXXXXX (6-digit random)  
**Fair Draw:** সব tokens থেকে random selection  
**Winner Tracking:** Lottery model-এ winnerToken save হয়
