// ===============================
// فایل عمومی اسکریپت سایت ERiSH Carpet
// ===============================

// شمارنده بازدید سایت
window.addEventListener("load", function () {
  let views = parseInt(localStorage.getItem("siteViews") || "0");
  views++;
  localStorage.setItem("siteViews", views);
});

// شمارنده بازدید هر محصول
function addProductView(name) {
  let views = JSON.parse(localStorage.getItem("productViews") || "{}");
  views[name] = (views[name] || 0) + 1;
  localStorage.setItem("productViews", JSON.stringify(views));
}

// اعلان در کنسول (برای تست)
console.log("🌿 ERiSH Carpet Website Loaded Successfully!");

// نمایش تاریخ در صفحه تماس (در صورت وجود)
const dateBox = document.getElementById("todayDate");
if (dateBox) {
  const now = new Date().toLocaleDateString("fa-IR");
  dateBox.textContent = now;
}

// دکمه‌های سفارش در صفحه محصولات
const productButtons = document.querySelectorAll(".category-card button");
productButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const productName = btn.parentElement.querySelector("h3").textContent;
    addProductView(productName);
  });
});

// وقتی سفارش ثبت شد اعلان کوتاه بده
window.addEventListener("storage", (event) => {
  if (event.key === "orders") {
    console.log("📬 سفارش جدید ثبت شد!");
  }
});