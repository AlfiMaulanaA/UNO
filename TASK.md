Berikut versi prompt lengkap untuk game kartu UNO dengan pola yang sama: Next.js, online/offline, multiplayer, bot, colorful, dan siap deploy ke Vercel.

Buat sebuah web application game kartu bergaya **UNO** yang modern, colorful, fun, responsive, dapat dimainkan secara **online maupun offline**, mendukung **multiplayer hingga beberapa pemain**, serta **bermain melawan bot/AI**.

Gunakan nama aplikasi sementara:

**ColorCards**

Penting:
Game harus memiliki gameplay kartu bergaya UNO, tetapi **jangan bergantung pada aset, logo, ilustrasi, font, atau desain proprietary UNO**. Buat identitas visual, card design, logo, icon, dan branding sendiri sehingga aplikasi memiliki tampilan original.

Aplikasi harus siap dijalankan secara lokal dan dideploy ke **Vercel**.

---

# 1. Tujuan Aplikasi

Bangun web game kartu multiplayer yang terasa seperti game production-ready, bukan sekadar prototype atau UI statis.

Game harus mendukung:

1. **Play vs Bot**
2. **Local Multiplayer**
3. **Online Multiplayer**
4. **Private Room**
5. **Quick Match** jika memungkinkan
6. **Mixed Players**
   - Human + Bot dalam satu room

Contoh:

```text
Player 1 - Human
Player 2 - Human
Player 3 - Bot
Player 4 - Bot
```

Target jumlah pemain:

```text
2–6 Players
```

Minimum:

```text
2 Players
```

Recommended maximum:

```text
6 Players
```

---

# 2. Tech Stack

Gunakan:

- Next.js versi terbaru
- App Router
- TypeScript
- React
- Tailwind CSS
- shadcn/ui jika diperlukan
- Lucide React untuk icon
- Framer Motion untuk animasi

Untuk online multiplayer gunakan:

**Supabase**

Dengan:

- Supabase Database
- Supabase Realtime
- Supabase Anonymous/Guest Identity atau custom guest session

Alternatif yang diperbolehkan jika lebih cocok:

- Firebase
- Ably
- Pusher

Namun prioritaskan:

```text
Next.js
+
TypeScript
+
Tailwind CSS
+
Supabase Realtime
+
Vercel
```

Jangan menggunakan arsitektur WebSocket server persistent tradisional yang tidak cocok dengan deployment Vercel/serverless.

---

# 3. Arsitektur Project

Buat struktur modular.

Contoh:

```text
app/
  page.tsx

  play/
    page.tsx

  bot/
    page.tsx

  local/
    page.tsx

  online/
    page.tsx

  room/
    [roomId]/
      page.tsx

  settings/
    page.tsx

components/
  cards/
    GameCard.tsx
    CardBack.tsx
    CardStack.tsx
    PlayerHand.tsx

  game/
    GameTable.tsx
    DrawPile.tsx
    DiscardPile.tsx
    PlayerSeat.tsx
    PlayerAvatar.tsx
    TurnIndicator.tsx
    GameControls.tsx
    GameResultModal.tsx
    ColorPickerModal.tsx

  multiplayer/
    CreateRoom.tsx
    JoinRoom.tsx
    RoomLobby.tsx
    ConnectionStatus.tsx
    PlayerSlot.tsx

  layout/
    Navbar.tsx
    MobileNav.tsx

lib/
  game/
    deck.ts
    rules.ts
    actions.ts
    game-engine.ts
    bot.ts
    scoring.ts

  multiplayer/
    realtime.ts
    room.ts

  supabase/
    client.ts
    server.ts

hooks/
  useGame.ts
  useOnlineGame.ts
  useGameSettings.ts
  useGuestPlayer.ts
  useNetworkStatus.ts

types/
  card.ts
  game.ts
  player.ts
  room.ts
```

Pisahkan:

- UI
- game engine
- card rules
- bot
- realtime
- room state
- persistence

Jangan menaruh seluruh logic di satu component.

---

# 4. Homepage

Homepage harus langsung terasa seperti game casual modern.

Hero:

```text
ColorCards
```

Headline:

```text
PLAY. MATCH. WIN.
```

Subtitle:

