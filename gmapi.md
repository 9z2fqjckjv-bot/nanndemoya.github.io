ご提示いただいた資料「何でも屋」のサービス内容に基づき、Webサイト上に「移動代金計算シミュレーター」を構築する場合の Google Maps API 利用料金について解説します。  
結論から申し上げますと、**個人向け・小規模なWebサイト（目安として月間1,000〜2,000回のシミュレーター実行）であれば、Googleから毎月提供される「無料枠」の範囲内に収まるため、月額0円（無料）で運用可能**です。  
アクセス数が多くなり、無料枠を超えた場合は\*\*従量課金制（リクエスト数に応じた課金）\*\*となります。

## **1\. 移動代金シミュレーターに必要な API と単価**

シミュレーターを作る場合、通常以下のAPIを組み合わせて使用します。

| 使用する API | 主な用途 | 単価（1,000回あたり） |
| :---- | :---- | :---- |
| **Routes API** (旧 Directions API) | スタッフ自宅 / 拠点〜お客様指定場所までの**走行距離・所要時間を計算** | **$5.00**（約750円）/ 1,000回 |
| **Places API** (Places Autocomplete) | 住所入力時に自動で候補を出して誤入力を防ぐ | **$2.83**（約420円）/ 1,000回 |
| **Geocoding API** | 入力された住所を緯度・経度に変換する | **$5.00**（約750円）/ 1,000回 |
| **Maps JavaScript API** | 画面上に地図を表示させる（※必要な場合のみ） | **$7.00**（約1,050円）/ 1,000回 |

## **2\. 無料枠（無料利用の範囲）**

Google Maps Platform では、サービスごとに\*\*毎月の無料利用枠（無料上限）\*\*が設定されています。

> * **Routes API（距離計算）:** 毎月 **10,000回** まで無料  
> * **Places Autocomplete（住所補完）:** 毎月 **10,000回** まで無料  
> * **Geocoding（住所変換）:** 毎月 **10,000回** まで無料  
> * **Dynamic Maps（地図表示）:** 毎月 **10,000回** まで無料

**目安:** \> シミュレーターでの「距離・時間の計算（Routes API）」だけであれば、**1日あたり約300回（月間10,000回）の実行まで追加料金は一切発生しません**。

## **3\. 無料枠を超えた場合の費用シミュレーション**

無料枠（10,000回/月）を超えた場合、超過した分に対して以下の費用が発生します。 *(※1ドル＝150円で換算)*

### **ケース①：月間 3,000 回 実行された場合（1日約100回）**

> * 無料枠（10,000回）の範囲内のため、**利用料金は 0円** です。

### **ケース②：月間 20,000 回 実行された場合（1日約660回）**

> * 無料枠 10,000回 を除いた **10,000回分** が課金対象となります。  
> * **Routes API（距離計算のみ）:** 10,000回 × $5.00 / 1,000回 ＝ \*\*$50（約 7,500円/月）\*\*  
> * **住所補完・地図表示もセットで利用した場合:** 約 **$148.30（約 22,000円/月）**

## **4\. コストを安く抑えるためのポイント・注意点**

> 1. **APIキーの利用制限（必須設定）** 誰でもアクセスできる状態にすると、意図しない第三者やボットに大量実行され、高額請求が発生するリスクがあります。Google Cloudの管理画面で**HTTPリファラー制限**（自分のWebサイトドメインからのみ呼び出し可能にする）を設定することが不可欠です。  
> 2. **予算上限（Quota Limit）の設定** 「1日あたり上限100リクエストまで」といったハード上限（Quota）をAPI側に設定しておくことで、予算オーバーや思わぬ請求事故を防ぐことができます。  
> 3. **地図（マップ画像）の非表示** 距離・時間と移動代金の数値だけを表示し、**画面上にGoogle Map（地図）を描画しない仕様**にすれば、Dynamic Maps の料金（$7.00/1,000回）を節約できます。

## 5. 移動代金シミュレーターへAPIを組み込むステップ

現在の `transport_cost_simulator.html` は、APIキーを公開せずに利用できる手動入力版です。Google Maps Platform を組み込む場合は、以下の順番で進めます。

### Step 1: Google Cloud プロジェクトを用意する

1. Google Cloud Console で専用プロジェクトを作成します。
2. 請求先アカウントを紐付けます。
3. プロジェクト名は、例として `nanndemoya-transport-simulator` のように用途が分かる名前にします。

### Step 2: 必要なAPIだけを有効化する

最小構成では、以下を有効化します。

| API | 目的 | 必須度 |
| :-- | :-- | :-- |
| Routes API | 出発地から目的地までの距離・所要時間を取得 | 必須 |
| Places API | 住所入力候補を表示 | 推奨 |
| Geocoding API | 手入力住所を緯度経度に変換 | 必要に応じて |
| Maps JavaScript API | 地図を画面表示 | 任意 |

料金を抑える場合、最初は地図表示なしで Routes API と Places API だけから始めます。

### Step 3: APIキーを作成して必ず制限する

APIキーを作成したら、公開前に必ず以下を設定します。

1. **アプリケーションの制限:** HTTP リファラー
2. **許可するリファラー:** `https://9z2fqjckjv-bot.github.io/*` など公開ドメインのみ
3. **APIの制限:** Routes API、Places API、Geocoding API など利用するAPIだけ
4. **割り当て上限:** 1日あたりのリクエスト上限を設定
5. **予算アラート:** 月額上限に近づいたら通知されるように設定

