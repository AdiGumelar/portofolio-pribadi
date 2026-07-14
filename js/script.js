document.addEventListener("DOMContentLoaded", function () {
  const loadingScreen = document.getElementById("loading-screen");
  const scrollToTopButton = document.getElementById("scroll-to-top");
  const currentYear = document.getElementById("current-year");
  const navbar = document.querySelector(".portfolio-navbar");
  const navbarCollapse = document.getElementById("mainNavbar");
  const navLinks = document.querySelectorAll(".navbar-nav .nav-link");
  const themeToggles = document.querySelectorAll("#theme-toggle, #theme-toggle-mobile");
  const typingText = document.getElementById("typing-text");
  const counters = document.querySelectorAll(".counter");
  const skillProgressBars = document.querySelectorAll(".skill-progress-bar");
  const contactForm = document.getElementById("contact-form");
  const formAlert = document.getElementById("form-alert");

  let ticking = false;

  setCurrentYear();
  initTheme();
  initAOS();
  initLoadingScreen();
  initScrollState();
  initNavLinks();
  initTypingAnimation();
  initCounters();
  initSkillProgress();
  initContactForm();
  updateScrollState();

  function setCurrentYear() {
    if (currentYear) {
      currentYear.textContent = new Date().getFullYear();
    }
  }

  function initTheme() {
    const savedTheme = localStorage.getItem("portfolio-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldUseDark = savedTheme ? savedTheme === "dark" : prefersDark;

    document.body.classList.toggle("dark-mode", shouldUseDark);
    updateThemeIcons(shouldUseDark);

    themeToggles.forEach(function (toggle) {
      toggle.addEventListener("click", function () {
        const isDark = document.body.classList.toggle("dark-mode");
        localStorage.setItem("portfolio-theme", isDark ? "dark" : "light");
        updateThemeIcons(isDark);
      });
    });
  }

  function updateThemeIcons(isDark) {
    themeToggles.forEach(function (toggle) {
      const icon = toggle.querySelector("i");
      if (!icon) return;

      icon.className = isDark ? "bi bi-sun" : "bi bi-moon-stars";
      toggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    });
  }

  function initAOS() {
    if (typeof AOS === "undefined") return;

    AOS.init({
      duration: 780,
      easing: "ease-out-cubic",
      once: true,
      offset: 80
    });
  }

  function initLoadingScreen() {
    window.addEventListener("load", function () {
      document.body.classList.add("page-loaded");

      if (!loadingScreen) return;
      setTimeout(function () {
        loadingScreen.classList.add("hidden");
      }, 420);
    });

    setTimeout(function () {
      document.body.classList.add("page-loaded");
    }, 900);
  }

  function initScrollState() {
    window.addEventListener("scroll", function () {
      if (ticking) return;

      ticking = true;
      requestAnimationFrame(function () {
        updateScrollState();
        ticking = false;
      });
    }, { passive: true });
  }

  function updateScrollState() {
    const isScrolled = window.scrollY > 24;

    if (navbar) {
      navbar.classList.toggle("navbar-scrolled", isScrolled);
    }

    if (scrollToTopButton) {
      scrollToTopButton.classList.toggle("show", window.scrollY > 350);
    }

    updateActiveNavLink();
  }

  function initNavLinks() {
    if (scrollToTopButton) {
      scrollToTopButton.addEventListener("click", function () {
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      });
    }

    navLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        if (!navbarCollapse || typeof bootstrap === "undefined") return;

        const collapse = bootstrap.Collapse.getInstance(navbarCollapse);
        if (collapse) {
          collapse.hide();
        }
      });
    });
  }

  function updateActiveNavLink() {
    const scrollPosition = window.scrollY + 120;

    navLinks.forEach(function (link) {
      const targetId = link.getAttribute("href");
      if (!targetId || !targetId.startsWith("#")) return;

      const section = document.querySelector(targetId);
      if (!section) return;

      const sectionTop = section.offsetTop;
      const sectionBottom = sectionTop + section.offsetHeight;
      const isActive = scrollPosition >= sectionTop && scrollPosition < sectionBottom;

      link.classList.toggle("active", isActive);
    });
  }

  function initTypingAnimation() {
    if (!typingText) return;

    const text = "Information Technology Graduate";
    let index = 0;
    let isDeleting = false;

    function type() {
      typingText.textContent = text.slice(0, index);

      if (!isDeleting && index < text.length) {
        index += 1;
        setTimeout(type, 78);
        return;
      }

      if (!isDeleting && index === text.length) {
        isDeleting = true;
        setTimeout(type, 1600);
        return;
      }

      if (isDeleting && index > 0) {
        index -= 1;
        setTimeout(type, 34);
        return;
      }

      isDeleting = false;
      setTimeout(type, 520);
    }

    type();
  }

  function initCounters() {
    if (!counters.length) return;

    const animateCounter = function (counter) {
      const target = Number(counter.dataset.target);
      const duration = 1400;
      const startTime = performance.now();

      function updateCounter(currentTime) {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 3);

        counter.textContent = Math.floor(easedProgress * target);

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = target;
        }
      }

      requestAnimationFrame(updateCounter);
    };

    observeOnce(counters, animateCounter, 0.5);
  }

  function initSkillProgress() {
    if (!skillProgressBars.length) return;

    observeOnce(skillProgressBars, function (bar) {
      bar.style.width = (bar.dataset.width || "0") + "%";
    }, 0.45);
  }

  function observeOnce(elements, callback, threshold) {
    if (!("IntersectionObserver" in window)) {
      elements.forEach(callback);
      return;
    }

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        callback(entry.target);
        observer.unobserve(entry.target);
      });
    }, {
      threshold: threshold
    });

    elements.forEach(function (element) {
      observer.observe(element);
    });
  }

  function initContactForm() {
    if (!contactForm) return;

    const fields = {
      nameInput: document.getElementById("contact-name"),
      emailInput: document.getElementById("contact-email"),
      subjectInput: document.getElementById("contact-subject"),
      messageInput: document.getElementById("contact-message")
    };

    const fieldList = Object.values(fields).filter(Boolean);

    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!validateContactForm(fields)) {
        showFormAlert("Mohon lengkapi form kontak dengan benar.", "error");
        return;
      }

      showFormAlert("Pesan berhasil divalidasi. Terima kasih sudah menghubungi saya.", "success");
      contactForm.reset();
      fieldList.forEach(function (field) {
        field.classList.remove("is-valid", "is-invalid");
      });
    });

    fieldList.forEach(function (field) {
      field.addEventListener("input", function () {
        validateField(field);
      });
    });
  }

  function validateContactForm(fields) {
    return [
      validateField(fields.nameInput),
      validateField(fields.emailInput),
      validateField(fields.subjectInput),
      validateField(fields.messageInput)
    ].every(Boolean);
  }

  function validateField(field) {
    if (!field) return false;

    const value = field.value.trim();
    let isValid = value.length > 0;

    if (field.type === "email") {
      isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    if (field.id === "contact-message") {
      isValid = value.length >= 10;
    }

    field.classList.toggle("is-invalid", !isValid);
    field.classList.toggle("is-valid", isValid);

    return isValid;
  }

  function showFormAlert(message, type) {
    if (!formAlert) return;

    formAlert.textContent = message;
    formAlert.className = "form-alert show " + type;
  }
});
