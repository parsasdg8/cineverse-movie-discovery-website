<div align="center">

# 🎬 CineVerse

### وب‌سایت مدرن کشف و جست‌وجوی فیلم

<p>
  فیلم‌های مختلف را کشف کنید، فیلم‌های برتر را ببینید،
  فیلم روز را دریافت کنید و در میان مجموعه فیلم‌ها جست‌وجو کنید.
</p>

<br>

<a href="https://cineverse-demo.netlify.app/">
  <img src="https://img.shields.io/badge/🚀%20دموی%20آنلاین-مشاهده%20CineVerse-7C3AED?style=for-the-badge" alt="Live Demo">
</a>

<br><br>

<a href="README.md">
  <img src="https://img.shields.io/badge/🇬🇧%20English-README-7C3AED?style=for-the-badge" alt="English README">
</a>
<a href="README-fa.md">
  <img src="https://img.shields.io/badge/🇮🇷%20فارسی-README--fa-18181B?style=for-the-badge" alt="Persian README">
</a>

</div>

---

## 📖 درباره پروژه

**CineVerse** یک وب‌سایت مدرن برای **کشف فیلم‌ها** است که با استفاده از **HTML، CSS و Vanilla JavaScript** ساخته شده است.

هدف پروژه ایجاد تجربه‌ای جذاب و مدرن برای کشف فیلم‌ها با استفاده از یک رابط کاربری **Glassmorphism، افکت‌های Glow و طراحی کاملاً Responsive** است.

در CineVerse فقط یک لیست ساده از فیلم‌ها نمایش داده نمی‌شود، بلکه امکانات مختلفی برای کشف فیلم وجود دارد؛ از جمله فیلم‌های دارای بالاترین امتیاز، پیشنهاد روزانه، جست‌وجوی فیلم، صفحه‌بندی، نمایش جزئیات فیلم و Carousel تعاملی.

اطلاعات فیلم‌ها از **MoviesAPI.ir** دریافت می‌شوند.

---

## 🚀 دموی آنلاین

برای مشاهده پروژه می‌توانید از لینک زیر استفاده کنید:

(اگر ip شما ایران است باید از vpn برای دیدن دموی انلاین پروژه استفاده کنید)

### 👉 [مشاهده CineVerse](https://cineverse-demo.netlify.app/)
---

## ✨ امکانات

### 🎬 کشف فیلم

- دریافت مجموعه‌ای از فیلم‌ها از API
- نمایش پوستر، عنوان، سال انتشار و امتیاز IMDb
- حذف خودکار فیلم‌های تکراری
- دریافت اطلاعات از چندین صفحه API

### ⭐ فیلم‌های برتر

- پیدا کردن فیلم‌هایی با بالاترین امتیاز
- نمایش فیلم‌های برتر در یک Carousel تعاملی
- تغییر تعداد کارت‌های قابل نمایش بر اساس اندازه صفحه
- دکمه‌های کنترل در دسکتاپ
- قابلیت Swipe در موبایل

### 🎯 پیشنهاد فیلم روزانه

- هر روز یک فیلم به عنوان پیشنهاد روزانه انتخاب می‌شود.
- فیلم انتخاب‌شده در طول همان روز ثابت باقی می‌ماند.
- اطلاعات انتخاب در `localStorage` ذخیره می‌شود.
- انتخاب فیلم بر اساس تاریخ روز و به صورت Deterministic انجام می‌شود.

### 🔎 جست‌وجوی فیلم

- جست‌وجو بر اساس عنوان فیلم
- نمایش نتایج هم‌زمان با تایپ کاربر
- نمایش حداکثر ۸ نتیجه
- باز کردن مستقیم جزئیات فیلم از نتایج جست‌وجو
- رابط جست‌وجوی مناسب برای موبایل

### 📄 صفحه‌بندی

- نمایش فیلم‌ها در صفحات مختلف
- نمایش ۱۰ فیلم در هر صفحه
- دکمه‌های صفحه قبل و بعد
- نمایش شماره صفحات به صورت پویا
- اسکرول نرم هنگام تغییر صفحه

### 🪟 نمایش جزئیات فیلم

با کلیک روی هر فیلم، یک Modal حاوی اطلاعات کامل آن نمایش داده می‌شود:

- عنوان فیلم
- امتیاز IMDb
- سال انتشار
- کشور
- ژانرها
- توضیحات / داستان
- پوستر فیلم
- تصاویر و Screenshotهای فیلم

تصاویر داخل Modal نیز قابلیت باز شدن در حالت Fullscreen را دارند.

### 💾 کش کردن اطلاعات با LocalStorage

اطلاعات دریافت‌شده از API با استفاده از `localStorage` ذخیره می‌شوند.

مدت اعتبار Cache برابر با **۶ ساعت** است که باعث کاهش درخواست‌های غیرضروری به API و بهبود سرعت تجربه کاربر می‌شود.

### 📱 طراحی Responsive

رابط کاربری برای اندازه‌های مختلف صفحه طراحی شده است:

- Desktop
- Laptop
- Tablet
- Mobile

Carousel نیز بر اساس عرض صفحه به صورت خودکار تعداد کارت‌های قابل نمایش را تغییر می‌دهد.

### ✨ افکت‌های مدرن رابط کاربری

رابط کاربری پروژه از ترکیبی از افکت‌های مدرن استفاده می‌کند:

- Glassmorphism
- Glow Effects
- نور دنبال‌کننده موس روی کارت‌ها
- Ambient Page Glow
- Transitionهای نرم
- کارت‌های مدرن
- Layoutهای Responsive

