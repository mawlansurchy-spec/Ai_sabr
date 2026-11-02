import { LanguageCode } from "../types";

export interface TranslationDictionary {
  // Navigation
  home: string;
  dashboard: string;
  ai_generator: string;
  services: string;
  add_balance: string;
  subscriptions: string;
  my_history: string;
  notifications: string;
  profile: string;
  security: string;
  contact_admin: string;
  logout: string;
  login: string;
  sign_up: string;
  start_free: string;
  switch_language: string;
  dark_mode: string;
  light_mode: string;

  // Hero / Public Home
  hero_title: string;
  hero_subtitle: string;
  how_it_works_title: string;
  step_1_title: string;
  step_1_desc: string;
  step_2_title: string;
  step_2_desc: string;
  step_3_title: string;
  step_3_desc: string;
  step_4_title: string;
  step_4_desc: string;
  available_services: string;
  ready_to_create: string;
  ready_desc: string;

  // Auth
  email_or_username: string;
  password: string;
  confirm_password: string;
  full_name: string;
  username: string;
  email: string;
  phone_number: string;
  remember_me: string;
  forgot_password: string;
  create_account: string;
  already_have_account: string;
  dont_have_account: string;
  agree_terms: string;
  password_requirements: string;
  password_weak: string;
  password_medium: string;
  password_strong: string;
  login_success: string;
  signup_success: string;
  passwords_dont_match: string;
  fill_all_fields: string;
  account_disabled_msg: string;

  // Dashboard
  welcome_back: string;
  free_ai_generations: string;
  current_balance: string;
  active_subscription: string;
  no_active_subscription: string;
  subscription_expiry: string;
  days_remaining: string;
  total_generated_images: string;
  account_status: string;
  status_active: string;
  status_suspended: string;
  status_disabled: string;
  quick_actions: string;
  recent_generations: string;
  no_generations_yet: string;

  // AI Generator
  generator_title: string;
  generator_subtitle: string;
  prompt_placeholder: string;
  negative_prompt_placeholder: string;
  prompt_label: string;
  negative_prompt_label: string;
  style_label: string;
  aspect_ratio_label: string;
  generate_button: string;
  generating: string;
  remaining_free: string;
  credits_depleted_title: string;
  credits_depleted_desc: string;
  choose_subscription: string;
  download_image: string;
  save_to_history: string;
  generation_success: string;
  generation_failed: string;
  try_again: string;
  copy_prompt: string;
  prompt_copied: string;

  // Services
  services_title: string;
  services_subtitle: string;
  use_service: string;
  service_image_gen_name: string;
  service_image_gen_desc: string;
  service_enhancement_name: string;
  service_enhancement_desc: string;
  service_bg_removal_name: string;
  service_bg_removal_desc: string;
  service_ai_design_name: string;
  service_ai_design_desc: string;
  service_logo_design_name: string;
  service_logo_design_desc: string;
  active_service: string;

  // Subscriptions
  sub_plans_title: string;
  sub_plans_subtitle: string;
  plan_weekly: string;
  plan_monthly: string;
  plan_yearly: string;
  plan_weekly_desc: string;
  plan_monthly_desc: string;
  plan_yearly_desc: string;
  duration_7_days: string;
  duration_30_days: string;
  duration_365_days: string;
  purchase_plan: string;
  sub_request_sent_title: string;
  sub_request_sent_desc: string;
  pending_approval: string;
  request_id: string;

  // History
  history_title: string;
  history_subtitle: string;
  delete_item: string;
  item_deleted: string;
  filter_all: string;
  search_prompt: string;

  // Notifications
  notifications_title: string;
  mark_all_read: string;
  no_notifications: string;
  unread: string;

  // Profile & Security
  my_profile: string;
  update_profile: string;
  profile_updated: string;
  security_settings: string;
  change_password: string;
  current_password: string;
  new_password: string;
  two_factor_auth: string;
  two_factor_desc: string;
  enable_2fa: string;
  disable_2fa: string;
  backup_codes: string;
  backup_codes_desc: string;
  logout_all_devices: string;
  all_devices_logged_out: string;

  // Contact Admin
  contact_admin_title: string;
  contact_admin_subtitle: string;
  request_type: string;
  request_type_general: string;
  request_type_subscription: string;
  request_type_tech: string;
  request_type_billing: string;
  your_message: string;
  send_message: string;
  message_sent_admin: string;
}

