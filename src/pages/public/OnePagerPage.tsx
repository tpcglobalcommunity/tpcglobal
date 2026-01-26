import { useI18n } from "@/i18n";
import { Download, ArrowRight, FileText, Shield } from "lucide-react";
import { PremiumShell, PremiumCard, PremiumButton, NoticeBox } from "@/components/ui";

export default function OnePagerPage({ lang }: { lang: string }) {
  const { t } = useI18n();

  const generateMD = () => {
    const content = `# ${t("onePager.title")}

${t("onePager.subtitle")}

---

## ${t("onePager.whatItIs")}

${t("onePager.whatItIs")}

---

## ${t("onePager.whatWePublish")}

- ${t("onePager.publish1")}
- ${t("onePager.publish2")}
- ${t("onePager.publish3")}
- ${t("onePager.publish4")}
- ${t("onePager.publish5")}

---

## ${t("onePager.whatWeNotPublish")}

- ${t("onePager.notPublish1")}
- ${t("onePager.notPublish2")}

---

## ${t("onePager.howVerificationWorks")}

- ${t("onePager.verification1")}
- ${t("onePager.verification2")}
- ${t("onePager.verification3")}
- ${t("onePager.verification4")}

---

## ${t("onePager.accessSecurity")}

- ${t("onePager.access1")}
- ${t("onePager.access2")}
- ${t("onePager.access3")}

---

## ${t("onePager.publicEndpoints")}

- ${t("onePager.endpoint1")}
- ${t("onePager.endpoint2")}

---

## ${t("onePager.disclaimer")}

${t("onePager.disclaimer")}

---

## ${t("onePager.cta")}

[${t("onePager.cta")}](/${lang}/transparency)
`;

    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transparency-one-pager.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generatePDF = () => {
    // Simple HTML to PDF conversion using window.print
    const printContent = `
      <html>
        <head>
          <title>${t("onePager.title")}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; color: #333; }
            h1 { color: #F0B90B; border-bottom: 2px solid #F0B90B; padding-bottom: 10px; }
            h2 { color: #333; margin-top: 30px; }
            ul { margin: 10px 0; }
            li { margin: 5px 0; }
            .disclaimer { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .cta { background: #F0B90B; color: #000; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }
          </style>
        </head>
        <body>
          <h1>${t("onePager.title")}</h1>
          <p><em>${t("onePager.subtitle")}</em></p>
          
          <h2>${t("onePager.whatItIs")}</h2>
          <p>${t("onePager.whatItIs")}</p>
          
          <h2>${t("onePager.whatWePublish")}</h2>
          <ul>
            <li>${t("onePager.publish1")}</li>
            <li>${t("onePager.publish2")}</li>
            <li>${t("onePager.publish3")}</li>
            <li>${t("onePager.publish4")}</li>
            <li>${t("onePager.publish5")}</li>
          </ul>
          
          <h2>${t("onePager.whatWeNotPublish")}</h2>
          <ul>
            <li>${t("onePager.notPublish1")}</li>
            <li>${t("onePager.notPublish2")}</li>
          </ul>
          
          <h2>${t("onePager.howVerificationWorks")}</h2>
          <ul>
            <li>${t("onePager.verification1")}</li>
            <li>${t("onePager.verification2")}</li>
            <li>${t("onePager.verification3")}</li>
            <li>${t("onePager.verification4")}</li>
          </ul>
          
          <h2>${t("onePager.accessSecurity")}</h2>
          <ul>
            <li>${t("onePager.access1")}</li>
            <li>${t("onePager.access2")}</li>
            <li>${t("onePager.access3")}</li>
          </ul>
          
          <h2>${t("onePager.publicEndpoints")}</h2>
          <ul>
            <li>${t("onePager.endpoint1")}</li>
            <li>${t("onePager.endpoint2")}</li>
          </ul>
          
          <div class="disclaimer">
            <strong>${t("onePager.disclaimer")}</strong>
          </div>
          
          <a href="${window.location.origin}/${lang}/transparency" class="cta">${t("onePager.cta")}</a>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  return (
    <PremiumShell>
      <div className="max-w-4xl mx-auto">
        {/* Header with Shield */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-[#F0B90B]" />
            <span className="text-sm font-semibold text-[#F0B90B] bg-[#F0B90B]/10 px-3 py-1 rounded-full">
              Public Audit Verified
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            {t("onePager.title")}
          </h1>
          <p className="text-xl text-[#F0B90B] font-medium">
            {t("onePager.subtitle")}
          </p>
        </div>

        {/* Main Content Card */}
        <PremiumCard>
          <div className="p-8">
            {/* What it is */}
            <div className="mb-10">
              <h2 className="text-2xl font-semibold text-white mb-4">
                {t("onePager.whatItIs")}
              </h2>
              <p className="text-white/80 leading-relaxed text-lg">
                {t("onePager.whatItIs")}
              </p>
            </div>

            {/* What we publish */}
            <div className="mb-10">
              <h3 className="text-xl font-semibold text-white mb-6">
                {t("onePager.whatWePublish")}
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  t("onePager.publish1"),
                  t("onePager.publish2"),
                  t("onePager.publish3"),
                  t("onePager.publish4"),
                  t("onePager.publish5"),
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-white/80">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* What we do NOT publish */}
            <div className="mb-10">
              <h3 className="text-xl font-semibold text-white mb-6">
                {t("onePager.whatWeNotPublish")}
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  t("onePager.notPublish1"),
                  t("onePager.notPublish2"),
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-rose-400 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-white/80">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* How verification works */}
            <div className="mb-10">
              <h3 className="text-xl font-semibold text-white mb-6">
                {t("onePager.howVerificationWorks")}
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  t("onePager.verification1"),
                  t("onePager.verification2"),
                  t("onePager.verification3"),
                  t("onePager.verification4"),
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-white/80">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Access & security */}
            <div className="mb-10">
              <h3 className="text-xl font-semibold text-white mb-6">
                {t("onePager.accessSecurity")}
              </h3>
              <div className="grid md:grid-cols-1 gap-4">
                {[
                  t("onePager.access1"),
                  t("onePager.access2"),
                  t("onePager.access3"),
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-white/80">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Public endpoints */}
            <div className="mb-10">
              <h3 className="text-xl font-semibold text-white mb-6">
                {t("onePager.publicEndpoints")}
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  t("onePager.endpoint1"),
                  t("onePager.endpoint2"),
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-white/80">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <NoticeBox variant="warning" className="mb-10">
              <p className="text-white/90 font-medium">
                {t("onePager.disclaimer")}
              </p>
            </NoticeBox>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <PremiumButton
                onClick={() => window.location.href = `/${lang}/transparency`}
                className="flex items-center gap-2"
              >
                {t("onePager.cta")}
                <ArrowRight className="w-4 h-4" />
              </PremiumButton>
              
              <PremiumButton
                variant="secondary"
                onClick={generatePDF}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </PremiumButton>
              
              <PremiumButton
                variant="secondary"
                onClick={generateMD}
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Download MD
              </PremiumButton>
            </div>
          </div>
        </PremiumCard>

        {/* Additional Information */}
        <div className="mt-12 text-center">
          <p className="text-white/60 text-sm">
            Professional one-page summary of our transparency system for partners, media, and community members.
          </p>
        </div>
      </div>
    </PremiumShell>
  );
}
