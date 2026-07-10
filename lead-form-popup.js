<!-- 1. Google認証ライブラリの読み込み（<head>内または</body>直前に記述） -->
<script src="https://accounts.google.com/gsi/client" async defer></script>

<!-- 2. Googleでログインボタンを表示したい場所に設置 -->
<div id="g_id_onload"
     data-client_id="593428385721-mj70tgma9b20kd4hm9u1ni90nhsre36l.apps.googleusercontent.com" 
     data-context="signin"
     data-ux_mode="popup"
     data-callback="handleCredentialResponse"
     data-auto_prompt="false">
</div>

<div class="g_id_signin"
     data-type="standard"
     data-shape="rounded"
     data-theme="outline"
     data-text="signin_with"
     data-size="large"
     data-logo_alignment="left">
</div>
(function () {
  var REDIRECT_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSfYt373xf8padZTHHZMp9-z5XO4K7I1ugiK4Y7c0dMT_WkyvA/viewform?usp=publish-editor';
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
      '.nm-lead-modal { position: relative; width: min(520px, 100%); background: #ffffff; border-radius: 14px; padding: 32px 32px 24px; box-shadow: 0 16px 48px rgba(0,0,0,0.28); color: #1a1a1a; font-size: 14px; line-height: 1.5; box-sizing: border-box; max-height: 90vh; overflow-y: auto; }',
      '.nm-lead-close { position: absolute; top: 12px; right: 14px; background: none; border: none; font-size: 22px; line-height: 1; cursor: pointer; color: #666; padding: 4px 6px; border-radius: 6px; }',
      '.nm-lead-close:hover { background: #f0f0f0; color: #111; }',
      '.nm-lead-modal h2 { margin: 0 0 6px; font-size: 18px; font-weight: 700; color: #111; }',
      '.nm-lead-modal .nm-lead-subtitle { margin: 0 0 16px; font-size: 12px; color: #666; }',
      '.nm-lead-row { display: flex; gap: 12px; }',
      '.nm-lead-row .nm-lead-field { flex: 1; }',
      '.nm-lead-field { margin-bottom: 12px; }',
      '.nm-lead-field label { display: block; font-size: 12px; font-weight: 600; margin-bottom: 4px; color: #333; }',
      '.nm-lead-field .nm-lead-required { color: #c62828; margin-left: 3px; }',
      '.nm-lead-field input, .nm-lead-field select { width: 100%; padding: 8px 10px; border: 1.5px solid #d0d7e2; border-radius: 6px; font-size: 14px; outline: none; box-sizing: border-box; transition: border-color 0.2s; background: #fff; }',
      '.nm-lead-field input:focus, .nm-lead-field select:focus { border-color: #2f6fed; }',
      '.nm-lead-field input.nm-lead-input-error { border-color: #c62828; }',
      '.nm-lead-error { font-size: 11px; color: #c62828; margin-top: 3px; display: none; }',
      '.nm-lead-submit { width: 100%; padding: 10px; margin-top: 8px; background: #2f6fed; color: #fff; border: none; border-radius: 6px; font-size: 15px; font-weight: 700; cursor: pointer; transition: background 0.2s; }',
      '.nm-lead-submit:hover { background: #1f4fb0; }'
    ].join('\n');
    doc.head.appendChild(style);

    var a = Math.floor(Math.random() * 8) + 2;
    var b = Math.floor(Math.random() * 8) + 2;
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
      
      // 姓・名（横並び）
      + '<div class="nm-lead-row">'
      + '<div class="nm-lead-field">'
      + '<label for="nm-lead-last-name">姓<span class="nm-lead-required">*</span></label>'
      + '<input type="text" id="nm-lead-last-name" placeholder="例：山田" autocomplete="family-name">'
      + '<div class="nm-lead-error" id="nm-lead-last-name-error">姓を入力してください。</div>'
      + '</div>'
      + '<div class="nm-lead-field">'
      + '<label for="nm-lead-first-name">名<span class="nm-lead-required">*</span></label>'
      + '<input type="text" id="nm-lead-first-name" placeholder="例：太郎" autocomplete="given-name">'
      + '<div class="nm-lead-error" id="nm-lead-first-name-error">名を入力してください。</div>'
      + '</div>'
      + '</div>'
      
      // メール・電話
      + '<div class="nm-lead-field">'
      + '<label for="nm-lead-email">メールアドレス<span class="nm-lead-required">*</span></label>'
      + '<input type="email" id="nm-lead-email" placeholder="例：example@email.com" autocomplete="email">'
      + '<div class="nm-lead-error" id="nm-lead-email-error">有効なメールアドレスを入力してください。</div>'
      + '</div>'
      + '<div class="nm-lead-field">'
      + '<label for="nm-lead-phone">電話番号<span class="nm-lead-required">*</span></label>'
      + '<input type="tel" id="nm-lead-phone" placeholder="例：09012345678" autocomplete="tel">'
      + '<div class="nm-lead-error" id="nm-lead-phone-error">電話番号を入力してください。</div>'
      + '</div>'
      
      // 国・郵便番号（国はデフォルト日本）
      + '<div class="nm-lead-row">'
      + '<div class="nm-lead-field">'
      + '<label for="nm-lead-country">国<span class="nm-lead-required">*</span></label>'
      + '<select id="nm-lead-country" autocomplete="country">'
      + '<option value="JP" selected>日本 (Japan)</option>'
      + '<option value="US">アメリカ (USA)</option>'
      + '</select>'
      + '</div>'
      + '<div class="nm-lead-field">'
      + '<label for="nm-lead-postal">郵便番号<span class="nm-lead-required">*</span></label>'
      + '<input type="text" id="nm-lead-postal" placeholder="例：100-0001" autocomplete="postal-code">'
      + '<div class="nm-lead-error" id="nm-lead-postal-error">郵便番号を入力してください。</div>'
      + '</div>'
      + '</div>'

      // 地域（都道府県）・市区町村
      + '<div class="nm-lead-row">'
      + '<div class="nm-lead-field">'
      + '<label for="nm-lead-region">地域 (都道府県)<span class="nm-lead-required">*</span></label>'
      + '<input type="text" id="nm-lead-region" placeholder="例：東京都" autocomplete="address-level1">'
      + '<div class="nm-lead-error" id="nm-lead-region-error">都道府県を入力してください。</div>'
      + '</div>'
      + '<div class="nm-lead-field">'
      + '<label for="nm-lead-locality">市区町村<span class="nm-lead-required">*</span></label>'
      + '<input type="text" id="nm-lead-locality" placeholder="例：千代田区" autocomplete="address-level2">'
      + '<div class="nm-lead-error" id="nm-lead-locality-error">市区町村を入力してください。</div>'
      + '</div>'
      + '</div>'

      // 番地
      + '<div class="nm-lead-field">'
      + '<label for="nm-lead-street">番地・ビル名<span class="nm-lead-required">*</span></label>'
      + '<input type="text" id="nm-lead-street" placeholder="例：千代田1-1" autocomplete="address-line1">'
      + '<div class="nm-lead-error" id="nm-lead-street-error">番地を入力してください。</div>'
      + '</div>'
      
      // ボット確認
      + '<div class="nm-lead-field">'
      + '<label for="nm-lead-bot">' + a + ' + ' + b + ' = ? <span class="nm-lead-required">*</span></label>'
      + '<input type="text" id="nm-lead-bot" inputmode="numeric" placeholder="計算結果を入力">'
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

    var form = overlay.querySelector('.nm-lead-form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();

        var inputs = {
          lastName: overlay.querySelector('#nm-lead-last-name'),
          firstName: overlay.querySelector('#nm-lead-first-name'),
          email: overlay.querySelector('#nm-lead-email'),
          phone: overlay.querySelector('#nm-lead-phone'),
          country: overlay.querySelector('#nm-lead-country'),
          postal: overlay.querySelector('#nm-lead-postal'),
          region: overlay.querySelector('#nm-lead-region'),
          locality: overlay.querySelector('#nm-lead-locality'),
          street: overlay.querySelector('#nm-lead-street'),
          bot: overlay.querySelector('#nm-lead-bot')
        };

        var errors = {
          lastName: overlay.querySelector('#nm-lead-last-name-error'),
          firstName: overlay.querySelector('#nm-lead-first-name-error'),
          email: overlay.querySelector('#nm-lead-email-error'),
          phone: overlay.querySelector('#nm-lead-phone-error'),
          postal: overlay.querySelector('#nm-lead-postal-error'),
          region: overlay.querySelector('#nm-lead-region-error'),
          locality: overlay.querySelector('#nm-lead-locality-error'),
          street: overlay.querySelector('#nm-lead-street-error'),
          bot: overlay.querySelector('#nm-lead-bot-error')
        };

        var valid = true;

        // エラー状態の初期化
        Object.keys(inputs).forEach(function(key) {
          inputs[key].classList.remove('nm-lead-input-error');
        });
        Object.keys(errors).forEach(function(key) {
          errors[key].style.display = 'none';
        });

        // 必須チェック一覧
        var requiredFields = ['lastName', 'firstName', 'phone', 'postal', 'region', 'locality', 'street'];
        requiredFields.forEach(function(field) {
          if (!inputs[field].value.trim()) {
            inputs[field].classList.add('nm-lead-input-error');
            errors[field].style.display = 'block';
            valid = false;
          }
        });

        // メールチェック
        var emailVal = inputs.email.value.trim();
        if (!emailVal || !inputs.email.validity.valid) {
          inputs.email.classList.add('nm-lead-input-error');
          errors.email.style.display = 'block';
          valid = false;
        }

        // ボットチェック
        var botVal = parseInt((inputs.bot.value || '').trim(), 10);
        if (isNaN(botVal) || botVal !== botAnswer) {
          inputs.bot.classList.add('nm-lead-input-error');
          errors.bot.style.display = 'block';
          valid = false;
        }

        if (!valid) {
          return;
        }

        // ✨ すべてのデータをGTMのデータレイヤーへ送信
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          'event': 'lead_form_submit',
          'lead_email': emailVal,
          'lead_phone': inputs.phone.value.trim(),
          'lead_first_name': inputs.firstName.value.trim(),
          'lead_last_name': inputs.lastName.value.trim(),
          'lead_street': inputs.street.value.trim(),
          'lead_locality': inputs.locality.value.trim(),
          'lead_region': inputs.region.value.trim(),
          'lead_country': inputs.country.value.trim(),
          'lead_postal': inputs.postal.value.trim()
        });

        hidePopupFor24h();
        
        // データレイヤーへの書き込み完了をわずかに待ってからGoogleフォームへ安全に遷移
        setTimeout(function() {
          window.location.href = REDIRECT_URL;
        }, 150);
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

