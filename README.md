# ৭ পাতা — ৭টি প্রিমিয়াম ই-বুক যুক্ত করার প্যাকেজ

## কী আছে
- `library.html`: নতুন বাংলা লাইব্রেরি পেজ; অনলাইন PDF রিডার, অনুসন্ধান ও ৭টি বিভাগ
- `books.json`: বইয়ের তথ্য
- `books/`: ৭টি আসল প্রিমিয়াম PDF (প্রতিটি ১৫ পৃষ্ঠা)

## GitHub-এ কীভাবে যুক্ত করবেন
1. ZIP Extract করুন।
2. `7-pata/7-pata.github.io` (অথবা নতুন নামের রিপোজিটরি) খুলুন।
3. রিপোজিটরির **root**-এ `library.html`, `books.json` ও পুরো `books/` ফোল্ডারটি আপলোড করুন। ZIP নিজে আপলোড করবেন না।
4. Commit changes করুন।
5. ব্রাউজারে `https://7-pata.github.io/library.html` খুলুন। Organization `7pata` নামে বদলে Pages চালু থাকলে URL হবে `https://7pata.github.io/library.html`।
6. বর্তমান হোমপেজের মেনুতে `<a href="library.html">বই পড়ুন</a>` লিংক যোগ করুন। আপনার সাইট আগে থেকে Codex দিয়ে বদলে থাকলে হোমপেজ overwrite করবেন না।

## গুরুত্বপূর্ণ
- অনলাইন PDF রিডার ব্রাউজারের built-in PDF viewer ব্যবহার করে। কিছু মোবাইল ব্রাউজারে নতুন ট্যাবে খোলার প্রয়োজন হতে পারে।
- এটি ফ্রি static site; বাস্তব pageview, completed reads বা downloads-এর shared analytics নিজের থেকে সংগ্রহ করে না।
- `books.json`-এ বইয়ের নতুন তথ্য যোগ করা যাবে; বইয়ের id ও PDF path একই রাখলে লিংক স্থিতিশীল থাকে।
- আগের হোমপেজের support section, payment configuration এবং অন্য কাস্টম কাজের কোনো ফাইল এই প্যাকেজ বদলায় না।
