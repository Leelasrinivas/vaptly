/* Vaptly — Structured Data (JSON-LD)
   Load via: <script src="structured-data.js" defer></script>
   Place in <head> of every HTML page.
*/

(function () {
  // ── Organisation Schema ──────────────────────────────────
  const organisation = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Vaptly",
    "url": "https://vaptly.com",
    "logo": "https://vaptly.com/favicon.png",
    "description": "Adversarial-grade cybersecurity consulting and enterprise security products. Penetration testing, GRC compliance advisory, incident response, and AI-powered security platforms.",
    "foundingDate": "2024",
    "founder": {
      "@type": "Person",
      "name": "Leela Srinivas Atla",
      "jobTitle": "Founder & Chief Security Architect",
      "url": "https://vaptly.com/about.html",
      "sameAs": [
        "https://www.linkedin.com/in/leela-srinivas-atla"
      ]
    },
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "contactType": "customer support",
        "email": "engagements@vaptly.com",
        "availableLanguage": "English"
      },
      {
        "@type": "ContactPoint",
        "contactType": "emergency",
        "telephone": "+1-800-555-1234",
        "contactOption": "TollFree",
        "hoursAvailable": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": [
            "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"
          ],
          "opens": "00:00",
          "closes": "23:59"
        },
        "availableLanguage": "English"
      }
    ],
    "sameAs": [
      "https://www.linkedin.com/company/vaptly",
      "https://twitter.com/vaptly",
      "https://github.com/vaptly"
    ],
    "areaServed": "Worldwide",
    "knowsAbout": [
      "Penetration Testing",
      "Cybersecurity Consulting",
      "Incident Response",
      "GRC Compliance",
      "Red Team Operations",
      "Zero Trust Architecture",
      "MITRE ATT&CK",
      "Human Risk Management",
      "Network Detection and Response",
      "Credential Security"
    ]
  };

  // ── Local Business Schema ────────────────────────────────
  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": "Vaptly",
    "url": "https://vaptly.com",
    "image": "https://vaptly.com/favicon.png",
    "description": "Adversarial-grade cybersecurity services and enterprise security products for organisations that cannot afford to be wrong.",
    "priceRange": "$$$$",
    "telephone": "+1-800-555-0100",
    "email": "engagements@vaptly.com",
    "openingHours": "Mo-Fr 09:00-18:00",
    "areaServed": {
      "@type": "GeoShape",
      "name": "Worldwide"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Vaptly Security Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Penetration Testing (VAPT)",
            "description": "Manual adversarial penetration testing across web, mobile, network, and cloud environments with zero false positives guaranteed.",
            "url": "https://vaptly.com/services.html#vapt"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "GRC & Compliance Advisory",
            "description": "ISO 27001, SOC 2 Type II, PCI DSS, HIPAA, and NIST compliance advisory with 99.4% first-attempt audit pass rate.",
            "url": "https://vaptly.com/services.html#grc"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Incident Response",
            "description": "24/7 emergency incident response for active breaches, ransomware events, and unauthorized access. Response within 1 hour.",
            "url": "https://vaptly.com/services.html#ir"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Security Awareness Training",
            "description": "Behaviour-based security awareness programmes for enterprise teams, tailored to actual risk profiles.",
            "url": "https://vaptly.com/services.html#training"
          }
        }
      ]
    }
  };

  // ── Website Schema ───────────────────────────────────────
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Vaptly",
    "url": "https://vaptly.com",
    "description": "Adversarial-grade cybersecurity consulting and enterprise security products.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://vaptly.com/?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  // ── Person Schema (Founder) ──────────────────────────────
  const founder = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Leela Srinivas Atla",
    "jobTitle": "Founder & Chief Security Architect",
    "worksFor": {
      "@type": "Organization",
      "name": "Vaptly",
      "url": "https://vaptly.com"
    },
    "url": "https://vaptly.com/about.html",
    "image": "https://media.licdn.com/dms/image/v2/D5603AQHWk6Wg5_mmhw/profile-displayphoto-scale_400_400/B56ZxdGcg3J4Ag-/0/1771088499205?e=1775692800&v=beta&t=vwcRvqxWV1EqDIvS6oaxTgW08QI6Pdw_Zss0FiiragE",
    "description": "Founder of Vaptly with over a decade of offensive security experience. Former security architect for the U.S. Department of Defense, Navy, NASA, and Air Force.",
    "knowsAbout": [
      "Offensive Security",
      "Red Team Operations",
      "Zero Trust Architecture",
      "Adversary Simulation",
      "Penetration Testing",
      "Critical Infrastructure Protection",
      "Exploit Development",
      "MITRE ATT&CK Framework"
    ],
    "alumniOf": [
      {
        "@type": "Organization",
        "name": "U.S. Department of Defense"
      },
      {
        "@type": "Organization",
        "name": "United States Navy"
      },
      {
        "@type": "Organization",
        "name": "NASA"
      },
      {
        "@type": "Organization",
        "name": "United States Air Force"
      }
    ],
    "sameAs": [
      "https://www.linkedin.com/in/leela-srinivas-atla"
    ]
  };

  // ── Inject all schemas ───────────────────────────────────
  const schemas = [organisation, localBusiness, website, founder];

  schemas.forEach(function (schema) {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schema, null, 2);
    document.head.appendChild(script);
  });

})();
