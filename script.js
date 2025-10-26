/* 🌿 کدهای عملکرد سایت فرشینه ERiSH 🌿 */

/* === منوی موبایل === */
function toggleMenu() {
  const menu = document.querySelector(".nav-links");
  menu.classList.toggle("active");
}

/* === اسلایدر ساده === */
let currentSlide = 0;
const slides = document.querySelectorAll(".slide");

function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.classList.toggle("active", i === index);
  });
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % slides.length;
  showSlide(currentSlide);
}

if (slides.length > 0) {
  showSlide(currentSlide);
  setInterval(nextSlide, 4000);
}

/* === ارسال پیام فرم تماس به تلگرام === */
const TELEGRAM_TOKEN = "توکن_ربات_تو_اینجا";
const TELEGRAM_CHAT_ID = "chat_id_خودت_اینجا";

async function sendMessage(event) {
  event.preventDefault();

  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const message = document.getElementById("message").value;
  const result = document.getElementById("resultMessage");

  const text = `📩 پیام جدید از فرم تماس:\n\n👤 نام: ${name}\n📞 تلفن: ${phone}\n💬 پیام:\n${message}`;

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: text,
      }),
    });
    result.textContent = "✅ پیام با موفقیت ارسال شد!";
    event.target.reset();
  } catch (error) {
    result.textContent = "❌ خطا در ارسال پیام!";
  }
}

/* === ارسال فرم سفارش آنلاین به تلگرام === */
async function sendOrder(event) {
  event.preventDefault();

  const name = document.getElementById("order_name").value;
  const phone = document.getElementById("order_phone").value;
  const product = document.getElementById("product").value;
  const size = document.getElementById("size").value;
  const details = document.getElementById("details").value;
  const result = document.getElementById("orderResult");

  const text = `🛍 سفارش جدید:\n\n👤 نام: ${name}\n📞 شماره: ${phone}\n🎨 طرح: ${product}\n📏 سایز: ${size}\n📍 توضیحات:\n${details}`;

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: text,
      }),
    });
    result.textContent = "✅ سفارش شما ثبت شد!";
    event.target.reset();
  } catch (error) {
    result.textContent = "❌ خطا در ارسال سفارش!";
  }
}