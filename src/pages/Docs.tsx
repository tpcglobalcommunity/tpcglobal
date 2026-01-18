import { BookOpen, Target, Coins, HelpCircle, AlertCircle } from 'lucide-react';
import { Language, useTranslations } from '../i18n';
import { PremiumShell, PremiumSection, PremiumCard, Accordion, AccordionItem, NoticeBox } from '../components/ui';

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
          <HelpCircle className="w-6 h-6 text-[#F0B90B]" />
          <h2 className="text-2xl md:text-3xl font-semibold text-white">
            {t.docs.faq}
          </h2>
        </div>
        <Accordion>
          {[1, 2].map((num) => (
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

      <PremiumSection variant="tight">
        <NoticeBox
          variant="info"
          icon={<AlertCircle />}
        >
          {t.docs.disclaimer}
        </NoticeBox>
      </PremiumSection>
    </PremiumShell>
  );
};

export default Docs;
