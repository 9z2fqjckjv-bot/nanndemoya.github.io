Cloud Shell では、**Google Maps Platform の各APIに「1日あたりのクォータ上限」を無料枠以下に設定**するのが安全です。以下は、Maps系APIを1日300回で止める例です。

```bash
# 1. 対象プロジェクトを設定
PROJECT_ID="nanndemoya-transport-simulator"
gcloud config set project "$PROJECT_ID"

# 2. 必要なAPI名を確認
gcloud services list --enabled --filter="maps OR routes OR places OR geocoding"

# 3. Maps系APIの現在のクォータ情報を確認
gcloud services quota list \
  --service=routes.googleapis.com \
  --consumer="projects/$PROJECT_ID"

gcloud services quota list \
  --service=places.googleapis.com \
  --consumer="projects/$PROJECT_ID"

gcloud services quota list \
  --service=geocoding-backend.googleapis.com \
  --consumer="projects/$PROJECT_ID"
```

重要点として、**Google Cloud は「無料枠を超えたら自動で全Maps APIを停止する」専用スイッチは基本的にありません**。実運用では、各APIの「Requests per day」などのクォータを無料枠以下に手動設定します。

Cloud Shell から直接変更できる場合は、以下のように `gcloud beta services quota override create` を使います。ただし、クォータ項目名はAPIごとに異なるため、先に `quota list` で対象metric/unitを確認してください。

```bash
PROJECT_ID="nanndemoya-transport-simulator"
DAILY_LIMIT="300"

# 例: Routes API の日次リクエスト上限を設定する形式
gcloud beta services quota override create \
  --service=routes.googleapis.com \
  --consumer="projects/$PROJECT_ID" \
  --metric="routes.googleapis.com/compute_routes_requests" \
  --unit="1/d/{project}" \
  --value="$DAILY_LIMIT" \
  --force
```

より確実に「課金を止めたい」場合は、**Cloud Billing Budget の通知 + Cloud Function で Maps API を無効化**します。Cloud Shell で作る最小構成は次の考え方です。

```bash
PROJECT_ID="nanndemoya-transport-simulator"
gcloud config set project "$PROJECT_ID"

# Pub/Sub トピック作成
gcloud pubsub topics create billing-alerts

# Maps系APIを止めるCloud Function用サービスアカウント
gcloud iam service-accounts create maps-api-killer \
  --display-name="Disable Maps APIs on budget alert"

# API無効化に必要な権限
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:maps-api-killer@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/serviceusage.serviceUsageAdmin"
```

Cloud Function の中身例:

```js
const {ServiceUsageClient} = require('@google-cloud/service-usage');

const client = new ServiceUsageClient();

const PROJECT_ID = process.env.GCP_PROJECT;
const SERVICES = [
  'routes.googleapis.com',
  'places.googleapis.com',
  'geocoding-backend.googleapis.com',
  'maps-backend.googleapis.com',
  'maps-embed-backend.googleapis.com',
  'static-maps-backend.googleapis.com',
  'street-view-image-backend.googleapis.com'
];

exports.disableMapsApis = async (message) => {
  const data = JSON.parse(Buffer.from(message.data, 'base64').toString());

  // 予算の100%以上になったら停止
  if ((data.costAmount || 0) < (data.budgetAmount || 0)) {
    return;
  }

  for (const service of SERVICES) {
    await client.disableService({
      name: `projects/${PROJECT_ID}/services/${service}`,
      disableDependentServices: true
    });
    console.log(`Disabled ${service}`);
  }
};
```

ただし、**無料枠ぴったりで完全停止を保証するなら、予算アラートよりクォータ制限の方が確実**です。予算アラートは反映に遅延があり、通知時点で少額の超過が起きる可能性があります。
