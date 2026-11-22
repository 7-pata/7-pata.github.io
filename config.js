/* 7 Pata-এর সব পরিবর্তন এখান থেকে করুন। কোনো গোপন PIN/OTP প্রকাশ করবেন না। */
window.SEVENUP = {
  author: 'অর্নব',
  facebook: '', // https://www.facebook.com/your-page
  payments: { bkash: '01860066158', nagad: '01860066158', rocket: '01860066158' },
  categories: [
    { id: 'technology', title: 'বিজ্ঞান ও ডিজিটাল প্রযুক্তি', icon: '{ }', accent: 'rose', summary: 'পাইথন, কৃত্রিম বুদ্ধিমত্তা, ডেটা সায়েন্স ও দৈনন্দিন বিজ্ঞান' },
    { id: 'business', title: 'টাকা-পয়সা ও ছোট ব্যবসা', icon: '◈', accent: 'amber', summary: 'পারিবারিক বাজেট, সঞ্চয় ও ছোট উদ্যোগের হিসাব' },
    { id: 'history', title: 'বাংলাদেশের ইতিহাস ও সমাজ', icon: '◷', accent: 'brick', summary: 'ভাষা আন্দোলন, মুক্তিযুদ্ধ ও স্থানীয় ইতিহাস' },
    { id: 'careers', title: 'চাকরি ও কর্মদক্ষতা', icon: '✦', accent: 'violet', summary: 'কারিগরি প্রশিক্ষণ, জীবনবৃত্তান্ত ও সাক্ষাৎকারের প্রস্তুতি' },
    { id: 'services', title: 'সরকারি সেবা ও নাগরিক অধিকার', icon: '▥', accent: 'teal', summary: 'জন্মনিবন্ধন, জাতীয় পরিচয়পত্র ও সরকারি সেবার আবেদন' },
    { id: 'health', title: 'পরিবারের স্বাস্থ্য ও সেবাপথ', icon: '✚', accent: 'green', summary: 'ডেঙ্গু প্রতিরোধ, প্রাথমিক স্বাস্থ্যসেবা ও কোথায় সাহায্য পাবেন' },
    { id: 'climate', title: 'জলবায়ু ও দুর্যোগ প্রস্তুতি', icon: '☂', accent: 'blue', summary: 'বন্যা, ঘূর্ণিঝড় ও তাপপ্রবাহের জন্য পারিবারিক প্রস্তুতি' }
  ],
  books: [
    { id:'python', categoryId:'technology', title:'পাইথনের অজানা যত কাণ্ড', category:'প্রোগ্রামিং', summary:'সাধারণ কোডের অপ্রত্যাশিত ফল, লুকানো আচরণ আর বাস্তব উদাহরণ।', cover:'assets/python.svg', pdf:'', volume:'০১', tags:['পাইথন','প্রোগ্রামিং','কোড','Python'] },
    { id:'data', categoryId:'technology', title:'সংখ্যার আড়ালের গল্প', category:'ডেটা সায়েন্স', summary:'সংখ্যা কীভাবে ভুল পথে নেয়, পরিসংখ্যানের ব্যতিক্রম ও তথ্যের ফাঁদ।', cover:'assets/data-science.svg', pdf:'', volume:'০২', tags:['ডেটা','পরিসংখ্যান','বিশ্লেষণ','Data Science'] },
    { id:'ml', categoryId:'technology', title:'যখন মডেল ভুল করে', category:'এআই ও মেশিন লার্নিং', summary:'৯৯% নির্ভুলতা কেন যথেষ্ট নয়? মডেল ব্যর্থতার চমকপ্রদ কারণ।', cover:'assets/machine-learning.svg', pdf:'', volume:'০৩', tags:['এআই','মেশিন লার্নিং','মডেল','Machine Learning','AI'] }
  ]
};
