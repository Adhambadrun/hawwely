import type { Faq } from '@/lib/types';
import { corridorId, faqId, serviceId } from './ids';

/** FAQ content. Mirrors the `faqs` table seed. */
export const FAQS: Faq[] = [
  {
    id: faqId(1),
    question: 'What is Hawwely?',
    question_ar: 'إيه هو حوّلي؟',
    answer:
      'Hawwely is a free comparison platform that helps Egyptian expats find the cheapest way to send money home to Egypt. We compare exchange rates and fees across 10+ services in real-time.',
    answer_ar:
      'حوّلي هو منصة مقارنة مجانية بتساعد المصريين بالخارج يلاقوا أرخص طريقة يبعتوا فلوس لمصر. بنقارن أسعار الصرف والعمولات في أكتر من 10 خدمات في الوقت الفعلي.',
    category: 'general',
    corridor_id: null,
    service_id: null,
    sort_order: 1,
    is_active: true,
  },
  {
    id: faqId(2),
    question: 'Is Hawwely free?',
    question_ar: 'حوّلي ببلاش؟',
    answer:
      'Yes, Hawwely is 100% free to use. We earn a small commission from some services when you use our links, at no extra cost to you.',
    answer_ar:
      'أيوه، حوّلي مجاني 100%. بنكسب عمولة صغيرة من بعض الخدمات لما تستخدم لينكاتنا، من غير أي تكلفة إضافية عليك.',
    category: 'general',
    corridor_id: null,
    service_id: null,
    sort_order: 2,
    is_active: true,
  },
  {
    id: faqId(3),
    question: 'How do you get your rates?',
    question_ar: 'بتجيبوا الأسعار منين؟',
    answer:
      'We pull rates from official APIs, public websites, and our community of reporters who verify rates daily.',
    answer_ar:
      'بنجيب الأسعار من APIs رسمية، مواقع عامة، ومجتمعنا من المتطوعين اللي بيتأكدوا من الأسعار كل يوم.',
    category: 'rates',
    corridor_id: null,
    service_id: null,
    sort_order: 3,
    is_active: true,
  },
  {
    id: faqId(4),
    question: 'How often are rates updated?',
    question_ar: 'الأسعار بتتحدث كل قد إيه؟',
    answer: 'Exchange rates are updated every 30 minutes. Fee structures are verified daily.',
    answer_ar: 'أسعار الصرف بتتحدث كل 30 دقيقة. العمولات بنتأكد منها يومياً.',
    category: 'rates',
    corridor_id: null,
    service_id: null,
    sort_order: 4,
    is_active: true,
  },
  {
    id: faqId(5),
    question: 'What is the mid-market rate?',
    question_ar: 'إيه هو سعر السوق الحقيقي؟',
    answer:
      'The mid-market rate is the real exchange rate you see on Google or Reuters. It is the midpoint between buy and sell prices. Most transfer services add a markup on top of this rate, which is a hidden fee.',
    answer_ar:
      'سعر السوق الحقيقي هو سعر الصرف الحقيقي اللي بتشوفه على جوجل. معظم خدمات التحويل بتضيف هامش على السعر ده، وده بيكون عمولة مخفية.',
    category: 'rates',
    corridor_id: null,
    service_id: null,
    sort_order: 5,
    is_active: true,
  },
  {
    id: faqId(6),
    question: 'Which service is cheapest for Saudi Arabia to Egypt?',
    question_ar: 'إيه أرخص طريقة تحويل من السعودية لمصر؟',
    answer:
      'It depends on the amount and speed you need. Generally, Wise offers the closest to mid-market rate, but for cash pickup, Tahweel Al Rajhi can be competitive. Use our comparison tool to check real-time rates.',
    answer_ar:
      'بيعتمد على المبلغ والسرعة. عموماً، Wise بتقدم أقرب سعر لسعر السوق، لكن للاستلام كاش، تحويل الراجحي ممكن يكون أحسن. استخدم أداة المقارنة عندنا.',
    category: 'services',
    corridor_id: corridorId(1),
    service_id: null,
    sort_order: 6,
    is_active: true,
  },
  {
    id: faqId(7),
    question: 'Does Hawwely transfer money itself?',
    question_ar: 'حوّلي بيحوّل الفلوس بنفسه؟',
    answer:
      'No. Hawwely never touches your money. We are an independent comparison site — when you choose a service, you complete the transfer on that provider’s own website or app.',
    answer_ar:
      'لأ. حوّلي عمره ما بيلمس فلوسك. إحنا موقع مقارنة مستقل — لما تختار خدمة، بتكمل التحويل على موقع أو تطبيق الخدمة نفسها.',
    category: 'security',
    corridor_id: null,
    service_id: null,
    sort_order: 7,
    is_active: true,
  },
  {
    id: faqId(8),
    question: 'Is it safe to use the services listed on Hawwely?',
    question_ar: 'الخدمات اللي على حوّلي آمنة؟',
    answer:
      'We only list licensed providers regulated by authorities such as the UK FCA, SAMA, the UAE Central Bank and the Central Bank of Egypt. Always double-check recipient details before you send.',
    answer_ar:
      'بنعرض بس خدمات مرخصة وخاضعة لجهات رقابية زي FCA البريطانية، ساما، مصرف الإمارات المركزي، والبنك المركزي المصري. دايماً راجع بيانات المستلم قبل ما تبعت.',
    category: 'security',
    corridor_id: null,
    service_id: null,
    sort_order: 8,
    is_active: true,
  },
  {
    id: faqId(9),
    question: 'What is the difference between the visible fee and the hidden fee?',
    question_ar: 'إيه الفرق بين العمولة الظاهرة والعمولة المخفية؟',
    answer:
      'The visible fee is the fixed or percentage fee the service shows you. The hidden fee is the difference between the mid-market rate and the rate they give you, multiplied by your amount. Hawwely shows you both so you see the true cost.',
    answer_ar:
      'العمولة الظاهرة هي الرسوم الثابتة أو النسبية اللي الخدمة بتقولك عليها. العمولة المخفية هي الفرق بين سعر السوق الحقيقي والسعر اللي بيدهولك، مضروب في المبلغ. حوّلي بيوريك الاتنين عشان تعرف التكلفة الحقيقية.',
    category: 'rates',
    corridor_id: null,
    service_id: null,
    sort_order: 9,
    is_active: true,
  },
  {
    id: faqId(10),
    question: 'Can my family receive money on InstaPay?',
    question_ar: 'أهلي يقدروا يستلموا على إنستاباي؟',
    answer:
      'Yes. Several services, including Wise and Paysend, can pay out to any Egyptian bank account, and your family can then move it instantly via InstaPay. Some providers deliver directly to InstaPay-linked accounts.',
    answer_ar:
      'أيوه. خدمات كتير زي Wise وPaysend بتحوّل على أي حساب بنكي مصري، وأهلك يقدروا يحركوها فوراً عن طريق إنستاباي. وبعض الخدمات بتوصّل مباشرة لحسابات مربوطة بإنستاباي.',
    category: 'services',
    corridor_id: null,
    service_id: serviceId(12),
    sort_order: 10,
    is_active: true,
  },
  {
    id: faqId(11),
    question: 'Which is the cheapest way to send money from the UAE to Egypt?',
    question_ar: 'إيه أرخص طريقة تحويل من الإمارات لمصر؟',
    answer:
      'For bank deposits, Wise and Al Ansari Exchange usually offer the best AED to EGP rates. For cash pickup, compare Al Ansari with Remitly. Rates move during the day, so check the live comparison.',
    answer_ar:
      'للتحويل على البنك، Wise والأنصاري للصرافة عادةً أحسن سعر درهم للجنيه. للاستلام كاش، قارن بين الأنصاري وريميتلي. السعر بيتحرك خلال اليوم، فاتأكد من المقارنة الحية.',
    category: 'services',
    corridor_id: corridorId(2),
    service_id: null,
    sort_order: 11,
    is_active: true,
  },
  {
    id: faqId(12),
    question: 'How does Hawwely make money?',
    question_ar: 'حوّلي بيكسب منين؟',
    answer:
      'Some providers pay us a referral commission when you sign up through our link. This never changes the rate you get, and it never changes our ranking — results are always sorted by the amount your family receives.',
    answer_ar:
      'بعض الخدمات بتدفعلنا عمولة إحالة لما تسجّل من خلال لينكنا. ده عمره ما بيغيّر السعر اللي بتاخده، ولا بيغيّر ترتيب النتائج — النتائج دايماً مترتبة حسب المبلغ اللي أهلك هيستلموه.',
    category: 'general',
    corridor_id: null,
    service_id: null,
    sort_order: 12,
    is_active: true,
  },
  {
    id: faqId(13),
    question: 'Why is the bank rate different from the rate on Google?',
    question_ar: 'ليه سعر البنك مختلف عن السعر اللي على جوجل؟',
    answer:
      'Google shows the mid-market rate. Banks and transfer companies buy currency at a slightly better rate and sell it to you at a slightly worse one — that spread is how they profit.',
    answer_ar:
      'جوجل بيعرض سعر السوق الحقيقي. البنوك وشركات التحويل بتشتري العملة بسعر أحسن شوية وتبيعهالك بسعر أوحش شوية — الفرق ده هو مكسبهم.',
    category: 'rates',
    corridor_id: null,
    service_id: null,
    sort_order: 13,
    is_active: true,
  },
  {
    id: faqId(14),
    question: 'What is the best time of the month to send money to Egypt?',
    question_ar: 'إيه أحسن وقت في الشهر أبعت فيه فلوس لمصر؟',
    answer:
      'There is no fixed best day, but rates tend to fluctuate around Central Bank announcements and month-end demand. Set a rate alert and we will notify you when the rate hits your target.',
    answer_ar:
      'مفيش يوم ثابت، لكن الأسعار بتتحرك حوالين قرارات البنك المركزي وزحمة آخر الشهر. اعمل تنبيه سعر وهنبعتلك لما السعر يوصل للرقم اللي عايزه.',
    category: 'rates',
    corridor_id: null,
    service_id: null,
    sort_order: 14,
    is_active: true,
  },
];
