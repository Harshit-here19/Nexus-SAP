const NotificationModule = (() => {
  // --- 1. CSS Injection ---
  const style = document.createElement('style');
  style.textContent = `
    #notification-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 999999;
      font-family: 'JetBrains Mono', monospace;
    }

    .notification {
      --accent-color: #3498db;

      color: #fff;
      background:
      linear-gradient(
        135deg,
        color-mix(in srgb, var(--accent-color) 10%, rgba(18,22,35,.7)),
        rgba(18,22,35,.55)
      );
  
      backdrop-filter: blur(18px) saturate(180%);
      -webkit-backdrop-filter: blur(18px) saturate(180%);

      overflow: hidden;
      position: relative;

      padding: 14px 18px;      /* was 20px 25px */
      min-width: 300px;        /* was 350px */
      max-width: 340px;        /* was 400px */
      margin: 8px 0;           /* was 10px */
      border-radius: 7px;      /* optional */

      border: 1px solid rgba(255, 255, 255, 0.12);
      border-left: 4px solid var(--accent-color);

      box-shadow:
        0 10px 35px rgba(0, 0, 0, 0.35),
        0 0 20px color-mix(in srgb, var(--accent-color) 35%, transparent),
        inset 0 1px 0 rgba(255,255,255,0.12);

      opacity: 0;
      transform: translateY(-20px) scale(.96);
      transition:
        opacity .35s ease,
        transform .35s ease,
        box-shadow .4s ease;
    }

    .notification.show {
      opacity: 1;
      transform: translateY(0) scale(1);
      animation: glassGlow 2.2s ease-in-out infinite alternate;
    }

    .notification::before {
      content: "";
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 2px;
      background: linear-gradient(
          90deg,
          transparent,
          var(--accent-color),
          transparent
      );
    }

    @keyframes glassGlow {
      from {
        box-shadow:
          0 10px 35px rgba(0,0,0,.35),
          0 0 15px color-mix(in srgb, var(--accent-color) 25%, transparent),
          inset 0 1px 0 rgba(255,255,255,.1);
      }

      to {
        box-shadow:
          0 14px 45px rgba(0,0,0,.45),
          0 0 28px color-mix(in srgb, var(--accent-color) 60%, transparent),
          inset 0 1px 0 rgba(255,255,255,.18);
      }
    }

    .notification .heading {
      font-weight: 700;
      font-size: 13px;         /* was 15px */
      margin-bottom: 5px;      /* was 8px */
      letter-spacing: .06em;
      text-transform: uppercase;
      color: #fff;
    }

    .notification .message {
      color: rgba(255,255,255,.82);
      font-size: 13px;
      line-height: 1.4;
      font-weight: 500;
    }

    .notification .close-btn {
      position: absolute;
      top: 9px;
      right: 10px;
      width: 24px;
      height: 24px;

      display: flex;
      align-items: center;
      justify-content: center;

      border-radius: 50%;
      color: rgba(255,255,255,.7);
      cursor: pointer;
      transition: .25s;
    }

    .notification .close-btn:hover {
      background: rgba(255,255,255,.08);
      color: #fff;
    }

    .notification .progress {
      position: absolute;
      left: 0;
      bottom: 0;
      height: 3px;
      width: 0;

      background: linear-gradient(
        90deg,
        var(--accent-color),
        color-mix(in srgb, var(--accent-color) 55%, white),
        var(--accent-color)
      );

      box-shadow: 0 0 10px var(--accent-color);
    }

    .notification.success { border-left-color: #2ecc71;border-top-color: #22c55e; --accent-color:#22c55e; }
    .notification.error { border-left-color: #e74c3c;border-top-color: #ef4444; --accent-color:#ef4444; }
    .notification.info { border-left-color: #a855f7;border-top-color: #a855f7; --accent-color:#a855f7; }
    .notification.warning { border-left-color: #f1c40f;border-top-color: #f59e0b; --accent-color:#f59e0b; }
  `;
  document.head.appendChild(style);

  // --- 2. Logic ---
  let container = document.getElementById('notification-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'notification-container';
    document.body.appendChild(container);
  }

  function createNotification(heading, message, options = {}) {
    const { type = 'info', duration = 5000, sound = null } = options;

    const notif = document.createElement('div');
    notif.className = `notification ${type}`;
    notif.innerHTML = `
      <div class="heading">${heading}</div>
      <div class="message">${message}</div>
      <span class="close-btn">&times;</span>
      <div class="progress"></div>
    `;

    if (sound) {
      const audio = new Audio(sound);
      audio.play().catch(e => console.warn('Sound failed to play:', e));
    }

    notif.querySelector('.close-btn').addEventListener('click', () => hideNotification(notif));
    container.appendChild(notif);

    setTimeout(() => notif.classList.add('show'), 50);

    const progress = notif.querySelector('.progress');
    progress.style.transition = `width ${duration}ms linear`;
    setTimeout(() => progress.style.width = '100%', 50);

    setTimeout(() => hideNotification(notif), duration);
  }

  function hideNotification(notif) {
    notif.classList.remove('show');
    setTimeout(() => {
      if (notif.parentNode) notif.parentNode.removeChild(notif);
    }, 400);
  }

  return {
    notify: createNotification
  };
})();

export default NotificationModule;