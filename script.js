 window.addEventListener('load', () => {
      const urlInput = document.getElementById('urlInput');
      const sizeSelect = document.getElementById('sizeSelect');
      const genBtn = document.getElementById('genBtn');
      const clearBtn = document.getElementById('clearBtn');
      const saveBtn = document.getElementById('saveBtn');
      const container = document.getElementById('qrContainer');
      const statusEl = document.getElementById('status');

      let qr;

      const isValidURL = (str) => {
        try { new URL(str); return true; } catch { return false; }
      };

      const resetPreview = () => {
        container.innerHTML = '<span class="meta">No QR yet</span>';
        saveBtn.disabled = true;
        statusEl.textContent = '';
      };

      const makeQR = () => {
        const text = urlInput.value.trim();
        const size = parseInt(sizeSelect.value, 10) || 512;

        if (!text) { statusEl.textContent = 'Please paste a link or text.'; return; }
        statusEl.textContent = isValidURL(text) ? 'OK: URL detected.' : 'Note: Treating input as plain text.';
        container.innerHTML = "";

        qr = new QRCode(container, {
          text, width: size, height: size,
          correctLevel: QRCode.CorrectLevel.H,
          colorDark: "#000000", colorLight: "#ffffff"
        });

        // Enable Save once rendered
        let tries = 0;
        const t = setInterval(() => {
          const canvas = container.querySelector('canvas');
          const img = container.querySelector('img');
          if (canvas || img || tries > 10) {
            clearInterval(t);
            saveBtn.disabled = !(canvas || img);
          }
          tries++;
        }, 40);
      };

      const downloadPNG = () => {
        let dataURL;
        const canvas = container.querySelector('canvas');

        if (canvas) {
          dataURL = canvas.toDataURL('image/png');
        } else {
          const img = container.querySelector('img');
          if (!img) return;
          const tmp = document.createElement('canvas');
          tmp.width  = img.naturalWidth  || parseInt(sizeSelect.value, 10);
          tmp.height = img.naturalHeight || parseInt(sizeSelect.value, 10);
          const ctx = tmp.getContext('2d');
          ctx.fillStyle = '#fff';
          ctx.fillRect(0, 0, tmp.width, tmp.height);
          ctx.drawImage(img, 0, 0, tmp.width, tmp.height);
          dataURL = tmp.toDataURL('image/png');
        }

        let name = urlInput.value.trim()
          .replace(/^https?:\/\//,'')
          .replace(/[^\w.-]+/g,'_')
          .slice(0,60) || 'qr-code';

        const a = document.createElement('a');
        a.href = dataURL;
        a.download = `${name}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();

        statusEl.textContent = 'PNG saved (check your browser downloads).';
      };

      genBtn.addEventListener('click', makeQR);
      saveBtn.addEventListener('click', downloadPNG);
      clearBtn.addEventListener('click', () => { urlInput.value = ""; resetPreview(); urlInput.focus(); });
      urlInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') makeQR(); });

      resetPreview();
    });