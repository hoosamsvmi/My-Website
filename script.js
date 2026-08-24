/* ==========================================================================
   hoosamsvmi — Modern Animated Developer Portfolio JavaScript
   Handles Mobile Navigation, EmailJS Contact Form Integration,
   Intersection Observer Animations, and Scroll Behavior
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // ------------------------------------------------------------------------
  // 1. Initialize EmailJS with Public Key
  // ------------------------------------------------------------------------
  const EMAILJS_PUBLIC_KEY = "WJuKquplMW7fh8jpV";
  const EMAILJS_SERVICE_ID = "service_cxtu3yi";
  const EMAILJS_TEMPLATE_MAIN = "template_30qywbf";
  const EMAILJS_TEMPLATE_AUTOREPLY = "template_vztzv4c";

  if (window.emailjs) {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  } else {
    console.warn("EmailJS SDK not loaded yet.");
  }

  // ------------------------------------------------------------------------
  // 2. Mobile Navigation Hamburger Menu Toggle
  // ------------------------------------------------------------------------
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.classList.toggle('is-active');
      navMenu.classList.toggle('is-active');
      navToggle.setAttribute('aria-expanded', !isExpanded);
    });

    // Smooth scroll handler that prevents URL hash changes in address bar
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const targetId = anchor.getAttribute('href');
        if (targetId && targetId !== '#') {
          const targetElement = document.querySelector(targetId);
          if (targetElement) {
            e.preventDefault();
            
            // Calculate position with navbar height offset
            const navOffset = navbar ? navbar.offsetHeight : 0;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - navOffset;

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        }

        // Close mobile navigation menu if open
        navToggle.classList.remove('is-active');
        navMenu.classList.remove('is-active');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ------------------------------------------------------------------------
  // 3. Header Glassmorphic Scroll Effect & Active Section Tracking
  // ------------------------------------------------------------------------
  const handleHeaderScroll = () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  handleHeaderScroll();

  // Active section indicator via Intersection Observer
  const sections = document.querySelectorAll('section[id]');
  
  const sectionObserverOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, sectionObserverOptions);

  sections.forEach(section => sectionObserver.observe(section));

  // ------------------------------------------------------------------------
  // 4. Scroll Reveal Animations (Intersection Observer)
  // ------------------------------------------------------------------------
  const revealItems = document.querySelectorAll('.reveal-item');

  const revealObserverOptions = {
    root: null,
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // Unobserve after revealing to prevent redundant recalculations
        observer.unobserve(entry.target);
      }
    });
  }, revealObserverOptions);

  revealItems.forEach(item => revealObserver.observe(item));

  // ------------------------------------------------------------------------
  // 5. Skill Progress Bars Animation
  // ------------------------------------------------------------------------
  const skillItems = document.querySelectorAll('.skill-item');

  const skillObserverOptions = {
    root: null,
    threshold: 0.2
  };

  const skillObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const skillItem = entry.target;
        const level = skillItem.getAttribute('data-level');
        const progressBar = skillItem.querySelector('.progress-bar-fill');
        if (progressBar && level) {
          progressBar.style.width = `${level}%`;
        }
        observer.unobserve(skillItem);
      }
    });
  }, skillObserverOptions);

  skillItems.forEach(item => skillObserver.observe(item));

  // ------------------------------------------------------------------------
  // 6. Contact Form Submission & EmailJS Integration
  // ------------------------------------------------------------------------
  const contactForm = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');
  const formStatus = document.getElementById('form-status');

  if (contactForm && submitBtn && formStatus) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Native browser input validation check
      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }

      // Collect form field values & trim whitespace
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const subject = document.getElementById('subject').value.trim();
      const message = document.getElementById('message').value.trim();

      if (!name || !email || !subject || !message) {
        return;
      }

      // Disable button & show loading state
      submitBtn.disabled = true;
      const originalBtnHtml = submitBtn.innerHTML;
      submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>Sending...</span>`;

      // Reveal form status message container
      formStatus.removeAttribute('hidden');
      formStatus.className = 'form-status is-visible loading';
      formStatus.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> <span>Sending your message, please wait...</span>`;

      const templateParams = {
        name: name,
        email: email,
        subject: subject,
        message: message
      };

      try {
        // Send main email to Hossam
        const mainResponse = await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_MAIN,
          templateParams
        );

        let autoReplySuccess = true;
        try {
          // Send automatic reply email to the visitor
          await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_AUTOREPLY,
            templateParams
          );
        } catch (autoErr) {
          console.warn("Auto-reply email failed to send:", autoErr);
          autoReplySuccess = false;
        }

        if (mainResponse.status === 200) {
          // Success State
          formStatus.className = 'form-status is-visible success';
          if (autoReplySuccess) {
            formStatus.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>Your message has been sent successfully! I'll get back to you as soon as possible.</span>`;
          } else {
            formStatus.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>Your message was received! Note: The automatic confirmation email could not be sent.</span>`;
          }

          // Reset form fields only on successful delivery
          contactForm.reset();
        } else {
          throw new Error(`EmailJS responded with status: ${mainResponse.status}`);
        }

      } catch (error) {
        console.error("EmailJS Form Submission Error:", error);
        
        // Error State (DO NOT clear user input)
        formStatus.className = 'form-status is-visible error';
        formStatus.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> <span>Something went wrong while sending your message. Please try again later.</span>`;
      } finally {
        // Always restore submit button state
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
      }
    });
  }
});
