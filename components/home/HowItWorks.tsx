import { ChartColumn, HandCoins, MapPin } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export async function HowItWorks() {
  const t = await getTranslations('home');
  const tc = await getTranslations('common');
  const steps = [
    { icon: MapPin, title: t('how1Title'), text: t('how1Text'), color: 'bg-navy text-white' },
    { icon: ChartColumn, title: t('how2Title'), text: t('how2Text'), color: 'bg-primary text-white' },
    { icon: HandCoins, title: t('how3Title'), text: t('how3Text'), color: 'bg-gold text-navy' },
  ];
  return (
    <section className="section bg-white" aria-labelledby="how-title">
      <div className="container-content">
        <div className="text-center">
          <h2 id="how-title" className="section-title">
            {t('howTitle')}
          </h2>
          <p className="section-subtitle mx-auto">{t('howSubtitle')}</p>
        </div>
        <ol className="relative mt-12 grid gap-8 md:grid-cols-3">
          <div className="absolute inset-x-[16%] top-10 hidden h-0.5 bg-gradient-to-r from-navy via-primary to-gold md:block" aria-hidden />
          {steps.map((s, i) => (
            <li key={s.title} className="relative flex flex-col items-center text-center animate-fade-up" style={{ animationDelay: `${i * 120}ms` }}>
              <div className={`relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl shadow-card animate-float ${s.color}`} style={{ animationDelay: `${i * 400}ms` }}>
                <s.icon className="h-9 w-9" aria-hidden />
                <span className="num absolute -end-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-white text-caption font-extrabold text-navy shadow-card">
                  {i + 1}
                </span>
              </div>
              <p className="sr-only">{tc('step', { n: i + 1 })}</p>
              <h3 className="mt-5 text-lg font-bold text-navy">{s.title}</h3>
              <p className="mt-2 max-w-xs text-small text-content-secondary">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
