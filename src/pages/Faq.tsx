import { HelpCircle, FileText, Eye, ExternalLink, Users, Shield, Globe, Coins, HeadphonesIcon } from 'lucide-react';
import { Language, useTranslations, getLangPath } from '../i18n';
import { PremiumShell, PremiumCard, NoticeBox, PremiumButton } from '../components/ui';
import { Accordion, AccordionItem } from '../components/ui/Accordion';
import { Link } from '../components/Router';

interface FaqProps {
  lang: Language;
}

interface FaqItem {
  q: string;
  a: string;
}

interface FaqCategory {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  items: FaqItem[];
}

const Faq = ({ lang }: FaqProps) => {
  const t = useTranslations(lang);

  const categories: FaqCategory[] = [
    {
      id: 'general',
      icon: Globe,
      title: t.faq.sections.general.title,
      desc: t.faq.sections.general.desc,
      items: [
        t.faq.items.general.q1,
        t.faq.items.general.q2,
        t.faq.items.general.q3,
        t.faq.items.general.q4,
      ],
    },
    {
      id: 'membership',
      icon: Users,
      title: t.faq.sections.membership.title,
      desc: t.faq.sections.membership.desc,
      items: [
        t.faq.items.membership.q1,
        t.faq.items.membership.q2,
        t.faq.items.membership.q3,
        t.faq.items.membership.q4,
      ],
    },
    {
      id: 'security',
      icon: Shield,
      title: t.faq.sections.security.title,
      desc: t.faq.sections.security.desc,
      items: [
        t.faq.items.security.q1,
        t.faq.items.security.q2,
        t.faq.items.security.q3,
        t.faq.items.security.q4,
      ],
    },
    {
      id: 'transparency',
      icon: Eye,
      title: t.faq.sections.transparency.title,
      desc: t.faq.sections.transparency.desc,
      items: [
        t.faq.items.transparency.q1,
        t.faq.items.transparency.q2,
        t.faq.items.transparency.q3,
        t.faq.items.transparency.q4,
      ],
    },
    {
      id: 'token',
      icon: Coins,
      title: t.faq.sections.token.title,
      desc: t.faq.sections.token.desc,
      items: [
        t.faq.items.token.q1,
        t.faq.items.token.q2,
        t.faq.items.token.q3,
        t.faq.items.token.q4,
      ],
    },
    {
      id: 'support',
      icon: HeadphonesIcon,
      title: t.faq.sections.support.title,
      desc: t.faq.sections.support.desc,
      items: [
        t.faq.items.support.q1,
        t.faq.items.support.q2,
        t.faq.items.support.q3,
      ],
    },
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <PremiumShell>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 pb-24 md:pb-28">
        <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-6 md:p-10 mb-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#F0B90B]/10 to-[#F0B90B]/5 border border-[#F0B90B]/20 mb-6">
              <HelpCircle className="w-4 h-4 text-[#F0B90B]" />
              <span className="text-sm font-medium text-[#F0B90B]">
                {t.faq.hero.badge}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              {t.faq.hero.title}
            </h1>
            <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              {t.faq.hero.subtitle}
            </p>
          </div>

          <NoticeBox
            variant="info"
            title={t.faq.hero.noticeTitle}
          >
            {t.faq.hero.noticeDesc}
          </NoticeBox>
        </div>

        <div className="mb-10">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => scrollToSection(category.id)}
                  className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 hover:border-[#F0B90B]/30 hover:bg-[#F0B90B]/10 transition-all duration-300"
                >
                  <Icon className="w-4 h-4 text-white/60 group-hover:text-[#F0B90B] transition-colors" />
                  <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">
                    {category.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-[#F0B90B]/30 to-transparent mb-10" />

        <div className="space-y-12">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <div key={category.id} id={category.id} className="scroll-mt-24">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#F0B90B]/20 to-[#F0B90B]/5 border border-[#F0B90B]/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[#F0B90B]" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-semibold text-white">
                      {category.title}
                    </h2>
                  </div>
                  <p className="text-white/60 text-sm ml-13">
                    {category.desc}
                  </p>
                </div>

                <Accordion>
                  {category.items.map((item, index) => (
                    <AccordionItem
                      key={`${category.id}-${index}`}
                      title={item.q}
                    >
                      <div className="space-y-3">
                        {item.a.split('\n\n').map((paragraph, pIndex) => {
                          if (paragraph.trim().startsWith('•')) {
                            const lines = paragraph.split('\n').filter(line => line.trim());
                            return (
                              <ul key={pIndex} className="space-y-2 ml-4">
                                {lines.map((line, lIndex) => (
                                  <li key={lIndex} className="flex items-start gap-2">
                                    <span className="text-[#F0B90B] mt-1 flex-shrink-0">•</span>
                                    <span className="text-white/75">{line.replace('• ', '')}</span>
                                  </li>
                                ))}
                              </ul>
                            );
                          }
                          return (
                            <p key={pIndex} className="text-white/75 leading-relaxed">
                              {paragraph}
                            </p>
                          );
                        })}
                      </div>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            );
          })}
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-[#F0B90B]/30 to-transparent my-12" />

        <PremiumCard hover={false}>
          <div className="text-center py-8">
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3">
              {t.faq.cta.title}
            </h2>
            <p className="text-white/70 text-base mb-8 max-w-2xl mx-auto">
              {t.faq.cta.desc}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to={getLangPath(lang, '/docs')}>
                <PremiumButton variant="primary">
                  <FileText className="w-5 h-5" />
                  {t.faq.cta.primary}
                </PremiumButton>
              </Link>
              <Link to={getLangPath(lang, '/transparency')}>
                <PremiumButton variant="secondary">
                  <Eye className="w-5 h-5" />
                  {t.faq.cta.secondary}
                </PremiumButton>
              </Link>
              <PremiumButton
                variant="secondary"
                href="https://t.me/tpcglobalcommunity"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-5 h-5" />
                {t.faq.cta.tertiary}
              </PremiumButton>
            </div>
          </div>
        </PremiumCard>
      </div>
    </PremiumShell>
  );
};

export default Faq;
