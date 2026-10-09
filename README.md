# PhoneRadar — SmartPhone Hardware & Buyer's Guide Portal

Dunyo smartfonlari, kamera va batareya apparat tahlili hamda xarid bo'yicha professional maslahatlar platformasi (Fullstack Multi-Page Web Application).

---

## 🌟 Alohida Sahifalar Ro'yxati (Multi-Page Architecture)

Har bir bo'lim alohida, to'liq sahifa sifatida yaratilgan:

1. 🏠 **Bosh Sahifa** (`index.html`):
   - Portalning umumiy ko'rinishi, tezkor qidiruv, trenddagi modellar va bo'limlarga tezkor o'tish eshigi.
   👉 `http://localhost:3000/index.html`

2. 📱 **Telefonlar Kataloqi** (`catalog.html`):
   - To'liq telefonlar ro'yxati, real vaqtdagi jonli qidiruv (Live search & autocomplete dropdown), brendlar filtri, toifalar va narx saralash, IP68 va OIS filtrlari.
   👉 `http://localhost:3000/catalog.html`

3. 🧠 **Aqlli Maslahatchi (Quiz)** (`advisor.html`):
   - "Qaysi telefon sizga mos?" 1 daqiqalik test sahifasi. Byudjet, ehtiyoj va brend tanlanishi bilan server algoritmi orqali eng yaxshi modelni chiqarib beradi.
   👉 `http://localhost:3000/advisor.html`

4. 🧭 **Xarid Qo'llanmasi** (`guide.html`):
   - Telefon olayotganda nimaga e'tibor berish kerak? 7 ta oltin qoida, do'konda tekshirish cheklisti va marketing aldovlaridan saqlanish.
   👉 `http://localhost:3000/guide.html`

5. 🔬 **Kamera & Batareya Apparati** (`hardware.html`):
   - Sensorlar o'lchami tahlili (1 dyuym, 1/1.3"), OIS va periskop zum, 120W tezkor zaryadlash xavfsizligi, AMOLED LTPO va PWM ko'z salomatligi.
   👉 `http://localhost:3000/hardware.html`

6. ⚖️ **Smartfonlarni Taqqoslash** (`compare.html`):
   - 2 yoki 3 ta smartfonni tanlab ularning apparat parametrlarini yonma-yon ulkan matritsa jadvalida solishtirish.
   👉 `http://localhost:3000/compare.html`

7. 🛠️ **Admin Boshqaruv Paneli** (`admin.html`):
   - Yangi chiqqan telefonlarni kodsiz qo'shish, narxlarini yangilash, tahrirlash va o'chirish.
   👉 `http://localhost:3000/admin.html`

---

## 🚀 Ishga Tushirish

Server fonda ishlamoqda yoki istalgan vaqtda:
```bash
node server.js
```
buyrug'i bilan ishga tushiriladi va `http://localhost:3000` manzilida ochiladi.
