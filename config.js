/* 7 Pata-এর সব পরিবর্তন এখান থেকে করুন। কোনো গোপন PIN/OTP প্রকাশ করবেন না। */
window.SEVENUP = {
  author: 'অর্নব',
  facebook: '', // https://www.facebook.com/your-page
  payments: { bkash: '', nagad: '', rocket: '01860066158' },
  siteUrl: 'https://7-pata.github.io/',
  analytics: { measurementId: '', statsUrl: '' },
  categories: [
    { id: 'literature', title: 'গল্প, সাহিত্য ও কল্পজগৎ', icon: 'book', accent: 'violet', summary: 'গল্প, কবিতা আর কল্পনায় নতুন জগৎ', subcategories: ['উপন্যাস ও ছোটগল্প', 'রহস্য ও থ্রিলার', 'কবিতা', 'কল্পবিজ্ঞান', 'রোমান্টিক সাহিত্য', 'গোয়েন্দা গল্প', 'শিশু-কিশোর সাহিত্য'] },
    { id: 'arts', title: 'শিল্প, সংগীত ও সংস্কৃতি', icon: 'music', accent: 'coral', summary: 'সুর, রং, মঞ্চ ও বাংলাদেশের লোকঐতিহ্য', subcategories: ['সংগীত ও সুরতত্ত্ব', 'নৃত্য', 'চিত্রকলা', 'চলচ্চিত্র', 'ফটোগ্রাফি', 'নাটক ও অভিনয়', 'বাংলাদেশের লোকসংস্কৃতি'] },
    { id: 'history', title: 'রহস্য, ইতিহাস ও অজানা', icon: 'compass', accent: 'amber', summary: 'নথিভুক্ত ইতিহাস, অমীমাংসিত প্রশ্ন আর লোককথার আলাদা পাঠ', subcategories: ['বাংলাদেশের ইতিহাস', 'বিশ্ব ইতিহাস', 'প্রত্নতত্ত্ব', 'হারিয়ে যাওয়া সভ্যতা', 'ঐতিহাসিক রহস্য', 'অজানা ঘটনা', 'অনুসন্ধানমূলক গবেষণা'] },
    { id: 'mind', title: 'মন ও মানুষের আচরণ', icon: 'brain', accent: 'teal', summary: 'আমরা কীভাবে ভাবি, শিখি ও সিদ্ধান্ত নিই', subcategories: ['মনোবিজ্ঞান', 'আবেগ ও অনুভূতি', 'স্মৃতি ও শেখা', 'মানুষের সিদ্ধান্ত', 'Cognitive Bias', 'ব্যক্তিত্ব', 'সম্পর্ক ও যোগাযোগ'] },
    { id: 'life', title: 'অর্থনীতি, ক্যারিয়ার ও জীবনদক্ষতা', icon: 'case', accent: 'green', summary: 'অর্থ, কাজ ও দৈনন্দিন সিদ্ধান্তের ব্যবহারিক পাঠ', subcategories: ['ব্যক্তিগত অর্থব্যবস্থা', 'ক্যারিয়ার উন্নয়ন', 'উদ্যোক্তা ও ব্যবসা', 'যোগাযোগ দক্ষতা', 'নেতৃত্ব', 'উৎপাদনশীলতা', 'অর্থনীতি ও বাস্তব জীবন'] },
    { id: 'technology', title: 'AI, প্রযুক্তি ও প্রোগ্রামিং', icon: 'chip', accent: 'indigo', summary: 'কোড, কৃত্রিম বুদ্ধিমত্তা ও ডিজিটাল জগতের ভিত', subcategories: ['Artificial Intelligence', 'Machine Learning', 'Data Science', 'Python Programming', 'Web Development', 'Cybersecurity', 'Digital Literacy'] },
    { id: 'science', title: 'বিজ্ঞান ও আবিষ্কার', icon: 'atom', accent: 'blue', summary: 'প্রকৃতি, মহাকাশ আর পরীক্ষায় পাওয়া উত্তর', subcategories: ['মহাকাশ', 'পদার্থবিজ্ঞান', 'জীববিজ্ঞান', 'রসায়ন', 'পরিবেশ ও জলবায়ু', 'বৈজ্ঞানিক আবিষ্কার', 'অদ্ভুত বিজ্ঞান'] }
  ],
  books: [
    { id:'python', categoryId:'technology', subcategory:'Python Programming', author:'অর্নব', publicationDate:'', status:'upcoming', featured:true, title:'পাইথনের অজানা যত কাণ্ড', category:'প্রোগ্রামিং', summary:'সাধারণ কোডের অপ্রত্যাশিত ফল, লুকানো আচরণ আর বাস্তব উদাহরণ।', cover:'assets/python.svg', pdf:'', volume:'০১', tags:['পাইথন','প্রোগ্রামিং','কোড','Python'] },
    { id:'data', categoryId:'technology', subcategory:'Data Science', author:'অর্নব', publicationDate:'', status:'upcoming', featured:true, title:'সংখ্যার আড়ালের গল্প', category:'ডেটা সায়েন্স', summary:'সংখ্যা কীভাবে ভুল পথে নেয়, পরিসংখ্যানের ব্যতিক্রম ও তথ্যের ফাঁদ।', cover:'assets/data-science.svg', pdf:'', volume:'০২', tags:['ডেটা','পরিসংখ্যান','বিশ্লেষণ','Data Science'] },
    { id:'ml', categoryId:'technology', subcategory:'Machine Learning', author:'অর্নব', publicationDate:'', status:'upcoming', featured:true, title:'যখন মডেল ভুল করে', category:'এআই ও মেশিন লার্নিং', summary:'৯৯% নির্ভুলতা কেন যথেষ্ট নয়? মডেল ব্যর্থতার চমকপ্রদ কারণ।', cover:'assets/machine-learning.svg', pdf:'', volume:'০৩', tags:['এআই','মেশিন লার্নিং','মডেল','Machine Learning','AI'] }
  ]
};
