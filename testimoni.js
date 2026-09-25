(function () {
  const slidesWrap = document.getElementById('testimoniSlides');
  const dotsWrap = document.getElementById('testimoniDots');
  const prevBtn = document.getElementById('testimoniPrev');
  const nextBtn = document.getElementById('testimoniNext');
  if (!slidesWrap) return;

  const total = slidesWrap.children.length;
  let index = 0;
  let timer;

  function renderDots() {
    dotsWrap.innerHTML = Array.from({ length: total }).map((_, i) =>
      `<button data-i="${i}" class="testimoni-dot w-2 h-2 rounded-full transition-colors ${i === index ? 'bg-accent' : 'bg-white/15'}" aria-label="Slide ${i + 1}"></button>`
    ).join('');
    dotsWrap.querySelectorAll('.testimoni-dot').forEach((dot) => {
      dot.addEventListener('click', () => goTo(parseInt(dot.dataset.i)));
    });
  }

  function goTo(i) {
    index = (i + total) % total;
    slidesWrap.style.transform = `translateX(-${index * 100}%)`;
    renderDots();
    resetTimer();
  }

  function next() { goTo(index + 1); }
  function prev() { goTo(index - 1); }

  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(next, 6000);
  }

  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  const section = document.getElementById('testimoni');
  section.addEventListener('mouseenter', () => clearInterval(timer));
  section.addEventListener('mouseleave', resetTimer);

  renderDots();
  resetTimer();
})();
