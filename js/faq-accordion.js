/* ============================================================
   WURQLY — FAQ Accordion
   ARIA-compliant, auto-generates FAQPage JSON-LD
   ============================================================ */

function initFaqAccordion() {
  const triggers = document.querySelectorAll('.faq-trigger');

  triggers.forEach(btn => {
    btn.addEventListener('click', () => {
      const content = btn.nextElementSibling;
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      // Close all others
      triggers.forEach(otherBtn => {
        if (otherBtn !== btn) {
          otherBtn.setAttribute('aria-expanded', 'false');
          const otherContent = otherBtn.nextElementSibling;
          if (otherContent) otherContent.style.maxHeight = '0';
        }
      });

      // Toggle current
      if (isOpen) {
        btn.setAttribute('aria-expanded', 'false');
        content.style.maxHeight = '0';
      } else {
        btn.setAttribute('aria-expanded', 'true');
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });

    // Keyboard support
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });
}

function generateFaqSchema() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  const questions = [];
  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    const content = item.querySelector('.faq-content-inner');
    if (trigger && content) {
      questions.push({
        '@type': 'Question',
        name: trigger.textContent.trim(),
        acceptedAnswer: {
          '@type': 'Answer',
          text: content.textContent.trim()
        }
      });
    }
  });

  if (questions.length) {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: questions
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initFaqAccordion();
  generateFaqSchema();
});
