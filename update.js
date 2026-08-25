const fs = require('fs');
const https = require('https');

// رابط واجهة جلب أسعار العملات (مثال باستخدام API افتراضي أو مدعوم)
const API_URL = 'https://open.er-api.com/v6/latest/USD';

https.get(API_URL, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const parsedData = JSON.parse(data);
            
            // 1. حفظ ملف الأسعار الكامل rates.json
            fs.writeFileSync('rates.json', JSON.stringify(parsedData, null, 2));
            console.log('تم تحديث ملف rates.json بنجاح.');

            // 2. إنشاء ملف update.json الصغير الذي يحتوي فقط على وقت التحديث
            const updateInfo = {
                time_last_update_utc: parsedData.time_last_update_utc || new Date().toUTCString()
            };
            
            fs.writeFileSync('update.json', JSON.stringify(updateInfo, null, 2));
            console.log('تم تحديث ملف update.json بنجاح.');

        } catch (error) {
            console.error('خطأ في معالجة البيانات:', error);
            process.exit(1);
        }
    });

}).on('error', (err) => {
    console.error('فشل الاتصال بالخادم لجلب الأسعار:', err.message);
    process.exit(1);
});
