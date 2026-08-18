/**
 * Google Ads Scripts用: 何でも屋サイトリンク自動設定
 *
 * 使い方:
 * 1. Google広告の「ツール」>「一括操作」>「スクリプト」に移動
 * 2. 新規スクリプトへこのファイルの内容を貼り付ける
 * 3. 必要に応じて CONFIG を編集する
 * 4. プレビューで内容を確認してから実行する
 *
 * TARGET_CAMPAIGN_NAMES が空の場合は、アカウント単位のサイトリンクとして追加します。
 * キャンペーン名を指定した場合は、そのキャンペーンへサイトリンクを追加します。
 */

const CONFIG = {
    baseUrl: "https://nanndemoya.net/",
    targetCampaignNames: [],
    validateCharacterLimits: true,
    dryRun: false
};

const SITELINKS = [
    {
        name: "サービス案内",
        linkText: "何でも屋サービス",
        description1: "目的別のサービスを確認",
        description2: "料金や内容をまとめて案内",
        path: "service.html"
    },
    {
        name: "申込フォーム",
        linkText: "相談・申込フォーム",
        description1: "申し込みや相談はこちら",
        description2: "目的に合う窓口を選択",
        path: "form.html"
    },
    {
        name: "料金確認",
        linkText: "料金シミュレーター",
        description1: "基本料金を事前に確認",
        description2: "プレミアム料金も計算",
        path: "anytime_service_prices.html"
    },
    {
        name: "移動代金",
        linkText: "移動代金シミュレーター",
        description1: "移動代金の目安を確認",
        description2: "依頼前の費用確認に便利",
        path: "transport_cost_simulator.html"
    },
    {
        name: "利用案内",
        linkText: "利用案内",
        description1: "利用の流れを確認",
        description2: "初めての方にも分かりやすく",
        path: "UserGuide.html"
    },
    {
        name: "支払い方法",
        linkText: "お支払い方法",
        description1: "支払い方法を事前確認",
        description2: "対応する決済方法を案内",
        path: "payment.html"
    },
    {
        name: "連絡先",
        linkText: "連絡先",
        description1: "問い合わせ先を確認",
        description2: "連絡方法をまとめて掲載",
        path: "information.html"
    },
    {
        name: "基金案内",
        linkText: "何でも屋基金",
        description1: "各基金の内容を確認",
        description2: "参加や相談ページへ案内",
        path: "NCF.html"
    },
    {
        name: "ハウス案内",
        linkText: "何でも屋ハウス",
        description1: "住まい関連の支援を案内",
        description2: "申請や特典情報も確認",
        path: "house.html"
    },
    {
        name: "定期利用",
        linkText: "Nanndemoya365",
        description1: "定期利用プランを確認",
        description2: "用途別のプランを掲載",
        path: "Nanndemoya365.html"
    },
    {
        name: "クラウド",
        linkText: "NanndemoyaCloud",
        description1: "クラウド導入を支援",
        description2: "Google Workspace活用",
        path: "NanndemoyaCloud.html"
    },
    {
        name: "ヘルプ",
        linkText: "ヘルプドキュメント",
        description1: "よくある疑問を確認",
        description2: "関連ページへすぐ移動",
        path: "helps/help-document.html"
    },
    {
        name: "Q&A",
        linkText: "Q&A",
        description1: "質問と回答を確認",
        description2: "利用前の不安を解消",
        path: "helps/qanda.html"
    },
    {
        name: "規約情報",
        linkText: "規約・事業情報",
        description1: "利用規約などを掲載",
        description2: "事業情報も確認できます",
        path: "policy.html"
    },
    {
        name: "資料一覧",
        linkText: "資料一覧",
        description1: "動画や資料を確認",
        description2: "サービス紹介資料を掲載",
        path: "documet/index.html"
    },
    {
        name: "リンク一覧",
        linkText: "サイトリンク一覧",
        description1: "主要ページへすぐ移動",
        description2: "迷った時の入口に便利",
        path: "site-links.html"
    }
];

function main() {
    validateSitelinks();

    const sitelinks = SITELINKS.map(function(item) {
        return Object.assign({}, item, {
            finalUrl: buildFinalUrl(item.path)
        });
    });

    if (CONFIG.dryRun) {
        logDryRun(sitelinks);
        return;
    }

    if (CONFIG.targetCampaignNames.length === 0) {
        addSitelinksToAccount(sitelinks);
        return;
    }

    addSitelinksToCampaigns(sitelinks, CONFIG.targetCampaignNames);
}