```text
Challenge friends, play against bots,
or jump into a colorful card battle online.
```

CTA:

```text
[ Play Now ]
[ Play vs Bot ]
```

Tampilkan ilustrasi tumpukan kartu original.

Di bawah hero buat:

```text
Choose Your Game
```

Cards:

### Play Online

Description:

```text
Create a room or challenge players online.
```

Button:

```text
Play Online
```

### Play vs Bot

Description:

```text
Practice your strategy against smart AI opponents.
```

Button:

```text
Challenge Bot
```

### Local Game

Description:

```text
Play together on the same device.
```

Button:

```text
Play Local
```

---

# 5. Visual Design

Gunakan visual:

- colorful
- playful
- energetic
- modern
- clean
- rounded
- mobile-game inspired

Hindari UI yang terlalu gelap.

Gunakan background terang dengan gradient decorative shapes.

Palette utama dapat menggunakan:

```text
Red:
#EF4444

Blue:
#3B82F6

Green:
#22C55E

Yellow:
#FACC15

Purple:
#8B5CF6

Pink:
#EC4899

Orange:
#F97316

Background:
#F8FAFC

Dark text:
#0F172A
```

Gunakan card surface:

```text
#FFFFFF
```

Border:

```text
#E2E8F0
```

Gunakan gradient untuk:

- primary CTA
- lobby header
- victory screen
- selected game mode

Jangan membuat seluruh halaman menjadi gradient.

---

# 6. Original Card Design

Buat desain kartu original.

Jangan meniru kartu UNO secara pixel-perfect.

Kartu memiliki:

- rounded corners
- large center symbol
- small top-left symbol
- small bottom-right symbol
- subtle pattern
- shadow
- color category

Ukuran kartu menggunakan aspect ratio kira-kira:

```css
aspect-ratio: 2.5 / 3.5;
```

Kategori warna:

```text
Red
Blue
Green
Yellow
```

Gunakan icon atau bentuk grafis original.

---

# 7. Jenis Kartu

Gunakan sistem permainan ala matching card game.

## Number Cards

Untuk setiap warna:

```text
0
1
2
3
4
5
6
7
8
9
```

Colors:

```text
Red
Blue
Green
Yellow
```

## Action Cards

Tambahkan:

### Skip

Player berikutnya kehilangan giliran.

Symbol:

```text
⊘
```

### Reverse

Arah permainan berubah.

Symbol:

```text
↻
```

### Draw Two

Player berikutnya mengambil 2 kartu.

Symbol:

```text
+2
```

### Wild

Pemain dapat memilih warna selanjutnya.

### Wild Draw Four

Pemain:

- menentukan warna
- pemain selanjutnya draw 4 cards

Symbol:

```text
+4
```

---

# 8. Game Rules

Gunakan rule utama matching-card game.

Pemain dapat memainkan kartu jika:

```text
warna sama
OR
angka sama
OR
symbol/action sama
OR
wild card
```

Contoh:

Discard pile:

```text
Red 7
```

Valid:

```text
Red 2
Red Skip
Blue 7
Green 7
Yellow 7
Wild
```

Tidak valid:

```text
Blue 3
Green 5
```

---

# 9. Turn System

Gunakan state:

```ts
type Direction = "clockwise" | "counter-clockwise";
```

Dan:

```ts
currentPlayerIndex
```

Setelah player memainkan card:

```text
apply card effect
↓
determine next player
↓
update current turn
```

Jika kartu:

```text
Reverse
```

ubah direction.

Jika hanya 2 pemain, Reverse dapat berfungsi seperti Skip sesuai aturan game yang dipilih.

---

# 10. Draw System

Jika pemain tidak memiliki kartu valid:

Button:

```text
Draw Card
```

Pemain mengambil satu kartu.

Aturan default:

Setelah mengambil kartu:

Jika kartu valid:

```text
Play Card
```

atau:

```text
Keep Card
```

Jika tidak valid:

otomatis lanjut ke pemain berikutnya.

Buat aturan ini configurable pada room settings jika diperlukan.

---

# 11. Call System

Tambahkan mekanisme seruan ketika pemain hanya memiliki satu kartu.

Karena branding harus original, jangan wajib menggunakan nama trademark.

