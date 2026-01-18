import { BookOpen, Target, Coins, Map, HelpCircle } from 'lucide-react';
import { Language, useTranslations } from '../i18n';
import { PremiumShell, PremiumSection, PremiumCard, Accordion, AccordionItem } from '../components/ui';

interface DocsProps {
  lang: Language;
}

const Docs = ({ lang }: DocsProps) => {
  const t = useTranslations(lang);

  return (
    <PremiumShell>
      <PremiumSection
        title={t.docs.title}
        subtitle={t.docs.subtitle}
        centered
      >
        <div className="max-w-5xl mx-auto space-y-8">
          <PremiumCard>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#F0B90B] to-[#C29409] rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-black" />
              </div>
              <h2 className="text-2xl font-semibold text-white mt-2">
                {t.docs.whatIsTPC}
              </h2>
            </div>
            <p className="text-white/75 text-base leading-relaxed max-w-[70ch]">
              {t.docs.whatIsTPCContent}
            </p>
          </PremiumCard>

          <PremiumCard>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#F0B90B] to-[#C29409] rounded-lg flex items-center justify-center flex-shrink-0">
                <Target className="w-6 h-6 text-black" />
              </div>
              <h2 className="text-2xl font-semibold text-white mt-2">
                {t.docs.howItWorks}
              </h2>
            </div>
            <p className="text-white/75 text-base leading-relaxed max-w-[70ch]">
              {t.docs.howItWorksContent}
            </p>
          </PremiumCard>

          <PremiumCard>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#F0B90B] to-[#C29409] rounded-lg flex items-center justify-center flex-shrink-0">
                <Coins className="w-6 h-6 text-black" />
              </div>
              <h2 className="text-2xl font-semibold text-white mt-2">
                {t.docs.tokenUtility}
              </h2>
            </div>
            <p className="text-white/75 text-base leading-relaxed max-w-[70ch]">
              {t.docs.tokenUtilityContent}
            </p>
          </PremiumCard>
        </div>
      </PremiumSection>

      <PremiumSection>
        <div className="flex items-center gap-3 mb-8">
          <Map className="w-6 h-6 text-[#F0B90B]" />
          <h2 className="text-2xl md:text-3xl font-semibold text-white">
            {t.docs.roadmap}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {['Q1', 'Q2', 'Q3', 'Q4'].map((quarter, index) => (
            <PremiumCard key={quarter}>
              <div className="text-[#F0B90B] font-semibold text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-[#F0B90B] rounded-full"></span>
                Phase {index + 1}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {t.docs[`roadmap${quarter}`]}
              </h3>
              <p className="text-white/75 text-sm leading-relaxed">
                {t.docs[`roadmap${quarter}Content`]}
              </p>
            </PremiumCard>
          ))}
        </div>
      </PremiumSection>

      <PremiumSection>
        <div className="flex items-center gap-3 mb-8">
          <HelpCircle className="w-6 h-6 text-[#F0B90B]" />
          <h2 className="text-2xl md:text-3xl font-semibold text-white">
            {t.docs.faq}
          </h2>
        </div>
        <Accordion>
          {[1, 2, 3, 4].map((num) => (
            <AccordionItem
              key={num}
              title={t.docs[`faqQ${num}`]}
              defaultOpen={num === 1}
            >
              {t.docs[`faqA${num}`]}
            </AccordionItem>
          ))}
        </Accordion>
      </PremiumSection>
    </PremiumShell>
  );
};

export default Docs;
