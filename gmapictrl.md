`quota list` が使えない場合は、**Google Cloud Console 画面でクォータを設定する方法が一番確実**です。Cloud Shell だけで進めるより安全です。

手順:

1. Google Cloud Console を開く
2. 対象プロジェクトを選択
3. 左メニューで **API とサービス** → **有効な API とサービス**
4. `Routes API`、`Places API`、`Geocoding API` などを開く
5. **割り当て / Quotas** タブを開く
6. `Requests per day` や `Requests per minute` を探す
7. 無料枠以下の値に変更する

例:

| API | 月間無料枠を超えにくい日次上限 |
|---|---:|
| Routes API | 300回/日 |
| Places API | 300回/日 |
| Geocoding API | 300回/日 |
| Maps JavaScript API | 300回/日 |

Cloud Shell で確認したい場合は、代わりに **Service Usage API を直接叩く**方法があります。

```bash
PROJECT_ID="nanndemoya-transport-simulator"
PROJECT_NUMBER="$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')"

ACCESS_TOKEN="$(gcloud auth print-access-token)"

curl -s \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  "https://serviceusage.googleapis.com/v1beta1/projects/$PROJECT_NUMBER/services/routes.googleapis.com/consumerQuotaMetrics"
```

ただし、このAPIレスポンスは長くて読みにくいです。見やすくするなら:

```bash
curl -s \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  "https://serviceusage.googleapis.com/v1beta1/projects/$PROJECT_NUMBER/services/routes.googleapis.com/consumerQuotaMetrics" \
  | python3 -m json.tool
```

結論として、**課金防止目的なら Console の Quotas 画面で日次上限を設定するのが最もおすすめ**です。`quota list` が使えなくても、Console から同じ制限を設定できます。