Gunakan misalnya:

```text
LAST CARD!
```

Ketika player memiliki 2 kartu dan memainkan 1 kartu:

Tampilkan tombol:

```text
LAST CARD!
```

Jika player lupa menekan tombol sebelum giliran berpindah, sistem dapat memberi penalti.

Contoh:

```text
Draw 2 Cards
```

Buat option:

```text
Enable Last Card Penalty
ON/OFF
```

---

# 12. Card Effects

Implementasikan:

### Skip

```text
skip next player
```

### Reverse

```text
reverse play direction
```

### Draw Two

```text
next player draws 2
```

### Wild

Buka modal:

```text
Choose Color
```

Pilihan:

```text
Red
Blue
Green
Yellow
```

### Wild Draw Four

```text
choose color
+
next player draws 4
```

---

# 13. Optional Stack Rules

Tambahkan game setting:

```text
Allow Draw Stacking
```

OFF secara default.

Jika ON:

Contoh:

```text
Player A: +2
Player B: +2
Player C must draw 4
```

Optional rule:

```text
+4 stacking
```

Jangan campur house rules dengan default rules tanpa setting eksplisit.

---

# 14. Game Table

Desktop layout:

```text
                   Player 3
                 [ 5 cards ]

Player 2                             Player 4
[6 cards]                            [3 cards]


             Draw       Discard
             Pile        Pile

                 Direction ↻


               Player 1
          [Your Cards Here]
```

Gunakan visual table yang clean.

Tidak perlu meniru meja kasino.

Bisa menggunakan:

```text
soft gradient background
```

misalnya:

```text
purple → blue
```

atau:

```text
blue → cyan
```

Namun kartu harus tetap terbaca dengan jelas.

---

# 15. Player Hand

Untuk player sendiri:

Tampilkan kartu secara horizontal.

Desktop:

```text
[card][card][card][card][card]
```

Gunakan sedikit overlap jika banyak kartu.

Mobile:

Gunakan:

- horizontal scroll
atau
- card fan layout

Pastikan user tetap bisa memilih kartu.

Selected card naik sedikit.

Contoh:

```css
transform: translateY(-12px);
```

Tambahkan transition.

---

# 16. Opponent Hand

Jangan tampilkan isi kartu lawan.

Tampilkan card backs.

Contoh:

```text
Player 2

▯ ▯ ▯ ▯ ▯

5 Cards
```

Untuk pemain yang memiliki terlalu banyak kartu:

Jangan render semua card backs jika mengganggu performance.

Boleh tampilkan:

```text
12 Cards
```

dengan beberapa kartu visual representatif.

---

# 17. Turn Indicator

Giliran aktif harus sangat jelas.

Contoh:

```text
YOUR TURN
```

Gunakan:

- animated border
- glow ringan
- badge

Opponent:

```text
Alex's Turn
```

Tambahkan timer turn optional.

---

# 18. Direction Indicator

Tampilkan arah permainan:

```text
↻ Clockwise
```

atau:

```text
↺ Counter-clockwise
```

Animasi ringan saat Reverse dimainkan.

---

# 19. Card Animation

Gunakan Framer Motion.

Animasi:

- card draw
- card play
- card discard
- shuffle
- turn change
- reverse
- +2
- +4
- win

Card saat dimainkan:

```text
Player Hand
↓
center discard pile
```

Jangan berlebihan.

Animation duration sekitar:

```text
150–350ms
```

---

# 20. Player vs Bot

Mode:

```text
Play vs Bot
```

User dapat memilih:

```text
2 Players
3 Players
4 Players
```

Contoh:

```text
You
Bot Alex
Bot Nova
Bot Pixel
```

Difficulty:

```text
Easy
Medium
Hard
```

Bot harus mempertimbangkan:

- valid cards
- color distribution
- action cards
- cards remaining
- opponent card count
- wild card usage

---

# 21. Bot Difficulty

### Easy

Bot:

- memilih kartu valid secara random
- tidak mempertimbangkan strategi

### Medium

Bot:

- prioritaskan kartu yang warna dominannya masih banyak di tangan
- gunakan action cards secara masuk akal
- simpan Wild jika belum diperlukan

### Hard

Bot mempertimbangkan:

