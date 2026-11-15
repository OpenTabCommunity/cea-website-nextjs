// One description of every kind of content. The database tables, the admin list pages
// and the admin forms are all generated from this file, so adding a field here is enough.
//
// Field types: text, textarea, markdown, number, bool, select, relation, image, file,
//              images (several pictures), jdate, jdatetime (Jalali inputs), slug, url, password.

export const COLORS = [
  ['firoozeh', 'فیروزه‌ای'],
  ['cream', 'کرم'],
  ['laki', 'لاکی'],
  ['cobalt', 'کبود'],
  ['gold', 'طلایی'],
];

export const EVENT_KINDS = [
  ['workshop', 'کارگاه'],
  ['contest', 'مسابقه'],
  ['course', 'دوره'],
  ['talk', 'همایش و سخنرانی'],
  ['meetup', 'دورهمی'],
];

export const PLAN_STATUS = [
  ['planned', 'برنامه‌ریزی‌شده'],
  ['doing', 'در حال انجام'],
  ['done', 'انجام‌شده'],
];

export const resources = {
  events: {
    label: 'رویدادها', singular: 'رویداد', group: 'محتوا', order: 'starts_at DESC, id DESC', title: 'title', list: ['kind', 'starts_at', 'published'],
    path: (r) => `/events/${r.slug}`,
    fields: [
      { name: 'title', label: 'عنوان', type: 'text', required: true },
      { name: 'slug', label: 'نشانی صفحه', type: 'slug', from: 'title', help: 'خالی بگذارید تا از روی عنوان ساخته شود.' },
      { name: 'kind', label: 'نوع', type: 'select', options: EVENT_KINDS, default: 'workshop' },
      { name: 'starts_at', label: 'تاریخ و ساعت برگزاری', type: 'jdatetime', required: true },
      { name: 'location', label: 'مکان', type: 'text' },
      { name: 'summary', label: 'خلاصه', type: 'textarea', help: 'یک یا دو جمله که در فهرست رویدادها دیده می‌شود.' },
      { name: 'body', label: 'توضیح کامل', type: 'markdown' },
      { name: 'cover', label: 'پوستر یا تصویر', type: 'image' },
      { name: 'register_url', label: 'پیوند ثبت‌نام', type: 'url' },
      { name: 'team_id', label: 'تیم برگزارکننده', type: 'relation', resource: 'teams' },
      { name: 'published', label: 'نمایش در سایت', type: 'bool', default: 1 },
    ],
  },
  posts: {
    label: 'خبرها و مقاله‌ها', singular: 'نوشته', group: 'محتوا', order: 'published_at DESC, id DESC', title: 'title', list: ['kind', 'published_at', 'published'],
    path: (r) => `/news/${r.slug}`,
    fields: [
      { name: 'kind', label: 'نوع', type: 'select', options: [['news', 'خبر و اطلاعیه'], ['article', 'مقاله']], default: 'news' },
      { name: 'title', label: 'عنوان', type: 'text', required: true },
      { name: 'slug', label: 'نشانی صفحه', type: 'slug', from: 'title', help: 'خالی بگذارید تا از روی عنوان ساخته شود.' },
      { name: 'excerpt', label: 'خلاصه', type: 'textarea' },
      { name: 'body', label: 'متن', type: 'markdown' },
      { name: 'cover', label: 'تصویر', type: 'image' },
      { name: 'author', label: 'نویسنده', type: 'text' },
      { name: 'team_id', label: 'تیم', type: 'relation', resource: 'teams' },
      { name: 'published_at', label: 'تاریخ انتشار', type: 'jdate', required: true },
      { name: 'published', label: 'نمایش در سایت', type: 'bool', default: 1 },
    ],
  },
  publications: {
    label: 'نشریه', singular: 'شماره', group: 'محتوا', order: 'published_at DESC, id DESC', title: 'title', list: ['issue', 'published_at', 'published'],
    path: () => '/publications',
    fields: [
      { name: 'title', label: 'عنوان', type: 'text', required: true },
      { name: 'issue', label: 'شماره', type: 'text', help: 'مثلاً «شمارهٔ ۷، پاییز ۱۴۰۵»' },
      { name: 'published_at', label: 'تاریخ انتشار', type: 'jdate' },
      { name: 'description', label: 'توضیح', type: 'textarea' },
      { name: 'cover', label: 'تصویر جلد', type: 'image' },
      { name: 'file', label: 'فایل PDF', type: 'file' },
      { name: 'published', label: 'نمایش در سایت', type: 'bool', default: 1 },
    ],
  },
  albums: {
    label: 'گالری', singular: 'آلبوم', group: 'محتوا', order: 'date DESC, id DESC', title: 'title', list: ['date', 'published'],
    path: (r) => `/gallery/${r.id}`,
    fields: [
      { name: 'title', label: 'عنوان آلبوم', type: 'text', required: true },
      { name: 'date', label: 'تاریخ', type: 'jdate' },
      { name: 'description', label: 'توضیح', type: 'textarea' },
      { name: 'images', label: 'عکس‌ها', type: 'images', help: 'می‌توانید چند عکس را با هم انتخاب کنید.' },
      { name: 'published', label: 'نمایش در سایت', type: 'bool', default: 1 },
    ],
  },
  teams: {
    label: 'تیم‌ها', singular: 'تیم', group: 'انجمن', order: 'sort ASC, id ASC', title: 'name', list: ['name_en', 'status'],
    path: (r) => `/teams/${r.slug}`,
    fields: [
      { name: 'name', label: 'نام تیم', type: 'text', required: true },
      { name: 'name_en', label: 'نام انگلیسی', type: 'text', dir: 'ltr', help: 'مثلاً OpenTab. در کارت تیم بزرگ نمایش داده می‌شود.' },
      { name: 'slug', label: 'نشانی صفحه', type: 'slug', from: 'name_en', help: 'خالی بگذارید تا از روی نام ساخته شود.' },
      { name: 'tagline', label: 'معرفی کوتاه', type: 'textarea' },
      { name: 'body', label: 'معرفی کامل', type: 'markdown' },
      { name: 'color', label: 'رنگ کارت', type: 'select', options: COLORS, default: 'firoozeh' },
      { name: 'status', label: 'وضعیت', type: 'select', options: [['active', 'فعال'], ['soon', 'به‌زودی']], default: 'active' },
      { name: 'link', label: 'پیوند بیرونی', type: 'url', help: 'مثلاً نشانی گیت‌هاب تیم' },
      { name: 'logo', label: 'لوگو', type: 'image' },
      { name: 'sort', label: 'ترتیب نمایش', type: 'number', default: 0 },
    ],
  },
  members: {
    label: 'اعضا', singular: 'عضو', group: 'انجمن', order: 'is_board DESC, sort ASC, id ASC', title: 'name', list: ['role', 'team_id', 'active'],
    path: () => '/members',
    fields: [
      { name: 'name', label: 'نام و نام خانوادگی', type: 'text', required: true },
      { name: 'role', label: 'سمت', type: 'text', help: 'مثلاً دبیر انجمن، مسئول روابط عمومی' },
      { name: 'team_id', label: 'تیم', type: 'relation', resource: 'teams' },
      { name: 'is_board', label: 'عضو شورای مرکزی', type: 'bool', default: 0 },
      { name: 'year', label: 'ورودی', type: 'text', help: 'مثلاً ۱۴۰۲' },
      { name: 'bio', label: 'دربارهٔ عضو', type: 'textarea' },
      { name: 'photo', label: 'عکس', type: 'image' },
      { name: 'link', label: 'پیوند شخصی', type: 'url', help: 'گیت‌هاب، لینکدین یا سایت شخصی' },
      { name: 'sort', label: 'ترتیب نمایش', type: 'number', default: 0 },
      { name: 'active', label: 'نمایش در سایت', type: 'bool', default: 1 },
    ],
  },
  achievements: {
    label: 'افتخارات', singular: 'افتخار', group: 'انجمن', order: 'sort ASC, year DESC, id DESC', title: 'title', list: ['year'],
    path: () => '/achievements',
    fields: [
      { name: 'title', label: 'عنوان', type: 'text', required: true },
      { name: 'year', label: 'سال', type: 'text', help: 'مثلاً ۱۴۰۴' },
      { name: 'description', label: 'توضیح', type: 'textarea' },
      { name: 'image', label: 'تصویر', type: 'image' },
      { name: 'sort', label: 'ترتیب نمایش', type: 'number', default: 0 },
    ],
  },
  plans: {
    label: 'برنامه‌ها', singular: 'برنامه', group: 'انجمن', order: 'sort ASC, id ASC', title: 'title', list: ['status', 'target'],
    path: () => '/plans',
    fields: [
      { name: 'title', label: 'عنوان', type: 'text', required: true },
      { name: 'description', label: 'توضیح', type: 'textarea' },
      { name: 'status', label: 'وضعیت', type: 'select', options: PLAN_STATUS, default: 'planned' },
      { name: 'target', label: 'زمان هدف', type: 'text', help: 'مثلاً «بهار ۱۴۰۶»' },
      { name: 'sort', label: 'ترتیب نمایش', type: 'number', default: 0 },
    ],
  },
  stats: {
    label: 'آمار صفحهٔ اصلی', singular: 'آمار', group: 'انجمن', order: 'sort ASC, id ASC', title: 'label', list: ['value'],
    path: () => '/',
    fields: [
      { name: 'label', label: 'عنوان', type: 'text', required: true, help: 'مثلاً «عضو فعال»' },
      { name: 'value', label: 'عدد', type: 'number', required: true },
      { name: 'sort', label: 'ترتیب نمایش', type: 'number', default: 0 },
    ],
  },
  users: {
    label: 'مدیران', singular: 'مدیر', group: 'تنظیمات', order: 'id ASC', title: 'username', list: ['name'],
    fields: [
      { name: 'username', label: 'نام کاربری', type: 'text', required: true, dir: 'ltr' },
      { name: 'name', label: 'نام', type: 'text' },
      { name: 'password', label: 'رمز عبور', type: 'password', help: 'حداقل ۱۰ نویسه. هنگام ویرایش، خالی بگذارید تا رمز عوض نشود.' },
    ],
  },
};

