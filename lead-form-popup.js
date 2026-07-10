(function () {
  // --- 設定値 ---
  var REDIRECT_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSfYt373xf8padZTHHZMp9-z5XO4K7I1ugiK4Y7c0dMT_WkyvA/viewform?usp=publish-editor';
  var GOOGLE_CLIENT_ID = 'YOUR_CLIENT_ID.apps.googleusercontent.com';
  var GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';
  var GOOGLE_NAME_ENTRY_KEY = 'entry.111111111';
  var GOOGLE_EMAIL_ENTRY_KEY = 'entry.222222222';
  var STORAGE_KEY = 'nanndemoya_lead_form_hidden_until';
  var DELAY_MS = 2500;
  var APPEND_RETRY_DELAY_MS = 50;
  var MAX_APPEND_RETRIES = 60;
  var memoryHiddenUntil = 0;
  var readHiddenUntil = function () {
    try {
      return parseInt(window.localStorage.getItem(STORAGE_KEY) || '0', 10) || 0;
    } catch (error) {
      return memoryHiddenUntil;
    }
  };
  var writeHiddenUntil = function (value) {
    memoryHiddenUntil = value;
    try {
      window.localStorage.setItem(STORAGE_KEY, String(value));
    } catch (error) {
      // localStorage が使えない環境でもポップアップ表示自体は継続する
    }
  };

  // すでに非表示期間中（24時間以内）であれば、何もしない
  var now = Date.now();
  var hiddenUntil = readHiddenUntil();
  if (now < hiddenUntil) {
    return;
  }

  var doc = document;
  var decodeJwtResponse = function (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  };
  var buildGoogleFormUrl = function (fullName, email) {
    var url = new URL(REDIRECT_URL, window.location.href);
    if (GOOGLE_NAME_ENTRY_KEY) {
      url.searchParams.set(GOOGLE_NAME_ENTRY_KEY, fullName);
    }
    if (GOOGLE_EMAIL_ENTRY_KEY) {
      url.searchParams.set(GOOGLE_EMAIL_ENTRY_KEY, email);
    }
    return url.toString();
  };
  var handleCredentialResponse = function (response) {
    var responsePayload = decodeJwtResponse(response.credential);
    var userName = responsePayload.name || '';
    var userEmail = responsePayload.email || '';

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      'event': 'lead_google_login',
      'lead_email': userEmail,
      'lead_first_name': responsePayload.given_name || '',
      'lead_last_name': responsePayload.family_name || ''
    });

    window.open(buildGoogleFormUrl(userName, userEmail), '_blank');
  };
  window.handleCredentialResponse = handleCredentialResponse;
  var ensureGoogleIdentityScript = function (overlay) {
    var script = doc.querySelector('script[src="' + GOOGLE_SCRIPT_SRC + '"]');
    var renderGoogleButton = function () {
      if (!window.google || !window.google.accounts || !window.google.accounts.id) {
        return;
      }

      var target = overlay.querySelector('.g_id_signin');
      if (!target) {
        return;
      }

      target.innerHTML = '';
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        context: 'signin',
        ux_mode: 'popup',
        auto_select: false
      });
      window.google.accounts.id.renderButton(target, {
        type: 'standard',
        shape: 'rounded',
        theme: 'outline',
        text: 'signin_with',
        size: 'large',
        logo_alignment: 'left'
      });
    };

    if (script) {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        renderGoogleButton();
      } else {
        script.addEventListener('load', renderGoogleButton, { once: true });
      }
      return;
    }

    script = doc.createElement('script');
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = renderGoogleButton;
    doc.head.appendChild(script);
  };

  // --- ポップアップを生成・表示する主要関数 ---
  var renderPopup = function () {
    // 1. スタイルの生成と追加
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
      '.nm-lead-google { margin: 0 0 14px; }',
      '.nm-lead-google-note { margin: 0 0 6px; font-size: 12px; color: #555; }',
      '.nm-lead-divider { margin: 16px 0 12px; border: 0; border-top: 1px solid #e3e8f0; }',
      '.nm-lead-submit { width: 100%; padding: 10px; margin-top: 8px; background: #2f6fed; color: #fff; border: none; border-radius: 6px; font-size: 15px; font-weight: 700; cursor: pointer; transition: background 0.2s; }',
      '.nm-lead-submit:hover { background: #1f4fb0; }'
    ].join('\n');
    doc.head.appendChild(style);

    // 2. ボット確認用の計算問題を生成 (2〜9のランダム)
    var a = Math.floor(Math.random() * 8) + 2;
    var b = Math.floor(Math.random() * 8) + 2;
    var botAnswer = a + b;

    // 3. オーバーレイ要素の作成
    var overlay = doc.createElement('div');
    overlay.className = 'nm-lead-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'nm-lead-title');
    
    overlay.innerHTML = '<div class="nm-lead-modal">'
      + '<button type="button" class="nm-lead-close" aria-label="閉じる">✕</button>'
      + '<h2 id="nm-lead-title">お気軽にお問い合わせください</h2>'
      + '<p class="nm-lead-subtitle">ご連絡先をご入力のうえ、ボット確認に回答すると外部ページへ移動します。</p>'
      + '<div class="nm-lead-google">'
      + '<p class="nm-lead-google-note">Googleアカウントでログインして入力を省略できます。</p>'
      + '<div id="g_id_onload" data-client_id="' + GOOGLE_CLIENT_ID + '" data-context="signin" data-ux_mode="popup" data-callback="handleCredentialResponse" data-auto_prompt="false"></div>'
      + '<div class="g_id_signin" data-type="standard" data-shape="rounded" data-theme="outline" data-text="signin_with" data-size="large" data-logo_alignment="left"></div>'
      + '</div>'
      + '<hr class="nm-lead-divider">'
      + '<form class="nm-lead-form" novalidate>'
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
      + '<div class="nm-lead-field">'
      + '<label for="nm-lead-street">番地・ビル名<span class="nm-lead-required">*</span></label>'
      + '<input type="text" id="nm-lead-street" placeholder="例：千代田1-1" autocomplete="address-line1">'
      + '<div class="nm-lead-error" id="nm-lead-street-error">番地を入力してください。</div>'
      + '</div>'
      + '<div class="nm-lead-field">'
      + '<label for="nm-lead-bot">' + a + ' + ' + b + ' = ? <span class="nm-lead-required">*</span></label>'
      + '<input type="text" id="nm-lead-bot" inputmode="numeric" placeholder="計算結果を入力">'
      + '<div class="nm-lead-error" id="nm-lead-bot-error">ボット確認の回答が正しくありません。</div>'
      + '</div>'
      + '<button type="submit" class="nm-lead-submit">確認して進む</button>'
      + '</form>'
      + '</div>';

    // クッキー/ローカルストレージに24時間非表示フラグをセットする関数
    var hidePopupFor24h = function () {
      writeHiddenUntil(Date.now() + 24 * 60 * 60 * 1000);
    };

    var removePopup = function () {
      overlay.remove();
    };

    // ✕ ボタンによるクローズ
    var closeBtn = overlay.querySelector('.nm-lead-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        hidePopupFor24h();
        removePopup();
      });
    }

    // フォーム送信処理（バリデーションとGTMデータ送信）
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

        // エラー表示リセット
        Object.keys(inputs).forEach(function(key) {
          if(inputs[key]) inputs[key].classList.remove('nm-lead-input-error');
        });
        Object.keys(errors).forEach(function(key) {
          if(errors[key]) errors[key].style.display = 'none';
        });

        // 必須テキストフィールドチェック
        var requiredFields = ['lastName', 'firstName', 'phone', 'postal', 'region', 'locality', 'street'];
        requiredFields.forEach(function(field) {
          if (!inputs[field].value.trim()) {
            inputs[field].classList.add('nm-lead-input-error');
            errors[field].style.display = 'block';
            valid = false;
          }
        });

        // メールアドレス形式チェック
        var emailVal = inputs.email.value.trim();
        if (!emailVal || !inputs.email.validity.valid) {
          inputs.email.classList.add('nm-lead-input-error');
          errors.email.style.display = 'block';
          valid = false;
        }

        // ボット計算クイズチェック
        var botVal = parseInt((inputs.bot.value || '').trim(), 10);
        if (isNaN(botVal) || botVal !== botAnswer) {
          inputs.bot.classList.add('nm-lead-input-error');
          errors.bot.style.display = 'block';
          valid = false;
        }

        if (!valid) {
          return;
        }

        // ✨ すべてのデータをGTMのdataLayer（拡張コンバージョン対応）へ送信
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
        
        // GTMへのデータ書き込みの時間をわずかに待ってから安全にGoogleフォームへ遷移
        setTimeout(function() {
          window.location.href = REDIRECT_URL;
        }, 150);
      });
    }

    // 作成した要素を確実にDOM（画面）へ追加
    var appendAttempts = 0;
    var appendOverlay = function () {
      if (!doc.body) {
        appendAttempts += 1;
        if (appendAttempts < MAX_APPEND_RETRIES) {
          window.setTimeout(appendOverlay, APPEND_RETRY_DELAY_MS);
        } else if (window.console && typeof window.console.warn === 'function') {
          window.console.warn('Lead form popup could not be attached because document.body was unavailable.');
        }
        return;
      }

      doc.body.appendChild(overlay);
      ensureGoogleIdentityScript(overlay);
    };

    appendOverlay();
  };

  // --- 修正の要：DOM（HTML）の構築が完全に終わってからタイマーを始動させる ---
  var initPopupScheduler = function () {
    setTimeout(renderPopup, DELAY_MS);
  };

  if (doc.readyState === 'interactive' || doc.readyState === 'complete') {
    initPopupScheduler();
  } else {
    doc.addEventListener('DOMContentLoaded', initPopupScheduler, { once: true });
  }
})();
