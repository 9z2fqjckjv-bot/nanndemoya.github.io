(function () {
  var REDIRECT_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSfYt373xf8padZTHHZMp9-z5XO4K7I1ugiK4Y7c0dMT_WkyvA/viewform?usp=publish-editor'; // ← 遷移先を設定
  var STORAGE_KEY = 'nanndemoya_lead_form_hidden_until';
  var DELAY_MS = 2500;

  var now = Date.now();
  var hiddenUntil = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
  if (now < hiddenUntil) {
    return;
  }

  var doc = document;

  var renderPopup = function () {
    var style = doc.createElement('style');
    style.textContent = [
      '.nm-lead-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.55); display: flex; align-items: center; justify-content: center; padding: 16px; z-index: 10000; }',
      '.nm-lead-modal { position: relative; width: min(480px, 100%); background: #ffffff; border-radius: 14px; padding: 36px 32px 28px; box-shadow: 0 16px 48px rgba(0,0,0,0.28); color: #1a1a1a; font-size: 15px; line-height: 1.6; box-sizing: border-box; }',
      '.nm-lead-close { position: absolute; top: 12px; right: 14px; background: none; border: none; font-size: 22px; line-height: 1; cursor: pointer; color: #666; padding: 4px 6px; border-radius: 6px; }',
      '.nm-lead-close:hover { background: #f0f0f0; color: #111; }',
      '.nm-lead-modal h2 { margin: 0 0 6px; font-size: 20px; font-weight: 700; color: #111; }',
      '.nm-lead-modal .nm-lead-subtitle { margin: 0 0 20px; font-size: 13px; color: #666; }',
      '.nm-lead-field { margin-bottom: 16px; }',
      '.nm-lead-field label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 5px; color: #333; }',
      '.nm-lead-field .nm-lead-required { color: #c62828; margin-left: 3px; }',
      '.nm-lead-field input { width: 100%; padding: 10px 12px; border: 1.5px solid #d0d7e2; border-radius: 8px; font-size: 15px; outline: none; box-sizing: border-box; transition: border-color 0.2s; }',
      '.nm-lead-field input:focus { border-color: #2f6fed; }',
      '.nm-lead-field input.nm-lead-input-error { border-color: #c62828; }',
      '.nm-lead-error { font-size: 12px; color: #c62828; margin-top: 4px; display: none; }',
      '.nm-lead-submit { width: 100%; padding: 12px; margin-top: 6px; background: #2f6fed; color: #fff; border: none; border-radius: 8px; font-size: 16px; font-weight: 700; cursor: pointer; transition: background 0.2s; }',
      '.nm-lead-submit:hover { background: #1f4fb0; }'
    ].join('\n');
    doc.head.appendChild(style);

    var a = Math.floor(Math.random() * 8) + 2; // 2-9
    var b = Math.floor(Math.random() * 8) + 2; // 2-9
    var botAnswer = a + b;

    var overlay = doc.createElement('div');
    overlay.className = 'nm-lead-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'nm-lead-title');
    overlay.innerHTML = '<div class="nm-lead-modal">'
      + '<button type="button" class="nm-lead-close" aria-label="閉じる">✕</button>'
      + '<h2 id="nm-lead-title">お気軽にお問い合わせください</h2>'
      + '<p class="nm-lead-subtitle">ご連絡先をご入力のうえ、ボット確認に回答すると外部ページへ移動します。</p>'
      + '<form class="nm-lead-form" novalidate>'
      + '<div class="nm-lead-field">'
      + '<label for="nm-lead-name">氏名<span class="nm-lead-required">*</span></label>'
      + '<input type="text" id="nm-lead-name" name="name" placeholder="例：山田 太郎" autocomplete="name">'
      + '<div class="nm-lead-error" id="nm-lead-name-error">氏名を入力してください。</div>'
      + '</div>'
      + '<div class="nm-lead-field">'
      + '<label for="nm-lead-email">メールアドレス<span class="nm-lead-required">*</span></label>'
      + '<input type="email" id="nm-lead-email" name="email" placeholder="例：example@email.com" autocomplete="email">'
      + '<div class="nm-lead-error" id="nm-lead-email-error">有効なメールアドレスを入力してください。</div>'
      + '</div>'
      + '<div class="nm-lead-field">'
      + '<label for="nm-lead-phone">電話番号</label>'
      + '<input type="tel" id="nm-lead-phone" name="phone" placeholder="例：090-1234-5678" autocomplete="tel">'
      + '</div>'
      + '<div class="nm-lead-field">'
      + '<label for="nm-lead-bot">' + a + ' + ' + b + ' = ? <span class="nm-lead-required">*</span></label>'
      + '<input type="text" id="nm-lead-bot" name="bot" inputmode="numeric" placeholder="計算結果を入力">'
      + '<div class="nm-lead-error" id="nm-lead-bot-error">ボット確認の回答が正しくありません。</div>'
      + '</div>'
      + '<button type="submit" class="nm-lead-submit">確認して進む</button>'
      + '</form>'
      + '</div>';

    var hidePopupFor24h = function () {
      localStorage.setItem(STORAGE_KEY, String(Date.now() + 24 * 60 * 60 * 1000));
    };

    var removePopup = function () {
      overlay.remove();
    };

    var closeBtn = overlay.querySelector('.nm-lead-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        hidePopupFor24h();
        removePopup();
      });
    }

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) {
        hidePopupFor24h();
        removePopup();
      }
    });

    var form = overlay.querySelector('.nm-lead-form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();

        var nameInput = overlay.querySelector('#nm-lead-name');
        var emailInput = overlay.querySelector('#nm-lead-email');
        var phoneInput = overlay.querySelector('#nm-lead-phone');
        var botInput = overlay.querySelector('#nm-lead-bot');

        var nameError = overlay.querySelector('#nm-lead-name-error');
        var emailError = overlay.querySelector('#nm-lead-email-error');
        var botError = overlay.querySelector('#nm-lead-bot-error');

        var valid = true;

        nameInput.classList.remove('nm-lead-input-error');
        emailInput.classList.remove('nm-lead-input-error');
        botInput.classList.remove('nm-lead-input-error');
        nameError.style.display = 'none';
        emailError.style.display = 'none';
        botError.style.display = 'none';

        if (!nameInput.value.trim()) {
          nameInput.classList.add('nm-lead-input-error');
          nameError.style.display = 'block';
          valid = false;
        }

        var emailVal = emailInput.value.trim();
        if (!emailVal || !emailInput.validity.valid) {
          emailInput.classList.add('nm-lead-input-error');
          emailError.style.display = 'block';
          valid = false;
        }

        var botVal = parseInt((botInput.value || '').trim(), 10);
        if (isNaN(botVal) || botVal !== botAnswer) {
          botInput.classList.add('nm-lead-input-error');
          botError.style.display = 'block';
          valid = false;
        }

        if (!valid) {
          return;
        }

        // ==========================================
        // ✨ GTMデータレイヤー送信処理（追加箇所）
        // ==========================================
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          'event': 'lead_form_submit',               // GTMで拾うためのカスタムイベント名
          'lead_name': nameInput.value.trim(),       // 氏名
          'lead_email': emailVal,                    // メールアドレス
          'lead_phone': phoneInput.value.trim()      // 電話番号
        });
        // ==========================================

        hidePopupFor24h();
        
        // GTMへのデータ送信処理が完了する時間を微小（100ms）持たせて遷移
        setTimeout(function() {
          window.location.href = REDIRECT_URL;
        }, 100);
      });
    }

    if (doc.body) {
      doc.body.appendChild(overlay);
      return;
    }

    doc.addEventListener('DOMContentLoaded', function () {
      if (!doc.body.contains(overlay) && doc.body) {
        doc.body.appendChild(overlay);
      }
    }, { once: true });
  };

  var schedulePopup = function () {
    setTimeout(renderPopup, DELAY_MS);
  };

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', schedulePopup, { once: true });
    return;
  }

  schedulePopup();
})();