// Site-wide texts, edited on the admin "settings" page.
export const settingsGroups = [
  {
    title: 'نام و صفحهٔ اصلی',
    fields: [
      { name: 'site_name', label: 'نام کامل انجمن', type: 'text', default: 'انجمن علمی مهندسی کامپیوتر دانشگاه تبریز' },
      { name: 'short_name', label: 'نام کوتاه (بالای صفحه و پایین سایت)', type: 'text', default: 'انجمن کامپیوتر تبریز' },
      { name: 'hero_title', label: 'تیتر صفحهٔ اصلی', type: 'text', default: 'انجمن علمی' },
      { name: 'hero_highlight', label: 'بخش رنگی تیتر', type: 'text', default: 'مهندسی کامپیوتر' },
      { name: 'hero_text', label: 'متن زیر تیتر', type: 'textarea', default: 'دانشگاه تبریز. کارگاه، مسابقه، نشریه و پروژه‌های متن‌باز، برای هر دانشجویی که می‌خواهد بیشتر از کلاس یاد بگیرد.' },
      { name: 'statement', label: 'جملهٔ بزرگ روی فرش', type: 'textarea', default: 'یاد می‌گیریم، می‌سازیم و هر چه ساخته‌ایم را با بقیه به اشتراک می‌گذاریم؛ کنار هم.' },
      { name: 'join_url', label: 'پیوند عضویت', type: 'url', default: '', help: 'نشانی فرم عضویت یا کانال انجمن. اگر خالی باشد دکمهٔ عضویت به بخش تماس می‌رود.' },
    ],
  },
  {
    title: 'دربارهٔ انجمن',
    fields: [
      { name: 'about_title', label: 'عنوان', type: 'text', default: 'دربارهٔ انجمن' },
      { name: 'about_text', label: 'متن', type: 'textarea', default: 'انجمن علمی را خود دانشجوها اداره می‌کنند. کارگاه و دوره برگزار می‌کنیم، مسابقه راه می‌اندازیم، نشریه منتشر می‌کنیم و روی پروژه‌های متن‌باز کار می‌کنیم. از ترم اول تا ارشد، همه می‌توانند عضو شوند.' },
    ],
  },
  {
    title: 'تماس و شبکه‌های اجتماعی',
    fields: [
      { name: 'address', label: 'نشانی', type: 'text', default: 'تبریز، بلوار ۲۹ بهمن، دانشگاه تبریز، دانشکدهٔ مهندسی برق و کامپیوتر' },
      { name: 'email', label: 'ایمیل', type: 'text', dir: 'ltr', default: '' },
      { name: 'telegram', label: 'تلگرام', type: 'url', default: '' },
      { name: 'instagram', label: 'اینستاگرام', type: 'url', default: '' },
      { name: 'github', label: 'گیت‌هاب', type: 'url', default: '' },
      { name: 'linkedin', label: 'لینکدین', type: 'url', default: '' },
    ],
  },
];

export const settingsFields = settingsGroups.flatMap((g) => g.fields);

export function optionLabel(field, value) {
  const hit = (field.options || []).find(([v]) => String(v) === String(value));
  return hit ? hit[1] : value;
}
