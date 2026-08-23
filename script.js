const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
).matches;

const revealItems = document.querySelectorAll(".reveal");
const navLinks = document.querySelectorAll(".nav-link");
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");
const preloader = document.getElementById("preloader");
const scrollTopButton = document.querySelector(".scroll-top");
const emailLink = document.getElementById("emailLink");
const copyEmailBtn = document.getElementById("copyEmailBtn");
const toast = document.getElementById("toast");
const form = document.getElementById("contactForm");
const submitBtn = document.getElementById("submitBtn");
const successMessage = document.getElementById("form-success-message");
const skillCards = document.querySelectorAll(".skill-card");

const emailAddress = "hossamsamyabdelaal@gmail.com";

if (emailLink) {
    emailLink.href = `mailto:${emailAddress}`;
    emailLink.textContent = emailAddress;
}

const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(showToast.timeoutId);
    showToast.timeoutId = setTimeout(() => {
        toast.classList.remove("is-visible");
    }, 2200);
};

const copyEmail = async () => {
    const emailText = emailAddress;

    try {
        await navigator.clipboard.writeText(emailText);
        showToast("Email copied!");
    } catch (error) {
        const temp = document.createElement("textarea");
        temp.value = emailText;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand("copy");
        document.body.removeChild(temp);
        showToast("Email copied!");
    }
};

if (copyEmailBtn) {
    copyEmailBtn.addEventListener("click", copyEmail);
}

const updateActiveLink = () => {
    const sections = document.querySelectorAll("main section[id]");

    sections.forEach((section) => {
        const sectionTop = section.offsetTop - 140;
        const sectionHeight = section.offsetHeight;
        const scrollPosition = window.scrollY;

        if (
            scrollPosition >= sectionTop &&
            scrollPosition < sectionTop + sectionHeight
        ) {
            navLinks.forEach((link) => {
                link.classList.toggle(
                    "active",
                    link.getAttribute("href") === `#${section.id}`,
                );
            });
        }
    });
};

const initializeSkillAnimations = () => {
    const skillObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                const card = entry.target;
                const percentage = Number(card.dataset.percentage || 0);
                const progressBar = card.querySelector(".skill-progress-bar");
                const valueText = card.querySelector(".skill-value");

                if (!progressBar || !valueText) {
                    observer.unobserve(card);
                    return;
                }

                if (prefersReducedMotion) {
                    progressBar.style.width = `${percentage}%`;
                    valueText.textContent = `${percentage}%`;
                    card.classList.add("is-visible");
                    observer.unobserve(card);
                    return;
                }

                progressBar.style.width = "0%";

                let currentValue = 0;
                const duration = 1400;
                const startTime = performance.now();

                const updateCounter = (currentTime) => {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const easedProgress = 1 - Math.pow(1 - progress, 3);

                    currentValue = Math.round(easedProgress * percentage);
                    valueText.textContent = `${currentValue}%`;
                    progressBar.style.width = `${currentValue}%`;

                    if (progress < 1) {
                        requestAnimationFrame(updateCounter);
                    } else {
                        valueText.textContent = `${percentage}%`;
                        progressBar.style.width = `${percentage}%`;
                    }
                };

                requestAnimationFrame(updateCounter);
                card.classList.add("is-visible");
                observer.unobserve(card);
            });
        },
        { threshold: 0.35 },
    );

    skillCards.forEach((card, index) => {
        card.style.setProperty("--skill-delay", `${index * 100}ms`);
        skillObserver.observe(card);
    });
};

const revealObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                revealObserver.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.14 },
);

if (!prefersReducedMotion) {
    revealItems.forEach((item) => revealObserver.observe(item));
} else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
}

initializeSkillAnimations();

navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("is-open");
    navToggle.classList.toggle("is-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach((link) => {
    link.addEventListener("click", () => {
        navMenu.classList.remove("is-open");
        navToggle.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
    });
});

