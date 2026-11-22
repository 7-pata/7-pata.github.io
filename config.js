/* 7 Pata-এর সব পরিবর্তন এখান থেকে করুন। কোনো গোপন PIN/OTP প্রকাশ করবেন না। */
window.SEVENUP = {
  author: 'অর্নব',
  facebook: '', // https://www.facebook.com/your-page
  payments: { bkash: '', nagad: '', rocket: '01860066158' },
  categories: [
    { id: 'programming', title: 'প্রোগ্রামিং', icon: '{ }', accent: 'rose', summary: 'কোডের গভীরে লুকানো চমক' },
    { id: 'ai', title: 'কৃত্রিম বুদ্ধিমত্তা', icon: '✦', accent: 'violet', summary: 'বুদ্ধিমান মডেল কীভাবে কাজ করে' },
    { id: 'data', title: 'ডেটা সায়েন্স', icon: '▥', accent: 'teal', summary: 'সংখ্যার আড়ালের গল্প' },
    { id: 'science', title: 'বিজ্ঞান', icon: '⚗', accent: 'blue', summary: 'অজানা প্রশ্নের অনুসন্ধান' },
    { id: 'business', title: 'ব্যবসা ও অর্থনীতি', icon: '◈', accent: 'amber', summary: 'ব্যবসা ও বাজারের ভেতরের কথা' },
    { id: 'history', title: 'ইতিহাস ও সমাজ', icon: '◷', accent: 'brick', summary: 'অতীতের আলোয় বর্তমানকে বোঝা' },
    { id: 'skills', title: 'জীবনদক্ষতা', icon: '✿', accent: 'green', summary: 'দৈনন্দিন জীবনে কাজে লাগার মতো শেখা' }
  ],
  books: [
    { id:'python', categoryId:'programming', title:'পাইথনের অজানা যত কাণ্ড', category:'প্রোগ্রামিং', summary:'সাধারণ কোডের অপ্রত্যাশিত ফল, লুকানো আচরণ আর বাস্তব উদাহরণ।', cover:'assets/python.svg', pdf:'', volume:'০১', tags:['পাইথন','প্রোগ্রামিং','কোড','Python'] },
    { id:'data', categoryId:'data', title:'সংখ্যার আড়ালের গল্প', category:'ডেটা সায়েন্স', summary:'সংখ্যা কীভাবে ভুল পথে নেয়, পরিসংখ্যানের ব্যতিক্রম ও তথ্যের ফাঁদ।', cover:'assets/data-science.svg', pdf:'', volume:'০২', tags:['ডেটা','পরিসংখ্যান','বিশ্লেষণ','Data Science'] },
    { id:'ml', categoryId:'ai', title:'যখন মডেল ভুল করে', category:'এআই ও মেশিন লার্নিং', summary:'৯৯% নির্ভুলতা কেন যথেষ্ট নয়? মডেল ব্যর্থতার চমকপ্রদ কারণ।', cover:'assets/machine-learning.svg', pdf:'', volume:'০৩', tags:['এআই','মেশিন লার্নিং','মডেল','Machine Learning','AI'] }
  ]
};
