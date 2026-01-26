import { useI18n } from "@/i18n";
import { ShieldCheck, Download, ArrowRight } from "lucide-react";
import { PremiumShell, PremiumCard, PremiumButton, NoticeBox } from "@/components/ui";

export default function PressKitPage({ lang }: { lang: string }) {
  const { t } = useI18n();

  const generatePressKitMD = () => {
    const content = `# Press Kit - Public Transparency System

## English Version

### Headline & Tagline
**Headline:** ${t("press.headline")}  
**Tagline:** ${t("press.tagline")}

### Short Description
${t("press.description")}

### Key Features
- ${t("press.feature1")}
- ${t("press.feature2")}
- ${t("press.feature3")}
- ${t("press.feature4")}
- ${t("press.feature5")}

### Disclaimer
${t("press.disclaimer")}

### Call to Action
${t("press.viewTransparency")}

---

## Indonesian Version

### Judul & Tagline
**Judul:** ${t("press.headlineID")}  
**Tagline:** ${t("press.taglineID")}

### Deskripsi Singkat
${t("press.descriptionID")}

### Fitur Utama
- ${t("press.feature1ID")}
- ${t("press.feature2ID")}
- ${t("press.feature3ID")}
- ${t("press.feature4ID")}
- ${t("press.feature5ID")}

### Disclaimer
${t("press.disclaimerID")}

### Call to Action
${t("press.viewTransparencyID")}

---

## Quick Copy & Paste

### English Press Release Snippet
\`\`\`
${t("press.headline")}

${t("press.tagline")}

${t("press.description")}

${t("press.viewTransparency")}: [link]
\`\`\`

### Indonesian Press Release Snippet
\`\`\`
${t("press.headlineID")}

${t("press.taglineID")}

${t("press.descriptionID")}

${t("press.viewTransparencyID")}: [link]
\`\`\`
`;

    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "press-kit.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <PremiumShell>
      <div className="max-w-4xl mx-auto">
        {/* Header with Badge */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <ShieldCheck className="w-6 h-6 text-[#F0B90B]" />
            <span className="text-sm font-semibold text-[#F0B90B] bg-[#F0B90B]/10 px-3 py-1 rounded-full">
              Public Audit Verified
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            {t("press.title")}
          </h1>
          <p className="text-lg text-white/60">
            {t("press.subtitle")}
          </p>
        </div>

        {/* Main Content Card */}
        <PremiumCard>
          <div className="p-8">
            {/* Headline & Tagline */}
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white mb-3">
                {t("press.headline")}
              </h2>
              <p className="text-xl text-[#F0B90B] font-medium">
                {t("press.tagline")}
              </p>
            </div>

            {/* Short Description */}
            <div className="mb-10">
              <p className="text-white/80 leading-relaxed text-lg">
                {t("press.description")}
              </p>
            </div>

            {/* Key Features */}
            <div className="mb-10">
              <h3 className="text-xl font-semibold text-white mb-6">
                {t("press.keyFeatures")}
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  t("press.feature1"),
                  t("press.feature2"),
                  t("press.feature3"),
                  t("press.feature4"),
                  t("press.feature5"),
                ].map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-[#F0B90B] rounded-full mt-2 flex-shrink-0" />
                    <span className="text-white/80">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <NoticeBox variant="warning" className="mb-10">
              <p className="text-white/90">
                {t("press.disclaimer")}
              </p>
            </NoticeBox>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <PremiumButton
                onClick={() => window.location.href = `/${lang}/transparency`}
                className="flex items-center gap-2"
              >
                {t("press.viewTransparency")}
                <ArrowRight className="w-4 h-4" />
              </PremiumButton>
              
              <PremiumButton
                variant="secondary"
                onClick={generatePressKitMD}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                {t("press.downloadKit")}
              </PremiumButton>
            </div>
          </div>
        </PremiumCard>

        {/* Additional Information */}
        <div className="mt-12 text-center">
          <p className="text-white/60 text-sm">
            For media inquiries and additional information, please refer to our transparency page for the most current data and verification records.
          </p>
        </div>
      </div>
    </PremiumShell>
  );
}