- pemain berikutnya
- jumlah kartu lawan
- warna dominan
- kapan menggunakan +2
- kapan menggunakan +4
- kapan menyimpan wild
- potensi mengubah direction

Bot tidak boleh curang.

Bot hanya boleh mengetahui:

```text
own cards
discard pile
public game state
opponent card count
```

Bot tidak boleh membaca hidden cards pemain lain sebagai strategi.

---

# 22. Local Multiplayer

Sediakan:

```text
Local Game
```

Mode ini harus dapat dimainkan offline.

Karena kartu harus dirahasiakan, gunakan sistem:

```text
Pass Device
```

Flow:

```text
Player 1 Turn
↓
Play Card
↓
Hide Hand
↓
"Pass device to Player 2"
↓
Player 2 presses Ready
↓
Player 2 hand shown
```

Jangan tampilkan kartu pemain selanjutnya sebelum tombol:

```text
I'm Ready
```

ditekan.

---

# 23. Online Multiplayer

Online mode flow:

```text
Play Online
↓
Create Room
OR
Join Room
```

Create Room:

```text
Player Name

Number of Players:
2
3
4
5
6

Bots:
0–5

Game Rules

[Create Room]
```

---

# 24. Room Code

Generate code pendek.

Contoh:

```text
CARD-X7P9
```

atau:

```text
X7P9QK
```

Lobby:

```text
ROOM CODE

X7P9QK

[Copy Code]

Invite Link:

https://domain.com/room/X7P9QK

[Copy Invite Link]
```

---

# 25. Multiplayer Lobby

Lobby tampilkan slots.

Contoh:

```text
ROOM X7P9QK

1. You             READY
2. Alex            READY
3. Waiting...
4. Bot Nova

Game Settings
4 Players
Stacking: OFF

[Start Game]
```

Host memiliki control:

```text
Start Game
Add Bot
Remove Bot
Kick Player
Change Rules
```

Hanya host yang dapat mulai game.

---

# 26. Ready System

Player dapat menekan:

```text
READY
```

Status:

```text
Not Ready
Ready
```

Host dapat memilih:

```text
Require everyone ready
```

Default:

```text
ON
```

---

# 27. Guest Player

Login tidak wajib.

Generate guest:

```text
Guest4821
```

Simpan guest identity di:

```text
localStorage
```

User dapat mengubah nama.

Contoh:

```text
Your Name:
Alex
```

Optional auth:

- Google
- Email magic link

Namun jangan memaksa login.

---

# 28. Realtime Multiplayer

Sinkronisasi:

- room state
- player joins
- player leaves
- ready status
- game start
- current turn
- draw pile
- discard pile
- player card count
- played card
- selected color
- direction
- game result

Informasi hidden hand tidak boleh dibroadcast secara terbuka kepada seluruh pemain.

Arsitektur harus mempertimbangkan keamanan kartu rahasia.

---

# 29. Hidden Card Security

Ini sangat penting.

Jangan menyimpan seluruh hands semua player dalam state realtime yang bisa dibaca semua client.

Setiap player hanya boleh mendapatkan:

```text
own hand
```

Untuk lawan hanya tampilkan:

```text
card count
```

Validasi move di server/backend.

Client mengirim:

```ts
{
  roomId,
  playerId,
  cardId
}
```

Backend melakukan:

```text
verify player
verify ownership
verify turn
verify valid move
apply action
update state
```

Jangan percaya client.

---

# 30. Data Model

Contoh:

```ts
type GameCard = {
  id: string;

  color:
    | "red"
    | "blue"
    | "green"
    | "yellow"
    | "wild";

  type:
    | "number"
    | "skip"
    | "reverse"
    | "draw2"
    | "wild"
    | "wild4";

  value?: number;
};
```

Player:

```ts
type Player = {
  id: string;
  name: string;
  avatar?: string;

  isBot: boolean;
  connected: boolean;

  cardCount: number;
};
```

Game:

```ts
type GameState = {
  roomId: string;

  status:
    | "waiting"
    | "playing"
    | "finished";

  players: Player[];

  currentPlayerIndex: number;

  direction:
    | "clockwise"
    | "counter-clockwise";

  discardTop: GameCard;

  selectedColor:
    | "red"
    | "blue"
    | "green"
    | "yellow";

  winnerId?: string;

  createdAt: string;
  updatedAt: string;
};
```

