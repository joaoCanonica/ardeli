// Tour em vídeo sob demanda: o pôster só entra quando a pessoa abre o <details>;
// os capítulos viram botões que levam ao ponto do vídeo.
export function iniciarTour(): void {
  const tour = document.querySelector<HTMLDetailsElement>('[data-tour]');
  const video = tour?.querySelector<HTMLVideoElement>('[data-tour-video]');
  if (!tour || !video) return;
  tour.addEventListener('toggle', () => {
    if (tour.open && tour.dataset.poster && !video.poster) {
      video.poster = tour.dataset.poster;
      video.preload = 'metadata';
    }
    if (!tour.open) video.pause();
  });
  for (const b of tour.querySelectorAll<HTMLButtonElement>('[data-ir]')) {
    b.hidden = false;
    const texto = b.parentElement?.querySelector<HTMLElement>('[data-ir-texto]');
    if (texto) texto.hidden = true;
    b.addEventListener('click', () => {
      video.currentTime = Number(b.dataset.ir ?? 0);
      void video.play().catch(() => undefined);
      video.focus();
    });
  }
}
