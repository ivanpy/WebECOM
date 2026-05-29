// ────────────────────────────────────────────────
// NAV: sticky + mobile menu + dropdowns
// ────────────────────────────────────────────────
(function () {
  const nav = document.getElementById("nav");
  const toggle = document.getElementById("nav-toggle");
  const mobileMenu = document.getElementById("nav-mobile");
  const navLinks = mobileMenu.querySelectorAll("a");

  // Sticky scroll
  const handleScroll = () => {
    if (window.scrollY > 16) {
      nav.classList.add("nav--scrolled");
    } else {
      nav.classList.remove("nav--scrolled");
    }
  };
  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();

  // ── Desktop dropdowns ──
  const dropdownItems = nav.querySelectorAll(".nav__item--dropdown");

  const closeAllDropdowns = () => {
    dropdownItems.forEach((item) => {
      item.classList.remove("is-open");
      const btn = item.querySelector(".nav__dropdown-toggle");
      if (btn) btn.setAttribute("aria-expanded", "false");
    });
  };

  dropdownItems.forEach((item) => {
    const btn = item.querySelector(".nav__dropdown-toggle");
    if (!btn) return;

    // Click para abrir/cerrar
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = item.classList.contains("is-open");
      closeAllDropdowns();
      if (!isOpen) {
        item.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  // Cerrar dropdowns al hacer click fuera
  document.addEventListener("click", (e) => {
    if (!nav.contains(e.target)) closeAllDropdowns();
  });

  // Cerrar con Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAllDropdowns();
  });

  // ── Mobile menu toggle ──
  const closeMenu = () => {
    toggle.setAttribute("aria-expanded", "false");
    mobileMenu.classList.remove("is-open");
    mobileMenu.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    if (isOpen) {
      closeMenu();
    } else {
      toggle.setAttribute("aria-expanded", "true");
      mobileMenu.classList.add("is-open");
      mobileMenu.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }
  });

  // Cerrar mobile al hacer click en link (no en toggles de submenú)
  navLinks.forEach((link) => link.addEventListener("click", closeMenu));

  // ── Mobile submenús acordeón ──
  const mobileToggles = mobileMenu.querySelectorAll(".nav__mobile-dropdown-toggle");
  mobileToggles.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const submenu = document.getElementById(targetId);
      if (!submenu) return;
      const isOpen = submenu.classList.contains("is-open");
      submenu.classList.toggle("is-open", !isOpen);
      submenu.setAttribute("aria-hidden", isOpen ? "true" : "false");
      btn.setAttribute("aria-expanded", isOpen ? "false" : "true");
    });
  });

  // Cerrar mobile al click fuera
  document.addEventListener("click", (e) => {
    if (!nav.contains(e.target)) closeMenu();
  });
})();

// ────────────────────────────────────────────────
// SCROLL REVEAL
// ────────────────────────────────────────────────
(function () {
  const elements = document.querySelectorAll(".reveal");

  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px",
    },
  );

  elements.forEach((el) => observer.observe(el));
})();

// ────────────────────────────────────────────────
// Desplazamiento suave aplicado a enlaces
// ────────────────────────────────────────────────
(function () {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const target = document.querySelector(anchor.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      const navHeight = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--nav-height",
        ),
      );
      const top =
        target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });
})();

// ────────────────────────────────────────────────
// Activar NAV LINK al hacer scroll
// ────────────────────────────────────────────────
(function () {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav__menu .nav__link");

  const setActive = () => {
    let current = "";
    sections.forEach((section) => {
      const sectionTop =
        section.offsetTop -
        parseInt(
          getComputedStyle(document.documentElement).getPropertyValue(
            "--nav-height",
          ),
        ) -
        40;
      if (window.scrollY >= sectionTop) current = section.id;
    });
    navLinks.forEach((link) => {
      link.classList.toggle(
        "nav__link--active",
        link.getAttribute("href") === `#${current}`,
      );
    });
  };
  window.addEventListener("scroll", setActive, { passive: true });
})();

// ────────────────────────────────────────────────
// CONTACT FORM — validation + submit simulation
// ────────────────────────────────────────────────
(function () {
  const form = document.getElementById("contact-form");
  const wrap = document.getElementById("contact-form-wrap");
  const submitBtn = form ? form.querySelector(".form__submit") : null;
  const resetBtn = document.getElementById("contact-reset");

  if (!form) return;

  // ── Real-time field validation feedback ──
  const getFieldError = (field) => {
    if (field.validity.valueMissing) return "Este campo es obligatorio.";
    if (field.validity.typeMismatch && field.type === "email")
      return "Ingresa un email válido.";
    if (field.validity.tooShort) return `Mínimo ${field.minLength} caracteres.`;
    return "";
  };

  const showError = (field, msg) => {
    // Para el checkbox buscamos el error en el padre del wrapper, no del input
    const container =
      field.type === "checkbox"
        ? (field.closest(".form__field") ?? field.parentElement)
        : field.parentElement;

    let err = container.querySelector(".form__error");
    if (!err) {
      err = document.createElement("span");
      err.className = "form__error";
      err.setAttribute("role", "alert");
      container.appendChild(err);
    }

    err.textContent = msg;
    err.style.display = msg ? "block" : "none";
    field.setAttribute("aria-invalid", msg ? "true" : "false");

    // No aplicar estilos de borde al checkbox
    if (field.type !== "checkbox") {
      field.style.borderColor = msg ? "#E05C5C" : "";
      field.style.boxShadow = msg ? "0 0 0 3px rgba(224,92,92,0.12)" : "";
    }
  };

  const clearError = (field) => showError(field, "");

  // ── Validación en tiempo real ──
  form.querySelectorAll("input, select, textarea").forEach((field) => {
    field.addEventListener("blur", () => {
      if (field.name === "privacy") return; // el checkbox se valida sólo al submit
      showError(field, getFieldError(field));
    });
    field.addEventListener("input", () => clearError(field));
    field.addEventListener("change", () => clearError(field));
  });

  // ── Submit ──
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    let firstError = null;
    let valid = true;

    // Validar todos los campos required excepto el checkbox (se trata aparte)
    form
      .querySelectorAll('[required]:not([type="checkbox"])')
      .forEach((field) => {
        const msg = getFieldError(field);
        if (msg) {
          showError(field, msg);
          if (!firstError) firstError = field;
          valid = false;
        }
      });

    // Validar checkbox de privacidad
    const privacy = form.querySelector("#contact-privacy");
    if (privacy && !privacy.checked) {
      showError(privacy, "Debes aceptar la política de privacidad.");
      if (!firstError) firstError = privacy;
      valid = false;
    }

    if (!valid) {
      firstError.focus();
      return;
    }

    // Simular envío async
    submitBtn.classList.add("is-loading");

    setTimeout(() => {
      submitBtn.classList.remove("is-loading");
      wrap.classList.add("is-success");
      wrap.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 1800);
  });

  // ── Reset ──
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      form.reset();
      wrap.classList.remove("is-success");

      // Limpiar estilos inline y atributos aria de todos los campos
      form.querySelectorAll("input, select, textarea").forEach((f) => {
        f.removeAttribute("aria-invalid");
        f.style.borderColor = "";
        f.style.boxShadow = "";
      });

      // Eliminar todos los spans de error del DOM
      form.querySelectorAll(".form__error").forEach((el) => el.remove());
    });
  }
})();

