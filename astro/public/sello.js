const BADGE_W = 360;
const BADGE_H = 92;

document.addEventListener('DOMContentLoaded', () => {
  const rucInput = document.getElementById('badgeRucInput');
  const generateBtn = document.getElementById('generateBadgeBtn');
  const statusEl = document.getElementById('badgeStatus');
  const previewSection = document.getElementById('badgePreviewSection');
  const previewFrame = document.getElementById('badgePreviewFrame');
  const stage = document.getElementById('badgeStage');
  const embedCode = document.getElementById('embedCode');
  const copyBtn = document.getElementById('copyEmbedBtn');
  const themeBtns = document.querySelectorAll('.theme-opt');

  let currentRuc = null;
  let currentTheme = 'light';

  function render() {
    if (!currentRuc) return;
    const url = `${window.location.origin}/badge/${currentRuc}${currentTheme === 'dark' ? '?theme=dark' : ''}`;
    previewFrame.src = url;
    // The stage mimics the host page's background, so the user can see how the
    // badge will actually sit on a light or a dark site before copying it.
    if (stage) stage.classList.toggle('on-dark', currentTheme === 'dark');
    embedCode.value =
      `<iframe src="${url}" width="${BADGE_W}" height="${BADGE_H}" ` +
      `style="border:none;overflow:hidden;max-width:100%" scrolling="no" ` +
      `title="Verificado por consultaruc-pe.com" loading="lazy"></iframe>`;
  }

  themeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      themeBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentTheme = btn.dataset.theme;
      render();
    });
  });

  generateBtn.addEventListener('click', async () => {
    const ruc = rucInput.value.trim();
    if (!/^\d{11}$/.test(ruc)) {
      statusEl.textContent = 'Ingresa un RUC válido de 11 dígitos.';
      previewSection.style.display = 'none';
      return;
    }

    statusEl.textContent = 'Verificando...';

    try {
      const res = await fetch(`/api/ruc/${ruc}`);
      const json = await res.json();

      if (!json.success) {
        statusEl.textContent = 'Ese RUC no se encontró en nuestros registros — no se puede generar el sello.';
        previewSection.style.display = 'none';
        return;
      }

      currentRuc = ruc;
      render();
      previewSection.style.display = 'block';
      statusEl.textContent = '';
      previewSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (err) {
      statusEl.textContent = 'Error de conexión: ' + err.message;
    }
  });

  rucInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      generateBtn.click();
    }
  });

  copyBtn.addEventListener('click', () => {
    embedCode.select();
    navigator.clipboard.writeText(embedCode.value);
    const original = copyBtn.innerHTML;
    copyBtn.textContent = '✓ Copiado';
    setTimeout(() => { copyBtn.innerHTML = original; }, 2000);
  });
});