function addSitelinksToAccount(sitelinks) {
    const account = AdsApp.currentAccount();
    const existing = getExistingSitelinkMap(account.extensions().sitelinks().get());
    let createdCount = 0;
    let skippedCount = 0;

    sitelinks.forEach(function(item) {
        const key = createSitelinkKey(item.linkText, item.finalUrl);

        if (existing[key]) {
            Logger.log("SKIP account sitelink already exists: " + item.linkText);
            skippedCount += 1;
            return;
        }

        const sitelink = createSitelink(item);
        account.addSitelink(sitelink);
        existing[key] = true;
        createdCount += 1;
        Logger.log("ADD account sitelink: " + item.linkText + " -> " + item.finalUrl);
    });

    Logger.log("Done. created=" + createdCount + ", skipped=" + skippedCount);
}

function addSitelinksToCampaigns(sitelinks, campaignNames) {
    const campaignNameSet = {};
    campaignNames.forEach(function(name) {
        campaignNameSet[name] = true;
    });

    const campaignIterator = AdsApp.campaigns().get();
    let matchedCampaignCount = 0;

    while (campaignIterator.hasNext()) {
        const campaign = campaignIterator.next();

        if (!campaignNameSet[campaign.getName()]) {
            continue;
        }

        matchedCampaignCount += 1;
        addSitelinksToCampaign(campaign, sitelinks);
    }

    if (matchedCampaignCount === 0) {
        throw new Error("対象キャンペーンが見つかりません: " + campaignNames.join(", "));
    }
}

function addSitelinksToCampaign(campaign, sitelinks) {
    const existing = getExistingSitelinkMap(campaign.extensions().sitelinks().get());
    let addedCount = 0;
    let skippedCount = 0;

    sitelinks.forEach(function(item) {
        const key = createSitelinkKey(item.linkText, item.finalUrl);

        if (existing[key]) {
            Logger.log("SKIP campaign sitelink already exists: " + campaign.getName() + " / " + item.linkText);
            skippedCount += 1;
            return;
        }

        const sitelink = createSitelink(item);
        campaign.addSitelink(sitelink);
        existing[key] = true;
        addedCount += 1;
        Logger.log("ADD campaign sitelink: " + campaign.getName() + " / " + item.linkText);
    });

    Logger.log("Campaign done: " + campaign.getName() + ", added=" + addedCount + ", skipped=" + skippedCount);
}

function createSitelink(item) {
    const operation = AdsApp.extensions()
        .newSitelinkBuilder()
        .withLinkText(item.linkText)
        .withDescription1(item.description1)
        .withDescription2(item.description2)
        .withFinalUrl(item.finalUrl)
        .build();

    if (!operation.isSuccessful()) {
        throw new Error("サイトリンク作成に失敗しました: " + item.linkText + " / " + operation.getErrors().join(", "));
    }

    return operation.getResult();
}

function getExistingSitelinkMap(iterator) {
    const existing = {};

    while (iterator.hasNext()) {
        const sitelink = iterator.next();
        const finalUrl = sitelink.urls().getFinalUrl();
        existing[createSitelinkKey(sitelink.getLinkText(), finalUrl)] = true;
    }

    return existing;
}

function createSitelinkKey(linkText, finalUrl) {
    return linkText + "\n" + finalUrl;
}

function buildFinalUrl(path) {
    const baseUrl = CONFIG.baseUrl.replace(/\/+$/, "");
    const cleanPath = path.replace(/^\/+/, "");

    return baseUrl + "/" + cleanPath;
}

function validateSitelinks() {
    if (!CONFIG.validateCharacterLimits) {
        return;
    }

    SITELINKS.forEach(function(item) {
        assertMaxLength(item.name, 25, item.name + " site link");
        assertMaxLength(item.linkText, 25, item.name + " link text");
        assertMaxLength(item.description1, 35, item.name + " description1");
        assertMaxLength(item.description2, 35, item.name + " description2");
    });
}

function assertMaxLength(value, maxLength, label) {
    if (value.length > maxLength) {
        throw new Error(label + " is too long: " + value.length + " / " + maxLength + " chars");
    }
}

function logDryRun(sitelinks) {
    Logger.log("DRY RUN: サイトリンクは作成されません。");

    sitelinks.forEach(function(item) {
        Logger.log([
            item.name,
            item.linkText,
            item.description1,
            item.description2,
            item.finalUrl
        ].join(" | "));
    });
}
