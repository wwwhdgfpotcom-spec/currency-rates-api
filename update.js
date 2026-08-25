const fs = require('fs');

// دالة مساعدة لانتظار وقت محدد (لإدارة مهلة الانتظار والمحاولات الذكية)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchRatesWithRetry(retries = 3, delay = 180000) { // المهلة 3 دقائق (180000 ميلي ثانية) بين المحاولات
  const apiUrl = 'https://open.er-api.com/v6/latest/USD'; // مثال لمصدر أسعار موثوق ومجاني

  for (let i = 0; i < retries; i++) {
    try {
      console.log(`محاولة جلب البيانات رقم ${i + 1}...`);
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`فشلت المحاولة ${i + 1}: ${error.message}`);
      if (i < retries - 1) {
        console.log(`انتظار لمدة ${delay / 1000} ثانية قبل إعادة المحاولة...`);
        await sleep(delay);
      } else {
        throw new Error('فشلت جميع محاولات الاتصال بالـ API الخارجي.');
      }
    }
  }
}

async function updateCurrencyData() {
  try {
    const data = await fetchRatesWithRetry();

    // 1. تحديث ملف rates.json بالأسعار الجديدة
    const ratesData = {
      base: data.base_code || "USD",
      rates: data.rates || {},
      time_last_update_utc: data.time_last_update_utc
    };
    fs.writeFileSync('rates.json', JSON.stringify(ratesData, null, 2));
    console.log('تم تحديث rates.json بنجاح.');

    // 2. تحديث ملف update.json بطابع زمني جديد
    const updateData = {
      last_update: new Date().toISOString()
    };
    fs.writeFileSync('update.json', JSON.stringify(updateData, null, 2));
    console.log('تم تحديث update.json بنجاح.');

  } catch (error) {
    console.error('حدث خطأ أثناء عملية التحديث:', error);
    process.exit(1); // إيقاف العملية لتنبيه الفشل في GitHub Actions
  }
}

updateCurrencyData();