---

# 31. Database

Jika menggunakan Supabase:

## rooms

```text
id
room_code
host_id
status
max_players
direction
current_player_index
active_color
discard_top
winner_id
settings
created_at
updated_at
```

## players

```text
id
room_id
user_id
name
seat
is_bot
is_ready
connected
card_count
created_at
```

## player_hands

```text
id
room_id
player_id
card_data
created_at
updated_at
```

Pastikan player tidak dapat membaca hand player lain.

Gunakan:

```text
Row Level Security
```

atau server-side API/action sebagai authoritative game engine.

---

# 32. Server Authority

Online game harus memiliki authoritative logic.

Jangan melakukan game logic penting hanya pada frontend.

Backend harus memvalidasi:

```text
whose turn
card ownership
legal card
draw action
skip
reverse
draw two
wild
wild draw four
win condition
```

Jika client dimodifikasi user, game tetap tidak boleh bisa dicurangi dengan mudah.

---

# 33. Reconnection

Jika connection hilang:

```text
Connection Lost
Reconnecting...
```

Player tidak langsung dihapus.

Berikan grace period.

Contoh:

```text
60 seconds
```

Jika reconnect:

- restore hand
- restore seat
- restore turn
- restore game state

Tampilkan:

```text
Connected
```

Jika opponent disconnect:

```text
Alex disconnected
Waiting for reconnection...
```

---

# 34. Leave Game

Jika player menekan:

```text
Leave Game
```

Konfirmasi:

```text
Leave this match?
```

Online:

Host dapat memilih behavior:

```text
Replace disconnected player with bot
```

Default:

```text
ON
```

Dengan begitu pertandingan tetap berjalan.

---

# 35. Bot Replacement

Jika user disconnect terlalu lama:

Optional:

```text
Replace Player With Bot
```

Bot mengambil seat dan kartu pemain tersebut.

Jika player reconnect setelah bot replacement:

Gunakan aturan yang jelas.

Pilihan paling sederhana:

```text
Once permanently replaced,
player becomes spectator.
```

---

# 36. Victory Condition

Pemain menang ketika tidak memiliki kartu.

```text
hand.length === 0
```

Tampilkan modal:

```text
🎉 YOU WIN!
```

atau:

```text
🏆 ALEX WINS
```

Tambahkan:

```text
Play Again
Rematch
Back Home
```

Online:

```text
Request Rematch
```

---

# 37. Score System

Optional tetapi direkomendasikan.

Setelah game:

```text
1st Alex       +100
2nd You        +60
3rd Nova       +30
4th Pixel      +10
```

Atau gunakan score berdasarkan sisa kartu pemain.

Simpan match stats jika login tersedia.

Guest stats dapat disimpan local.

---

# 38. Player Avatar

Sediakan avatar original.

Misalnya:

```text
🐼
🦊
🐸
🐯
🐨
🐧
👾
🤖
```

Atau gunakan abstract colorful avatar.

Jangan membutuhkan upload foto untuk bermain.

---

# 39. Chat / Emoji

Optional:

Tambahkan quick reactions:

```text
😂
🔥
😱
👏
😎
💀
```

Player dapat mengirim emoji reaction.

Jangan buat full chat untuk MVP jika tidak diperlukan.

Tambahkan rate limit pada reaction online.

---

# 40. Sound Effects

Tambahkan:

- card draw
- card played
- shuffle
- reverse
- skip
- +2
- +4
- turn notification
- win
- lose

Sediakan:

```text
Sound ON/OFF
```

Simpan setting di localStorage.

---

# 41. Haptic-like Visual Feedback

Karena browser tidak selalu mendukung haptic, gunakan visual feedback.

Ketika:

```text
+4
```

dimainkan, tampilkan:

```text
+4 CARDS!
```

dengan animation singkat.

Ketika Skip:

```text
SKIPPED!
```

Reverse:

```text
REVERSE!
```

---

# 42. Settings

Buat settings:

```text
Sound
Music
Animation
Card Size
Color Blind Mode
Show Playable Cards
Game Speed
```

Optional:

```text
Reduced Motion
```

---

# 43. Color Blind Accessibility

Jangan hanya mengandalkan warna.

Setiap kategori warna juga memiliki simbol.

Contoh:

```text
Red    ●
Blue   ◆
Green  ▲
Yellow ★
```

Atau symbol original lainnya.

Dengan demikian player dapat membedakan kartu meski memiliki gangguan persepsi warna.

---

# 44. Playable Card Highlight

Ketika giliran player:

Playable card diberi:

- slight glow
- border
- lift

Invalid card dibuat sedikit muted.

Namun jangan disable secara visual hingga tidak terbaca.

Jika user memilih invalid card:

tampilkan:

```text
You can't play this card.
```

---

# 45. Game Events

Buat event toast.

Contoh:

```text
Alex played Reverse
```

```text
Direction changed
```

```text
Nova draws 2 cards
```

```text
Pixel skipped your turn
```

```text
Alex has one card left!
```

---

# 46. Mobile First

Prioritaskan:

```text
320px
375px
390px
430px
```

Game harus nyaman dimainkan dengan satu tangan.

Mobile layout:

```text
Opponent Players

        Draw
        +
      Discard

Status / Direction

Your Cards

Game Controls
```

Player hand boleh horizontal scroll.

Pastikan tidak ada horizontal overflow page.

---

# 47. Desktop Layout

Desktop dapat menggunakan meja lebih luas.

Example:

```text
              Player 3

Player 2                  Player 4


        Draw   Discard


           You
      [Your Cards]
```

Max width sekitar:

```text
1200–1400px
```

---

# 48. Game Controls

Controls:

```text
Draw Card
Last Card!
Settings
Leave
```

Host optional:

```text
Game Rules
```

Jangan memenuhi layar dengan terlalu banyak button.

Gunakan contextual controls.

---

# 49. Loading State

Tambahkan:

```text
Creating room...
```

```text
Joining room...
```

```text
Shuffling cards...
```

```text
Waiting for players...
```

```text
Starting match...
```

Jangan menampilkan blank page.

---

# 50. Error Handling

Tangani:

```text
Room not found
```

```text
Room is full
```

```text
Game already started
```

```text
Invalid room code
```

```text
You were disconnected
```

```text
Connection lost
```

```text
Unable to play card
```

```text
Not your turn
```

Gunakan toast yang jelas.

---

# 51. Offline Support

Buat PWA jika memungkinkan.

Tambahkan:

- manifest
- icons
- service worker
- offline fallback

Offline mode mendukung:

```text
Player vs Bot
```

dan:

```text
Local Multiplayer
```

Online multiplayer membutuhkan connection.

Tampilkan badge:

```text
Offline
```

Jika connection kembali:

```text
Back Online
```

---

# 52. State Management

Gunakan React hooks sebagai default.

Jika state mulai kompleks gunakan:

```text
Zustand
```

Pisahkan:

```text
Game State
UI State
Multiplayer State
Settings State
```

Contoh hooks:

```text
useCardGame
useRoom
useOnlineGame
useGuestPlayer
useGameSettings
useNetworkStatus
```

---

# 53. Game Engine

Buat pure functions sebanyak mungkin.

Misalnya:

```ts
createDeck()
shuffleDeck()
isCardPlayable()
playCard()
drawCard()
applyCardEffect()
getNextPlayer()
reverseDirection()
checkWinner()
```

Pure logic mempermudah testing.

---

# 54. Shuffle

Gunakan Fisher-Yates Shuffle.

Jangan menggunakan:

```ts
array.sort(() => Math.random() - 0.5)
```

untuk shuffle utama.

Buat:

```ts
shuffleDeck(cards)
```

menggunakan algoritma Fisher-Yates.

---

# 55. New Game Setup

Flow:

```text
Create deck
↓
Shuffle
↓
Deal cards
↓
Create draw pile
↓
Set first discard
↓
Determine starting player
↓
Start match
```

Jumlah awal:

```text
7 cards per player
```

Jika kartu awal merupakan action card, implementasikan behavior secara konsisten dan dokumentasikan rule yang digunakan.

---

# 56. Empty Draw Pile

Jika draw pile habis:

Ambil discard pile kecuali top card.

