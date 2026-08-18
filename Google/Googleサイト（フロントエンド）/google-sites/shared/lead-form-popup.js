 (function () {
   // --- 設定値 ---
   var REDIRECT_URL = 'LEAD_FORM_URL_FROM_APPS_SCRIPT';
   var GOOGLE_CLIENT_ID = 'GOOGLE_CLIENT_ID_FROM_APPS_SCRIPT';
   var GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';
   var GOOGLE_NAME_ENTRY_KEY = 'GOOGLE_NAME_ENTRY_KEY_FROM_APPS_SCRIPT';
   var GOOGLE_EMAIL_ENTRY_KEY = 'GOOGLE_EMAIL_ENTRY_KEY_FROM_APPS_SCRIPT';
   var STORAGE_KEY = 'nanndemoya_lead_form_hidden_until';
   var RE_SHOW_DELAY_MS = 60 * 1000; // ✕で閉じられた場合の再表示までの時間 (1分)
   var APPEND_RETRY_DELAY_MS = 50;
   var MAX_APPEND_RETRIES = 60;
   var memoryHiddenUntil = 0;
   var activeOverlay = null;

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
       // localStorage が使えない環境でも表示処理自体は継続する
     }
   };

   // すでに非表示期間中（24時間以内または閉じて1分以内）であれば、何もしない
   var now = Date.now();
   var hiddenUntil = readHiddenUntil();
   if (now < hiddenUntil) {
     return;
   }

   var doc = document;
   var hidePopupFor24h = function () {
     writeHiddenUntil(Date.now() + 24 * 60 * 60 * 1000);
   };
   var hidePopupFor1m = function () {
     writeHiddenUntil(Date.now() + RE_SHOW_DELAY_MS);
   };
   var removeActivePopup = function () {
     if (activeOverlay) {
       activeOverlay.remove();
       activeOverlay = null;
     }
   };
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

     hidePopupFor24h();
     removeActivePopup();
     window.location.href = buildGoogleFormUrl(userName, userEmail);
   };
   window.handleCredentialResponse = handleCredentialResponse;

   var ensureGoogleIdentityScript = function (overlay, promptAfterLoad) {
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
         logo_alignment: 'left',
         width: 320
       });

       if (promptAfterLoad) {
         window.google.accounts.id.prompt(function (notification) {
           if (
             notification.isNotDisplayed()
             || notification.isSkippedMoment()
             || notification.isDismissedMoment()
           ) {
             hidePopupFor24h();
             removeActivePopup();
             window.location.href = REDIRECT_URL;
           }
         });
       }
     };
     var script = doc.querySelector('script[src="' + GOOGLE_SCRIPT_SRC + '"]');

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

   // --- ポップアップ／バナーを生成・表示する主要関数 ---
   var renderPopup = function () {
     // 1. スタイルの生成と追加
     var style = doc.createElement('style');
     style.textContent = [
       '/* 画面下部バナーのスタイル */',
       '.nm-lead-banner { position: fixed; bottom: 0; left: 0; right: 0; background: #ffffff; box-shadow: 0 -4px 20px rgba(0,0,0,0.15); padding: 16px 24px; z-index: 10000; border-top: 1px solid #e3e8f0; font-size: 14px; color: #1a1a1a; }',
       '.nm-lead-banner-content { max-width: 960px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 16px; position: relative; }',
       '.nm-lead-banner-text h3 { margin: 0 0 4px; font-size: 16px; font-weight: 700; color: #111; }',
       '.nm-lead-banner-text p { margin: 0; font-size: 13px; color: #666; }',
       '.nm-lead-banner-actions { display: flex; gap: 10px; align-items: center; flex-shrink: 0; }',
       '.nm-lead-banner-btn { padding: 8px 16px; border: none; border-radius: 6px; font-size: 14px; font-weight: 700; cursor: pointer; transition: background 0.2s; white-space: nowrap; }',
       '.nm-lead-banner-btn-primary { background: #2f6fed; color: #fff; }',
       '.nm-lead-banner-btn-primary:hover { background: #1f4fb0; }',
       '.nm-lead-banner-btn-secondary { background: #eef2f7; color: #1f2937; }',
       '.nm-lead-banner-btn-secondary:hover { background: #dbe3ef; }',
       '.nm-lead-banner-close { background: none; border: none; font-size: 20px; line-height: 1; cursor: pointer; color: #666; padding: 4px 8px; border-radius: 4px; margin-left: 8px; }',
       '.nm-lead-banner-close:hover { background: #f0f0f0; color: #111; }',
       
       '/* モーダルダイアログのスタイル（フォーム表示時） */',
       '.nm-lead-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.55); display: flex; align-items: center; justify-content: center; padding: 16px; z-index: 10001; }',
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
       '.nm-lead-choice-buttons { display: grid; gap: 10px; margin-top: 18px; }',
       '.nm-lead-choice-button, .nm-lead-submit, .nm-lead-policy-button { width: 100%; padding: 10px; background: #2f6fed; color: #fff; border: none; border-radius: 6px; font-size: 15px; font-weight: 700; cursor: pointer; transition: background 0.2s; text-align: center; }',
       '.nm-lead-choice-button:hover, .nm-lead-submit:hover, .nm-lead-policy-button:hover { background: #1f4fb0; }',
       '.nm-lead-choice-button.nm-lead-secondary { background: #eef2f7; color: #1f2937; }',
       '.nm-lead-choice-button.nm-lead-secondary:hover { background: #dbe3ef; }',
       '.nm-lead-choice-button.nm-lead-google-choice { background: #ffffff; color: #1f2937; border: 1.5px solid #d0d7e2; }',
       '.nm-lead-choice-button.nm-lead-google-choice:hover { background: #f8fafc; }',
       '.nm-lead-choice-button:disabled { cursor: wait; opacity: 0.75; }',
       '.nm-lead-google { display: none; margin: 12px auto 0; min-height: 44px; text-align: center; }',
       '.nm-lead-google-note { margin: 8px 0 0; font-size: 12px; color: #555; text-align: center; }',
       '.nm-lead-submit { margin-top: 8px; }',
       '.nm-lead-screen[hidden], .nm-lead-info-popup[hidden] { display: none; }',
       '.nm-lead-info-popup { position: absolute; inset: 0; background: rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; padding: 16px; border-radius: 14px; }',
       '.nm-lead-info-card { position: relative; width: 100%; background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 12px 32px rgba(0,0,0,0.24); }',
       '.nm-lead-info-card p { margin: 0 0 12px; }',
       '@media (max-width: 640px) { .nm-lead-banner-content { flex-direction: column; align-items: flex-start; gap: 12px; } .nm-lead-banner-actions { width: 100%; justify-content: flex-end; } .nm-lead-modal { padding: 28px 20px 20px; } .nm-lead-row { display: block; } }'
     ].join('\n');
     doc.head.appendChild(style);

     // 2. ボット確認用の計算問題を生成 (2〜9のランダム)
     var a = Math.floor(Math.random() * 8) + 2;
     var b = Math.floor(Math.random() * 8) + 2;
     var botAnswer = a + b;

     // 3. 画面下部バナー要素の作成
     var banner = doc.createElement('div');
     banner.className = 'nm-lead-banner';
     banner.setAttribute('role', 'region');
     banner.setAttribute('aria-label', 'お問い合わせ確認');
     activeOverlay = banner;

     banner.innerHTML = '<div class="nm-lead-banner-content">'
       + '<div class="nm-lead-banner-text">'
       + '<h3>今すぐにお問い合わせしますか？</h3>'
       + '<p>連絡先情報はお問い合わせ対応およびご案内のために利用します。</p>'
       + '</div>'
       + '<div class="nm-lead-banner-actions">'
       + '<button type="button" class="nm-lead-banner-btn nm-lead-banner-btn-primary nm-lead-yes">はい</button>'
       + '<button type="button" class="nm-lead-banner-btn nm-lead-banner-btn-secondary nm-lead-no">いいえ</button>'
       + '<button type="button" class="nm-lead-banner-close" aria-label="閉じる">✕</button>'
       + '</div>'
       + '</div>';

     // 4. フォーム入力用モーダル要素の定義
     var createModalOverlay = function () {
       var modalOverlay = doc.createElement('div');
       modalOverlay.className = 'nm-lead-overlay';
       modalOverlay.setAttribute('role', 'dialog');
       modalOverlay.setAttribute('aria-modal', 'true');
       modalOverlay.setAttribute('aria-labelledby', 'nm-lead-title');

       modalOverlay.innerHTML = '<div class="nm-lead-modal">'
         + '<button type="button" class="nm-lead-close nm-lead-modal-close" aria-label="閉じる">✕</button>'
         + '<section class="nm-lead-screen nm-lead-form-screen">'
         + '<h2 id="nm-lead-title">お問い合わせ・事前登録</h2>'
         + '<p class="nm-lead-subtitle">入力は必要な範囲だけで大丈夫です。ご連絡先はお問い合わせ対応の目的で大切に扱います。</p>'
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
         + '<div class="nm-lead-choice-buttons" style="margin-top:12px;">'
         + '<button type="button" class="nm-lead-choice-button nm-lead-google-choice nm-lead-google-start">Googleでログイン（Googleフォームから問い合わせる）</button>'
         + '</div>'
         + '<div class="nm-lead-google">'
         + '<div id="g_id_onload" data-client_id="' + GOOGLE_CLIENT_ID + '" data-context="signin" data-ux_mode="popup" data-callback="handleCredentialResponse" data-auto_prompt="false"></div>'
         + '<div class="g_id_signin" data-type="standard" data-shape="rounded" data-theme="outline" data-text="signin_with" data-size="large" data-logo_alignment="left"></div>'
         + '<p class="nm-lead-google-note">Googleログイン画面が表示されない場合は、上のGoogleボタンから進んでください。</p>'
         + '</div>'
         + '</form>'
         + '</section>'
         + '</div>';

       var modalCloseBtn = modalOverlay.querySelector('.nm-lead-modal-close');
       if (modalCloseBtn) {
         modalCloseBtn.addEventListener('click', function () {
           hidePopupFor1m();
           removeActivePopup();
         });
       }

       var googleStartBtn = modalOverlay.querySelector('.nm-lead-google-start');
       if (googleStartBtn) {
         googleStartBtn.addEventListener('click', function () {
           var button = modalOverlay.querySelector('.nm-lead-google-start');
           var googleArea = modalOverlay.querySelector('.nm-lead-google');
           if (button) {
             button.disabled = true;
             button.textContent = 'Googleログインを起動しています...';
           }
           if (googleArea) {
             googleArea.style.display = 'block';
           }
           window.dataLayer = window.dataLayer || [];
           window.dataLayer.push({ 'event': 'lead_google_form_click' });
           ensureGoogleIdentityScript(modalOverlay, true);
         });
       }

       // フォーム送信処理
       var form = modalOverlay.querySelector('.nm-lead-form');
       if (form) {
         form.addEventListener('submit', function (e) {
           e.preventDefault();

           var inputs = {
             lastName: modalOverlay.querySelector('#nm-lead-last-name'),
             firstName: modalOverlay.querySelector('#nm-lead-first-name'),
             email: modalOverlay.querySelector('#nm-lead-email'),
             phone: modalOverlay.querySelector('#nm-lead-phone'),
             country: modalOverlay.querySelector('#nm-lead-country'),
             postal: modalOverlay.querySelector('#nm-lead-postal'),
             region: modalOverlay.querySelector('#nm-lead-region'),
             locality: modalOverlay.querySelector('#nm-lead-locality'),
             street: modalOverlay.querySelector('#nm-lead-street'),
             bot: modalOverlay.querySelector('#nm-lead-bot')
           };

           var errors = {
             lastName: modalOverlay.querySelector('#nm-lead-last-name-error'),
             firstName: modalOverlay.querySelector('#nm-lead-first-name-error'),
             email: modalOverlay.querySelector('#nm-lead-email-error'),
             phone: modalOverlay.querySelector('#nm-lead-phone-error'),
             postal: modalOverlay.querySelector('#nm-lead-postal-error'),
             region: modalOverlay.querySelector('#nm-lead-region-error'),
             locality: modalOverlay.querySelector('#nm-lead-locality-error'),
             street: modalOverlay.querySelector('#nm-lead-street-error'),
             bot: modalOverlay.querySelector('#nm-lead-bot-error')
           };

           var valid = true;

           Object.keys(inputs).forEach(function (key) {
             if (inputs[key]) inputs[key].classList.remove('nm-lead-input-error');
           });
           Object.keys(errors).forEach(function (key) {
             if (errors[key]) errors[key].style.display = 'none';
           });

           var requiredFields = ['lastName', 'firstName', 'phone', 'postal', 'region', 'locality', 'street'];
           requiredFields.forEach(function (field) {
             if (!inputs[field].value.trim()) {
               inputs[field].classList.add('nm-lead-input-error');
               errors[field].style.display = 'block';
               valid = false;
             }
           });

           var emailVal = inputs.email.value.trim();
           if (!emailVal || !inputs.email.validity.valid) {
             inputs.email.classList.add('nm-lead-input-error');
             errors.email.style.display = 'block';
             valid = false;
           }

           var botVal = parseInt((inputs.bot.value || '').trim(), 10);
           if (isNaN(botVal) || botVal !== botAnswer) {
             inputs.bot.classList.add('nm-lead-input-error');
             errors.bot.style.display = 'block';
             valid = false;
           }

           if (!valid) {
             return;
           }

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

           setTimeout(function () {
             window.location.href = REDIRECT_URL;
           }, 150);
         });
       }

       return modalOverlay;
     };

     var showLeadFormModal = function () {
       removeActivePopup();
       var modal = createModalOverlay();
       activeOverlay = modal;
       doc.body.appendChild(modal);
     };

     // バナー内の各種ボタンイベント設定
     var bannerCloseBtn = banner.querySelector('.nm-lead-banner-close');
     if (bannerCloseBtn) {
       bannerCloseBtn.addEventListener('click', function () {
         hidePopupFor1m();
         removeActivePopup();
       });
     }

     var yesBtn = banner.querySelector('.nm-lead-yes');
     if (yesBtn) {
       yesBtn.addEventListener('click', showLeadFormModal);
     }

     var noBtn = banner.querySelector('.nm-lead-no');
     if (noBtn) {
       noBtn.addEventListener('click', function () {
         hidePopupFor24h();
         removeActivePopup();
       });
     }

     // バナー要素をDOMに追加
     var appendAttempts = 0;
     var appendOverlay = function () {
       if (!doc.body) {
         appendAttempts += 1;
         if (appendAttempts < MAX_APPEND_RETRIES) {
           window.setTimeout(appendOverlay, APPEND_RETRY_DELAY_MS);
         } else if (window.console && typeof window.console.warn === 'function') {
           window.console.warn('Lead form banner could not be attached because document.body was unavailable.');
         }
         return;
       }

       doc.body.appendChild(banner);
     };

     appendOverlay();
   };

   // --- 初期化ロジック ---
   var initPopupScheduler = function () {
     renderPopup();
   };

   if (doc.readyState === 'interactive' || doc.readyState === 'complete') {
     initPopupScheduler();
   } else {
     doc.addEventListener('DOMContentLoaded', initPopupScheduler, { once: true });
   }
 })();
