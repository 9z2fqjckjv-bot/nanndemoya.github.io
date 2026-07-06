(function () {
  var NM_FORM_GH_OWNER  = '9z2fqjckjv-bot';
  var NM_FORM_GH_REPO   = 'nanndemoya.github.io';

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
      '.nm-lead-overlay {',
      '  position: fixed;',
      '  inset: 0;',
      '  background: rgba(0,0,0,0.55);',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  padding: 16px;',
      '  z-index: 10000;',
      '}',
      '.nm-lead-modal {',
      '  position: relative;',
      '  width: min(480px, 100%);',
      '  background: #ffffff;',
      '  border-radius: 14px;',
      '  padding: 36px 32px 28px;',
      '  box-shadow: 0 16px 48px rgba(0,0,0,0.28);',
      '  color: #1a1a1a;',
      '  font-size: 15px;',
      '  line-height: 1.6;',
      '  box-sizing: border-box;',
      '}',
      '.nm-lead-close {',
      '  position: absolute;',
      '  top: 12px;',
      '  right: 14px;',
      '  background: none;',
      '  border: none;',
      '  font-size: 22px;',
      '  line-height: 1;',
      '  cursor: pointer;',
      '  color: #666;',
      '  padding: 4px 6px;',
      '  border-radius: 6px;',
      '}',
      '.nm-lead-close:hover {',
      '  background: #f0f0f0;',
      '  color: #111;',
      '}',
      '.nm-lead-modal h2 {',
      '  margin: 0 0 6px;',
      '  font-size: 20px;',
      '  font-weight: 700;',
      '  color: #111;',
      '}',
      '.nm-lead-modal .nm-lead-subtitle {',
      '  margin: 0 0 20px;',
      '  font-size: 13px;',
      '  color: #666;',
      '}',
      '.nm-lead-field {',
      '  margin-bottom: 16px;',
      '}',
      '.nm-lead-field label {',
      '  display: block;',
      '  font-size: 13px;',
      '  font-weight: 600;',
      '  margin-bottom: 5px;',
      '  color: #333;',
      '}',
      '.nm-lead-field .nm-lead-required {',
      '  color: #c62828;',
      '  margin-left: 3px;',
      '}',
      '.nm-lead-field input {',
      '  width: 100%;',
      '  padding: 10px 12px;',
      '  border: 1.5px solid #d0d7e2;',
      '  border-radius: 8px;',
      '  font-size: 15px;',
      '  outline: none;',
      '  box-sizing: border-box;',
      '  transition: border-color 0.2s;',
      '}',
      '.nm-lead-field input:focus {',
      '  border-color: #2f6fed;',
      '}',
      '.nm-lead-field input.nm-lead-input-error {',
      '  border-color: #c62828;',
      '}',
      '.nm-lead-error {',
      '  font-size: 12px;',
      '  color: #c62828;',
      '  margin-top: 4px;',
      '  display: none;',
      '}',
      '.nm-lead-submit {',
      '  width: 100%;',
      '  padding: 12px;',
      '  margin-top: 6px;',
      '  background: #2f6fed;',
      '  color: #fff;',
      '  border: none;',
      '  border-radius: 8px;',
      '  font-size: 16px;',
      '  font-weight: 700;',
      '  cursor: pointer;',
      '  transition: background 0.2s;',
      '}',
      '.nm-lead-submit:hover {',
      '  background: #1f4fb0;',
      '}',
      '.nm-lead-thanks {',
      '  text-align: center;',
      '  padding: 12px 0 8px;',
      '}',
      '.nm-lead-thanks .nm-lead-thanks-icon {',
      '  font-size: 44px;',
      '  display: block;',
      '  margin-bottom: 12px;',
      '}',
      '.nm-lead-thanks h3 {',
      '  font-size: 20px;',
      '  font-weight: 700;',
      '  margin: 0 0 8px;',
      '  color: #111;',
      '}',
      '.nm-lead-thanks p {',
      '  font-size: 14px;',
      '  color: #555;',
      '  margin: 0 0 20px;',
      '}',
      '.nm-lead-thanks-close {',
      '  padding: 10px 32px;',
      '  background: #2f6fed;',
      '  color: #fff;',
      '  border: none;',
      '  border-radius: 8px;',
      '  font-size: 15px;',
      '  font-weight: 700;',
      '  cursor: pointer;',
      '  transition: background 0.2s;',
      '}',
      '.nm-lead-thanks-close:hover {',
      '  background: #1f4fb0;',
      '}'
    ].join('\n');
    doc.head.appendChild(style);

    var overlay = doc.createElement('div');
    overlay.className = 'nm-lead-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'nm-lead-title');
    overlay.innerHTML = '<div class="nm-lead-modal">'
      + '<button type="button" class="nm-lead-close" aria-label="閉じる">✕</button>'
      + '<h2 id="nm-lead-title">お気軽にお問い合わせください</h2>'
      + '<p class="nm-lead-subtitle">ご連絡先をご入力いただくと、担当者よりご連絡いたします。</p>'
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
      + '<button type="submit" class="nm-lead-submit">送信する</button>'
      + '<div class="nm-lead-error nm-lead-send-error" id="nm-lead-send-error" style="margin-top:10px;">送信に失敗しました。しばらくしてから再度お試しください。</div>'
      + '</form>'
      + '<div class="nm-lead-thanks" style="display:none;">'
      + '<span class="nm-lead-thanks-icon">✅</span>'
      + '<h3>ありがとうございます！</h3>'
      + '<p>お問い合わせを受け付けました。<br>担当者よりご連絡差し上げます。</p>'
      + '<button type="button" class="nm-lead-thanks-close">閉じる</button>'
      + '</div>'
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
        var nameError = overlay.querySelector('#nm-lead-name-error');
        var emailError = overlay.querySelector('#nm-lead-email-error');

        var valid = true;

        nameInput.classList.remove('nm-lead-input-error');
        emailInput.classList.remove('nm-lead-input-error');
        nameError.style.display = 'none';
        emailError.style.display = 'none';

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

        if (!valid) {
          return;
        }

        var submitBtn = overlay.querySelector('.nm-lead-submit');
        submitBtn.disabled = true;
        submitBtn.textContent = '送信中...';

        var phoneVal = (overlay.querySelector('#nm-lead-phone').value || '').trim();
        var now = new Date();
        var jstString = now.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });

        var doSubmit = function () {
          var sendError = overlay.querySelector('#nm-lead-send-error');

          fetch(
            'https://api.github.com/repos/' + NM_FORM_GH_OWNER + '/' + NM_FORM_GH_REPO + '/dispatches',
            {
              method: 'POST',
              headers: {
                'Accept': 'application/vnd.github+json',
                'Content-Type': 'application/json',
                'X-GitHub-Api-Version': '2022-11-28'
              },
              body: JSON.stringify({
                event_type: 'lead_form_submission',
                client_payload: {
                  name: nameInput.value.trim(),
                  email: emailVal,
                  phone: phoneVal,
                  submitted_at: jstString
                }
              })
            }
          ).then(function (res) {
            if (res.ok) {
              showThanks();
            } else {
              showSendError();
            }
          }).catch(function () {
            showSendError();
          });

          var showSendError = function () {
            submitBtn.disabled = false;
            submitBtn.textContent = '送信する';
            if (sendError) {
              sendError.style.display = 'block';
            }
          };
        };

        var showThanks = function () {
          form.style.display = 'none';
          var thanks = overlay.querySelector('.nm-lead-thanks');
          if (thanks) {
            thanks.style.display = 'block';
          }
          hidePopupFor24h();
        };

        doSubmit();
      });
    }

    var thanksCloseBtn = overlay.querySelector('.nm-lead-thanks-close');
    if (thanksCloseBtn) {
      thanksCloseBtn.addEventListener('click', removePopup);
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