```text
Top discard stays
```

Sisa discard:

```text
shuffle
↓
new draw pile
```

Pastikan game tidak crash.

---

# 57. Race Condition

Online multiplayer harus mencegah:

```text
two players playing simultaneously
```

Gunakan:

- transaction
- database RPC
- server action
- authoritative API

sesuai arsitektur.

Setiap game state dapat memiliki:

```text
version
```

Contoh:

```ts
gameVersion: number;
```

Client harus mengirim expected version.

Backend menolak stale updates.

---

# 58. Idempotency

Penting untuk realtime.

Jika event yang sama diterima dua kali:

Jangan menjalankan action dua kali.

Gunakan:

```text
actionId
```

atau:

```text
moveId
```

Contoh:

```ts
{
  actionId: crypto.randomUUID(),
  playerId,
  type: "play_card",
  cardId
}
```

---

# 59. Security

Jangan expose:

```text
SUPABASE_SERVICE_ROLE_KEY
```

ke frontend.

Environment public hanya yang aman.

Contoh:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Server secrets:

```env
SUPABASE_SERVICE_ROLE_KEY=
```

hanya di server.

Tambahkan:

- schema validation
- authorization
- turn validation
- rate limiting jika diperlukan

Gunakan Zod untuk payload API jika sesuai.

---

# 60. SEO

Metadata:

```text
Title:
ColorCards — Play Card Games Online

Description:
Play a colorful multiplayer card game with friends, bots, or local players.
```

Tambahkan:

- favicon
- OpenGraph
- theme-color
- metadata

---

# 61. PWA

Tambahkan:

```text
manifest.webmanifest
```

Name:

```text
ColorCards
```

Display:

```text
standalone
```

Theme color:

sesuai primary brand.

Pastikan app tetap usable tanpa PWA install.

---

# 62. Performance

Optimalkan:

- card component rendering
- animations
- realtime subscriptions
- mobile performance

Gunakan React memoization jika benar-benar diperlukan.

Hindari:

```text
unnecessary re-renders
```

Jangan broadcast seluruh game state untuk setiap animation frame.

---

# 63. Accessibility

Pastikan:

- keyboard navigation
- focus state
- aria-label
- contrast
- color-blind symbols
- reduced motion
- touch targets >= sekitar 44px

Cards yang dapat dimainkan harus bisa dipilih dengan keyboard.

---

# 64. Testing

Gunakan:

```text
Vitest
```

dan jika diperlukan:

```text
React Testing Library
```

Test minimal:

```text
create deck
shuffle deck
valid card
invalid card
skip
reverse
draw two
wild
wild draw four
next player
win
draw pile regeneration
```

Online validation tests:

```text
wrong player turn
invalid card ownership
duplicate action
stale game state
```

---

# 65. Routes

Minimal:

```text
/
```

Home.

```text
/bot
```

Bot game.

```text
/local
```

Local multiplayer.

```text
/online
```

Create / Join game.

```text
/room/[roomId]
```

Lobby dan online game.

```text
/settings
```

Settings.

---

# 66. Homepage Feature Section

Tambahkan:

```text
Why ColorCards?
```

Cards:

### Multiplayer

```text
Play with friends in real time.
```

### Smart Bots

```text
Challenge AI players at different difficulties.
```

### Offline Ready

```text
Play against bots even without internet.
```

### Mobile Friendly

```text
Built for phones, tablets, and desktop.
```

---

# 67. UI Component Style

Gunakan:

```text
rounded-xl
rounded-2xl
soft shadows
clean typography
large buttons
bold numbers
subtle gradients
```

CTA harus terlihat seperti game button.

Contoh:

```text
PLAY NOW
```

Primary CTA:

```text
gradient purple → blue
```

Secondary CTA:

```text
white surface
border
```

---

# 68. Lobby Visual

Lobby jangan terasa seperti admin dashboard.

Gunakan gaming UI.

Contoh:

```text
┌───────────────────────────────┐
│ ROOM X7P9QK                  │
│                               │
│ 🐼 You              READY ✓   │
│ 🦊 Alex             READY ✓   │
│ 🤖 Nova             BOT       │
│ + Waiting for player          │
│                               │
│      [ START GAME ]           │
└───────────────────────────────┘
```

