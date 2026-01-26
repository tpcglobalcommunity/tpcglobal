export type Language = "en" | "id";

type TrustCard = { title: string; desc: string; cta: string };
type HomeObject = {
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  disclaimer: {
    text: string;
  };
  trust: {
    title: string;
    cards: TrustCard[];
  };
};

type TranslationValue = string | HomeObject | TrustCard[];

// Helper function for deep merge
function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] !== undefined) {
      if (
        typeof source[key] === 'object' && 
        source[key] !== null && 
        !Array.isArray(source[key]) &&
        typeof result[key] === 'object' && 
        result[key] !== null && 
        !Array.isArray(result[key])
      ) {
        result[key] = deepMerge(result[key], source[key] as any);
      } else {
        result[key] = source[key] as any;
      }
    }
  }
  
  return result;
}

export const translations: Record<Language, Record<string, TranslationValue>> = {
  en: {
    "app.name": "Trader Professional Community",
    "app.loading": "Loading...",
    "app.error": "Something went wrong",

    "auth.signin.title": "Sign In",
    "auth.signup.title": "Create Account",
    "auth.email": "Email address",
    "auth.password": "Password",
    "auth.submit": "Continue",
    "auth.logout": "Logout",

    "auth.signUp.title": "Create Account",
    "auth.signUp.subtitle": "Join TPC Global - Professional Trading Community",
    "auth.signUp.fullNameLabel": "Full Name",
    "auth.signUp.emailLabel": "Email Address",
    "auth.signUp.passwordLabel": "Password",
    "auth.signUp.confirmPasswordLabel": "Confirm Password",
    "auth.signUp.referralCodeLabel": "Referral Code (Optional)",
    "auth.signUp.submit": "Create Account",
    "auth.signUp.submitting": "Creating Account...",
    "auth.signUp.haveAccount": "Already have an account?",
    "auth.signUp.signInLink": "Sign In",
    "auth.signUp.errorGeneric": "Registration failed. Please try again.",
    "auth.signUp.errorPasswordMismatch": "Passwords do not match",
    "auth.signUp.errorPasswordShort": "Password must be at least 8 characters",
    "auth.signUp.errorNameShort": "Name must be at least 2 characters",
    "auth.signUp.errorEmailInvalid": "Please enter a valid email address",
    "auth.signUp.success": "Account created successfully!",
    "auth.signUp.checkEmail": "Please check your email to verify your account.",

    "auth.checkEmail.title": "Check Your Email",
    "auth.checkEmail.subtitle": "We've sent a verification link to your email address",
    "auth.checkEmail.body": "Click the link in the email to complete your registration. If you don't see the email, check your spam folder.",
    "auth.checkEmail.backToSignIn": "Back to Sign In",
    "auth.checkEmail.resend": "Resend Email",
    "auth.checkEmail.resending": "Resending...",
    "auth.checkEmail.resendSuccess": "Email sent successfully!",
    "auth.checkEmail.resendError": "Failed to resend email. Please try again.",

    "signup.title": "Join TPC",
    "signup.subtitle": "Professional trading community",
    "signup.referral": "Referral Code",
    "signup.submit": "Create Account",

    "faq.title": "Frequently Asked Questions",
    "faq.subtitle": "Transparent answers about TPC Token and the Trader Professional Community ecosystem.",
    "faq.disclaimer": "TPC Token is a utility token, not an investment instrument. Participation is done consciously and responsibly.",
    "faq.backToHome": "Back to Home",
    "faq.viewDocs": "View Docs",
    "faq.joinCommunity": "Join Community",

    "faq.items": {
      "what-is-tpc": {
        "question": "What is TPC?",
        "answer": "TPC (Trader Professional Community) is a global community built for disciplined traders. We focus on education-first, risk-aware growth, and transparent operations without promising guaranteed profits."
      },
      "what-is-tpc-token": {
        "question": "What is TPC Token?",
        "answer": "TPC Token is a utility token that serves as access and participation rights within the TPC ecosystem. It is not designed as an investment instrument."
      },
      "why-tpc-sells-token": {
        "question": "Why does TPC sell tokens?",
        "answer": "Token sales fund community development, platform maintenance, educational content creation, and ecosystem growth initiatives. All fund usage is transparently reported."
      },
      "does-tpc-promise-profit": {
        "question": "Does TPC promise profit?",
        "answer": "No. TPC does not promise or guarantee any profits. We provide education, tools, and community support. Trading always involves risks, and members participate at their own risk."
      },
      "tpc-token-usage": {
        "question": "What is TPC Token used for?",
        "answer": "TPC Token provides access to premium educational content, community features, platform utilities, and participation rights in governance decisions within the ecosystem."
      },
      "token-value-source": {
        "question": "Where does TPC Token value come from?",
        "answer": "Token value derives from utility within the ecosystem, community adoption, and platform usage. Value is not guaranteed and fluctuates based on market dynamics and ecosystem growth."
      },
      "is-tpc-safe": {
        "question": "Is TPC safe?",
        "answer": "TPC implements security best practices including role-based access, audit trails, and transparent operations. However, like any trading-related activity, risks exist and members should participate responsibly."
      },
      "is-tpc-mlm": {
        "question": "Is TPC an MLM scheme?",
        "answer": "No. TPC is an educational community, not a multi-level marketing scheme. We focus on trading education and community growth, not recruitment-based compensation structures."
      },
      "token-circulation": {
        "question": "Are all TPC tokens immediately in circulation?",
        "answer": "No. Token distribution follows a structured schedule with vesting periods and gradual release to maintain ecosystem stability and prevent market manipulation."
      },
      "must-buy-token": {
        "question": "Do I have to buy tokens to join TPC?",
        "answer": "No. Basic community membership and educational content are accessible without token purchase. Tokens provide enhanced access and utilities within the ecosystem."
      },
      "who-should-join": {
        "question": "Who should join TPC?",
        "answer": "TPC is suitable for disciplined traders who value education, risk management, and transparent operations. Ideal for those seeking community support without unrealistic profit expectations."
      },
      "long-term-vision": {
        "question": "What is TPC's long-term vision?",
        "answer": "To build the most trusted trader education community with transparent operations, quality educational resources, and sustainable ecosystem growth based on real utility value."
      }
    },

    "system.maintenance.title": "Maintenance Mode",
    "system.maintenance.subtitle": "We are upgrading the system to serve you better.",

    "home": {
      "hero": {
        "badge": "TPC • Trader Professional Community",
        "title": "Stop Guessing. Start Trading.",
        "subtitle": "A premium global community built for disciplined traders — education, tools, and transparent growth.",
        "ctaPrimary": "Join as Member",
        "ctaSecondary": "Explore Docs"
      },
      "disclaimer": {
        "text": "Trading involves risk. TPC provides education and tools — not financial advice or guaranteed profit."
      },
      "trust": {
        "title": "Built with transparency & accountability",
        "cards": [
          {
            title: "Proof of Transparency",
            desc: "Track treasury movements, buyback & burn reports, and public disclosures in real time.",
            cta: "View Transparency"
          },
          {
            title: "Security by Design",
            desc: "Role-based access, audit logs, and strict separation between member, admin, and system roles.",
            cta: "Explore Security"
          },
          {
            title: "Community-Governed Growth",
            desc: "Programs, funds, and ecosystem decisions are designed with long-term community alignment.",
            cta: "Learn About DAO"
          }
        ]
      }
    },

    "nav.home": "Home",
    "nav.docs": "Docs",
    "nav.dao": "DAO Lite",
    "nav.transparency": "Transparency",
    "nav.admin": "Admin",
    "nav.legal": "Legal",
    "nav.fund": "Fund",
    "nav.marketplace": "Marketplace",

    "common.learnMore": "Learn more",

    "member.dashboard.refNone": "No referral",
    "member.dashboard.createdAt": "Joined",
    
    // Admin Vendors
    "admin.vendors.title": "Vendor Applications",
    "admin.vendors.subtitle": "Review and manage vendor applications",
    "admin.vendors.filter.all": "All",
    "admin.vendors.filter.pending": "Pending",
    "admin.vendors.filter.approved": "Approved",
    "admin.vendors.filter.rejected": "Rejected",
    "admin.vendors.searchPlaceholder": "Search by name, email, or user ID...",
    "admin.vendors.empty": "No applications found",
    "admin.vendors.noSearchResults": "No applications match your search criteria",
    "admin.vendors.noApplications": "No vendor applications have been submitted yet",
    "admin.vendors.noFilterResults": "No {status} applications found",
    "admin.vendors.description": "Description",
    "admin.vendors.viewDetails": "View Details",
    "admin.vendors.processing": "Processing...",
    "admin.vendors.approve": "Approve",
    "admin.vendors.reject": "Reject",
    "admin.vendors.applicationDetails": "Application Details",
    "admin.vendors.basicInfo": "Basic Information",
    "admin.vendors.brandName": "Brand Name",
    "admin.vendors.status": "Status",
    "admin.vendors.userId": "User ID",
    "admin.vendors.appliedDate": "Applied Date",
    "admin.vendors.category": "Category",
    "admin.vendors.contactInfo": "Contact Information",
    "admin.vendors.email": "Email",
    "admin.vendors.whatsapp": "WhatsApp",
    "admin.vendors.website": "Website",
    "admin.vendors.adminNote": "Admin Note",
    "admin.vendors.adminNotePlaceholder": "Add notes about this application...",
    
    // Admin Members
    "admin.members.title": "Members Management",
    "admin.members.subtitle": "Manage and monitor all member accounts",
    "admin.members.filter.all": "All",
    "admin.members.filter.verified": "Verified",
    "admin.members.filter.unverified": "Unverified",
    "admin.members.searchPlaceholder": "Search by name, email, or user ID...",
    "admin.members.empty": "No members found",
    "admin.members.noSearchResults": "No members match your search criteria",
    "admin.members.noMembers": "No members found",
    "admin.members.noFilterResults": "No {filter} members found",
    "admin.members.action.view": "View",
    "admin.members.action.verify": "Verify",
    "admin.members.action.unverify": "Unverify",
    "admin.members.processing": "Processing...",
    "admin.members.memberDetails": "Member Details",
    "admin.members.basicInfo": "Basic Information",
    "admin.members.name": "Name",
    "admin.members.email": "Email",
    "admin.members.userId": "User ID",
    "admin.members.username": "Username",
    "admin.members.role": "Role",
    "admin.members.verified": "Verified",
    "admin.members.joinedDate": "Joined Date",
    "admin.members.referralCode": "Referral Code",
    "admin.members.additionalInfo": "Additional Information",
    "admin.members.phone": "Phone",
    "admin.members.telegram": "Telegram",
    "admin.members.city": "City",
    "admin.members.tier": "TPC Tier",
    
    // Admin Marketplace
    "admin.marketplace.title": "Marketplace Management",
    "admin.marketplace.subtitle": "Manage marketplace listings and vendors",
    "admin.marketplace.filter.all": "All",
    "admin.marketplace.filter.published": "Published",
    "admin.marketplace.filter.draft": "Draft",
    "admin.marketplace.filter.archived": "Archived",
    "admin.marketplace.searchPlaceholder": "Search by title, slug, category, or ID...",
    "admin.marketplace.empty": "No items found",
    "admin.marketplace.noSearchResults": "No items match your search criteria",
    "admin.marketplace.noItems": "No marketplace items found",
    "admin.marketplace.noFilterResults": "No {filter} items found",
    "admin.marketplace.action.view": "View",
    "admin.marketplace.action.edit": "Edit",
    "admin.marketplace.action.publish": "Publish",
    "admin.marketplace.action.unpublish": "Unpublish",
    "admin.marketplace.action.feature": "Feature",
    "admin.marketplace.action.unfeature": "Unfeature",
    "admin.marketplace.processing": "Processing...",
    "admin.marketplace.editItem": "Edit Item",
    "admin.marketplace.itemDetails": "Item Details",
    "admin.marketplace.basicInfo": "Basic Information",
    "admin.marketplace.itemTitle": "Title",
    "admin.marketplace.slug": "Slug",
    "admin.marketplace.category": "Category",
    "admin.marketplace.price": "Price",
    "admin.marketplace.description": "Description",
    "admin.marketplace.vendor": "Vendor",
    "admin.marketplace.status": "Status",
    "admin.marketplace.createdDate": "Created Date",
    "admin.marketplace.tags": "Tags",
    "admin.marketplace.saving": "Saving...",
    "admin.marketplace.save": "Save",
    "admin.marketplace.cancel": "Cancel",
    "footer.madeWith": "Made with",
    "footer.builtWith": "Built with transparency & trust",
    "footer.privacy": "Privacy Policy",
    "footer.terms": "Terms of Service",
    "footer.cookies": "Cookie Policy",
    "footer.disclaimer": "Disclaimer",
    "footer.rights": "All rights reserved",
    "footer.riskNotice": "Trading involves risk. TPC provides education and tools — not financial advice or guaranteed profit.",
    "footer.quickLinks": "Quick Links",
    "footer.tagline": "A professional trading community built on education, discipline, and transparency.",
    "footer.brand": "Trader Professional Community",
    "legal.common.lastUpdated": "Last updated",
    "legal.common.contact": "Contact",
    "legal.common.back": "Back",
    "legal.common.overview": "Overview",
    "legal.common.definitions": "Definitions",
    "legal.common.scope": "Scope",
    "legal.common.changes": "Changes to this policy",
    "legal.common.questions": "Questions",
    "legal.privacy.title": "Privacy Policy",
    "legal.privacy.subtitle": "How TPC collects, uses, and protects your personal information.",
    "legal.privacy.intro": "We respect your privacy. This policy explains what data we collect, why we collect it, and the choices you have.",
    "legal.privacy.whatWeCollectTitle": "Information we collect",
    "legal.privacy.howWeUseTitle": "How we use information",
    "legal.privacy.sharingTitle": "Sharing and disclosure",
    "legal.privacy.sharing": "We do not sell your personal data. We may share limited data with service providers strictly to operate the platform, comply with law, or protect rights and safety.",
    "legal.privacy.retentionTitle": "Data retention",
    "legal.privacy.retention": "We retain data only as long as necessary for legitimate business purposes and legal obligations.",
    "legal.privacy.securityTitle": "Security",
    "legal.privacy.security": "We use reasonable administrative, technical, and organizational measures to protect data. No method of transmission or storage is 100% secure.",
    "legal.privacy.yourRightsTitle": "Your choices",
    "legal.terms.title": "Terms of Service",
    "legal.terms.subtitle": "Rules for using TPC and our services.",
    "legal.terms.intro": "By accessing or using TPC, you agree to these Terms. If you do not agree, do not use the services.",
    "legal.terms.eligibilityTitle": "Eligibility",
    "legal.terms.eligibility": "You must be legally able to enter into a binding agreement and comply with applicable laws.",
    "legal.terms.accountTitle": "Account responsibilities",
    "legal.terms.prohibitedTitle": "Prohibited activities",
    "legal.terms.contentTitle": "Content and intellectual property",
    "legal.terms.content": "TPC content, branding, and materials are protected. You may not copy, redistribute, or exploit without permission.",
    "legal.terms.terminationTitle": "Termination",
    "legal.terms.termination": "We may suspend or terminate access for violations, security reasons, or legal compliance.",
    "legal.terms.liabilityTitle": "Limitation of liability",
    "legal.terms.liability": "TPC is provided 'as is'. To the maximum extent permitted by law, we are not liable for indirect, incidental, or consequential damages.",
    "legal.terms.governingTitle": "Governing law",
    "legal.terms.governing": "These Terms are governed by applicable laws in our operating jurisdiction, unless otherwise required.",
    "legal.cookies.title": "Cookie Policy",
    "legal.cookies.subtitle": "How we use cookies and similar technologies.",
    "legal.cookies.intro": "We use cookies to operate the site, enhance your experience, and understand usage.",
    "legal.cookies.typesTitle": "Types of cookies we use",
    "legal.cookies.controlTitle": "Your controls",
    "legal.cookies.control": "You can manage cookies via your browser settings. Disabling essential cookies may impact functionality.",
    "legal.disclaimer.title": "Disclaimer",
    "legal.disclaimer.subtitle": "Important notice about education, risk, and responsibility.",
    "legal.disclaimer.intro": "TPC provides educational content and tools for traders. We do not provide personalized financial advice.",
    "legal.disclaimer.noAdviceTitle": "No financial advice",
    "legal.disclaimer.noAdvice": "Nothing on TPC should be interpreted as investment, legal, or tax advice. You are responsible for your decisions.",
    "legal.disclaimer.riskTitle": "Risk disclosure",
    "legal.disclaimer.risk": "Trading involves significant risk and may result in loss. Past performance does not guarantee future results.",
    "legal.disclaimer.responsibilityTitle": "Your responsibility",
    "legal.disclaimer.responsibility": "You should do your own research and consult qualified professionals before making financial decisions.",
    "docs.title": "Documentation",
    "docs.subtitle": "Learn how TPC works, our principles, and how to get started.",
    "docs.menu.whatIsTPC": "What is TPC",
    "docs.whatIsTPC": "What is TPC?",
    "docs.whatIsTPCContent": "TPC (Trader Professional Community) is an education-based community built to support traders through collaboration, knowledge sharing, and transparency.",
    "docs.menu.howItWorks": "How it Works",
    "docs.howItWorks": "How It Works",
    "docs.howItWorksContent": "TPC operates as an open community that prioritizes education and member participation. Governance features will be implemented gradually based on technical readiness and community decisions.",
    "docs.menu.tokenUtility": "Token Utility",
    "docs.tokenUtility": "Token Utility",
    "docs.tokenUtilityContent": "The TPC Token is designed as a utility and community governance token. It is not an investment, not a financial instrument, and does not promise any profits or returns.",
    "docs.menu.faq": "FAQ",
    "docs.faq": "Frequently Asked Questions",
    "docs.faq.title": "Frequently Asked Questions",
    "docs.faq.content": "This section answers common questions about membership, tokens, risk, and platform usage.",
    "docs.faqQ1": "Is the TPC Token an investment?",
    "docs.faqQ1.title": "Is the TPC Token an investment?",
    "docs.faqQ1.content": "No. The TPC Token is a utility and governance token only. It is not an investment or financial product and offers no guarantee of profit.",
    "docs.faqA1": "No. The TPC Token is a utility and governance token only. It is not an investment or financial product and offers no guarantee of profit.",
    "docs.faqA1.title": "TPC Token is not an investment",
    "docs.faqA1.content": "No. The TPC Token is a utility and governance token only. It is not an investment or financial product and offers no guarantee of profit.",
    "docs.faqQ2": "How can I participate in governance?",
    "docs.faqQ2.title": "Governance participation",
    "docs.faqQ2.content": "Participation in governance will be possible once DAO Lite features are activated and made available to the community.",
    "docs.faqA2": "Participation in governance will be possible once DAO Lite features are activated and made available to the community.",
    "docs.faqA2.title": "DAO Lite features for governance",
    "docs.faqA2.content": "Participation in governance will be possible once DAO Lite features are activated and made available to the community.",
    "docs.faq2": "More Questions?",
    "docs.faq2.title": "More Questions?",
    "docs.faq2.content": "If you have additional questions about TPC, membership, tokens, or risk, please reach out to our community or consult the documentation sections above.",
    "docs.whatIsTPC.title": "What is TPC?",
    "docs.whatIsTPC.content": "TPC (Trader Professional Community) is a premium global community built for disciplined traders. We focus on education, tools, transparency, and long-term growth rather than speculation or hype.",
    "docs.howItWorks.title": "How TPC Works",
    "docs.howItWorks.content": "Members join TPC to access structured education, professional tools, and a transparent ecosystem. Growth is driven by skills, discipline, and community collaboration.",
    "docs.tokenUtility.title": "Token Utility",
    "docs.tokenUtility.content": "The TPC token is used for membership access, governance participation, ecosystem incentives, and long-term alignment between the platform and its members.",
    "docs.disclaimer": "All information on this website is for educational and community purposes only. TPC is not a financial advisor or investment platform.",
    "transparency.title": "Transparency",
    "transparency.subtitle": "Open, verifiable, and accountable ecosystem",
    "transparency.intro": "Transparency is a core principle of TPC. We openly share how funds, wallets, and governance structures operate.",
    "transparency.hero": {
      "title": "Transparency & Public Accountability",
      "subtitle": "All core wallets and ecosystem activities are published for public verification."
    },
    "transparency.live": {
      "title": "Live Transparency",
      "desc": "All community funds and transactions are publicly verifiable on-chain."
    },
    "transparency.sections.officialWallets": "Official Wallets",
    "transparency.wallets": {
      "items": "Sample wallet data will be displayed here"
    },
    "transparency.revenue": {
      "title": "Revenue Policy",
      "youtube": "YouTube Revenue Split",
      "community": "Revenue to Community"
    },
    "transparency.policy": {
      "youtube": "Sample policy data will be displayed here"
    },
    "transparency.revenueDesc": "All revenue goes back to community members and development.",
    "transparency.updates": {
      "title": "Recent Updates"
    },
    "transparency.cta": {
      "title": "Join Our Community",
      "subtitle": "Be part of a transparent and education-first trading community.",
      "docs": "Read Documentation",
      "join": "Join Community"
    },
    "transparency.walletAction": "View on Explorer",
    "transparency.sections.officialWallets.title": "Official Wallets",
    "transparency.sections.officialWallets.desc": "List of official TPC wallets used for treasury, operations, and on-chain activities.",
    "transparency.sections.officialWallets.description": "These wallets are used for operational, treasury, and ecosystem purposes. Addresses are published for public verification.",
    "transparency.sections.distribution.title": "Distributions & Batches",
    "transparency.sections.distribution.desc": "Records of fund distributions and processed transaction batches.",
    "transparency.sections.fundFlow.title": "Fund Flow",
    "transparency.sections.fundFlow.description": "All major fund movements follow predefined rules and are recorded for accountability.",
    "transparency.sections.governance.title": "Governance",
    "transparency.sections.governance.description": "Key decisions are guided by transparent governance processes and long-term community alignment.",
    "transparency.sections.reporting.title": "Reporting",
    "transparency.sections.reporting.description": "Regular reports provide visibility into treasury status, ecosystem growth, and platform sustainability.",
    "transparency.sections.updates.title": "Transparency Updates",
    "transparency.sections.updates.desc": "Latest activities including buybacks, burns, liquidity, and operations.",
    "transparency.notice": "Wallet addresses and records are provided for transparency and audit purposes only.",
    "dao.title": "DAO Lite",
    "dao.subtitle": "A lightweight governance model for the TPC community",
    "dao.notice": "DAO Lite is currently in an early phase. Features will be released gradually to ensure security and governance quality.",
    "dao.whatIsDAOLite": "What is DAO Lite?",
    "dao.whatIsDAOLiteContent": "DAO Lite is a simplified governance system that allows community members to participate in proposals, voting, and oversight without complex on-chain mechanisms.",
    "dao.howToParticipate": "How to Participate",
    "dao.step1": "Proposal Submission",
    "dao.step2": "Community Discussion", 
    "dao.step3": "Voting Period",
    "dao.step4": "Implementation",
    "dao.rules": "Governance Rules",
    "dao.rule1": "Participation is based on community responsibility.",
    "dao.rule2": "All proposals must align with TPC's educational values.",
    "dao.rule3": "Voting is transparent and auditable by the community.",
    "dao.rule4": "DAO Lite does not guarantee financial returns.",
    "footer.links.home": "Home",
    "footer.links.community": "Community",
    "footer.links.docs": "Documentation",
    "footer.links.dao": "DAO Lite",
    "footer.links.transparency": "Transparency",
    "footer.links.telegram": "Telegram",
    "footer.links.twitter": "X (Twitter)",
    "footer.links.youtube": "YouTube",
    "footer.links.support": "Support",

    // Community Fund
    "fund.title": "Community Development Support",
    "fund.description": "Community members may voluntarily contribute to support the development of the TPC ecosystem.",
    "fund.usage.title": "Use of Contributions",
    "fund.usage.items": "Educational content development, Platform maintenance and improvements, Community events and initiatives, Research and development",
    "fund.notice.title": "Important Notice",
    "fund.notice.content": "This program is NOT an investment. Contributions are voluntary, non-refundable, and do not grant ownership, profit rights, or financial returns. There are no guarantees of any kind.",
    "fund.progress.title": "Current Progress",
    "fund.progress.note": "Progress data is sample only and will be updated after the official launch.",

    // News
    "news.detail.notFound": "Article not found",
    "news.detail.notFoundDesc": "The article you're looking for doesn't exist or has been removed.",
    "news.detail.back": "Back to News",
    "news.detail.ctaTitle": "Stay Updated",
    "news.detail.ctaDesc": "Get the latest updates and announcements from our team.",

    "footer.links.contact": "Contact",

    // Marketplace verified gating
    "marketplace.verifiedOnly": "Verified Partners",
    "marketplace.badgeVerified": "Verified",
    "marketplace.emptyVerifiedTitle": "No verified partners yet",
    "marketplace.emptyVerifiedSubtitle": "We're onboarding verified vendors. Check back soon.",
    "marketplace.emptyVerifiedCta": "Join Telegram for updates",

    // Marketplace modal
    "marketplace.modal.verifiedBadge": "Verified",
    "marketplace.modal.category": "Category",
    "marketplace.modal.aboutVendor": "About Vendor",
    "marketplace.modal.legalNote": "Vendors operate independently. TPC is not responsible for transactions.",
    "marketplace.modal.ctaSignIn": "Sign In to Continue",
    "marketplace.modal.ctaProceed": "Proceed",
    "marketplace.modal.close": "Close",
    "marketplace.modal.comingSoon": "Checkout coming soon",

    // Marketplace not found
    "marketplace.notFound.title": "Item Not Found",
    "marketplace.notFound.desc": "The item you're looking for doesn't exist or has been removed.",
    "marketplace.notFound.back": "Back to Marketplace",

    "updateProfit.title": "Update Profit",
    "updateProfit.subtitle": "Share your trading results with the TPC community",
    "updateProfit.disclaimer": "This is for educational and community tracking purposes only. Trading involves risk and past performance does not guarantee future results.",
    "updateProfit.fields.date": "Date",
    "updateProfit.fields.account": "Account (Optional)",
    "updateProfit.fields.amount": "Profit/Loss Amount",
    "updateProfit.fields.currency": "Currency",
    "updateProfit.fields.type": "Type",
    "updateProfit.fields.note": "Note (Optional)",
    "updateProfit.fields.agree": "I confirm this is my real trading result.",
    "updateProfit.actions.save": "Save Result",
    "updateProfit.actions.saving": "Saving...",
    "updateProfit.success.title": "Result Saved (Demo)",
    "updateProfit.success.body": "Your trading result has been recorded. This is a demo - actual database integration coming soon.",
    "updateProfit.errors.required": "This field is required",
    "updateProfit.errors.invalidAmount": "Please enter a valid amount",
    "updateProfit.errors.tooLarge": "Amount cannot exceed 1,000,000",
    "updateProfit.errors.noteTooLong": "Note cannot exceed 280 characters",
    "updateProfit.errors.mustAgree": "You must confirm this is your real trading result",

    "marketplace.title": "Marketplace",
    "marketplace.subtitle": "Professional tools, services, and education",
    "marketplace.emptyTitle": "No items available",
    "marketplace.emptyDesc": "There are currently no products or services available in this category.",
    "marketplace.disclaimer": "All services are provided by independent partners.",
    "marketplace.applyAsVendor": "Apply as Vendor",
    "marketplace.filterByCategory": "Filter by category",
    "marketplace.categories.all": "All",
    "marketplace.categories.trading": "Trading",
    "marketplace.categories.education": "Education",
    "marketplace.categories.services": "Services",
    "marketplace.categories.technology": "Technology",
    "marketplace.categories.consulting": "Consulting",
    "marketplace.categories.media": "Media",
    "marketplace.categories.other": "Other",
    "marketplace.errorTitle": "Failed to load",
    "marketplace.errorDesc": "Unable to load marketplace items. Please try again.",
    "marketplace.retry": "Retry",
    "marketplace.visitWebsite": "Visit Website",
    "marketplace.contactTelegram": "Contact on Telegram",
    "marketplace.footerDisclaimer": "All vendors are independently operated. TPC does not endorse or guarantee any services.",
    "marketplace.badgeTrusted": "Trusted Partners",
    "marketplace.searchPlaceholder": "Search services, tools, education…",
    "marketplace.viewDetails": "View Details",
    "marketplace.requestAccess": "Request Access",
    "marketplace.sections.overview": "Overview",
    "marketplace.sections.benefits": "What You Get",
    "marketplace.sections.requirements": "Requirements",
    "marketplace.sections.disclaimer": "Disclaimer",
    "marketplace.notFoundTitle": "Service Not Found",
    "marketplace.notFoundDesc": "The marketplace service you're looking for doesn't exist or has been removed.",
    "marketplace.badges.comingSoon": "Coming Soon",
    "marketplace.comingSoon": "Coming Soon",
    "marketplace.description": "Professional tools, services, and education",
    "marketplace.category.media": "Media",
    "marketplace.category.other": "Other",
    "marketplace.category.services": "Services",
    "marketplace.category.technology": "Technology",
    "marketplace.category.consulting": "Consulting",
    "marketplace.category.trading": "Trading",
    "marketplace.category.education": "Education",
    
    // Marketplace hero
    "marketplace.hero.title": "Marketplace",
    "marketplace.hero.subtitle": "Professional tools, services, and education",
    
    // Marketplace featured
    "marketplace.featured.title": "Featured",
    
    // Marketplace CTA
    "marketplace.cta.viewDetails": "View Details",
    "marketplace.cta.viewMore": "View More Services",
    
    // Marketplace actions
    "marketplace.actions.viewDetails": "View Details",
    "marketplace.actions.contactProvider": "Contact Provider",
    "marketplace.actions.applyNow": "Apply Now",
    "marketplace.actions.getStarted": "Get Started",
    
    // Marketplace status
    "marketplace.status.comingSoon": "Coming Soon",
    "marketplace.status.available": "Available",
    "marketplace.status.verified": "Verified",
    "marketplace.status.featured": "Featured",
    
    // Marketplace pricing
    "marketplace.price.from": "From",
    "marketplace.price.perMonth": "/month",
    "marketplace.price.oneTime": "one-time",
    "marketplace.currency.usd": "$",
    
    // Marketplace vendor
    "marketplace.vendor.label": "Provider",
    "marketplace.vendor.since": "Since",
    "marketplace.vendor.rating": "Rating",
    
    // Marketplace vendors
    "marketplace.vendors.tpcAcademy.name": "TPC Academy",
    "marketplace.vendors.tpcAcademy.since": "Since 2021",
    "marketplace.vendors.tpcTradingLabs.name": "TPC Trading Labs",
    "marketplace.vendors.tpcTradingLabs.since": "Since 2020",
    "marketplace.vendors.tpcTechSolutions.name": "TPC Tech Solutions",
    "marketplace.vendors.tpcTechSolutions.since": "Since 2019",
    "marketplace.vendors.tpcMedia.name": "TPC Media",
    "marketplace.vendors.tpcMedia.since": "Since 2022",
    "marketplace.vendors.tpcRiskSolutions.name": "TPC Risk Solutions",
    "marketplace.vendors.tpcRiskSolutions.since": "Since 2020",
    "marketplace.vendors.tpcCommunity.name": "TPC Community",
    "marketplace.vendors.tpcCommunity.since": "Since 2021",
    
    // Marketplace tags
    "marketplace.tags.label": "Tags",
    
    // Marketplace details
    "marketplace.details.aboutService": "About This Service",
    "marketplace.details.features": "Features",
    
    // Marketplace detail page
    "marketplace.detail.notFoundTitle": "Listing not found",
    "marketplace.detail.notFoundDesc": "This marketplace listing may have been removed or the link is invalid.",
    "marketplace.detail.backToMarketplace": "Back to Marketplace",
    "marketplace.detail.primaryCta": "Create Account",
    
    // Marketplace badges
    "marketplace.badges.verified": "Verified",
    "marketplace.badges.popular": "Popular",
    "marketplace.badges.aiPowered": "AI-Powered",
    "marketplace.badges.bestseller": "Bestseller",
    "marketplace.badges.beginnerFriendly": "Beginner Friendly",
    "marketplace.badges.essential": "Essential",
    "marketplace.badges.professional": "Professional",
    "marketplace.badges.technical": "Technical",
    "marketplace.badges.developer": "Developer",
    "marketplace.badges.creative": "Creative",
    "marketplace.badges.advanced": "Advanced",
    
    // Marketplace tags
    "marketplace.tags.signals": "signals",
    "marketplace.tags.trading": "trading",
    "marketplace.tags.analysis": "analysis",
    "marketplace.tags.tools": "tools",
    "marketplace.tags.dashboard": "dashboard",
    "marketplace.tags.education": "education",
    "marketplace.tags.risk": "risk",
    "marketplace.tags.technical": "technical",
    "marketplace.tags.blockchain": "blockchain",
    "marketplace.tags.consulting": "consulting",
    "marketplace.tags.web3": "web3",
    "marketplace.tags.smartContracts": "smart contracts",
    "marketplace.tags.wallet": "wallet",
    "marketplace.tags.development": "development",
    "marketplace.tags.security": "security",
    "marketplace.tags.content": "content",
    "marketplace.tags.media": "media",
    "marketplace.tags.marketing": "marketing",
    "marketplace.tags.socialMedia": "social media",
    "marketplace.tags.defi": "defi",
    "marketplace.tags.yieldFarming": "yield farming",
    "marketplace.tags.strategies": "strategies",
    "marketplace.tags.audit": "audit",
    "marketplace.tags.compliance": "compliance",
    "marketplace.tags.community": "community",
    "marketplace.tags.management": "management",
    "marketplace.tags.engagement": "engagement",
    "marketplace.tags.nft": "nft",
    "marketplace.tags.marketplace": "marketplace",
    "marketplace.tags.integration": "integration",
    
    // Marketplace items
    "marketplace.items.tpcTradingAcademy.title": "TPC Trading Academy",
    "marketplace.items.tpcTradingAcademy.desc": "Comprehensive trading education program covering technical analysis, risk management, and advanced trading strategies for TPC tokens.",
    "marketplace.items.premiumSignals.title": "Premium Trading Signals",
    "marketplace.items.premiumSignals.desc": "Get real-time trading signals from expert analysts with high accuracy rates and detailed entry/exit points.",
    "marketplace.items.blockchainConsulting.title": "Blockchain Consulting Services",
    "marketplace.items.blockchainConsulting.desc": "Professional blockchain consulting for businesses looking to integrate Web3 technologies and smart contracts.",
    "marketplace.items.customWalletDevelopment.title": "Custom TPC Wallet Development",
    "marketplace.items.customWalletDevelopment.desc": "Development of secure, user-friendly cryptocurrency wallets with TPC token integration and advanced features.",
    "marketplace.items.marketAnalysisTools.title": "Market Analysis Tools",
    "marketplace.items.marketAnalysisTools.desc": "Advanced market analysis tools and dashboards to track trends, analyze patterns, and make informed trading decisions.",
    "marketplace.items.contentCreationServices.title": "Content Creation Services",
    "marketplace.items.contentCreationServices.desc": "Professional content creation for crypto projects including articles, videos, and social media content.",
    "marketplace.items.defiYieldFarming.title": "DeFi Yield Farming Guide",
    "marketplace.items.defiYieldFarming.desc": "Complete guide to yield farming strategies in the DeFi space with TPC tokens and other cryptocurrencies.",
    "marketplace.items.smartContractAudit.title": "Smart Contract Audit Services",
    "marketplace.items.smartContractAudit.desc": "Professional smart contract auditing services to ensure security and compliance with industry standards.",
    "marketplace.items.tpcCommunityManagement.title": "Community Management Services",
    "marketplace.items.tpcCommunityManagement.desc": "Professional community management for TPC projects including Discord, Telegram, and social media platforms.",
    "marketplace.items.nftMarketplaceIntegration.title": "NFT Marketplace Integration",
    "marketplace.items.nftMarketplaceIntegration.desc": "Integration services for NFT marketplaces to support TPC tokens and enable seamless trading experiences.",
    
    // Additional marketplace keys
    "marketplace.all": "All",
    "marketplace.featured": "Featured",
    "marketplace.allServices": "All Services",
    "marketplace.noResults": "No services found",
    "marketplace.tryDifferentCategory": "Try selecting a different category",
    "marketplace.badges.featured": "FEATURED",
    "marketplace.notFound": "Service Not Found",
    "marketplace.backToList": "Back to Marketplace",
    "marketplace.contactProvider": "Contact Provider",
    "marketplace.getInTouch": "Get in Touch",
    "marketplace.tags": "Tags",
    "marketplace.interested": "Interested in this service?",
    "marketplace.comingSoonDescription": "This service is currently under development and will be available soon.",
    "marketplace.ctaDescription": "Get in touch with the service provider to learn more and get started.",
    "marketplace.providerInfo": "Provider Information",
    "marketplace.category": "Category",
    "marketplace.serviceId": "Service ID",
    "marketplace.status": "Status",
    "marketplace.available": "Available",
    "marketplace.nextSteps": "Next Steps",
    "marketplace.notifyWhenAvailable": "This service is coming soon. Check back later for availability.",
    "marketplace.step1": "Click the contact button above",
    "marketplace.step2": "Fill out the inquiry form",
    "marketplace.step3": "Wait for provider response"
  },

  id: {
    "app.name": "Trader Professional Community",
    "app.loading": "Memuat...",
    "app.error": "Terjadi kesalahan",

    "auth.signin.title": "Masuk",
    "auth.signup.title": "Daftar Akun",
    "auth.email": "Alamat Email",
    "auth.password": "Kata Sandi",
    "auth.submit": "Lanjutkan",
    "auth.logout": "Keluar",

    "auth.signUp.title": "Buat Akun",
    "auth.signUp.subtitle": "Gabung TPC Global - Komunitas Trading Profesional",
    "auth.signUp.fullNameLabel": "Nama Lengkap",
    "auth.signUp.emailLabel": "Alamat Email",
    "auth.signUp.passwordLabel": "Kata Sandi",
    "auth.signUp.confirmPasswordLabel": "Konfirmasi Kata Sandi",
    "auth.signUp.referralCodeLabel": "Kode Referral (Opsional)",
    "auth.signUp.submit": "Buat Akun",
    "auth.signUp.submitting": "Membuat Akun...",
    "auth.signUp.haveAccount": "Sudah punya akun?",
    "auth.signUp.signInLink": "Masuk",
    "auth.signUp.errorGeneric": "Pendaftaran gagal. Silakan coba lagi.",
    "auth.signUp.errorPasswordMismatch": "Kata sandi tidak cocok",
    "auth.signUp.errorPasswordShort": "Kata sandi minimal 8 karakter",
    "auth.signUp.errorNameShort": "Nama minimal 2 karakter",
    "auth.signUp.errorEmailInvalid": "Masukkan alamat email yang valid",
    "auth.signUp.success": "Akun berhasil dibuat!",
    "auth.signUp.checkEmail": "Silakan periksa email Anda untuk verifikasi akun.",

    "auth.checkEmail.title": "Periksa Email Anda",
    "auth.checkEmail.subtitle": "Kami telah mengirimkan tautan verifikasi ke alamat email Anda",
    "auth.checkEmail.body": "Klik tautan dalam email untuk menyelesaikan pendaftaran. Jika Anda tidak melihat email, periksa folder spam.",
    "auth.checkEmail.backToSignIn": "Kembali ke Masuk",
    "auth.checkEmail.resend": "Kirim Ulang Email",
    "auth.checkEmail.resending": "Mengirim Ulang...",
    "auth.checkEmail.resendSuccess": "Email berhasil dikirim!",
    "auth.checkEmail.resendError": "Gagal mengirim ulang email. Silakan coba lagi.",

    "signup.title": "Gabung TPC",
    "signup.subtitle": "Komunitas trading profesional",
    "signup.referral": "Kode Referral",
    "signup.submit": "Buat Akun",

    "faq.title": "Pertanyaan yang Sering Diajukan",
    "faq.subtitle": "Jawaban transparan tentang Token TPC dan ekosistem Trader Professional Community.",
    "faq.disclaimer": "Token TPC adalah utility token, bukan instrumen investasi. Partisipasi dilakukan secara sadar dan bertanggung jawab.",
    "faq.backToHome": "Kembali ke Beranda",
    "faq.viewDocs": "Lihat Dokumentasi",
    "faq.joinCommunity": "Gabung Komunitas",

    "faq.items": {
      "what-is-tpc": {
        "question": "Apa itu TPC?",
        "answer": "TPC (Trader Professional Community) adalah komunitas global untuk trader disiplin. Kami fokus pada edukasi, pertumbuhan berbasis risiko, dan operasi transparan tanpa menjanjikan profit yang dijamin."
      },
      "what-is-tpc-token": {
        "question": "Apa itu Token TPC?",
        "answer": "Token TPC adalah utility token yang berfungsi sebagai hak akses dan partisipasi dalam ekosistem TPC. Token ini tidak dirancang sebagai instrumen investasi."
      },
      "why-tpc-sells-token": {
        "question": "Mengapa TPC menjual token?",
        "answer": "Penjualan token mendanai pengembangan komunitas, pemeliharaan platform, pembuatan konten edukasi, dan inisiatif pertumbuhan ekosistem. Semua penggunaan dana dilaporkan secara transparan."
      },
      "does-tpc-promise-profit": {
        "question": "Apakah TPC menjanjikan profit?",
        "answer": "Tidak. TPC tidak menjanjikan atau menjamin profit apa pun. Kami menyediakan edukasi, tools, dan dukungan komunitas. Trading selalu memiliki risiko, dan anggota berpartisipasi dengan risiko sendiri."
      },
      "tpc-token-usage": {
        "question": "Token TPC digunakan untuk apa saja?",
        "answer": "Token TPC memberikan akses ke konten edukasi premium, fitur komunitas, utilitas platform, dan hak partisipasi dalam keputusan tata kelola dalam ekosistem."
      },
      "token-value-source": {
        "question": "Dari mana nilai Token TPC berasal?",
        "answer": "Nilai token berasal dari utilitas dalam ekosistem, adopsi komunitas, dan penggunaan platform. Nilai tidak dijamin dan berfluktuasi berdasarkan dinamika pasar dan pertumbuhan ekosistem."
      },
      "is-tpc-safe": {
        "question": "Apakah TPC aman?",
        "answer": "TPC menerapkan praktik keamanan terbaik termasuk akses berbasis peran, audit trail, dan operasi transparan. Namun, seperti aktivitas trading lainnya, risiko ada dan anggota harus berpartisipasi secara bertanggung jawab."
      },
      "is-tpc-mlm": {
        "question": "Apakah TPC skema MLM?",
        "answer": "Tidak. TPC adalah komunitas edukatif, bukan skema multi-level marketing. Kami fokus pada edukasi trading dan pertumbuhan komunitas, bukan struktur kompensasi berbasis rekrutmen."
      },
      "token-circulation": {
        "question": "Apakah token TPC langsung beredar semua?",
        "answer": "Tidak. Distribusi token mengikuti jadwal terstruktur dengan periode vesting dan pelepasan bertahap untuk menjaga stabilitas ekosistem dan mencegah manipulasi pasar."
      },
      "must-buy-token": {
        "question": "Apakah saya harus membeli token untuk ikut TPC?",
        "answer": "Tidak. Keanggotaan komunitas dasar dan konten edukatif dapat diakses tanpa pembelian token. Token menyediakan akses yang ditingkatkan dan utilitas dalam ekosistem."
      },
      "who-should-join": {
        "question": "Siapa yang cocok bergabung dengan TPC?",
        "answer": "TPC cocok untuk trader disiplin yang menghargai edukasi, manajemen risiko, dan operasi transparan. Ideal untuk mereka yang mencari dukungan komunitas tanpa ekspektasi profit yang tidak realistis."
      },
      "long-term-vision": {
        "question": "Apa visi jangka panjang TPC?",
        "answer": "Membangun komunitas edukasi trader terpercaya dengan operasi transparan, sumber daya edukasi berkualitas, dan pertumbuhan ekosistem berkelanjutan berdasarkan nilai utilitas nyata."
      }
    },

    "system.maintenance.title": "Mode Pemeliharaan",
    "system.maintenance.subtitle": "Kami sedang meningkatkan sistem untuk pelayanan yang lebih baik.",

    "home": {
      "hero": {
        "badge": "TPC • Komunitas Trader Profesional",
        "title": "Stop Tebak-tebakan. Mulai Trading Serius.",
        "subtitle": "Komunitas premium global untuk trader disiplin — edukasi, tools, dan transparansi pertumbuhan.",
        "ctaPrimary": "Gabung Member",
        "ctaSecondary": "Lihat Docs"
      },
      "disclaimer": {
        "text": "Trading memiliki risiko. TPC menyediakan edukasi dan tools — bukan saran keuangan atau jaminan profit."
      },
      "trust": {
        "title": "Dibangun dengan transparansi & akuntabilitas",
        "cards": [
          {
            title: "Bukti Transparansi",
            desc: "Pantau pergerakan treasury, laporan buyback & burn, serta keterbukaan publik secara real-time.",
            cta: "Lihat Transparansi"
          },
          {
            title: "Keamanan Sejak Desain",
            desc: "Akses berbasis peran, audit log, serta pemisahan tegas antara member, admin, dan sistem.",
            cta: "Pelajari Keamanan"
          },
          {
            title: "Pertumbuhan Berbasis Komunitas",
            desc: "Program, dana, dan keputusan ekosistem dirancang untuk keberlanjutan jangka panjang komunitas.",
            cta: "Pelajari DAO"
          }
        ]
      }
    },

    // CRITICAL: All nav keys explicitly defined to prevent undefined access crashes
    "nav.home": "Beranda",
    "nav.docs": "Docs", 
    "nav.dao": "DAO Lite",
    "nav.transparency": "Transparansi",
    "nav.admin": "Admin",
    "nav.legal": "Legal",
    "nav.fund": "Dana",
    "nav.marketplace": "Marketplace",

    "common.learnMore": "Pelajari lebih lanjut",

    "member.dashboard.refNone": "Tanpa referral",
    "member.dashboard.createdAt": "Bergabung",
    
    // Admin Vendors
    "admin.vendors.title": "Aplikasi Vendor",
    "admin.vendors.subtitle": "Tinjau dan kelola aplikasi vendor",
    "admin.vendors.filter.all": "Semua",
    "admin.vendors.filter.pending": "Menunggu",
    "admin.vendors.filter.approved": "Disetujui",
    "admin.vendors.filter.rejected": "Ditolak",
    "admin.vendors.searchPlaceholder": "Cari berdasarkan nama, email, atau user ID...",
    "admin.vendors.empty": "Tidak ada aplikasi ditemukan",
    "admin.vendors.noSearchResults": "Tidak ada aplikasi yang cocok dengan kriteria pencarian",
    "admin.vendors.noApplications": "Belum ada aplikasi vendor yang diajukan",
    "admin.vendors.noFilterResults": "Tidak ada aplikasi {status} ditemukan",
    "admin.vendors.description": "Deskripsi",
    "admin.vendors.viewDetails": "Lihat Detail",
    "admin.vendors.processing": "Memproses...",
    "admin.vendors.approve": "Setujui",
    "admin.vendors.reject": "Tolak",
    "admin.vendors.applicationDetails": "Detail Aplikasi",
    "admin.vendors.basicInfo": "Informasi Dasar",
    "admin.vendors.brandName": "Nama Brand",
    "admin.vendors.status": "Status",
    "admin.vendors.userId": "User ID",
    "admin.vendors.appliedDate": "Tanggal Diajukan",
    "admin.vendors.category": "Kategori",
    "admin.vendors.contactInfo": "Informasi Kontak",
    "admin.vendors.email": "Email",
    "admin.vendors.whatsapp": "WhatsApp",
    "admin.vendors.website": "Website",
    "admin.vendors.adminNote": "Catatan Admin",
    "admin.vendors.adminNotePlaceholder": "Tambahkan catatan tentang aplikasi ini...",
    
    // Admin Members
    "admin.members.title": "Manajemen Anggota",
    "admin.members.subtitle": "Kelola dan pantau semua akun anggota",
    "admin.members.filter.all": "Semua",
    "admin.members.filter.verified": "Terverifikasi",
    "admin.members.filter.unverified": "Belum Terverifikasi",
    "admin.members.searchPlaceholder": "Cari berdasarkan nama, email, atau user ID...",
    "admin.members.empty": "Tidak ada anggota ditemukan",
    "admin.members.noSearchResults": "Tidak ada anggota yang cocok dengan kriteria pencarian",
    "admin.members.noMembers": "Tidak ada anggota ditemukan",
    "admin.members.noFilterResults": "Tidak ada anggota {filter} ditemukan",
    "admin.members.action.view": "Lihat",
    "admin.members.action.verify": "Verifikasi",
    "admin.members.action.unverify": "Batalkan Verifikasi",
    "admin.members.processing": "Memproses...",
    "admin.members.memberDetails": "Detail Anggota",
    "admin.members.basicInfo": "Informasi Dasar",
    "admin.members.name": "Nama",
    "admin.members.email": "Email",
    "admin.members.userId": "User ID",
    "admin.members.username": "Username",
    "admin.members.role": "Peran",
    "admin.members.verified": "Terverifikasi",
    "admin.members.joinedDate": "Tanggal Bergabung",
    "admin.members.referralCode": "Kode Referral",
    "admin.members.additionalInfo": "Informasi Tambahan",
    "admin.members.phone": "Telepon",
    "admin.members.telegram": "Telegram",
    "admin.members.city": "Kota",
    "admin.members.tier": "Tier TPC",
    
    // Admin Marketplace
    "admin.marketplace.title": "Manajemen Marketplace",
    "admin.marketplace.subtitle": "Kelola listing dan vendor marketplace",
    "admin.marketplace.filter.all": "Semua",
    "admin.marketplace.filter.published": "Diterbitkan",
    "admin.marketplace.filter.draft": "Draft",
    "admin.marketplace.filter.archived": "Diarsipkan",
    "admin.marketplace.searchPlaceholder": "Cari berdasarkan judul, slug, kategori, atau ID...",
    "admin.marketplace.empty": "Tidak ada item ditemukan",
    "admin.marketplace.noSearchResults": "Tidak ada item yang cocok dengan kriteria pencarian",
    "admin.marketplace.noItems": "Tidak ada item marketplace ditemukan",
    "admin.marketplace.noFilterResults": "Tidak ada item {filter} ditemukan",
    "admin.marketplace.action.view": "Lihat",
    "admin.marketplace.action.edit": "Edit",
    "admin.marketplace.action.publish": "Terbitkan",
    "admin.marketplace.action.unpublish": "Batalkan Terbitkan",
    "admin.marketplace.action.feature": "Unggulkan",
    "admin.marketplace.action.unfeature": "Batalkan Unggulkan",
    "admin.marketplace.processing": "Memproses...",
    "admin.marketplace.editItem": "Edit Item",
    "admin.marketplace.itemDetails": "Detail Item",
    "admin.marketplace.basicInfo": "Informasi Dasar",
    "admin.marketplace.itemTitle": "Judul",
    "admin.marketplace.slug": "Slug",
    "admin.marketplace.category": "Kategori",
    "admin.marketplace.price": "Harga",
    "admin.marketplace.description": "Deskripsi",
    "admin.marketplace.vendor": "Vendor",
    "admin.marketplace.status": "Status",
    "admin.marketplace.createdDate": "Tanggal Dibuat",
    "admin.marketplace.tags": "Tags",
    "admin.marketplace.saving": "Menyimpan...",
    "admin.marketplace.save": "Simpan",
    "admin.marketplace.cancel": "Batal",
    "footer.madeWith": "Dibuat dengan",
    "footer.builtWith": "Dibangun dengan transparansi & kepercayaan",
    "footer.privacy": "Kebijakan Privasi",
    "footer.terms": "Syarat & Ketentuan",
    "footer.cookies": "Kebijakan Cookie",
    "footer.disclaimer": "Disclaimer",
    "footer.rights": "Hak cipta dilindungi",
    "footer.riskNotice": "Trading memiliki risiko. TPC menyediakan edukasi dan tools — bukan saran keuangan atau jaminan profit.",
    "footer.quickLinks": "Tautan Cepat",
    "footer.tagline": "Komunitas trading profesional berbasis edukasi, disiplin, dan transparansi.",
    "footer.brand": "Trader Professional Community",
    "legal.common.lastUpdated": "Terakhir diperbarui",
    "legal.common.contact": "Kontak",
    "legal.common.back": "Kembali",
    "legal.common.overview": "Ringkasan",
    "legal.common.definitions": "Definisi",
    "legal.common.scope": "Ruang lingkup",
    "legal.common.changes": "Perubahan kebijakan",
    "legal.common.questions": "Pertanyaan",
    "legal.privacy.title": "Kebijakan Privasi",
    "legal.privacy.subtitle": "Cara TPC mengumpulkan, menggunakan, dan melindungi informasi pribadi.",
    "legal.privacy.intro": "Kita menghormati privasi. Kebijakan ini menjelaskan data apa yang kita kumpulkan, alasan pengumpulan, serta pilihan yang tersedia.",
    "legal.privacy.whatWeCollectTitle": "Informasi yang kita kumpulkan",
    "legal.privacy.howWeUseTitle": "Cara kita menggunakan informasi",
    "legal.privacy.sharingTitle": "Berbagi dan pengungkapan",
    "legal.privacy.sharing": "Kita tidak menjual data pribadi. Kita dapat membagikan data terbatas kepada penyedia layanan untuk menjalankan platform, mematuhi hukum, atau melindungi hak dan keselamatan.",
    "legal.privacy.retentionTitle": "Penyimpanan data",
    "legal.privacy.retention": "Kita menyimpan data hanya selama diperlukan untuk tujuan bisnis yang sah dan kewajiban hukum.",
    "legal.privacy.securityTitle": "Keamanan",
    "legal.privacy.security": "Kita menggunakan langkah administratif, teknis, dan organisasi yang wajar untuk melindungi data. Tidak ada metode transmisi atau penyimpanan yang 100% aman.",
    "legal.privacy.yourRightsTitle": "Pilihan kamu",
    "legal.terms.title": "Syarat & Ketentuan",
    "legal.terms.subtitle": "Aturan penggunaan TPC dan layanan kita.",
    "legal.terms.intro": "Dengan mengakses atau menggunakan TPC, kamu setuju dengan S&K ini. Jika tidak setuju, jangan gunakan layanan.",
    "legal.terms.eligibilityTitle": "Kelayakan",
    "legal.terms.eligibility": "Kamu harus sah secara hukum untuk membuat perjanjian dan mematuhi peraturan yang berlaku.",
    "legal.terms.accountTitle": "Tanggung jawab akun",
    "legal.terms.prohibitedTitle": "Aktivitas yang dilarang",
    "legal.terms.contentTitle": "Konten dan hak kekayaan intelektual",
    "legal.terms.content": "Konten, brand, dan materi TPC dilindungi. Dilarang menyalin, mendistribusikan, atau mengeksploitasi tanpa izin.",
    "legal.terms.terminationTitle": "Penghentian akses",
    "legal.terms.termination": "Kita dapat menangguhkan atau menghentikan akses karena pelanggaran, alasan keamanan, atau kepatuhan hukum.",
    "legal.terms.liabilityTitle": "Batasan tanggung jawab",
    "legal.terms.liability": "TPC disediakan 'sebagaimana adanya'. Sejauh diizinkan hukum, kita tidak bertanggung jawab atas kerugian tidak langsung, insidental, atau konsekuensial.",
    "legal.terms.governingTitle": "Hukum yang berlaku",
    "legal.terms.governing": "S&K ini diatur oleh hukum yang berlaku di yurisdiksi operasional kita, kecuali diwajibkan lain oleh peraturan.",
    "legal.cookies.title": "Kebijakan Cookie",
    "legal.cookies.subtitle": "Cara kita menggunakan cookie dan teknologi serupa.",
    "legal.cookies.intro": "Kita menggunakan cookie untuk menjalankan situs, meningkatkan pengalaman, dan memahami penggunaan.",
    "legal.cookies.typesTitle": "Jenis cookie yang kita gunakan",
    "legal.cookies.controlTitle": "Kontrol kamu",
    "legal.cookies.control": "Kamu bisa mengelola cookie lewat pengaturan browser. Menonaktifkan cookie esensial dapat memengaruhi fungsi situs.",
    "legal.disclaimer.title": "Disclaimer",
    "legal.disclaimer.subtitle": "Pemberitahuan penting tentang edukasi, risiko, dan tanggung jawab.",
    "legal.disclaimer.intro": "TPC menyediakan konten edukasi dan tools untuk trader. Kita tidak memberikan saran keuangan yang bersifat personal.",
    "legal.disclaimer.noAdviceTitle": "Bukan saran keuangan",
    "legal.disclaimer.noAdvice": "Tidak ada bagian dari TPC yang dapat dianggap sebagai saran investasi, hukum, atau pajak. Keputusan sepenuhnya tanggung jawab kamu.",
    "legal.disclaimer.riskTitle": "Pernyataan risiko",
    "legal.disclaimer.risk": "Trading memiliki risiko tinggi dan dapat menyebabkan kerugian. Performa masa lalu tidak menjamin hasil di masa depan.",
    "legal.disclaimer.responsibilityTitle": "Tanggung jawab kamu",
    "legal.disclaimer.responsibility": "Kamu sebaiknya melakukan riset sendiri dan berkonsultasi dengan profesional yang kompeten sebelum mengambil keputusan finansial.",
    "docs.title": "Dokumentasi",
    "docs.subtitle": "Pelajari cara kerja TPC, prinsip utama, dan cara memulai.",
    "docs.menu.whatIsTPC": "Apa itu TPC",
    "docs.whatIsTPC": "Apa itu TPC?",
    "docs.menu.howItWorks": "Cara Kerja",
    "docs.howItWorks": "Cara Kerja",
    "docs.menu.tokenUtility": "Fungsi Token",
    "docs.tokenUtility": "Utilitas Token",
    "docs.menu.faq": "FAQ",
    "docs.faq": "Pertanyaan yang Sering Diajukan",
    "docs.faq.title": "Pertanyaan Umum",
    "docs.faq.content": "Bagian ini menjawab pertanyaan umum seputar membership, token, risiko, dan penggunaan platform.",
    "docs.whatIsTPC.title": "Apa itu TPC?",
    "docs.whatIsTPC.content": "TPC (Trader Professional Community) adalah komunitas global premium untuk trader yang disiplin. Fokus kami pada edukasi, tools, transparansi, dan pertumbuhan jangka panjang — bukan spekulasi atau hype.",
    "docs.whatIsTPCContent": "TPC (Trader Professional Community) adalah komunitas trading global yang berfokus pada edukasi, disiplin, transparansi, dan pengembangan skill jangka panjang bagi trader.",
    "docs.howItWorks.title": "Cara Kerja TPC",
    "docs.howItWorks.content": "Member bergabung ke TPC untuk mengakses edukasi terstruktur, tools profesional, dan ekosistem yang transparan. Pertumbuhan didorong oleh skill, disiplin, dan kolaborasi komunitas.",
    "docs.howItWorksContent": "Member belajar melalui dokumentasi terstruktur, tools edukasi, dan sistem transparan yang dirancang untuk meningkatkan disiplin dan kualitas pengambilan keputusan trading.",
    "docs.tokenUtility.title": "Token Utility",
    "docs.tokenUtility.content": "Token TPC digunakan sebagai akses utama ke fitur ekosistem, partisipasi komunitas, DAO Lite, serta berbagai layanan dan utilitas internal.",
    "docs.tokenUtilityContent": "Dengan memiliki dan menggunakan token TPC, member dapat berpartisipasi secara transparan, berkelanjutan, dan selaras dengan pertumbuhan komunitas.",
    "dao.title": "DAO Lite",
    "dao.subtitle": "Model tata kelola ringan untuk komunitas TPC",
    "dao.notice": "DAO Lite saat ini masih dalam tahap awal. Fitur akan dibuka secara bertahap untuk menjaga keamanan dan kualitas tata kelola.",
    "dao.whatIsDAOLite": "Apa itu DAO Lite?",
    "dao.whatIsDAOLiteContent": "DAO Lite adalah sistem tata kelola sederhana yang memungkinkan member berpartisipasi dalam proposal, voting, dan pengawasan tanpa mekanisme on-chain yang kompleks.",
    "dao.howToParticipate": "Cara Berpartisipasi",
    "dao.step1": "Pengajuan Proposal",
    "dao.step2": "Diskusi Komunitas",
    "dao.step3": "Periode Voting", 
    "dao.step4": "Implementasi",
    "dao.rules": "Aturan Tata Kelola",
    "dao.rule1": "Partisipasi berbasis tanggung jawab komunitas.",
    "dao.rule2": "Semua proposal harus selaras dengan nilai edukasi TPC.",
    "dao.rule3": "Voting transparan dan dapat diaudit oleh komunitas.",
    "dao.rule4": "DAO Lite tidak menjamin pengembalian finansial.",
    "docs.faqA1": "Tentang Dokumentasi Ini",
    "docs.faqA1.title": "Tentang Dokumentasi Ini",
    "docs.faqA1.content": "Dokumentasi ini dirancang untuk membantu kamu memahami cara kerja TPC, prinsip utama, serta cara menggunakan platform secara bertanggung jawab dan efektif.",
    "docs.faqQ1": "Apakah TPC Cocok untuk Pemula?",
    "docs.faqQ1.title": "Apakah TPC Cocok untuk Pemula?",
    "docs.faqQ1.content": "TPC dirancang untuk trader disiplin di semua level. Pemula dianjurkan untuk fokus pada edukasi, pemahaman risiko, dan pengembangan skill jangka panjang sebelum melakukan trading aktif.",
    "docs.faq2": "Masih Ada Pertanyaan?",
    "docs.faq2.title": "Masih Ada Pertanyaan?",
    "docs.faq2.content": "Jika kamu memiliki pertanyaan lanjutan tentang TPC, membership, token, atau risiko, silakan hubungi komunitas kami atau pelajari bagian dokumentasi di atas.",
    "docs.faqA2": "Bantuan & Dukungan",
    "docs.faqA2.title": "Bantuan & Dukungan",
    "docs.faqA2.content": "Jika kamu membutuhkan bantuan atau klarifikasi, silakan bergabung dengan kanal komunitas resmi TPC atau pelajari kembali bagian dokumentasi yang tersedia di halaman ini.",
    "docs.faqQ2": "Butuh Informasi Tambahan?",
    "docs.faqQ2.title": "Butuh Informasi Tambahan?",
    "docs.faqQ2.content": "Untuk penjelasan lebih mendalam mengenai fitur TPC, governance, dan manajemen risiko, silakan jelajahi bagian dokumentasi atau bergabung dengan kanal komunitas resmi.",
    "docs.disclaimer": "Seluruh dokumentasi disediakan hanya untuk tujuan edukasi. Tidak ada bagian yang dapat dianggap sebagai saran keuangan atau jaminan hasil.",
    "transparency.title": "Transparansi",
    "transparency.subtitle": "Ekosistem terbuka, dapat diverifikasi, dan bertanggung jawab",
    "transparency.intro": "Transparansi adalah prinsip inti TPC. Kami membuka informasi tentang pengelolaan dana, wallet, dan struktur governance.",
    "transparency.hero": {
      "title": "Transparansi & Akuntabilitas Publik",
      "subtitle": "Semua wallet inti dan aktivitas ekosistem dipublikasikan untuk verifikasi publik."
    },
    "transparency.live": {
      "title": "Transparansi Langsung",
      "desc": "Semua dana komunitas dan transaksi dapat diverifikasi secara publik di on-chain."
    },
    "transparency.sections.officialWallets": "Wallet Resmi",
    "transparency.wallets": {
      "items": "Data wallet sampel akan ditampilkan di sini"
    },
    "transparency.revenue": {
      "title": "Kebijakan Pendapatan",
      "youtube": "Pembagian Pendapatan YouTube",
      "community": "Pendapatan ke Komunitas"
    },
    "transparency.policy": {
      "youtube": "Data kebijakan sampel akan ditampilkan di sini"
    },
    "transparency.revenueDesc": "Semua pendapatan kembali ke member komunitas dan pengembangan.",
    "transparency.updates": {
      "title": "Update Terbaru"
    },
    "transparency.cta": {
      "title": "Gabung Komunitas Kami",
      "subtitle": "Jadilah bagian dari komunitas trading yang transparan dan berbasis edukasi.",
      "docs": "Baca Dokumentasi",
      "join": "Gabung Komunitas"
    },
    "transparency.walletAction": "Lihat di Explorer",
    "transparency.sections.officialWallets.title": "Wallet Resmi",
    "transparency.sections.officialWallets.desc": "Daftar wallet resmi TPC yang digunakan untuk treasury, operasional, dan aktivitas on-chain.",
    "transparency.sections.officialWallets.description": "Wallet ini digunakan untuk operasional, treasury, dan kebutuhan ekosistem. Alamat dipublikasikan untuk verifikasi publik.",
    "transparency.sections.distribution.title": "Distribusi & Batch",
    "transparency.sections.distribution.desc": "Catatan distribusi dana dan batch transaksi yang telah diproses.",
    "transparency.sections.fundFlow.title": "Alur Dana",
    "transparency.sections.fundFlow.description": "Pergerakan dana utama mengikuti aturan yang telah ditetapkan dan dicatat untuk akuntabilitas.",
    "transparency.sections.governance.title": "Governance",
    "transparency.sections.governance.description": "Keputusan penting diarahkan oleh proses governance yang transparan dan selaras dengan komunitas jangka panjang.",
    "transparency.sections.reporting.title": "Pelaporan",
    "transparency.sections.reporting.description": "Laporan berkala memberikan visibilitas terhadap kondisi treasury, pertumbuhan ekosistem, dan keberlanjutan platform.",
    "transparency.sections.updates.title": "Update Transparansi",
    "transparency.sections.updates.desc": "Aktivitas terbaru terkait buyback, burn, liquidity, dan operasional.",
    "transparency.notice": "Alamat wallet dan catatan disediakan hanya untuk tujuan transparansi dan audit.",
    "footer.links.home": "Beranda",
    "footer.links.community": "Komunitas",
    "footer.links.docs": "Dokumentasi",
    "footer.links.dao": "DAO Lite",
    "footer.links.transparency": "Transparansi",
    "footer.links.telegram": "Telegram",
    "footer.links.twitter": "X (Twitter)",
    "footer.links.youtube": "YouTube",
    "footer.links.support": "Bantuan",

    // Community Fund
    "fund.title": "Dukungan Pengembangan Komunitas",
    "fund.description": "Member komunitas dapat secara sukarela berkontribusi untuk mendukung pengembangan ekosistem TPC.",
    "fund.usage.title": "Penggunaan Kontribusi",
    "fund.usage.items": "Pengembangan konten edukasi, Pemeliharaan dan peningkatan platform, Acara dan inisiatif komunitas, Penelitian dan pengembangan",
    "fund.notice.title": "Pemberitahuan Penting",
    "fund.notice.content": "Program ini BUKAN investasi. Kontribusi bersifat sukarela, tidak dapat dikembalikan, dan tidak memberikan hak kepemilikan, hak keuntungan, atau pengembalian finansial. Tidak ada jaminan apa pun.",
    "fund.progress.title": "Progress Saat Ini",
    "fund.progress.note": "Data progress hanya sampel dan akan diperbarui setelah peluncuran resmi.",

    // News
    "news.detail.notFound": "Artikel tidak ditemukan",
    "news.detail.notFoundDesc": "Artikel yang kamu cari tidak ada atau telah dihapus.",
    "news.detail.back": "Kembali ke Berita",
    "news.detail.ctaTitle": "Tetap Update",
    "news.detail.ctaDesc": "Dapatkan update dan pengumuman terbaru dari tim kami.",

    "footer.links.contact": "Kontak",

    // Marketplace verified gating
    "marketplace.verifiedOnly": "Mitra Terverifikasi",
    "marketplace.badgeVerified": "Terverifikasi",
    "marketplace.emptyVerifiedTitle": "Belum ada mitra terverifikasi",
    "marketplace.emptyVerifiedSubtitle": "Kami sedang onboarding vendor terverifikasi. Silakan cek kembali.",
    "marketplace.emptyVerifiedCta": "Gabung Telegram untuk update",

    // Marketplace modal
    "marketplace.modal.verifiedBadge": "Terverifikasi",
    "marketplace.modal.category": "Kategori",
    "marketplace.modal.aboutVendor": "Tentang Vendor",
    "marketplace.modal.legalNote": "Vendor beroperasi secara independen. TPC tidak bertanggung jawab atas transaksi.",
    "marketplace.modal.ctaSignIn": "Login untuk Lanjut",
    "marketplace.modal.ctaProceed": "Lanjut",
    "marketplace.modal.close": "Tutup",
    "marketplace.modal.comingSoon": "Checkout segera hadir",

    // Marketplace not found
    "marketplace.notFound.title": "Item Tidak Ditemukan",
    "marketplace.notFound.desc": "Item yang Anda cari tidak ada atau telah dihapus.",
    "marketplace.notFound.back": "Kembali ke Marketplace",

    "updateProfit.title": "Update Laporan Profit",
    "updateProfit.subtitle": "Bagikan hasil trading Anda dengan komunitas TPC",
    "updateProfit.disclaimer": "Ini hanya untuk tujuan edukasi dan pelacakan komunitas. Trading melibatkan risiko dan performa masa lalu tidak menjamin hasil masa depan.",
    "updateProfit.fields.date": "Tanggal",
    "updateProfit.fields.account": "Akun (Opsional)",
    "updateProfit.fields.amount": "Jumlah Profit/Loss",
    "updateProfit.fields.currency": "Mata Uang",
    "updateProfit.fields.type": "Tipe",
    "updateProfit.fields.note": "Catatan (Opsional)",
    "updateProfit.fields.agree": "Saya konfirmasi ini adalah hasil trading real saya.",
    "updateProfit.actions.save": "Simpan Hasil",
    "updateProfit.actions.saving": "Menyimpan...",
    "updateProfit.success.title": "Hasil Disimpan (Demo)",
    "updateProfit.success.body": "Hasil trading Anda telah dicatat. Ini adalah demo - integrasi database akan segera hadir.",
    "updateProfit.errors.required": "Field ini wajib diisi",
    "updateProfit.errors.invalidAmount": "Masukkan jumlah yang valid",
    "updateProfit.errors.tooLarge": "Jumlah tidak boleh melebihi 1.000.000",
    "updateProfit.errors.noteTooLong": "Catatan tidak boleh melebihi 280 karakter",
    "updateProfit.errors.mustAgree": "Anda harus konfirmasi ini adalah hasil trading real Anda",

    "marketplace.title": "Marketplace",
    "marketplace.subtitle": "Alat, layanan, dan edukasi profesional",
    "marketplace.emptyTitle": "Belum ada item",
    "marketplace.emptyDesc": "Saat ini belum ada produk atau layanan pada kategori ini.",
    "marketplace.disclaimer": "Semua layanan disediakan oleh mitra independen.",
    "marketplace.applyAsVendor": "Daftar sebagai Vendor",
    "marketplace.filterByCategory": "Filter berdasarkan kategori",
    "marketplace.categories.all": "Semua",
    "marketplace.categories.trading": "Trading",
    "marketplace.categories.education": "Edukasi",
    "marketplace.categories.services": "Layanan",
    "marketplace.categories.technology": "Teknologi",
    "marketplace.categories.consulting": "Konsultasi",
    "marketplace.categories.media": "Media",
    "marketplace.categories.other": "Lainnya",
    "marketplace.errorTitle": "Gagal memuat",
    "marketplace.errorDesc": "Tidak dapat memuat item marketplace. Silakan coba lagi.",
    "marketplace.retry": "Coba Lagi",
    "marketplace.visitWebsite": "Kunjungi Website",
    "marketplace.contactTelegram": "Kontak di Telegram",
    "marketplace.footerDisclaimer": "Semua vendor dioperasikan secara independen. TPC tidak mendukung atau menjamin layanan apa pun.",
    "marketplace.badgeTrusted": "Mitra Terverifikasi",
    "marketplace.searchPlaceholder": "Cari layanan, tools, edukasi…",
    "marketplace.viewDetails": "Lihat Detail",
    "marketplace.requestAccess": "Minta Akses",
    "marketplace.sections.overview": "Ringkasan",
    "marketplace.sections.benefits": "Yang Anda Dapatkan",
    "marketplace.sections.requirements": "Persyaratan",
    "marketplace.sections.disclaimer": "Disclaimer",
    "marketplace.notFoundTitle": "Layanan Tidak Ditemukan",
    "marketplace.notFoundDesc": "Layanan marketplace yang Anda cari tidak ada atau telah dihapus.",
    "marketplace.badges.comingSoon": "Segera Hadir",
    "marketplace.comingSoon": "Segera Hadir",
    "marketplace.description": "Alat, layanan, dan edukasi profesional",
    "marketplace.category.media": "Media",
    "marketplace.category.other": "Lainnya",
    "marketplace.category.services": "Layanan",
    "marketplace.category.technology": "Teknologi",
    "marketplace.category.consulting": "Konsultasi",
    "marketplace.category.trading": "Trading",
    "marketplace.category.education": "Edukasi",
    
    // Marketplace hero
    "marketplace.hero.title": "Marketplace",
    "marketplace.hero.subtitle": "Alat, layanan, dan edukasi profesional",
    
    // Marketplace featured
    "marketplace.featured.title": "Unggulan",
    
    // Marketplace CTA
    "marketplace.cta.viewDetails": "Lihat Detail",
    "marketplace.cta.viewMore": "Lihat Layanan Lainnya",
    
    // Marketplace actions
    "marketplace.actions.viewDetails": "Lihat Detail",
    "marketplace.actions.contactProvider": "Hubungi Penyedia",
    "marketplace.actions.applyNow": "Daftar Sekarang",
    "marketplace.actions.getStarted": "Mulai Sekarang",
    
    // Marketplace status
    "marketplace.status.comingSoon": "Segera Hadir",
    "marketplace.status.available": "Tersedia",
    "marketplace.status.verified": "Terverifikasi",
    "marketplace.status.featured": "Unggulan",
    
    // Marketplace pricing
    "marketplace.price.from": "Mulai",
    "marketplace.price.perMonth": "/bulan",
    "marketplace.price.oneTime": "sekali bayar",
    "marketplace.currency.usd": "$",
    
    // Marketplace vendor
    "marketplace.vendor.label": "Penyedia",
    "marketplace.vendor.since": "Sejak",
    "marketplace.vendor.rating": "Rating",
    
    // Marketplace vendors
    "marketplace.vendors.tpcAcademy.name": "TPC Academy",
    "marketplace.vendors.tpcAcademy.since": "Sejak 2021",
    "marketplace.vendors.tpcTradingLabs.name": "TPC Trading Labs",
    "marketplace.vendors.tpcTradingLabs.since": "Sejak 2020",
    "marketplace.vendors.tpcTechSolutions.name": "TPC Tech Solutions",
    "marketplace.vendors.tpcTechSolutions.since": "Sejak 2019",
    "marketplace.vendors.tpcMedia.name": "TPC Media",
    "marketplace.vendors.tpcMedia.since": "Sejak 2022",
    "marketplace.vendors.tpcRiskSolutions.name": "TPC Risk Solutions",
    "marketplace.vendors.tpcRiskSolutions.since": "Sejak 2020",
    "marketplace.vendors.tpcCommunity.name": "TPC Community",
    "marketplace.vendors.tpcCommunity.since": "Sejak 2021",
    
    // Marketplace tags
    "marketplace.tags.label": "Tags",
    
    // Marketplace details
    "marketplace.details.aboutService": "Tentang Layanan Ini",
    "marketplace.details.features": "Fitur",
    
    // Marketplace detail page
    "marketplace.detail.notFoundTitle": "Listing tidak ditemukan",
    "marketplace.detail.notFoundDesc": "Listing ini mungkin sudah dihapus atau tautannya tidak valid.",
    "marketplace.detail.backToMarketplace": "Kembali ke Marketplace",
    "marketplace.detail.primaryCta": "Buat Akun",
    
    // Marketplace badges
    "marketplace.badges.verified": "Terverifikasi",
    "marketplace.badges.popular": "Populer",
    "marketplace.badges.aiPowered": "Didukung AI",
    "marketplace.badges.bestseller": "Terlaris",
    "marketplace.badges.beginnerFriendly": "Ramah Pemula",
    "marketplace.badges.essential": "Esensial",
    "marketplace.badges.professional": "Profesional",
    "marketplace.badges.technical": "Teknis",
    "marketplace.badges.developer": "Developer",
    "marketplace.badges.creative": "Kreatif",
    "marketplace.badges.advanced": "Lanjutan",
    
    // Marketplace tags
    "marketplace.tags.signals": "sinyal",
    "marketplace.tags.trading": "trading",
    "marketplace.tags.analysis": "analisis",
    "marketplace.tags.tools": "alat",
    "marketplace.tags.dashboard": "dashboard",
    "marketplace.tags.education": "edukasi",
    "marketplace.tags.risk": "risiko",
    "marketplace.tags.technical": "teknis",
    "marketplace.tags.blockchain": "blockchain",
    "marketplace.tags.consulting": "konsultasi",
    "marketplace.tags.web3": "web3",
    "marketplace.tags.smartContracts": "smart contract",
    "marketplace.tags.wallet": "wallet",
    "marketplace.tags.development": "pengembangan",
    "marketplace.tags.security": "keamanan",
    "marketplace.tags.content": "konten",
    "marketplace.tags.media": "media",
    "marketplace.tags.marketing": "pemasaran",
    "marketplace.tags.socialMedia": "media sosial",
    "marketplace.tags.defi": "defi",
    "marketplace.tags.yieldFarming": "yield farming",
    "marketplace.tags.strategies": "strategi",
    "marketplace.tags.audit": "audit",
    "marketplace.tags.compliance": "kepatuhan",
    "marketplace.tags.community": "komunitas",
    "marketplace.tags.management": "manajemen",
    "marketplace.tags.engagement": "keterlibatan",
    "marketplace.tags.nft": "nft",
    "marketplace.tags.marketplace": "marketplace",
    "marketplace.tags.integration": "integrasi",
    
    // Marketplace items
    "marketplace.items.tpcTradingAcademy.title": "TPC Trading Academy",
    "marketplace.items.tpcTradingAcademy.desc": "Program edukasi trading komprehensif yang mencakup analisis teknis, manajemen risiko, dan strategi trading lanjutan untuk token TPC.",
    "marketplace.items.premiumSignals.title": "Sinyal Trading Premium",
    "marketplace.items.premiumSignals.desc": "Dapatkan sinyal trading real-time dari analis profesional dengan tingkat akurasi tinggi dan detail entry/exit point.",
    "marketplace.items.blockchainConsulting.title": "Layanan Konsultasi Blockchain",
    "marketplace.items.blockchainConsulting.desc": "Konsultasi blockchain profesional untuk bisnis yang ingin mengintegrasikan teknologi Web3 dan smart contract.",
    "marketplace.items.customWalletDevelopment.title": "Pengembangan Wallet TPC Kustom",
    "marketplace.items.customWalletDevelopment.desc": "Pengembangan wallet cryptocurrency yang aman dan user-friendly dengan integrasi token TPC dan fitur lanjutan.",
    "marketplace.items.marketAnalysisTools.title": "Alat Analisis Pasar",
    "marketplace.items.marketAnalysisTools.desc": "Alat analisis pasar dan dashboard canggih untuk melacak tren, menganalisis pola, dan membuat keputusan trading yang tepat.",
    "marketplace.items.contentCreationServices.title": "Layanan Pembuatan Konten",
    "marketplace.items.contentCreationServices.desc": "Pembuatan konten profesional untuk proyek crypto termasuk artikel, video, dan konten media sosial.",
    "marketplace.items.defiYieldFarming.title": "Panduan DeFi Yield Farming",
    "marketplace.items.defiYieldFarming.desc": "Panduan lengkap strategi yield farming di ruang DeFi dengan token TPC dan cryptocurrency lainnya.",
    "marketplace.items.smartContractAudit.title": "Layanan Audit Smart Contract",
    "marketplace.items.smartContractAudit.desc": "Layanan audit smart contract profesional untuk memastikan keamanan dan kepatuhan dengan standar industri.",
    "marketplace.items.tpcCommunityManagement.title": "Layanan Manajemen Komunitas",
    "marketplace.items.tpcCommunityManagement.desc": "Manajemen komunitas profesional untuk proyek TPC termasuk Discord, Telegram, dan platform media sosial.",
    "marketplace.items.nftMarketplaceIntegration.title": "Integrasi Marketplace NFT",
    "marketplace.items.nftMarketplaceIntegration.desc": "Layanan integrasi untuk marketplace NFT yang mendukung token TPC dan mengaktifkan pengalaman trading yang seamless.",
    
    // Additional marketplace keys
    "marketplace.all": "Semua",
    "marketplace.featured": "Unggulan",
    "marketplace.allServices": "Semua Layanan",
    "marketplace.noResults": "Tidak ada layanan yang ditemukan",
    "marketplace.tryDifferentCategory": "Coba pilih kategori lain",
    "marketplace.badges.featured": "UNGGULAN",
    "marketplace.notFound": "Layanan Tidak Ditemukan",
    "marketplace.backToList": "Kembali ke Marketplace",
    "marketplace.contactProvider": "Hubungi Penyedia",
    "marketplace.getInTouch": "Hubungi Kami",
    "marketplace.tags": "Tag",
    "marketplace.interested": "Tertarik dengan layanan ini?",
    "marketplace.comingSoonDescription": "Layanan ini sedang dalam pengembangan dan akan segera tersedia.",
    "marketplace.ctaDescription": "Hubungi penyedia layanan untuk mempelajari lebih lanjut dan memulai.",
    "marketplace.providerInfo": "Informasi Penyedia",
    "marketplace.category": "Kategori",
    "marketplace.serviceId": "ID Layanan",
    "marketplace.status": "Status",
    "marketplace.available": "Tersedia",
    "marketplace.nextSteps": "Langkah Selanjutnya",
    "marketplace.notifyWhenAvailable": "Layanan ini akan segera hadir. Periksa kembali nanti.",
    "marketplace.step1": "Klik tombol hubungi di atas",
    "marketplace.step2": "Isi formulir pertanyaan",
    "marketplace.step3": "Tunggu respons dari penyedia"
  }
};