window.addEventListener("scroll", updateActiveLink);
window.addEventListener("load", () => {
    updateActiveLink();
    setTimeout(() => {
        preloader.classList.add("hidden");
    }, 550);
});

scrollTopButton.addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? "auto" : "smooth",
    });
});

const setFieldError = (fieldName, message) => {
    const input = form.querySelector(`[name="${fieldName}"]`);
    const errorEl = form.querySelector(`[data-error-for="${fieldName}"]`);
    if (!input || !errorEl) return;

    input.setAttribute("aria-invalid", message ? "true" : "false");
    errorEl.textContent = message;
    errorEl.classList.toggle("is-visible", Boolean(message));
};

const validateField = (fieldName) => {
    const input = form.querySelector(`[name="${fieldName}"]`);
    if (!input) return true;

    const value = input.value.trim();

    if (!value) {
        setFieldError(
            fieldName,
            `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required.`,
        );
        return false;
    }

    if (fieldName === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        setFieldError(fieldName, "Please enter a valid email address.");
        return false;
    }

    setFieldError(fieldName, "");
    return true;
};

form.addEventListener("input", (event) => {
    const fieldName = event.target.name;
    if (fieldName) {
        validateField(fieldName);
    }
});

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const fields = ["name", "email", "subject", "message"];
    const isValid = fields.every(validateField);

    if (!isValid) {
        showToast("Please fix the highlighted fields.");
        return;
    }

    if (submitBtn.disabled) return;

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";
    
    // Hide success message when starting new submission
    if (successMessage) {
        successMessage.setAttribute("hidden", "");
    }

    const formData = new FormData(form);
    const payload = {
        name: formData.get("name"),
        email: formData.get("email"),
        subject: formData.get("subject"),
        message: formData.get("message"),
    };

    try {
        if (!window.emailjs) {
            throw new Error("EmailJS library not loaded");
        }

        emailjs.init({ publicKey: "WJuKquplMW7fh8jpV" });

        await emailjs.send("service_cxtu3yi", "template_30qywbf", payload);

        await emailjs.send("service_cxtu3yi", "template_vztzv4c", {
            name: payload.name,
            email: payload.email,
            subject: payload.subject,
            message: payload.message,
            to_email: payload.email,
            recipient_email: payload.email,
        });

        // Show success message
        if (successMessage) {
            successMessage.removeAttribute("hidden");
        }
        
        form.reset();
        fields.forEach((field) => setFieldError(field, ""));
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
            if (successMessage) {
                successMessage.setAttribute("hidden", "");
            }
        }, 5000);
    } catch (error) {
        console.error("EmailJS error:", error);
        showToast("Message failed. Please try again later.");
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Send Message";
    }
});

const cursorGlow = document.querySelector(".cursor-glow");
if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    window.addEventListener("pointermove", (event) => {
        cursorGlow.style.left = `${event.clientX}px`;
        cursorGlow.style.top = `${event.clientY}px`;
    });
}

// Interactive card system with cursor tracking and 3D tilt
const interactiveCards = document.querySelectorAll(".interactive-card");

if (!window.matchMedia("(hover: none)").matches) {
    interactiveCards.forEach((card) => {
        card.addEventListener("mousemove", (event) => {
            const rect = card.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            const rotateY = ((x / rect.width) - 0.5) * 8;
            const rotateX = ((y / rect.height) - 0.5) * -8;

            card.style.setProperty("--mouse-x", `${x}px`);
            card.style.setProperty("--mouse-y", `${y}px`);

            card.style.transform = `
                perspective(1000px)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
                translateY(-8px)
            `;
        });

        card.addEventListener("mouseleave", () => {
            card.style.transform = "";
            card.style.removeProperty("--mouse-x");
            card.style.removeProperty("--mouse-y");
        });
    });
}

window.addEventListener("beforeunload", () => {
    preloader.classList.remove("hidden");
});