// ────────────────────────────────────────────────
// STATS — contador animado + avance encadenado
// ────────────────────────────────────────────────
(function () {
  const carousel = document.getElementById("stats-carousel");
  if (!carousel) return;

  const slides = Array.from(document.getElementById("stats-track").children);
  const total  = slides.length;
  let current  = 0;
  let running  = false;

  function animateCounter(el, onDone) {
    const target = parseFloat(el.dataset.target);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const dur    = 1800;
    el.textContent = prefix + '0' + suffix;
    const start = performance.now();

    function tick(now) {
      const p     = Math.min((now - start) / dur, 1);
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      el.textContent = prefix + Math.floor(eased * target).toLocaleString('es-AR') + suffix;
      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = prefix + target.toLocaleString('es-AR') + suffix;
        onDone();
      }
    }
    requestAnimationFrame(tick);
  }

  function showSlide(index, first) {
    const prev = current;
    current = (index + total) % total;

    if (!first) {
      slides[prev].classList.remove('is-active');
    }

    const nextSlide = slides[current];
    // Esperar que el anterior se desvanezca antes de mostrar el siguiente
    setTimeout(() => {
      nextSlide.classList.add('is-active');
      const valueEl = nextSlide.querySelector('.stat__value[data-target]');
      animateCounter(valueEl, () => {
        setTimeout(() => {
          if (running) showSlide(current + 1, false);
        }, 2000);
      });
    }, first ? 0 : 420);
  }

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && !running) {
        running = true;
        showSlide(0, true);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  obs.observe(carousel);
})();

// ────────────────────────────────────────────────
// HERO TEXT SLIDES — rotación automática sin controles
// ────────────────────────────────────────────────
(function () {
  const slides = Array.from(document.querySelectorAll('.hero__slide'));
  if (slides.length < 2) return;

  let current = 0;
  const INTERVAL = 5000;  // ms por slide
  const LEAVE    = 380;   // ms coincide con la transición is-leaving

  function goTo(next) {
    const prev = current;

    // Salida del slide anterior
    slides[prev].classList.add('is-leaving');
    slides[prev].classList.remove('is-active');
    setTimeout(() => slides[prev].classList.remove('is-leaving'), LEAVE);

    // Entrada del siguiente slide
    slides[next].classList.add('is-active');
    current = next;
  }

  setInterval(() => goTo((current + 1) % slides.length), INTERVAL);
})();

// ────────────────────────────────────────────────
// EXPANSION SLIDES — rotación automática sin controles
// ────────────────────────────────────────────────
(function () {
  const slides = Array.from(document.querySelectorAll('.expansion__slide'));
  if (slides.length < 2) return;

  let current = 0;
  const INTERVAL = 4500;
  const LEAVE    = 380;

  function goTo(next) {
    const prev = current;
    slides[prev].classList.add('is-leaving');
    slides[prev].classList.remove('is-active');
    setTimeout(() => slides[prev].classList.remove('is-leaving'), LEAVE);
    slides[next].classList.add('is-active');
    current = next;
  }

  setInterval(() => goTo((current + 1) % slides.length), INTERVAL);
})();

// ────────────────────────────────────────────────
// BOTÓN IR ARRIBA — inyectado automáticamente
// ────────────────────────────────────────────────
(function () {
  const SCROLL_THRESHOLD = 400;

  // Crear e inyectar el botón
  const btn = document.createElement("button");
  btn.className = "back-to-top";
  btn.setAttribute("aria-label", "Volver al inicio de la página");
  btn.setAttribute("title", "Ir arriba");
  btn.innerHTML =
    '<svg class="back-to-top__icon" viewBox="0 0 24 24" fill="none" ' +
    'stroke="currentColor" stroke-width="2.5" stroke-linecap="round" ' +
    'stroke-linejoin="round" aria-hidden="true">' +
    '<polyline points="18 15 12 9 6 15"/></svg>';
  document.body.appendChild(btn);

  // Mostrar / ocultar según scroll
  const onScroll = () => {
    btn.classList.toggle("is-visible", window.scrollY >= SCROLL_THRESHOLD);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Scroll suave al hacer click
  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();

