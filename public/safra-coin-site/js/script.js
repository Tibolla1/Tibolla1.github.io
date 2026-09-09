// Safra Coin — interações básicas do site

document.addEventListener('DOMContentLoaded', () => {
  // Destaca o link do menu correspondente à seção visível
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.navlinks a');

  const highlightNav = () => {
    let current = '';
    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  };

  window.addEventListener('scroll', highlightNav);
  highlightNav();

  // Popup de contato: mostra os 3 e-mails ao clicar em "Falar com a gente" / "Fale com a equipe"
  const overlay = document.getElementById('contactOverlay');
  const closeBtn = document.getElementById('contactClose');
  const triggers = document.querySelectorAll('.js-contact-btn');

  const openModal = () => {
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  };

  triggers.forEach((btn) => btn.addEventListener('click', openModal));
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
});