APIキーを制限しないままHTMLへ埋め込むと、第三者に使われて高額請求につながる可能性があります。

### Step 4: 画面入力をAPI用に変更する

現在の手動入力欄に、以下の入力を追加または置き換えます。

| 現在の入力 | API連携後の入力 |
| :-- | :-- |
| 片道距離（km） | 出発地住所、目的地住所 |
| 片道移動時間（分） | Routes API の所要時間 |
| 交通手段 | 車、徒歩、公共交通機関などの移動モード |

例:

```html
<input id="originAddress" type="text" placeholder="出発地">
<input id="destinationAddress" type="text" placeholder="目的地">
<button type="button" id="routeSearchButton">距離を自動取得</button>
```

### Step 5: Places Autocomplete を住所入力へ付ける

住所の誤入力を減らすため、出発地と目的地の入力欄に Places Autocomplete を付けます。

実装方針:

1. Google Maps JavaScript API を読み込みます。
2. `originAddress` と `destinationAddress` に Autocomplete を設定します。
3. 日本国内の依頼が中心なら、国を `jp` に制限します。

例:

```html
<script async defer src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places&callback=initPlaces"></script>
```

```js
function initPlaces() {
  const options = {
    componentRestrictions: { country: 'jp' },
    fields: ['formatted_address', 'geometry', 'name']
  };

  new google.maps.places.Autocomplete(document.getElementById('originAddress'), options);
  new google.maps.places.Autocomplete(document.getElementById('destinationAddress'), options);
}
```

### Step 6: Routes API で距離と所要時間を取得する

「距離を自動取得」ボタンを押した時に、Routes API へリクエストします。

取得する値:

- `distanceMeters`: 移動距離
- `duration`: 所要時間
- `polyline`: 地図表示を行う場合のルート線

APIレスポンスから km と分へ変換し、既存の `distanceKm` と `travelMinutes` に反映します。

```js
async function fetchRoute(origin, destination) {
  const response = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
      'X-Goog-FieldMask': 'routes.distanceMeters,routes.duration'
    },
    body: JSON.stringify({
      origin: { address: origin },
      destination: { address: destination },
      travelMode: 'DRIVE'
    })
  });

  if (!response.ok) {
    throw new Error('ルート情報を取得できませんでした。');
  }

  const data = await response.json();
  const route = data.routes && data.routes[0];
  if (!route) {
    throw new Error('該当するルートが見つかりませんでした。');
  }

  return {
    distanceKm: route.distanceMeters / 1000,
    durationMinutes: Math.ceil(Number(route.duration.replace('s', '')) / 60)
  };
}
```

### Step 7: 既存の計算ロジックへ接続する

Routes API から取得した値を、既存の計算欄へ入れて `calcTransportCost()` を再実行します。

```js
async function updateRouteEstimate() {
  const origin = document.getElementById('originAddress').value;
  const destination = document.getElementById('destinationAddress').value;

  const route = await fetchRoute(origin, destination);
  document.getElementById('distanceKm').value = route.distanceKm.toFixed(1);
  document.getElementById('travelMinutes').value = route.durationMinutes;
  calcTransportCost();
}
```

この方式にすると、既存の交通手段別単価・最低移動代金・割増・その他実費の計算はそのまま使えます。

### Step 8: エラー表示を用意する

API呼び出しに失敗した場合、利用者が手動入力へ戻れるようにします。

表示する例:

- 住所が見つかりませんでした。番地まで入力してください。
- ルートを取得できませんでした。距離と時間を手動入力してください。
- 一時的に自動計算が利用できません。手動入力で概算できます。

エラー時に計算自体を止めず、現在の手動入力欄を残すことが重要です。

### Step 9: 利用回数を抑える

コストを抑えるため、以下の仕様にします。

1. 入力中に毎回APIを呼ばず、「距離を自動取得」ボタン押下時だけ呼ぶ
2. 同じ出発地・目的地・交通手段の結果はページ内で再利用する
3. 地図表示は初期実装では行わない
4. Places Autocomplete は必要な住所欄だけに付ける

### Step 10: 公開前チェック

公開前に以下を確認します。

- APIキーに HTTP リファラー制限が設定されている
- 利用APIが必要最小限に制限されている
- 1日あたりの上限または予算アラートが設定されている
- APIエラー時に手動入力へ戻れる
- スマートフォンで住所入力と計算結果が見やすい
- 実際の住所で距離・時間・料金が想定通りに出る

### Step 11: 初期公開後の運用

公開後1週間は Google Cloud Console で以下を確認します。

1. Routes API のリクエスト数
2. Places API のリクエスト数
3. エラー率
4. 想定外のアクセス増加
5. 課金見込み額

アクセスが増えるまでは、地図表示を追加せず、距離・時間・料金の数値表示に絞るのが安全です。

## 6. 推奨する実装順

最初から全機能を入れず、以下の順で段階的に進めます。

1. 住所入力欄を追加
2. Routes API で距離・所要時間を取得
3. 取得値を既存の計算ロジックへ反映
4. APIエラー時の手動入力フォールバックを追加
5. Places Autocomplete を追加
6. 必要になった場合だけ地図表示を追加

この順番なら、現在のシミュレーターを壊さずにAPI連携へ移行できます。