export const translations: Record<LanguageCode, TranslationDictionary> = {
  ku_so: {
    home: "سەرەکی",
    dashboard: "داشبۆرد",
    ai_generator: "دروستکەری وێنەی ژیری",
    services: "خزمەتگوزارییەکان",
    add_balance: "زیادکردنی باڵانس",
    subscriptions: "بەشداریکردنەکان",
    my_history: "مێژووی من",
    notifications: "ئاگادارییەکان",
    profile: "پڕۆفایل",
    security: "ئاسایش و پاراستن",
    contact_admin: "پەیوەندی بە بەڕێوەبەر",
    logout: "چوونەدەرەوە",
    login: "چوونەژوورەوە",
    sign_up: "تۆمارکردنی هەژمار",
    start_free: "بە خۆڕایی دەستپێبکە",
    switch_language: "گۆڕینی زمان",
    dark_mode: "دۆخی تاریک",
    light_mode: "دۆخی ڕووناک",

    hero_title: "پلاتفۆرمی داهێنەرانەی ژیری دەستکرد",
    hero_subtitle: "بیرۆکەکانت دروستبکە، بەهێزبکە و بگۆڕە بە ئامرازە پێشکەوتووەکانی ژیری دەستکرد.",
    how_it_works_title: "چۆن کاردەکات؟",
    step_1_title: "١. هەژمارێک دروستبکە",
    step_1_desc: "بە چەند چرکەیەک ناوت تۆمار بکە بەبێ پێویستی بە کارتی بانکی.",
    step_2_title: "٢. ٤ بەرهەمهێنانی خۆڕایی وەربگرە",
    step_2_desc: "دەستبەجێ ٤ خاڵی بەرهەمهێنانی وێنەی ژیری دەستکردت پێدەدرێت.",
    step_3_title: "٣. وێنەکانت دروستبکە",
    step_3_desc: "بەرزترین کوالیتی و دەربڕینی داهێنەرانە لە دروستکردنی وێنە ئەزموون بکە.",
    step_4_title: "٤. بەشداریکردن هەڵبژێرە",
    step_4_desc: "دوای تەواوبوونی خاڵە خۆڕاییەکانت، پلانێکی گونجاو لەگەڵ پێداویستییەکانت دیاری بکە.",
    available_services: "خزمەتگوزارییە بەردەستەکان",
    ready_to_create: "ئامادەیت دەستپێبکەیت؟",
    ready_desc: "ئەمڕۆ پەیوەندیمان پێوە بکە و ٤ بەرهەمهێنانی بێبەرامبەر بەدەستبهێنە.",

    email_or_username: "ئیمەیڵ یان ناوی بەکارهێنەر",
    password: "وشەی تێپەڕ",
    confirm_password: "دووبارەکردنەوەی وشەی تێپەڕ",
    full_name: "ناوی تەواو",
    username: "ناوی بەکارهێنەر",
    email: "ئیمەیڵ",
    phone_number: "ژمارەی مۆبایل",
    remember_me: "لەبیرم بمێنە",
    forgot_password: "وشەی تێپەڕت لەبیرچووە؟",
    create_account: "دروستکردنی هەژماری نوێ",
    already_have_account: "هەژمارت هەیە؟ چوونەژوورەوە",
    dont_have_account: "هەژمارت نییە؟ ئێستا دروستی بکە",
    agree_terms: "ڕازیم بە مەرج و ڕێساکانی بەکارهێنان",
    password_requirements: "وشەی تێپەڕ دەبێت کەمترین ٨ پیت بێت و پیتی گەورە، بچووک، ژمارە و هێمای تێدابێت.",
    password_weak: "لاواز",
    password_medium: "مامناوەند",
    password_strong: "بەهێز",
    login_success: "بە سەرکەوتوویی چووە ژوورەوە",
    signup_success: "هەژمارەکەت دروستکرا! ٤ خاڵی خۆڕاییت بۆ دانرا.",
    passwords_dont_match: "وشە تێپەڕەکان هاوشێوە نین",
    fill_all_fields: "تکایە هەموو خانەکان پڕبکەرەوە",
    account_disabled_msg: "هەژمارەکەت ڕاگیراوە یان ناچالاکە. تکایە پەیوەندی بە بەڕێوەبەرەوە بکە.",

    welcome_back: "بەخێربێیتەوە",
    free_ai_generations: "بەرهەمهێنانی خۆڕایی AI",
    current_balance: "باڵانسی ئێستا",
    active_subscription: "بەشداریکردنی چالاک",
    no_active_subscription: "هیچ بەشداریکردنێکی چالاک نییە",
    subscription_expiry: "کاتی بەسەرچوونی بەشداریکردن",
    days_remaining: "ڕۆژی ماوە",
    total_generated_images: "کۆی وێنە بەرهەمهێنراوەکان",
    account_status: "دۆخی هەژمار",
    status_active: "چالاک",
    status_suspended: "ڕاگیراو",
    status_disabled: "ناچالاککراو",
    quick_actions: "کردارە خێراکان",
    recent_generations: "دوایین بەرهەمهێنانەکانت",
    no_generations_yet: "تا ئێستا هیچ وێنەیەکت بەرهەم نەهێناوە",

    generator_title: "دروستکەری وێنەی پێشکەوتوو",
    generator_subtitle: "وەسفی وێنەکەت بنووسە و با ژیری دەستکرد بیهێنێتە بوون.",
    prompt_placeholder: "وەسفی ئەو وێنەیە بکە کە دەتەوێت دروستی بکەیت...",
    negative_prompt_placeholder: "ئەو شتانەی ناتەوێت لە وێنەکەدا دەربکەون بنووسە (ئیختیاری)...",
    prompt_label: "وەسفی سەرەکی (Prompt)",
    negative_prompt_label: "وەسفی نەرێنی (Negative Prompt)",
    style_label: "شێوازی هونەری (Style)",
    aspect_ratio_label: "ڕەهەندی وێنە (Aspect Ratio)",
    generate_button: "وێنە دروستبکە",
    generating: "لە دروستکردندایە...",
    remaining_free: "بەرهەمهێنانی خۆڕایی ماوە",
    credits_depleted_title: "هەر ٤ بەرهەمهێنانە خۆڕاییەکەت بەکارهێناوە",
    credits_depleted_desc: "تکایە بەشداریکردنێک هەڵبژێرە یان پەیوەندی بە بەڕێوەبەرەوە بکە بۆ بەردەوامبوون.",
    choose_subscription: "بەشداریکردن هەڵبژێرە",
    download_image: "داگرتنی وێنە",
    save_to_history: "پاشەکەوت لە مێژوو",
    generation_success: "وێنەکەت بە سەرکەوتوویی دروستکرا!",
    generation_failed: "دروستکردنی وێنەکە سەرکەوتوو نەبوو. هیچ خاڵێک نەبڕدراوە.",
    try_again: "دووبارە هەوڵبدەرەوە",
    copy_prompt: "کۆپیکردنی وەسف",
    prompt_copied: "وەسفەکە کۆپی کرا",

    services_title: "خزمەتگوزارییە پێشکەوتووەکان",
    services_subtitle: "کۆمەڵێک ئامرازی پرۆفیشناڵ بۆ بەرزکردنەوەی ئاستی کارەکانت",
    use_service: "بەکارهێنانی خزمەتگوزاری",
    service_image_gen_name: "دروستکردنی وێنەی ژیری",
    service_image_gen_desc: "دروستکردنی وێنەی ناوازە لە ڕێگەی دەقەوە بە مۆدێلی نوێ.",
    service_enhancement_name: "بەهێزکردنی وێنە (Photo Enhancement)",
    service_enhancement_desc: "بەرزکردنەوەی کوالیتی و ڕوونی وێنە و وردەکارییەکان.",
    service_bg_removal_name: "لابردنی باکگراوند (Background Removal)",
    service_bg_removal_desc: "لابردن و گۆڕینی باکگراوندی وێنەکان بە وردبینی بەرز.",
    service_ai_design_name: "دیزاینی ژیری (AI Design)",
    service_ai_design_desc: "دروستکردنی دیزاینی ڕیکلام و پۆستەری پرۆفیشناڵ.",
    service_logo_design_name: "دیزاینی لۆگۆ (Logo Design)",
    service_logo_design_desc: "دروستکردنی هێما و لۆگۆی تایبەت و سەردەمییانە.",
    active_service: "چالاک",

    sub_plans_title: "پلانەکانی بەشداریکردن",
    sub_plans_subtitle: "پلانی گونجاو دیاریبکە بۆ بەردەوامبوونی کارەکانت",
    plan_weekly: "هەفتانە (WEEKLY)",
    plan_monthly: "مانگانە (MONTHLY)",
    plan_yearly: "ساڵانە (YEARLY)",
    plan_weekly_desc: "گونجاوە بۆ ئەزموونکردن و پڕۆژەی کورتخایەن",
    plan_monthly_desc: "پەسەندکراو بۆ کار و دیزاینی بەردەوام",
    plan_yearly_desc: "باشترین هەڵبژاردن بۆ ساڵێکی تەواوی بێسنوور",
    duration_7_days: "ماوە: ٧ ڕۆژ",
    duration_30_days: "ماوە: ٣٠ ڕۆژ",
    duration_365_days: "ماوە: ٣٦٥ ڕۆژ",
    purchase_plan: "داواکردنی ئەم پلانە",
    sub_request_sent_title: "داواکارییەکەت ڕەوانەی بەڕێوەبەر کرا",
    sub_request_sent_desc: "داواکارییەکەت نێردراوە بۆ تێلێگرامی بەڕێوەبەر. تکایە چاوەڕوانی پشتڕاستکردنەوە بن.",
    pending_approval: "چاوەڕوانی پەسەندکردن",
    request_id: "کۆدی داواکاری",

    history_title: "مێژووی بەرهەمهێنانەکان",
    history_subtitle: "هەموو ئەو وێنانەی پێشتر دروستت کردوون",
    delete_item: "سڕینەوە",
    item_deleted: "وێنەکە لە مێژوو سڕایەوە",
    filter_all: "هەمووی",
    search_prompt: "گەڕان لە وەسفەکان...",

    notifications_title: "ناوەندی ئاگادارییەکان",
    mark_all_read: "دیاریکردنی هەموو وەک خوێنراوە",
    no_notifications: "هیچ ئاگادارییەکت نییە",
    unread: "نەخوێنراوە",

    my_profile: "پڕۆفایلی من",
    update_profile: "نوێکردنەوەی پڕۆفایل",
    profile_updated: "پڕۆفایل بە سەرکەوتوویی نوێکرایەوە",
    security_settings: "ڕێکخستنەکانی ئاسایش",
    change_password: "گۆڕینی وشەی تێپەڕ",
    current_password: "وشەی تێپەڕی ئێستا",
    new_password: "وشەی تێپەڕی نوێ",
    two_factor_auth: "پاراستنی دوو هەنگاوی (2FA)",
    two_factor_desc: "ئاستی ئاسایشی هەژمارەکەت بەرز بکەرەوە بە کلیل و کۆدی تایبەت.",
    enable_2fa: "چالاککردنی 2FA",
    disable_2fa: "ناچالاککردن",
    backup_codes: "کۆدەکانی فریاگوزاری (Backup Codes)",
    backup_codes_desc: "ئەم کۆدانە لە شوێنێکی پارێزراو هەڵبگرە بۆ ئەگەری لەدەستدانی ئامێرەکەت.",
    logout_all_devices: "چوونەدەرەوە لە هەموو ئامێرەکان",
    all_devices_logged_out: "لە هەموو ئامێرەکان چوویتە دەرەوە",

    contact_admin_title: "پەیوەندی بە بەڕێوەبەر",
    contact_admin_subtitle: "پەیامەکەت ڕاستەوخۆ دەگاتە تێلێگرامی بەڕێوەبەرایەتی",
    request_type: "جۆری داواکاری",
    request_type_general: "گشتی / پرسیار",
    request_type_subscription: "بەشداریکردن و پارەدان",
    request_type_tech: "کێشەی تەکنیکی",
    request_type_billing: "باڵانس و خاڵەکان",
    your_message: "پەیامەکەت",
    send_message: "ناردنی پەیام",
    message_sent_admin: "پەیامەکەت بە سەرکەوتوویی نێردرا بۆ بەڕێوەبەر.",
  },

  ku_ba: {
    home: "سەرەکی",
    dashboard: "داشبۆرد",
    ai_generator: "دروستکەرێ وێنەیێ هزر",
    services: "خزمەتگۆزاری",
    add_balance: "زێدەکرنا باڵانسی",
    subscriptions: "پشکداری",
    my_history: "مێژوویا من",
    notifications: "ئاگەهداری",
    profile: "پڕۆفایل",
    security: "پاراستن و ئێمناهی",
    contact_admin: "پەیوەندی ب سەرپەرشتی",
    logout: "دەرکەفتن",
    login: "چوونەژوور",
    sign_up: "تۆمارکرن",
    start_free: "بێ بەرامبەر دەستپێبکە",
    switch_language: "گوهۆڕینا زمانی",
    dark_mode: "ڕەوشا تاریک",
    light_mode: "ڕەوشا ڕووناک",

    hero_title: "پلاتفۆڕما هۆشمەندیا دەستکرد یا داهێنەرانە",
    hero_subtitle: "هزرێن خۆ چێکە، بهێزبکە و بگەهینە ئەنجامان ب ئەپێن پێشکەفتی یێن ژیریێ.",
    how_it_works_title: "چاوان کار دکەت؟",
    step_1_title: "١. ئەکاونتەکی چێکە",
    step_1_desc: "ب چەند چرکەکان ناڤێ خۆ بنڤیسە بێ پێدڤی ب کارتا بانکی.",
    step_2_title: "٢. ٤ بەرهەمهێنانێن بێ بەرامبەر وەربگرە",
    step_2_desc: "دەستبەجێ ٤ خالێن چێکرنا وێنەیێن AI دێ ب دەست کەڤن.",
    step_3_title: "٣. وێنەیێن خۆ چێکە",
    step_3_desc: "کوالیتییا بلند و هونەرێ نوێ د چێکرنا وێنەیان دا ببینە.",
    step_4_title: "٤. پشکدارییەکێ هەلبژێرە",
    step_4_desc: "پشتی خالێن بێ بەرامبەر تمام دبن، پلانەکا گونجای بۆ خۆ هەلبژێرە.",
    available_services: "خزمەتگۆزاریێن بەردەست",
    ready_to_create: "ئامادەی دەستپێبکەی؟",
    ready_desc: "ئەڤرۆ ئەکاونتێ خۆ چێکە و ٤ چێکرنێن بێ بەرامبەر ب دەستخۆڤە بینە.",

    email_or_username: "ئیمەیل یان ناڤێ بکارهێنەری",
    password: "پەیڤا دەربازبوونێ",
    confirm_password: "دووبارەکرنا پەیڤا دەربازبوونێ",
    full_name: "ناڤێ تەمام",
    username: "ناڤێ بکارهێنەری",
    email: "ئیمەیل",
    phone_number: "ژمارا مۆبایلێ",
    remember_me: "من ل بیر بینە",
    forgot_password: "پەیڤا دەربازبوونێ ژبیرکر؟",
    create_account: "چێکرنا ئەکاونتێ نوو",
    already_have_account: "ئەکاونت هەیە؟ چوونەژوور",
    dont_have_account: "ئەکاونت نینە؟ نوکە دروستبکە",
    agree_terms: "ئەز ڕازیمە ب مەرج و ڕێسایێن بەکارهێنانێ",
    password_requirements: "پەیڤا دەربازبوونێ دڤێت کێمترین ٨ پیت بن، پیتێن مەزن، هویر، ژمارە و نیشان تێدابن.",
    password_weak: "لاواز",
    password_medium: "ناڤنجی",
    password_strong: "ب هێز",
    login_success: "ب سەرکەفتی چوو ژوور",
    signup_success: "ئەکاونتێ تە هاتە چێکرن! ٤ خالێن بێ بەرامبەر هاتنە دان.",
    passwords_dont_match: "پەیڤێن دەربازبوونێ وەکی ئێک نینن",
    fill_all_fields: "هیڤییە هەمی جهان تژی بکەی",
    account_disabled_msg: "ئەکاونتێ تە هاتییە ڕاگرتن. تکایە پەیوەندیێ ب سەرپەرشتی بکە.",

    welcome_back: "ب خێربێییەڤە",
    free_ai_generations: "چێکرنێن بێ بەرامبەر",
    current_balance: "باڵانسێ نوکە",
    active_subscription: "پشکدارییا چالاک",
    no_active_subscription: "چ پشکدارییەکا چالاک نینە",
    subscription_expiry: "دەمێ ب دوماهیک هاتنێ",
    days_remaining: "ڕۆژێن ماین",
    total_generated_images: "سەرجەمێ وێنەیێن چێکری",
    account_status: "ڕەوشا ئەکاونتی",
    status_active: "چالاک",
    status_suspended: "ڕاگرتی",
    status_disabled: "ناچالاک",
    quick_actions: "کردارێن لەز",
    recent_generations: "دوماهیک کارێن تە",
    no_generations_yet: "تە چ وێنە چێنەکرینە هێشتا",

    generator_title: "چێکەرێ وێنەیێ پێشکەفتی",
    generator_subtitle: "وەسفێ وێنەیێ بنڤیسە دا ژیرییا دەستکرد ب دەستخۆڤە بینیت.",
    prompt_placeholder: "وەسفێ وی وێنەی بنڤیسە کو تە دڤێت چێکەی...",
    negative_prompt_placeholder: "تشتێن تە نەڤێت دیار ببن بنڤیسە...",
    prompt_label: "وەسفێ سەرەکی (Prompt)",
    negative_prompt_label: "وەسفێ نەرێنی (Negative Prompt)",
    style_label: "شێوازێ هونەری (Style)",
    aspect_ratio_label: "قەبارێ وێنەی (Aspect Ratio)",
    generate_button: "وێنەی چێکە",
    generating: "یێ چێدکەت...",
    remaining_free: "چێکرنێن بێ بەرامبەر یێن ماین",
    credits_depleted_title: "تە هەمی ٤ دەرفەتێن بێ بەرامبەر ب کارئینان",
    credits_depleted_desc: "تکایە پشکدارییەکێ هەلبژێرە یان نامەکێ بۆ سەرپەرشتی فرێکە.",
    choose_subscription: "پشکدارییەکێ هەلبژێرە",
    download_image: "داگرتنا وێنەی",
    save_to_history: "پاراستن د مێژوویێ دا",
    generation_success: "وێنەیێ تە ب سەرکەفتی هاتە چێکرن!",
    generation_failed: "چێکرنا وێنەی سەرنەکەفت. چ خال نەهاتینە بڕین.",
    try_again: "دووبارە بکە",
    copy_prompt: "کۆپیکرنا وەسفی",
    prompt_copied: "وەسف هاتە کۆپیکرن",

    services_title: "خزمەتگۆزاریێن پێشکەفتی",
    services_subtitle: "کۆمەکا ئامرازێن پیشەیی بۆ بەرزکرنا کارێ تە",
    use_service: "بکارئینانا خزمەتێ",
    service_image_gen_name: "چێکرنا وێنەیێ AI",
    service_image_gen_desc: "چێکرنا وێنەیێن تایبەت ب ڕێکا دەقێ نڤیسی.",
    service_enhancement_name: "بهێزکرنا وێنەی (Enhance)",
    service_enhancement_desc: "بلندکرنا کوالیتی و ڕوونییا وێنەیان.",
    service_bg_removal_name: "ڕاکرنا باکگراوندی",
    service_bg_removal_desc: "لابردنا باکگراوندێ وێنەی ب دروستی.",
    service_ai_design_name: "دیزاینا هۆشمەند (AI Design)",
    service_ai_design_desc: "دیزاینێن بازرگانی و ڕیکلامێن نوی.",
    service_logo_design_name: "دیزاینا لۆگۆی (Logo Design)",
    service_logo_design_desc: "چێکرنا لۆگۆیێن تایبەت بۆ براندان.",
    active_service: "چالاک",

    sub_plans_title: "پلانێن پشکداریێ",
    sub_plans_subtitle: "پلانەکا گونجای بۆ کارێن خۆ هەلبژێرە",
    plan_weekly: "حەفتییانە (WEEKLY)",
    plan_monthly: "هەیڤانە (MONTHLY)",
    plan_yearly: "ساڵانە (YEARLY)",
    plan_weekly_desc: "گونجایە بۆ تاقیکرنێ و پڕۆژەیێن کورت",
    plan_monthly_desc: "باشترین هەلبژارتن بۆ کارێ بەردەوام",
    plan_yearly_desc: "ئابووریترین پلان بۆ سالەکا بێ سنوور",
    duration_7_days: "ماوە: ٧ ڕۆژ",
    duration_30_days: "ماوە: ٣٠ ڕۆژ",
    duration_365_days: "ماوە: ٣٦٥ ڕۆژ",
    purchase_plan: "داواکرنا ڤێ پلانێ",
    sub_request_sent_title: "داخوازییا تە هاتە هنارتن",
    sub_request_sent_desc: "داخوازییا تە گەهشتە تێلێگرامێ سەرپەرشتی. هیڤییە ل هیڤییا پەسەندکرنێ بی.",
    pending_approval: "ل هیڤییا پەسەندکرنێ",
    request_id: "کۆدێ داخازیێ",

    history_title: "مێژوویا چێکرنان",
    history_subtitle: "هەمی ئەو وێنەیێن تە بەری نوکە چێکرین",
    delete_item: "ژێبرن",
    item_deleted: "وێنە ژ مێژوویێ هاتە ژێبرن",
    filter_all: "هەمی",
    search_prompt: "لێگەڕیان د وەسفان دا...",

    notifications_title: "ئاگەهداری",
    mark_all_read: "هەمی خواندی کرین",
    no_notifications: "چ ئاگەهداری نینن",
    unread: "نەخواندی",

    my_profile: "پڕۆفایلێ من",
    update_profile: "نووکرنا پڕۆفایلی",
    profile_updated: "پڕۆفایل هاتە نووکرن",
    security_settings: "ئێمناهی و پاراستن",
    change_password: "گۆڕینا پەیڤا دەربازبوونێ",
    current_password: "پەیڤا نوکە",
    new_password: "پەیڤا نوو",
    two_factor_auth: "پاراستنا دوو پێنگاڤی (2FA)",
    two_factor_desc: "ئاستێ پاراستنا ئەکاونتێ خۆ بلند بکە ب کلیلێن تایبەت.",
    enable_2fa: "چالاککرنا 2FA",
    disable_2fa: "ناچالاککرن",
    backup_codes: "کۆدێن فریاکەفتنێ (Backup Codes)",
    backup_codes_desc: "ڤان کۆدان ل جهەکی باوەرپێکری هەلگرە.",
    logout_all_devices: "دەرکەفتن ژ هەمی ئامیران",
    all_devices_logged_out: "تە ژ هەمی ئامیران دەرکەفتن کر",

    contact_admin_title: "پەیوەندی ب سەرپەرشتی",
    contact_admin_subtitle: "پەیاما تە ڕاستەوخۆ دچیتە سەر تێلێگرامێ سەرپەرشتی",
    request_type: "جۆرێ داخوازیێ",
    request_type_general: "گشتی / پرسیار",
    request_type_subscription: "پشکداری و پارەدان",
    request_type_tech: "ئاریشەیا تەکنیکی",
    request_type_billing: "باڵانس و خال",
    your_message: "پەیاما تە",
    send_message: "هنارتنا پەیامێ",
    message_sent_admin: "پەیاما تە گەهشتە سەرپەرشتی ب سەرکەفتی.",
  },

  ar: {
    home: "الرئيسية",
    dashboard: "لوحة التحكم",
    ai_generator: "منشئ الصور بالذكاء الاصطناعي",
    services: "الخدمات",
    add_balance: "شحن الرصيد",
    subscriptions: "الاشتراكات",
    my_history: "سجل أعمالي",
    notifications: "الإشعارات",
    profile: "الملف الشخصي",
    security: "الأمان والحماية",
    contact_admin: "تواصل مع المشرف",
    logout: "تسجيل الخروج",
    login: "تسجيل الدخول",
    sign_up: "إنشاء حساب",
    start_free: "ابدأ مجاناً",
    switch_language: "تغيير اللغة",
    dark_mode: "الوضع الداكن",
    light_mode: "الوضع الفاتح",

    hero_title: "منصة الذكاء الاصطناعي الإبداعية",
    hero_subtitle: "أنشئ، طوّر وحوّل أفكارك إلى تصاميم مذهلة باستخدام أقوى أدوات الذكاء الاصطناعي.",
    how_it_works_title: "كيف يعمل؟",
    step_1_title: "١. أنشئ حسابك",
    step_1_desc: "سجل في ثوانٍ معدودة دون الحاجة لبطاقة بنكية.",
    step_2_title: "٢. احصل على ٤ محاولات مجانية",
    step_2_desc: "ستحصل فوراً على ٤ رصيد توليد صور بالذكاء الاصطناعي مجاناً.",
    step_3_title: "٣. أنشئ صورك الإبداعية",
    step_3_desc: "جرّب أحدث تقنيات توليد الصور بأعلى دقة ونقاء فني.",
    step_4_title: "٤. اختر خطة الاشتراك",
    step_4_desc: "بعد استنفاد الرصيد المجاني، اختر الخطة التي تناسب احتياجاتك.",
    available_services: "الخدمات المتاحة",
    ready_to_create: "جاهز للبدء؟",
    ready_desc: "انضم إلينا اليوم واستمتع بـ ٤ عمليات توليد مجانية فورية.",

    email_or_username: "البريد الإلكتروني أو اسم المستخدم",
    password: "كلمة المرور",
    confirm_password: "تأكيد كلمة المرور",
    full_name: "الاسم الكامل",
    username: "اسم المستخدم",
    email: "البريد الإلكتروني",
    phone_number: "رقم الهاتف",
    remember_me: "تذكرني",
    forgot_password: "نسيت كلمة المرور؟",
    create_account: "إنشاء حساب جديد",
    already_have_account: "لديك حساب بالفعل؟ تسجيل الدخول",
    dont_have_account: "ليس لديك حساب؟ اشترك الآن",
    agree_terms: "أوافق على الشروط والأحكام وسياسة الخصوصية",
    password_requirements: "يجب أن تحتوي كلمة المرور على ٨ أحرف على الأقل، تشمل أحرفاً كبيرة وصغيرة وأرقاماً ورموزاً خاصة.",
    password_weak: "ضعيفة",
    password_medium: "متوسطة",
    password_strong: "قوية",
    login_success: "تم تسجيل الدخول بنجاح",
    signup_success: "تم إنشاء حسابك بنجاح! تم منحك ٤ محاولات مجانية.",
    passwords_dont_match: "كلمتا المرور غير متطابقتين",
    fill_all_fields: "يرجى ملء جميع الحقول المطلوبة",
    account_disabled_msg: "حسابك معطل أو معلق. يرجى التواصل مع المشرف.",

    welcome_back: "مرحباً بعودتك",
    free_ai_generations: "المحاولات المجانية للذكاء الاصطناعي",
    current_balance: "الرصيد الحالي",
    active_subscription: "الاشتراك النشط",
    no_active_subscription: "لا يوجد اشتراك نشط حالياً",
    subscription_expiry: "تاريخ انتهاء الاشتراك",
    days_remaining: "أيام متبقية",
    total_generated_images: "إجمالي الصور المنشأة",
    account_status: "حالة الحساب",
    status_active: "نشط",
    status_suspended: "معلق",
    status_disabled: "معطل",
    quick_actions: "إجراءات سريعة",
    recent_generations: "أحدث تصاميمك",
    no_generations_yet: "لم تقم بإنشاء أي صور حتى الآن",

    generator_title: "منشئ الصور الاحترافي",
    generator_subtitle: "اكتب وصفك بدقة ودع الذكاء الاصطناعي يحوله إلى تحفة فنية.",
    prompt_placeholder: "صف الصورة التي ترغب في إنشائها بالتفصيل...",
    negative_prompt_placeholder: "اكتب العناصر التي لا ترغب بظهورها في الصورة (اختياري)...",
    prompt_label: "الوصف الإيجابي (Prompt)",
    negative_prompt_label: "الوصف السلبي (Negative Prompt)",
    style_label: "الأسلوب الفني (Style)",
    aspect_ratio_label: "أبعاد الصورة (Aspect Ratio)",
    generate_button: "إنشاء الصورة",
    generating: "جاري المعالجة والإنشاء...",
    remaining_free: "الرصيد المجاني المتبقي",
    credits_depleted_title: "لقد استنفدت جميع المحاولات المجانية الأربعة (0 / 4)",
    credits_depleted_desc: "يرجى اختيار خطة اشتراك مناسبة أو التواصل مع المشرف للمتابعة.",
    choose_subscription: "اختر خطة الاشتراك",
    download_image: "تحميل الصورة",
    save_to_history: "حفظ في السجل",
    generation_success: "تم إنشاء الصورة بنجاح!",
    generation_failed: "تعذر إنشاء الصورة. لم يتم خصم أي رصيد.",
    try_again: "إعادة المحاولة",
    copy_prompt: "نسخ الوصف",
    prompt_copied: "تم نسخ الوصف إلى الحافظة",

    services_title: "خدمات الذكاء الاصطناعي المتقدمة",
    services_subtitle: "مجموعة أدوات احترافية لتطوير أعمالك الإبداعية",
    use_service: "استخدام الخدمة",
    service_image_gen_name: "توليد الصور بالذكاء الاصطناعي",
    service_image_gen_desc: "إنشاء تصاميم وصور مبتكرة وفائقة الدقة عبر النصوص.",
    service_enhancement_name: "تحسين جودة الصور (Photo Enhancement)",
    service_enhancement_desc: "رفع دقة وتفاصيل الصور القديمة والمنخفضة الجودة.",
    service_bg_removal_name: "إزالة الخلفيات (Background Removal)",
    service_bg_removal_desc: "تفريغ الصور وعزل العناصر والخلفيات بدقة متناهية.",
    service_ai_design_name: "التصميم الإبداعي (AI Design)",
    service_ai_design_desc: "تصميم بوسترات وحملات إعلانية بطرق عصرية.",
    service_logo_design_name: "تصميم الشعارات (Logo Design)",
    service_logo_design_desc: "ابتكار هويات بصرية وشعارات فريدة للشركات والمتاجر.",
    active_service: "متاح",

    sub_plans_title: "باقات وخطط الاشتراك",
    sub_plans_subtitle: "اختر الخطة المثالية لتلبية متطلباتك الإبداعية",
    plan_weekly: "أسبوعي (WEEKLY)",
    plan_monthly: "شهري (MONTHLY)",
    plan_yearly: "سنوي (YEARLY)",
    plan_weekly_desc: "مثالي للتجربة والمشاريع السريعة والمؤقتة",
    plan_monthly_desc: "الخيار الأفضل والأكثر طلباً للمحترفين والمصممين",
    plan_yearly_desc: "أفضل قيمة توفيرية لإنتاج لا محدود على مدار العام",
    duration_7_days: "المدة: ٧ أيام",
    duration_30_days: "المدة: ٣٠ يوماً",
    duration_365_days: "المدة: ٣٦٥ يوماً",
    purchase_plan: "طلب هذه الباقة",
    sub_request_sent_title: "تم إرسال طلب الاشتراك إلى الإدارة",
    sub_request_sent_desc: "تم إرسال تفاصيل طلبك إلى تيليجرام المشرف. يرجى الانتظار لتأكيد التفعيل.",
    pending_approval: "قيد المراجعة والموافقة",
    request_id: "رقم الطلب",

    history_title: "سجل أعمالي السابقة",
    history_subtitle: "استعرض جميع الصور والتصاميم التي قمت بإنشائها",
    delete_item: "حذف",
    item_deleted: "تم حذف الصورة من السجل",
    filter_all: "الكل",
    search_prompt: "بحث في الأوصاف...",

    notifications_title: "مركز الإشعارات",
    mark_all_read: "تحديد الكل كمقروء",
    no_notifications: "لا توجد إشعارات جديدة لديك",
    unread: "غير مقروء",

    my_profile: "الملف الشخصي",
    update_profile: "تحديث البيانات",
    profile_updated: "تم تحديث الملف الشخصي بنجاح",
    security_settings: "إعدادات الأمان والحماية",
    change_password: "تغيير كلمة المرور",
    current_password: "كلمة المرور الحالية",
    new_password: "كلمة المرور الجديدة",
    two_factor_auth: "التحقق بخطوتين (2FA)",
    two_factor_desc: "عزز أمان حسابك بإضافة خطوة تحقق إضافية عبر تطبيق المصادقة.",
    enable_2fa: "تفعيل 2FA",
    disable_2fa: "تعطيل",
    backup_codes: "رموز الاسترداد الاحتياطية",
    backup_codes_desc: "احتفظ بهذه الرموز في مكان آمن لاستعادة الحساب عند الطوارئ.",
    logout_all_devices: "تسجيل الخروج من كافة الأجهزة",
    all_devices_logged_out: "تم تسجيل الخروج بنجاح من جميع الجلسات",

    contact_admin_title: "التواصل مع المشرف",
    contact_admin_subtitle: "سيتم إرسال رسالتك مباشرة عبر البوابة الآمنة إلى المشرف",
    request_type: "نوع الطلب",
    request_type_general: "استفسار عام",
    request_type_subscription: "الاشتراكات والدفع",
    request_type_tech: "دعم تقني ومشاكل",
    request_type_billing: "الرصيد والفواتير",
    your_message: "نص الرسالة",
    send_message: "إرسال الرسالة",
    message_sent_admin: "تم إرسال رسالتك بنجاح إلى المشرف.",
  },

  en: {
    home: "Home",
    dashboard: "Dashboard",
    ai_generator: "AI Generator",
    services: "Services",
    add_balance: "Add Balance",
    subscriptions: "Subscriptions",
    my_history: "My History",
    notifications: "Notifications",
    profile: "My Profile",
    security: "Security",
    contact_admin: "Contact Admin",
    logout: "Logout",
    login: "Login",
    sign_up: "Sign Up",
    start_free: "Start Free",
    switch_language: "Language",
    dark_mode: "Dark Mode",
    light_mode: "Light Mode",

    hero_title: "AI Creative Platform",
    hero_subtitle: "Create, enhance and transform your ideas with powerful AI tools.",
    how_it_works_title: "How It Works",
    step_1_title: "1. Create an Account",
    step_1_desc: "Sign up in seconds without requiring any credit card.",
    step_2_title: "2. Receive 4 Free Generations",
    step_2_desc: "Instantly get 4 free AI image generation credits in your account.",
    step_3_title: "3. Generate Your Images",
    step_3_desc: "Experience high-definition visual synthesis with prompt fine-tuning.",
    step_4_title: "4. Choose a Subscription",
    step_4_desc: "Select a tailored plan once your free credits are finished.",
    available_services: "Available AI Services",
    ready_to_create: "Ready to Create?",
    ready_desc: "Join thousands of creators and claim your 4 free generations today.",

    email_or_username: "Email or Username",
    password: "Password",
    confirm_password: "Confirm Password",
    full_name: "Full Name",
    username: "Username",
    email: "Email Address",
    phone_number: "Phone Number",
    remember_me: "Remember Me",
    forgot_password: "Forgot Password?",
    create_account: "Create Account",
    already_have_account: "Already have an account? Login",
    dont_have_account: "Don't have an account? Sign up",
    agree_terms: "I agree to the Terms & Conditions and Privacy Policy",
    password_requirements: "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
    password_weak: "Weak",
    password_medium: "Medium",
    password_strong: "Strong",
    login_success: "Logged in successfully",
    signup_success: "Account created! 4 free generations credited.",
    passwords_dont_match: "Passwords do not match",
    fill_all_fields: "Please fill out all required fields",
    account_disabled_msg: "Your account is suspended or disabled. Please contact admin.",

    welcome_back: "Welcome Back",
    free_ai_generations: "Free AI Generations",
    current_balance: "Current Balance",
    active_subscription: "Active Subscription",
    no_active_subscription: "No Active Subscription",
    subscription_expiry: "Subscription Expiry",
    days_remaining: "Days Remaining",
    total_generated_images: "Total Generated Images",
    account_status: "Account Status",
    status_active: "Active",
    status_suspended: "Suspended",
    status_disabled: "Disabled",
    quick_actions: "Quick Actions",
    recent_generations: "Your Recent Generations",
    no_generations_yet: "You haven't generated any images yet",

    generator_title: "Professional AI Image Generator",
    generator_subtitle: "Describe your imagination and let artificial intelligence bring it to life.",
    prompt_placeholder: "Describe the image you want to generate in rich detail...",
    negative_prompt_placeholder: "Elements you want to avoid in the image (optional)...",
    prompt_label: "Prompt",
    negative_prompt_label: "Negative Prompt",
    style_label: "Style",
    aspect_ratio_label: "Aspect Ratio",
    generate_button: "Generate Image",
    generating: "Generating...",
    remaining_free: "Remaining Free Generations",
    credits_depleted_title: "You have used all 4 free AI generations (0 / 4)",
    credits_depleted_desc: "Please choose a subscription plan or contact Admin to continue generating.",
    choose_subscription: "Choose a Subscription",
    download_image: "Download Image",
    save_to_history: "Save to History",
    generation_success: "Image generated successfully!",
    generation_failed: "Generation failed. 0 credits were deducted.",
    try_again: "Try Again",
    copy_prompt: "Copy Prompt",
    prompt_copied: "Prompt copied to clipboard",

    services_title: "Professional AI Services",
    services_subtitle: "Powerful automated design tools designed for speed and quality",
    use_service: "Use Service",
    service_image_gen_name: "AI Image Generation",
    service_image_gen_desc: "Generate stunning high-definition artwork from text prompts.",
    service_enhancement_name: "Photo Enhancement",
    service_enhancement_desc: "Sharpen, restore, and upscale images with neural clarity.",
    service_bg_removal_name: "Background Removal",
    service_bg_removal_desc: "Isolate subjects and cleanly replace backgrounds instantly.",
    service_ai_design_name: "AI Design",
    service_ai_design_desc: "Craft professional advertising posters, banners, and digital graphics.",
    service_logo_design_name: "Logo Design",
    service_logo_design_desc: "Generate modern, vector-grade logos for brands and products.",
    active_service: "Active",

    sub_plans_title: "Subscription Plans",
    sub_plans_subtitle: "Unlock unlimited generations and premium features",
    plan_weekly: "WEEKLY",
    plan_monthly: "MONTHLY",
    plan_yearly: "YEARLY",
    plan_weekly_desc: "Best for short-term projects and testing features",
    plan_monthly_desc: "Most popular for regular creators and businesses",
    plan_yearly_desc: "Maximum savings for an entire year of creative freedom",
    duration_7_days: "Duration: 7 Days",
    duration_30_days: "Duration: 30 Days",
    duration_365_days: "Duration: 365 Days",
    purchase_plan: "Select Plan",
    sub_request_sent_title: "Subscription Request Sent",
    sub_request_sent_desc: "Your request has been sent to Admin. Please wait for confirmation.",
    pending_approval: "Pending Approval",
    request_id: "Request ID",

    history_title: "My Generation History",
    history_subtitle: "Access and download all your past visual generations",
    delete_item: "Delete",
    item_deleted: "Image removed from history",
    filter_all: "All",
    search_prompt: "Search by prompt...",

    notifications_title: "Notification Center",
    mark_all_read: "Mark All as Read",
    no_notifications: "No notifications to show",
    unread: "Unread",

    my_profile: "My Profile",
    update_profile: "Update Profile",
    profile_updated: "Profile updated successfully",
    security_settings: "Security Settings",
    change_password: "Change Password",
    current_password: "Current Password",
    new_password: "New Password",
    two_factor_auth: "Two-Factor Authentication (2FA)",
    two_factor_desc: "Protect your account with TOTP authenticator verification.",
    enable_2fa: "Enable 2FA",
    disable_2fa: "Disable",
    backup_codes: "Backup Recovery Codes",
    backup_codes_desc: "Keep these single-use recovery codes in a safe place.",
    logout_all_devices: "Logout From All Devices",
    all_devices_logged_out: "Logged out from all active sessions",

    contact_admin_title: "Contact Admin",
    contact_admin_subtitle: "Send a secure message directly to the administration Telegram",
    request_type: "Request Type",
    request_type_general: "General Inquiry",
    request_type_subscription: "Subscription & Payment",
    request_type_tech: "Technical Support",
    request_type_billing: "Balance & Credits",
    your_message: "Your Message",
    send_message: "Send Message",
    message_sent_admin: "Your message has been sent to Admin successfully.",
  },
};