// JWT（Googleから返却される暗号化データ）を解読するための関数
function decodeJwtResponse(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

// Googleログインが成功した時に自動で呼び出される関数
function handleCredentialResponse(response) {
    // 1. ユーザー情報の取得
    const responsePayload = decodeJwtResponse(response.credential);
    
    const userName  = responsePayload.name;  // フルネーム (例: 山田太郎)
    const userEmail = responsePayload.email; // メールアドレス

    // 2. 拡張コンバージョン用にGTMデータレイヤーにも送信しておく場合（任意）
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
        'event': 'lead_google_login',
        'lead_email': userEmail,
        'lead_first_name': responsePayload.given_name,
        'lead_last_name': responsePayload.family_name
    });

    // 3. Googleフォームの事前入力URLの組み立て
    // ★ステップ1で取得したベースURLに書き換えてください
    const formBaseUrl = "https://docs.google.com/forms/d/e/1FAIpQLSfYt373xf8padZTHHZMp9-z5XO4K7I1ugiK4Y7c0dMT_WkyvA/viewform?usp=pp_url";
    
    // ★ダミー文字列に対応する entry.xxxx の部分をステップ1の結果に合わせて書き換えてください
    const finalFormUrl = `${formBaseUrl}&entry.111111111=${encodeURIComponent(userName)}&entry.1152315817=${encodeURIComponent(userEmail)}`;

    // 4. Googleフォームへユーザーを画面遷移させる（別タブで開く場合）
    window.open(finalFormUrl, '_blank');
}
