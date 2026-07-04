(function () {
  const doc = document;
  const win = window;
  const consentApi = win.nanndemoyaGoogleTagConsent;

  if (!consentApi) {
    return;
  }

  const status = consentApi.getStatus();
  if (status === 'accepted' || status === 'declined' || status === 'hidden') {
    return;
  }

  const renderPopup = () => {
    const style = doc.createElement('style');
    style.textContent = `
      .nanndemoya-consent-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        z-index: 9999;
      }
      .nanndemoya-consent-modal {
        width: min(680px, 100%);
        background: #fff;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
        color: #1a1a1a;
        line-height: 1.7;
        font-size: 16px;
      }
      .nanndemoya-consent-modal h2 {
        margin: 0 0 12px;
        font-size: 22px;
      }
      .nanndemoya-consent-modal p {
        margin: 0 0 12px;
      }
      .nanndemoya-consent-modal a {
        color: #005fcc;
        font-weight: 700;
      }
      .nanndemoya-consent-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 18px;
      }
      .nanndemoya-consent-actions button {
        min-width: 150px;
        min-height: 44px;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 700;
        cursor: pointer;
        padding: 10px 16px;
      }
      .nanndemoya-consent-accept {
        background: #007a3d;
        color: #fff;
      }
      .nanndemoya-consent-decline {
        background: #c62828;
        color: #fff;
      }
      .nanndemoya-consent-hide {
        background: #455a64;
        color: #fff;
      }
    `;
    doc.head.appendChild(style);

    const overlay = doc.createElement('div');
    overlay.className = 'nanndemoya-consent-overlay';
    overlay.innerHTML = `
      <div class="nanndemoya-consent-modal" role="dialog" aria-modal="true" aria-labelledby="nanndemoya-consent-title">
        <h2 id="nanndemoya-consent-title">Googleタグを介した情報送信の同意について</h2>
        <p>このWebサイトではGoogle広告のコンバージョン獲得のために、Googleタグを活用しています。もし、Googleタグを介した情報送信をご希望でない場合、同意しないを選択してください。</p>
        <p>Googleの利用規約とプライバシーポリシーは<a href="https://policies.google.com/" target="_blank" rel="noopener noreferrer">こちら</a>。</p>
        <p>「何でも屋」の利用規約とプライバシーポリシーは<a href="policy.html">こちら</a>。</p>
        <p>このポップアップではクッキーを利用して、同意状態をブラウザに保存します。</p>
        <div class="nanndemoya-consent-actions">
          <button type="button" class="nanndemoya-consent-accept">同意する</button>
          <button type="button" class="nanndemoya-consent-decline">同意しない</button>
          <button type="button" class="nanndemoya-consent-hide">表示を隠す</button>
        </div>
      </div>
    `;

    const removePopup = () => {
      overlay.remove();
    };

    overlay.querySelector('.nanndemoya-consent-accept').addEventListener('click', () => {
      consentApi.accept();
      removePopup();
    });

    overlay.querySelector('.nanndemoya-consent-decline').addEventListener('click', () => {
      consentApi.decline();
      removePopup();
    });

    overlay.querySelector('.nanndemoya-consent-hide').addEventListener('click', () => {
      consentApi.hide();
      removePopup();
    });

    doc.body.appendChild(overlay);
  };

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', renderPopup, { once: true });
    return;
  }

  renderPopup();
})();
