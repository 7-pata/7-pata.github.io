# ৭ পাতার পরিসংখ্যান চালু করার নির্দেশিকা

শুরুতে `config.js`-এর `analytics.measurementId` ও `analytics.statsUrl` খালি। এতে কোনো ট্র্যাকিং স্ক্রিপ্ট লোড বা পরিসংখ্যানের অনুরোধ হয় না। ‘মোট বই’ সরাসরি ক্যাটালগ থেকে আসে এবং আসন্ন বইও এতে আছে। অন্য ঘরে প্রাপ্ত তথ্য না থাকলে ‘পরিসংখ্যান শীঘ্রই আসছে’ দেখায়।

## ১. ব্যক্তিগত ড্যাশবোর্ড

1. Google Analytics-এ GA4 property ও একটি Web data stream তৈরি করুন। ওয়েবসাইটের বর্তমান ঠিকানা দিন। Enhanced Measurement, Google Signals এবং বিজ্ঞাপনসংক্রান্ত সংযোগ বন্ধ রাখুন। Property-র time zone বাংলাদেশ রাখুন এবং আপনার গোপনীয়তা নীতি, উপযুক্ত retention ও অপ্ট-ইন ব্যাখ্যা প্রকাশ করুন।
2. Web stream-এর প্রকাশযোগ্য `G-…` Measurement ID কেবল `config.js`-এর `analytics.measurementId`-এ দিন। প্রশাসক টোকেন, API secret, service-account file বা ব্যক্তিগত export রিপোজিটরিতে রাখবেন না।
3. ডেপ্লয় করে ফুটারের ‘পরিসংখ্যান সংগ্রহের অনুমতি দিন’ চাপুন। GA4 Realtime বা DebugView-তে ঘটনাগুলো যাচাই করুন। প্রত্যাহারের বোতাম পরবর্তী tracking বন্ধ করে। গ্লোবাল প্রাইভেসি কন্ট্রোল চালু থাকলে সাইট tracking চালু করে না।
4. Event-scoped custom dimensions হিসেবে `book_id` এবং `section_id`, আর custom metric হিসেবে `progress_percent` নিবন্ধন করুন। রিপোর্টে event name ও custom dimension দিয়ে আলাদা হিসাব নিন। Search text, PDF-এর স্থানীয় পাতা, বা query-তে থাকা অজানা মান পাঠানো হয় না। পৃষ্ঠা URL-এ শুধু বৈধ বইয়ের ID থাকে এবং traffic-source referrer কেবল origin-এ সীমিত।

| ঘটনা | কী গণনা হয় |
| --- | --- |
| `page_view` | সম্মতিসাপেক্ষে একটি পৃষ্ঠা খোলা |
| `section_view` | হোমপেজের একটি বিভাগ অন্তত ২৫% দৃশ্যমান হওয়া, প্রতি পৃষ্ঠা লোডে বিভাগপিছু একবার |
| `book_detail_view` | পরিচিত বইয়ের বিবরণ পাতা খোলা |
| `reader_open` | ওই বইয়ের পিডিএফ পাঠকে সফলভাবে লোড হওয়া |
| `pdf_download_start` | সাইটের পিডিএফ ডাউনলোড লিংকে ক্লিক |
| `reading_session` | পিডিএফ পাঠকের একটি রেন্ডার করা পাতা দৃশ্যমান ট্যাবে অন্তত পাঁচ সেকেন্ড থাকা, প্রতি পাঠক খোলায় একবার |
| `reading_progress` | পাঁচ সেকেন্ড দেখা পৃথক পাতার আনুমানিক শতাংশ |
| `estimated_read_complete` | সেশনে অন্তত ৮০% পৃথক পাতা ওই শর্ত পূরণ করলে একবার |

ডাউনলোড ক্লিক থেকে ফাইলটি শেষ পর্যন্ত নামানো হয়েছে কি না জানা যায় না। দৃশ্যমান পাতা থেকে পাঠকের মনোযোগও বোঝা যায় না। বইয়ের বর্তমান পাতার নম্বর একই ব্রাউজারে স্থানীয়ভাবে রাখা হয়। অনলাইন হিসাবের জন্য শুধু বইয়ের আইডি ও সেশনের আনুমানিক অগ্রগতি যায়।

Daily, weekly ও monthly হিসেবে GA4-এর Users মেট্রিক আলাদা date range-এ দেখুন। দৈনিক unique-এর যোগফলকে মাসিক unique ধরে নেবেন না। GA4-এর browser/device identifiers ও রিপোর্টিং নিয়ম অনুসারে এগুলো আনুমানিক। সম্মতি, ব্লকার, মুছে ফেলা cookies, একই ব্যক্তির একাধিক ডিভাইস, সীমিত referrer এবং সরাসরি ভিজিটের কারণে সংখ্যা অপূর্ণ থাকতে পারে। Users মেট্রিক পাবলিক পাতায় প্রকাশ করা হয় না।

## ২. পাবলিক মোট সংখ্যা

1. GA4 Data API দিয়ে কোনো ব্যক্তিগত, অনুমোদিত পরিবেশে total event counts ও `book_id` অনুযায়ী event counts সংগ্রহ করুন, অথবা GA4 থেকে যাচাই করা aggregate export ব্যবহার করুন। একই সময়সীমা ব্যবহার করুন। API credentials কেবল সেই ব্যক্তিগত পরিবেশে রাখুন। ডিপ্লয়ের সঙ্গে কোনো collector, API বা নিয়মিত export চালু করা হয়নি।
2. শুধু যাচাই করা totals দিয়ে নিচের আকারের JSON তৈরি করুন। `as_of`-এ আসল export-এর ISO timestamp দিন। তথ্য না পাওয়া key বাদ দিন। শূন্য কেবল সত্যিই পরিমাপ করা হলে লিখুন।

```json
{
  "version": 1,
  "as_of": "YYYY-MM-DDTHH:mm:ssZ",
  "totals": {},
  "books": { "python": {}, "data": {}, "ml": {} }
}
```

`totals`-এ `page_views`, `download_starts`, `reading_sessions` গ্রহণ করা হয়। বইপ্রতি `detail_views`, `download_starts`, `reader_opens`, `reading_sessions`, `completed_sessions` গ্রহণ করা হয়। সবগুলোই non-negative integer। ‘জনপ্রিয় বই’ ইতিবাচক পড়ার সেশন অনুযায়ী সাজানো হয়। ডাউনলোড ও পড়ার সেশন স্পষ্টভাবে উদ্যোগ এবং অনুমান হিসেবে লেবেল করা থাকে।

3. JSON-টি উদাহরণস্বরূপ `stats.json` হিসেবে Pages-এ প্রকাশ করুন, অথবা read-only HTTPS endpoint-এ রাখুন। ভিন্ন origin হলে Pages origin-এর জন্য CORS অনুমোদন করুন। কোনো raw event, user/session identifier বা ব্যক্তিগত তথ্য প্রকাশ করবেন না। নিয়মিত হালনাগাদ করুন এবং প্রয়োজনে cache-control ব্যবহার করুন। `config.js`-এর `analytics.statsUrl`-এ URL লিখুন।
4. নিজস্ব collector যোগ করলে HTTPS, সীমিত event/schema, বিদ্যমান book ID যাচাই, অনুরোধের আকারের সীমা, rate limit, bot filtering, origin rules, aggregate cache এবং বিশ্বস্ত private export বাধ্যতামূলক করুন। browser থেকে পাঠানো event কখনোই সম্পূর্ণ tamper-proof ধরা যাবে না।
