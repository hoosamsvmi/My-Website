if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual"; //يعود الي بدايه الصفحه عنده عمل refresh
}

window.onload = () => {
  window.scrollTo(0, 0);
};

const buttons = document.querySelectorAll("[data-section]"); //الوظيفه تشغيل الازرار للزهاب الي كل section

buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const sectionId = btn.getAttribute("data-section");
    const section = document.getElementById(sectionId);

    section.scrollIntoView({
      behavior: "smooth",
    });
  });
});

const sections = document.querySelectorAll("section");
window.addEventListener("scroll", () => {
  sections.forEach((section) => {
    const windowHeight = window.innerHeight;
    const sectionTop = section.getBoundingClientRect().top;
    const revealPoint = 150;

    if (sectionTop < windowHeight - revealPoint) {
      section.classList.add("show");
    } else {
      section.classList.remove("show");
    }
  });
});