### ♿ دسترسی‌پذیری

در پروژه چند قابلیت برای بهبود Accessibility نیز در نظر گرفته شده است:

- قابلیت استفاده از کارت‌ها با کیبورد
- استفاده از `aria-label`
- استفاده از `aria-current`
- استفاده از `aria-expanded`
- پشتیبانی از کلیدهای کیبورد
- مدیریت Focus در Modal

---

## 🛠️ تکنولوژی‌های استفاده‌شده

| تکنولوژی | کاربرد |
|---|---|
| HTML5 | ساختار صفحات |
| CSS3 | طراحی، Responsive Design و افکت‌ها |
| JavaScript | منطق برنامه و تعاملات |
| MoviesAPI.ir | منبع اطلاعات فیلم‌ها |
| Fetch API | ارسال درخواست‌های API |
| LocalStorage | Cache و ذخیره پیشنهاد روزانه |
| Netlify | انتشار نسخه آنلاین |

---

## 🔌 API

این پروژه از API زیر استفاده می‌کند:

**MoviesAPI.ir**

Endpoint اصلی:

```text
http://moviesapi.ir/api/v1/movies?page=

برنامه اطلاعات چندین صفحه از API را دریافت کرده و سپس آن‌ها را در یک مجموعه واحد قرار می‌دهد.

مدیریت CORS

از آنجا که API هدر موردنیاز Access-Control-Allow-Origin را برای درخواست مستقیم مرورگر ارسال نمی‌کند، پروژه ابتدا درخواست مستقیم را امتحان کرده و در صورت نیاز از یک Public CORS Proxy استفاده می‌کند.

همچنین برای درخواست‌های API، Timeout و Error Handling در نظر گرفته شده است تا در صورت بروز مشکل، کل برنامه متوقف نشود.

⚡ روند کلی عملکرد

روند کلی برنامه به شکل زیر است:

اجرای وب‌سایت
     │
     ▼
دریافت اطلاعات فیلم‌ها
     │
     ├── LocalStorage Cache
     │
     └── API Request
             │
             ▼
       دریافت چندین صفحه
             │
             ▼
       ادغام اطلاعات فیلم‌ها
             │
             ▼
       حذف موارد تکراری
             │
             ├── فیلم‌های برتر
             ├── پیشنهاد روزانه
             ├── Pagination
             └── Search
📁 ساختار پروژه

ساختار پروژه ساده نگه داشته شده و از Vanilla Frontend استفاده می‌کند.

cineverse-movie-discovery/
│
├── index.html
├── style.css
├── script.js
│
├── README.md
└── README-fa.md

ساختار دقیق ممکن است بر اساس فایل‌های نهایی پروژه کمی متفاوت باشد.

💻 اجرای پروژه به صورت Local
1. کلون کردن Repository
git clone https://github.com/parsasdg8/cineverse-movie-discovery.git
2. باز کردن پروژه

پوشه پروژه را با ویرایشگر موردنظر خود باز کنید.

3. اجرای پروژه با Local Server

از آنجا که پروژه از fetch() و منابع خارجی استفاده می‌کند، بهتر است آن را با یک Local Development Server اجرا کنید.

برای مثال در VS Code و با استفاده از Live Server:

Right Click → Open with Live Server

سپس آدرسی که Local Server در اختیار شما قرار می‌دهد را باز کنید.

🧠 مفاهیم JavaScript استفاده‌شده

این پروژه چندین مفهوم کاربردی JavaScript را پیاده‌سازی می‌کند، از جمله:

async / await
Fetch API
Promise
Promise.all()
متدهای آرایه
map()
filter()
sort()
slice()
flat()
find()
Map
DOM Manipulation
Event Listener
Event Handling
Debouncing
localStorage
JSON Parsing و Serialization
AbortController
Responsive JavaScript Behavior
💡 بهینه‌سازی‌های انجام‌شده

برای بهبود عملکرد و تجربه کاربری از چند روش استفاده شده است:

Cache کردن پاسخ‌های API
Lazy Loading تصاویر فیلم‌ها
مدیریت Timeout درخواست‌ها
ارسال درخواست‌های هم‌زمان با Promise.all()
حذف فیلم‌های تکراری
Debounce کردن Resize
محدود کردن تعداد نتایج Search
نمایش Loading Progress
📌 هدف پروژه

این پروژه به عنوان یک پروژه عملی Frontend برای کار با موارد زیر ساخته شده است:

APIهای خارجی
JavaScript Asynchronous
DOM Manipulation
Responsive UI
افکت‌های مدرن CSS
Client-Side Storage
کامپوننت‌های تعاملی

هدف اصلی این پروژه ترکیب این مفاهیم در قالب یک تجربه کامل Movie Discovery بوده است، نه صرفاً ساخت یک صفحه استاتیک برای نمایش فیلم‌ها.
```
<hr>
👨‍💻 سازنده
<div align="center">
  <div align="start">
    Parsa Sadeghi
  </div>

<br>
<a href="https://github.com/parsasdg8"> <img src="https://img.shields.io/badge/GitHub-parsasdg8-181717?style=for-the-badge&logo=github" alt="GitHub"> </a> <a href="https://www.linkedin.com/in/parsa-sadeghi-141a0b389?utm_source=share_via&utm_content=profile&utm_medium=member_android"> <img src="https://img.shields.io/badge/LinkedIn-Parsa%20Sadeghi-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"> </a> 
<div align="start">



  
</div>


⭐ اگر پروژه برایتان جالب بود، می‌توانید Repository را Star کنید.

</div> 
