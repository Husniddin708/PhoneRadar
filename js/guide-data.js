/**
 * Telefon xarid qilish bo'yicha to'liq qo'llanma, apparat (hardware) tahlili va tavsiyalar.
 * Dasturiy ta'minot (OS) chetlab o'tilgan, faqat apparat qismlari.
 */

const BUYERS_GUIDE_DATA = {
  goldenRules: [
    {
      id: 1,
      icon: "fa-solid fa-camera",
      title: "Megapiksel soniga aldanmang! Sensor o'lchami va OIS ga qarang",
      summary: "200 MP bo'lgan arzon kamera 50 MP bo'lgan flagman kamerasidan yomonroq surat olishi mumkin.",
      detail: `Ko'pchilik odamlar 108 MP yoki 200 MP yozuvini ko'rib, bu eng zo'r kamera deb o'ylashadi. Biroq sifatni megapiksel soni emas, balki **sensorning jismoniy o'lchami (Sensor Size)** hal qiladi:
      <ul>
        <li><strong>Haqiqiy 1 dyuymli (1.0") yoki 1/1.3"</strong> sensorlar o'ziga yorug'likni 3-4 barobar ko'proq yig'adi. Natijada kechasi va xira xonada ham shovqinsiz (shovqin - donadorlik), tiniq va tabiiy fon xiralashgan (Bokeh) suratlar chiqadi.</li>
        <li><strong>OIS (Optik tasvir barqarorlashtirish)</strong> — kamerada albatta bo'lishi shart! Agar OIS bo'lmasa, qo'lingiz salgina qaltirasa ham rasm xira bo'lib chiqadi va tunda sifat keskin yomonlashadi.</li>
        <li><strong>Linza diafragmasi (f/1.6, f/1.8):</strong> Bu son qanchalik kichik bo'lsa, linza shunchalik keng ochiladi va yorug'lik ko'p o'tadi.</li>
      </ul>`
    },
    {
      id: 2,
      icon: "fa-solid fa-bolt",
      title: "Batareya: Faqat mAh sig'imi emas, zaryadlash tezligi (Vatt) va qutisi",
      summary: "5000 mAh batareyani 25W bilan 1.5 soatda, 120W bilan esa 19 daqiqada to'ldirish mumkin.",
      detail: `Telefon xarid qilayotganda batareyaning quyidagi apparat jihatlariga qarang:
      <ul>
        <li><strong>Minimal sig'im:</strong> Zamonaviy telefon uchun 5000 mAh standart hisoblanadi. Agar 5400-5500 mAh bo'lsa — bu ajoyib ko'rsatkich.</li>
        <li><strong>Zaryadlash quvvati (Watt):</strong> 67W, 100W yoki 120W quvvatlovchi telefonlar 20-30 daqiqada 100% to'ladi. 15W-25W esa 1.5 soat vaqt oladi.</li>
        <li><strong>Qutida blok bormi?</strong> Apple, Samsung va Google qutiga zaryadlovchi adapter qo'shmaydi (alohida $30-$50 ga sotib olishingiz kerak bo'ladi). Xiaomi, OnePlus va Poco esa qutida to'liq original quvvatlagich blok beradi.</li>
        <li><strong>Simsiz quvvatlash:</strong> Mashinada yoki ish stolida simsiz stend ishlatadiganlar uchun Qi yoki MagSafe apparati borligini tekshiring.</li>
      </ul>`
    },
    {
      id: 3,
      icon: "fa-solid fa-desktop",
      title: "Ekran: AMOLED, 120Hz chastota va quyoshdagi yorqinlik (Nits)",
      summary: "Ko'zingiz har kuni bir necha soat ekranga qaraydi. Yaxshi ekran sog'liq uchun eng muhimi.",
      detail: `Displeyni tanlashda 4 ta asosiy parametrga e'tibor bering:
      <ul>
        <li><strong>Displey turi:</strong> Faqat AMOLED yoki OLED oling. Eskirgan IPS ekranlar qora rangni kulrang qilib ko'rsatadi va batareyani ko'proq yeydi.</li>
        <li><strong>120Hz yangilanish:</strong> 60Hz va 120Hz o'rtasidagi farq juda katta — 120Hz da menyular va o'yinlar ipakdek silliq aylanadi. Eng yaxshisi — **LTPO** ekrandir (harakatsiz paytda chastotani 1Hz ga tushirib batareyani tejaydi).</li>
        <li><strong>Yorqinlik (Cho'qqi Nits):</strong> O'zbekistonning yozgi quyoshi ostida telefonni ko'rish uchun kamida 1500-2000 nits yorqinlik kerak. 2600-4500 nits bo'lsa — quyoshda ham ko'zgudek tiniq ko'rinadi.</li>
        <li><strong>PWM (Chaqnosh) chastotasi:</strong> Ko'zingiz tez charchamasligi va bosh og'rimasligi uchun 1920Hz yoki 3840Hz yuqori chastotali PWM himoyasi bor ekranlarni tanlang.</li>
      </ul>`
    },
    {
      id: 4,
      icon: "fa-solid fa-microchip",
      title: "Protsessor va Sovitish: Qizib ketish (Trottling) ga aldanmang",
      summary: "Benchmarkda zo'r ball olgan telefon sovitish tizimi yomon bo'lsa 15 daqiqada qizib, qotishni boshlaydi.",
      detail: `Protsessor telefonning yuragi hisoblanadi:
      <ul>
        <li><strong>Texprotsess (3nm / 4nm):</strong> Raqam qanchalik kichik bo'lsa, tranzistorlar shunchalik zich joylashgan, energiya kam sarflaydi va kamroq qiziydi (TSMC fabrikasida ishlab chiqarilgan chiplar eng barqaror).</li>
        <li><strong>Bug'lanish kamerasi (Vapor Chamber):</strong> Protsessor kuchli bo'lgani bilan, korpus ichida bug'lanish kamerasi bo'lmasa, telefon o'yin o'ynaganda qizib, chastotani tushirib yuboradi (trottling). Katta maydonli VC sovutish paneli bor telefonlarni tanlang.</li>
        <li><strong>Eng ishonchli flagman chiplar:</strong> Snapdragon 8 Gen 3, Apple A18 Pro, Dimensity 9300.</li>
      </ul>`
    },
    {
      id: 5,
      icon: "fa-solid fa-shield-halved",
      title: "Korpus va Suvdan Himoya: IP68 yoki IP67 sertifikati",
      summary: "Suv sachrashi yoki tasodifan hovuzga tushib ketganda telefoningiz omon qolishi shart.",
      detail: `Korpus apparat qismining mustahkamligi:
      <ul>
        <li><strong>IP68 sertifikati:</strong> Telefon 1.5 metrdan 6 metrgacha chuqurlikda toza suvda 30 daqiqa yotishi mumkin. Bu sertifikatsiz telefonlarni yomg'irda ham ehtiyot qilishga to'g'ri keladi.</li>
        <li><strong>Himoya shishasi:</strong> Corning Gorilla Glass Victus 2 yoki Gorilla Armor — tirnalish va yerga tushishdan eng yaxshi himoya.</li>
        <li><strong>Ramka materiali:</strong> Plastik romlar vaqt o'tib tirnaladi va mayishadi. Aviatsiya alyuminiyi yoki 5-sinf Titanium zarbani yaxshi yutadi va telefonni egilib ketishdan saqlaydi.</li>
      </ul>`
    },
    {
      id: 6,
      icon: "fa-solid fa-memory",
      title: "Xotira: Faqat gigabaytlar emas, xotira tezligi (UFS 4.0 va LPDDR5X)",
      summary: "UFS 4.0 xotira eskirgan UFS 2.2 ga nisbatan 4 barobar tezroq ishlaydi.",
      detail: `Telefon qotmasdan yillab tez ishlashi uchun xotira turlari:
      <ul>
        <li><strong>Tezkor xotira (RAM):</strong> Kamida 8 GB, eng yaxshisi 12 GB yoki 16 GB LPDDR5X. Bu ilovalarni orqa fonda yopilib ketmasdan bir zumda ochilishini ta'minlaydi.</li>
        <li><strong>Doimiy xotira (ROM):</strong> Flagmanlarda UFS 4.0, o'rta toifada UFS 3.1 bo'lishi shart. Eskirgan UFS 2.2 xotirali telefonlar 1 yildan keyin sekinlashadi.</li>
        <li>Hajm bo'yicha: 256 GB hozirgi zamonaviy minimal talab, chunki 4K videolar va yuqori sifatli fotosuratlar xotirani tez to'ldiradi.</li>
      </ul>`
    },
    {
      id: 7,
      icon: "fa-solid fa-hand-holding-dollar",
      title: "Xarid qilishda qanaqa keng tarqalgan xatolarga yo'l qo'ymaslik kerak?",
      summary: "Eski yillardagi eskirgan flagmanga aldanib qolmaslik va to'g'ri narx-sifat balansini topish.",
      detail: `Do'konga borishdan oldin yodda tuting:
      <ul>
        <li><strong>Reklama qilingan 200x yoki 100x raqamli zum:</strong> Bu apparat emas, shunchaki xira piksellarni kattalashtirish. Haqiqiy sifatni faqat 3x yoki 5x Optik/Periskop linza beradi.</li>
        <li><strong>O'ta yupqa yoki engil telefonlar:</strong> Odatda kichik batareyaga (4000 mAh dan kam) va kichik sovitish tizimiga ega bo'ladi, natijada tez qiziydi.</li>
        <li><strong>Do'konda displey yorug'ligini va qizishini qo'lda ushlab ko'ring:</strong> Kamerani 2 daqiqa 4K 60fps rejimida yoniq qoldiring va orqa qopqoq qanchalik qizishini tekshiring.</li>
      </ul>`
    }
  ],

  hardwareDeepDive: {
    camera: {
      title: "Smartfon Kameralari Apparati: Mukammal Texnik Tahlil",
      subtitle: "Megapiksel, sensor matritsasi, diafragma va optik zumning sirlari",
      sections: [
        {
          heading: "Sensor o'lchami nima va u nega eng muhim?",
          content: "Kamera ichidagi eng qimmat apparat — bu yorug'likni qabul qiluvchi kremniy matritsa (sensor) hisoblanadi. U dyuymlarda o'lchanadi (masalan, 1.0\", 1/1.3\", 1/1.56\", 1/2.8\"). Kasr maxraji qancha kichik bo'lsa, sensor shuncha katta bo'ladi. Katta sensor (masalan Xiaomi 14 Ultra va Vivo X100 Pro dagi 1 dyuymli Sony sensori) ko'proq fotonlarni yutadi, natijada dinamik diapazon kengayadi, tunda shovqinsiz tabiiy kadrlar olinadi."
        },
        {
          heading: "OIS (Optik Stabilizatsiya) qanday ishlaydi?",
          content: "OIS — bu linza yoki datchik atrofidagi maxsus elektromagnit g'altaklar va giroskop apparati. Siz qo'lingiz bilan telefonni qimirlatganingizda, ichki apparat linzani qarama-qarshi tomonga siljitib tebranishni zararsizlantiradi. Sensor-Shift texnologiyasida esa (Apple iPhone Pro larida) linza emas, balki matritsaning o'zi siljiydi, bu esa yanada tezkor barqarorlik beradi."
        },
        {
          heading: "Optik vs Periskop Zum: Uzoqni tiniq olish apparati",
          content: "Oddiy telefonlar ingichka bo'lgani sababli ichiga uzun linza sig'maydi. Shu sababli muhandislar periskop arxitekturasini yaratishdi: yorug'lik prizma orqali 90 darajaga burilib, telefon bo'ylab gorizontal joylashgan linzalar orqali o'tadi. 5x optik periskop linzasi yordamida 100 metr uzoqlikdagi yozuvlarni ham sifat yo'qolmasdan o'qish mumkin."
        }
      ]
    },

    battery: {
      title: "Batareya va Quvvatlash Apparati",
      subtitle: "mAh sig'imi, litiy-kremniy katodlari va 120W xavfsiz zaryadlash",
      sections: [
        {
          heading: "Yangi avlod Kremniy-uglerod (Silicon-Carbon) batareyalari",
          content: "2024-yildan boshlab ilg'or smartfonlarda (OnePlus, Vivo, Honor) an'anaviy grafit o'rniga kremniy-uglerod manfiy elektrodi ishlatilmoqda. Bu xuddi shu jismoniy qalinlikda batareya sig'imini 5000 mAh dan 5400-6000 mAh gacha oshirish imkonini berdi, shuningdek sovuq havoda (-20°C) batareya o'chib qolishining oldini oladi."
        },
        {
          heading: "100W-120W tezkor zaryad batareyani tez eskiradimi?",
          content: "Tezkor zaryadlovchi telefonlar ichida 1 ta emas, balki 2 ta alohida batareya katakchasi (Dual-cell, masalan 2x 2500 mAh) bo'ladi. 120W quvvat ikkala batareyaga teng (60W dan) taqsimlanadi. Shuningdek apparat ichidagi maxsus zaryad boshqaruvchi chiplar (masalan Xiaomi Surge P2, SuperVOOC chipi) haroratni sekundiga 50 marta nazorat qiladi. Shu sababli sifatli brendlarda batareya 800-1600 siklgacha (3-4 yil) 80% sog'lig'ini saqlab qoladi."
        },
        {
          heading: "Batareyani sog'lom saqlashning apparat siri",
          content: "Litiy batareyalar uchun eng katta dushman — bu yuqori harorat (45°C dan yuqori) va batareyaning 0% gacha to'liq o'lib qolishi. Zaryadni 20% dan 80% gacha oralig'ida ushlash uning xizmat muddatini deyarli 2 barobarga uzaytiradi."
        }
      ]
    },

    display: {
      title: "Ekran va Displey Texnologiyalari",
      subtitle: "LTPO AMOLED, Nits yorqinligi va ko'z salomatligi (PWM)",
      sections: [
        {
          heading: "LTPO (Past Haroratli Polikristall Oksid) mo''jizasi",
          content: "Oddiy 120Hz ekranlar hatto kitob o'qiyotganingizda ham ekranni sekundiga 120 marta yangilaydi va batareyani ko'p yeydi. LTPO apparat paneli esa siz harakat qilmayotganingizda chastotani darhol 1Hz ga (sekundiga 1 marta) tushiradi, barmoq tegishi bilan esa 120Hz ga chiqaradi. Bu batareyani 20-30% tejaydi."
        },
        {
          heading: "Nega ba'zi odamlarning ko'zi AMOLED ekrandan og'riydi?",
          content: "OLED ekranlar yorug'likni kamaytirish uchun piksellarni sekundiga yuzlab marta yoqib-o'chiradi (PWM chaqnashi). Agar bu chastota past (240Hz-480Hz) bo'lsa, ko'z qorachig'i toliqadi va bosh og'riydi. Zamonaviy telefonlarda 1920Hz dan 3840Hz gacha ultra-yuqori PWM yoki apparat darajasidagi DC Dimming qo'llaniladi, bu ko'z uchun xavfsizdir."
        }
      ]
    }
  },

  recommendationsByNeed: [
    {
      category: "Surat va Video Ishqibozlari (Eng Zo'r Kamerafon)",
      icon: "fa-solid fa-camera-retro",
      idealBudget: "$1000 - $1300",
      topPicks: ["Xiaomi 14 Ultra", "iPhone 16 Pro Max", "Vivo X100 Pro", "Samsung Galaxy S24 Ultra"],
      hardwareMustHaves: [
        "1 dyuymli yoki 1/1.3\" yirik sensor",
        "OIS yoki Sensor-Shift stabilizatsiya",
        "Kamida 3x-5x jismoniy periskop optik zoom",
        "4K 60fps va 4K 120fps video apparati"
      ],
      advice: "Agar asosiy maqsadingiz video bo'lsa — iPhone 16 Pro Max mutlaq yetakchi. Agar professional fotografiya, portret va optik linzalar sifati bo'lsa — Xiaomi 14 Ultra va Vivo X100 Pro tengsizdir."
    },
    {
      category: "Og'ir O'yinlar va Maksimal Tezlik (Geymerlar)",
      icon: "fa-solid fa-gamepad",
      idealBudget: "$500 - $1200",
      topPicks: ["Asus ROG Phone 8 Pro", "Poco F6 Pro", "OnePlus 12"],
      hardwareMustHaves: [
        "Snapdragon 8 Gen 3 yoki 8 Gen 2",
        "9000mm² dan katta Bug'lanish kamerasi (Vapor chamber)",
        "120Hz - 165Hz ekran va 720Hz sensor javobi",
        "12 GB - 24 GB LPDDR5X RAM"
      ],
      advice: "O'yin uchun faqat kuchli protsessor emas, korpusdagi sovitish muhim. Poco F6 Pro arzon narxda flagman kuchini bersa, Asus ROG Phone 8 Pro qo'shimcha sovutgich va yon triggerlari bilan chempion."
    },
    {
      category: "Batareyasi 2 Kun Yetadigan 'Ishchi Otlar'",
      icon: "fa-solid fa-battery-full",
      idealBudget: "$400 - $800",
      topPicks: ["OnePlus 12", "Sony Xperia 1 VI", "Samsung Galaxy A55 5G"],
      hardwareMustHaves: [
        "5000 - 5400 mAh energiya zich batareya",
        "4nm tejamkor chipset",
        "LTPO ekran 1Hz gacha tushuvchi",
        "67W - 100W tezkor zaryad"
      ],
      advice: "OnePlus 12 ning 5400 mAh batareyasi 10 soatdan ortiq ekran vaqti beradi va atigi 26 daqiqada 100% to'ladi. Sony Xperia 1 VI esa energiya tejash bo'yicha eng optimallashgan apparat."
    },
    {
      category: "Eng Aqlli Byudjet Xaridi ($350 - $450 Oralig'i)",
      icon: "fa-solid fa-wallet",
      idealBudget: "$350 - $450",
      topPicks: ["Redmi Note 13 Pro+ 5G", "Samsung Galaxy A55 5G"],
      hardwareMustHaves: [
        "IP67 yoki IP68 suvdan himoya",
        "Gorilla Glass Victus himoyasi",
        "OIS ga ega asosiy kamera",
        "5000 mAh batareya"
      ],
      advice: "Redmi Note 13 Pro+ 120W zaryadi va 200MP kamerasi bilan yutsa, Samsung A55 o'zining metall romi, uzoq xizmat qilishi va MicroSD tirqishi bilan ishonchlidir."
    }
  ]
};
