import { useEffect, useState, useRef } from 'react';
import { BookOpen, Target, Coins, HelpCircle } from 'lucide-react';
import { Language, useTranslations } from '../i18n';
import { PremiumShell, PremiumCard, Accordion, AccordionItem, NoticeBox } from '../components/ui';

interface DocsProps {
  lang: Language;
}

const HEADER_OFFSET = 100;

const Docs = ({ lang }: DocsProps) => {
  const t = useTranslations(lang);
  const [activeSection, setActiveSection] = useState('overview');
  const sectionsRef = useRef<{ [key: string]: HTMLElement | null }>({});

  const sections = [
    { id: 'overview', label: t.docs.whatIsTPC, icon: BookOpen },
    { id: 'how-it-works', label: t.docs.howItWorks, icon: Target },
    { id: 'token-utility', label: t.docs.tokenUtility, icon: Coins },
    { id: 'faq', label: t.docs.faq, icon: HelpCircle },
  ];

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash && sectionsRef.current[hash]) {
      setTimeout(() => {
        const element = sectionsRef.current[hash];
        if (element) {
          const top = element.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }, 100);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + HEADER_OFFSET + 50;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sectionsRef.current[sections[i].id];
        if (section && section.offsetTop <= scrollPos) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  const scrollToSection = (id: string) => {
    const element = sectionsRef.current[id];
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
      window.scrollTo({ top, behavior: 'smooth' });
      window.history.pushState({}, '', `#${id}`);
    }
  };

  return (
    <PremiumShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t.docs.title}
          </h1>
          <p className="text-xl text-white/70">
            {t.docs.subtitle}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 flex-shrink-0">
            <div className="lg:sticky lg:top-24 space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`
                      w-full text-left px-4 py-3 rounded-lg
                      transition-all duration-200
                      flex items-center gap-3
                      ${isActive
                        ? 'bg-white/10 border-l-4 border-[#F0B90B] text-white'
                        : 'bg-white/5 border-l-4 border-transparent text-white/60 hover:bg-white/8 hover:text-white/80'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-[#F0B90B]' : ''}`} />
                    <span className="font-medium">{section.label}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <div className="space-y-12">
              <section
                ref={(el) => (sectionsRef.current['overview'] = el)}
                id="overview"
              >
                <PremiumCard>
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#F0B90B] to-[#C29409] rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-6 h-6 text-black" />
                    </div>
                    <h2 className="text-2xl font-semibold text-white mt-2">
                      {t.docs.whatIsTPC}
                    </h2>
                  </div>
                  <p className="text-white/75 text-base leading-relaxed">
                    {t.docs.whatIsTPCContent}
                  </p>
                </PremiumCard>
              </section>

              <section
                ref={(el) => (sectionsRef.current['how-it-works'] = el)}
                id="how-it-works"
              >
                <PremiumCard>
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#F0B90B] to-[#C29409] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Target className="w-6 h-6 text-black" />
                    </div>
                    <h2 className="text-2xl font-semibold text-white mt-2">
                      {t.docs.howItWorks}
                    </h2>
                  </div>
                  <p className="text-white/75 text-base leading-relaxed">
                    {t.docs.howItWorksContent}
                  </p>
                </PremiumCard>
              </section>

              <section
                ref={(el) => (sectionsRef.current['token-utility'] = el)}
                id="token-utility"
              >
                <PremiumCard>
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#F0B90B] to-[#C29409] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Coins className="w-6 h-6 text-black" />
                    </div>
                    <h2 className="text-2xl font-semibold text-white mt-2">
                      {t.docs.tokenUtility}
                    </h2>
                  </div>
                  <p className="text-white/75 text-base leading-relaxed">
                    {t.docs.tokenUtilityContent}
                  </p>
                </PremiumCard>
              </section>

              <section
                ref={(el) => (sectionsRef.current['faq'] = el)}
                id="faq"
              >
                <div className="flex items-center gap-3 mb-6">
                  <HelpCircle className="w-6 h-6 text-[#F0B90B]" />
                  <h2 className="text-2xl md:text-3xl font-semibold text-white">
                    {t.docs.faq}
                  </h2>
                </div>
                <Accordion>
                  <AccordionItem
                    title={t.docs.faqQ1}
                    defaultOpen
                  >
                    {t.docs.faqA1}
                  </AccordionItem>
                  <AccordionItem
                    title={t.docs.faqQ2}
                  >
                    {t.docs.faqA2}
                  </AccordionItem>
                </Accordion>
              </section>

              <section>
                <NoticeBox variant="info">
                  {t.docs.disclaimer}
                </NoticeBox>
              </section>
            </div>
          </main>
        </div>
      </div>
    </PremiumShell>
  );
};

export default Docs;
