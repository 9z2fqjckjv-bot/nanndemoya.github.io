Google Maps APIの利用料金発生を防御し、無料枠内で処理受付を停止するためのCloudShell用実行コードおよび自動制御手順です。

**1. 緊急停止（Google Maps API処理の即時無効化）**

マップ表示やジオコーディングなどの全API処理を今すぐ停止し、課金発生を物理的に遮断するコマンドです。

```bash
# 対象プロジェクトIDをセット
export PROJECT_ID=$(gcloud config get-value project)

# Google Maps関連APIを一括無効化
gcloud services disable \
  maps-backend.googleapis.com \
  geocoding-backend.googleapis.com \
  directions-backend.googleapis.com \
  places-backend.googleapis.com \
  --project=$PROJECT_ID --force

```

---

**2. 1日あたりのリクエスト上限（クォータ制限）の設定**

無料枠（月額200ドル相当のクレジット）を超えないよう、1日あたりのリクエスト受付数に上限を設定します。上限に達したリクエストは自動的にエラー（429 Too Many Requests）となり、課金されません。

```bash
# 対象プロジェクトの指定確認
PROJECT_ID=$(gcloud config get-value project)

# Maps JavaScript API の1日あたりリクエスト上限を設定 (例: 1日1,000回)
gcloud alpha services quota update \
  --service=maps-backend.googleapis.com \
  --consumer=projects/$PROJECT_ID \
  --metric=maps-backend.googleapis.com/default_requests \
  --unit=1/d/project \
  --preferred-value=1000

```

* Cloud Console上の **「APIとサービス」>「クォータ」** からも、該当APIを選択して「1日あたりのリクエスト数」に上限値を入力・保存することで同等の制限を適用できます。

---

**3. 不正利用・超過呼び出し防止策（APIキー制限）**

第三者によるキーの盗用や過剰リクエストを防ぐため、リファラー制限を設定します。

```bash
# 既存のAPIキー一覧を表示してKEY_IDを確認
gcloud services api-keys list --project=$PROJECT_ID

# 特定ドメインからのみリクエストを許可するように更新
gcloud services api-keys update KEY_ID \
  --project=$PROJECT_ID \
  --allowed-referrers="https://*.github.io/*,https://yourdomain.com/*"

```