---

# 69. Game Result Screen

Victory:

```text
🎉
YOU WIN!
```

Subtitle:

```text
Amazing game!
```

Stats:

```text
Cards Played: 18
Action Cards: 6
Wild Cards: 2
Game Time: 8:42
```

Buttons:

```text
Rematch
Play Again
Home
```

Loss:

```text
GOOD GAME!
```

Jangan membuat loss screen terasa terlalu negatif.

---

# 70. Rematch System

Online:

Setelah game selesai:

```text
Request Rematch
```

Jika semua player setuju:

```text
shuffle new game
```

Pertahankan room dan seats.

Buat new match ID.

Jangan reuse deck/state dari pertandingan sebelumnya.

---

# 71. Optional Match History

Jika auth tersedia:

Simpan:

```text
Played
Won
Win Rate
Cards Played
Matches
```

Jangan jadikan auth dependency untuk core gameplay.

---

# 72. Code Quality

Gunakan:

- TypeScript strict mode
- clear types
- reusable components
- small functions
- separation of concerns

Hindari:

```ts
any
```

sebisa mungkin.

Jangan meninggalkan:

```text
TODO
FIXME
placeholder
```

untuk fitur inti.

---

# 73. README

Buat README berisi:

```text
Project overview
Tech stack
Installation
Environment setup
Supabase setup
Database schema
RLS setup
Development
Testing
Production build
Vercel deployment
```

Setup:

```bash
npm install
npm run dev
```

Testing:

```bash
npm run test
```

Production:

```bash
npm run build
```

---

# 74. Vercel Deployment

Project harus dapat:

```text
push to GitHub
↓
import to Vercel
↓
add environment variables
↓
Deploy
```

Tidak boleh membutuhkan:

```text
always-on custom Node server
```

untuk berjalan.

Gunakan serverless/edge-compatible architecture.

---

# 75. Final Quality Checklist

Sebelum project dianggap selesai:

Pastikan:

```text
Homepage works
Bot mode works
Local multiplayer works
Online lobby works
Room code works
Realtime sync works
Hidden cards secure
Action cards work
Reverse works
Skip works
Draw 2 works
Wild works
Draw 4 works
Winner detection works
Reconnect works
Responsive mobile works
Offline bot works
No major TypeScript errors
No broken routes
No horizontal overflow
Production build succeeds
```

Jalankan:

```bash
npm run lint
npm run test
npm run build
```

Perbaiki seluruh critical error.

---

# 76. Priority Implementasi

Kerjakan dalam urutan berikut:

```text
1. Card data model
2. Deck generation
3. Shuffle
4. Core game engine
5. Valid card logic
6. Action card effects
7. Winner logic
8. Game table UI
9. Player hand
10. Bot mode
11. Local multiplayer
12. Online room
13. Realtime
14. Server validation
15. Reconnection
16. Mobile optimization
17. Offline/PWA
18. Animation
19. Sound
20. Final polish
```

Jangan mulai dari animasi sebelum game engine stabil.

---

# 77. Definition of Done

Project dianggap selesai apabila user dapat:

```text
Open website
↓
Choose game mode
↓
Start game
↓
Play cards according to rules
↓
Use special cards
↓
Finish game
↓
See winner
↓
Play again
```

Untuk online:

```text
Player A creates room
↓
Shares room code
↓
Player B joins
↓
Both see the same match
↓
Hidden cards remain private
↓
Turns synchronize correctly
↓
Game can finish normally
```

Aplikasi harus terasa seperti **casual multiplayer web game yang benar-benar playable**, bukan hanya showcase UI.

Jika ada keputusan teknis yang tidak disebutkan, pilih solusi yang:

```text
simple
secure
maintainable
responsive
mobile friendly
Vercel compatible
```

dan prioritaskan kestabilan gameplay dibanding fitur dekoratif.

Untuk implementasi ini, stack yang paling pas adalah **Next.js + TypeScript + Tailwind + Zustand + Supabase Realtime/Postgres + Framer Motion + Vercel**. Bagian paling penting untuk mode online adalah **hidden-card security dan server-authoritative game state**, supaya pemain tidak bisa melihat kartu lawan hanya dengan membuka DevTools.