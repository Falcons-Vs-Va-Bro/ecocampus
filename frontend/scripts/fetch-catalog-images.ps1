param(
    [string]$OutputDirectory = (Join-Path $PSScriptRoot '..\public\catalog'),
    [string[]]$OnlyIds = @()
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
$OutputEncoding = [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()

$userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/136 Safari/537.36 EcoCampusCatalog/1.0'
$cwebp = (Get-Command cwebp -ErrorAction Stop).Source
$temporaryDirectory = Join-Path ([System.IO.Path]::GetTempPath()) 'ecocampus-catalog-images'
New-Item -ItemType Directory -Force -Path $OutputDirectory, $temporaryDirectory | Out-Null

$items = @(
    @{ Id = '50001'; Title = 'Python 编程：从入门到实践（第3版）'; Query = 'Python programming textbook book cover' },
    @{ Id = '50002'; Title = '数据结构 C 语言版 严蔚敏'; Query = 'computer science textbooks' },
    @{ Id = '50003'; Title = '线性代数 同济第七版'; Query = 'linear algebra textbook' },
    @{ Id = '50004'; Title = '概率论与数理统计 浙大第五版'; Query = 'probability statistics textbook' },
    @{ Id = '50005'; Title = '新视野大学英语读写教程 1-4'; Query = 'English language textbooks books' },
    @{ Id = '50006'; Title = '考研政治核心考案与真题'; Query = 'political science textbook' },
    @{ Id = '50007'; Title = 'Java 核心技术 卷 I'; Query = 'Java programming textbook book' },
    @{ Id = '50008'; Title = '西方经济学 微观与宏观两册'; Query = 'microeconomics macroeconomics textbooks' },
    @{ Id = '50009'; Title = 'iPad Air 4 64G WLAN'; Query = 'iPad Air 4th generation' },
    @{ Id = '50010'; Title = 'ThinkPad X1 Carbon 2020'; Query = 'ThinkPad X1 Carbon laptop' },
    @{ Id = '50011'; Title = '罗技 K380 蓝牙键盘'; Query = 'Logitech K380 keyboard' },
    @{ Id = '50012'; Title = '小米手环 8 标准版'; Query = 'Xiaomi Smart Band 8' },
    @{ Id = '50013'; Title = 'Kindle Paperwhite 4 8G'; Query = 'Kindle Paperwhite 4' },
    @{ Id = '50014'; Title = '西部数据 1TB 移动硬盘'; Query = 'Western Digital portable hard drive' },
    @{ Id = '50015'; Title = '戴尔 24 寸 IPS 显示器'; Query = 'Dell monitor' },
    @{ Id = '50016'; Title = '八合一 USB-C 扩展坞'; Query = 'USB-C multiport hub' },
    @{ Id = '50017'; Title = '宿舍人体工学椅 可升降'; Query = 'ergonomic office chair' },
    @{ Id = '50018'; Title = '折叠床上书桌 加宽款'; Query = 'folding laptop bed table' },
    @{ Id = '50019'; Title = '宿舍小冰箱 46L'; Query = 'mini refrigerator' },
    @{ Id = '50020'; Title = '台式循环电风扇'; Query = 'desk electric fan' },
    @{ Id = '50021'; Title = '宿舍遮光床帘 全套'; Query = 'bed curtains dormitory' },
    @{ Id = '50022'; Title = '真空压缩收纳袋 8 件套'; Query = 'vacuum bag clothes' },
    @{ Id = '50023'; Title = '加厚单人床垫 90×190'; Query = 'bed mattress' },
    @{ Id = '50024'; Title = '落地衣架 双层带鞋架'; Query = 'clothes rack' },
    @{ Id = '50025'; Title = '尤尼克斯入门羽毛球拍'; Query = 'badminton racket' },
    @{ Id = '50026'; Title = '加厚防滑瑜伽垫'; Query = 'yoga mat' },
    @{ Id = '50027'; Title = '捷安特入门公路自行车'; Query = 'road bicycle' },
    @{ Id = '50028'; Title = '成人轮滑鞋 41 码'; Query = 'rollerblades inline skates' },
    @{ Id = '50029'; Title = '耐克 5 号足球'; Query = 'Nike football soccer ball' },
    @{ Id = '50030'; Title = '计数跳绳 可调长度'; Query = 'jump rope skipping rope' },
    @{ Id = '50031'; Title = '可调节哑铃 10kg 一对'; Query = 'adjustable dumbbells' },
    @{ Id = '50032'; Title = '双人自动帐篷'; Query = 'two person camping tent' },
    @{ Id = '50033'; Title = '316 不锈钢保温杯 500ml'; Query = 'vacuum flask' },
    @{ Id = '50034'; Title = '折叠晴雨伞 加固款'; Query = 'folding umbrella' },
    @{ Id = '50035'; Title = '陶瓷餐具四件套'; Query = 'ceramic tableware set' },
    @{ Id = '50036'; Title = 'Tritan 运动水杯 1L'; Query = 'sports water bottle' },
    @{ Id = '50037'; Title = '宿舍电热水壶 1.5L'; Query = 'electric kettle' },
    @{ Id = '50038'; Title = '手持衣物挂烫机'; Query = 'garment steamer' },
    @{ Id = '50039'; Title = '电子体重秤'; Query = 'digital bathroom scale' },
    @{ Id = '50040'; Title = '家用工具箱 20 件套'; Query = 'home tool kit toolbox' },
    @{ Id = '50041'; Title = '未开封防晒霜 SPF50'; Query = 'sunscreen bottle' },
    @{ Id = '50042'; Title = '负离子吹风机'; Query = 'hair dryer' },
    @{ Id = '50043'; Title = '自动卷发棒 32mm'; Query = 'curling iron' },
    @{ Id = '50044'; Title = 'LED 化妆镜 三档光'; Query = 'LED makeup mirror' },
    @{ Id = '50045'; Title = '未开封洗护旅行套装'; Query = 'travel toiletries' },
    @{ Id = '50046'; Title = '未开封身体乳两瓶装'; Query = 'body lotion bottles' },
    @{ Id = '50047'; Title = '电动牙刷主机 不含刷头'; Query = 'electric toothbrush handle' },
    @{ Id = '50048'; Title = '桌面化妆品收纳盒'; Query = 'cosmetic organizer' },
    @{ Id = '50049'; Title = '入门民谣吉他 41 寸'; Query = 'acoustic guitar' },
    @{ Id = '50050'; Title = '布鲁斯口琴 C 调'; Query = 'blues harmonica' },
    @{ Id = '50051'; Title = '专业彩铅 72 色'; Query = 'colored pencils set' },
    @{ Id = '50052'; Title = 'Wacom 入门手绘板'; Query = 'Wacom graphics tablet' },
    @{ Id = '50053'; Title = 'A5 活页手账本套装'; Query = 'A5 ring binder notebook' },
    @{ Id = '50054'; Title = '双头马克笔 60 色'; Query = 'marker pens set' },
    @{ Id = '50055'; Title = '课程资料文件夹 10 个'; Query = 'document folders stationery' },
    @{ Id = '50056'; Title = '61 键便携电子琴'; Query = '61 key electronic keyboard instrument' },
    @{ Id = '50057'; Title = '校园电影放映兑换券 2 张'; Query = 'cinema movie tickets' },
    @{ Id = '50058'; Title = '话剧演出票 1 张'; Query = 'theatre ticket' },
    @{ Id = '50059'; Title = '学术讲座预约名额'; Query = 'university academic lecture audience' },
    @{ Id = '50060'; Title = '校园足球赛看台票 2 张'; Query = 'football match tickets' },
    @{ Id = '50061'; Title = 'Livehouse 乐队演出单人票'; Query = 'live music concert ticket' },
    @{ Id = '50062'; Title = '毕业季摄影套餐转让'; Query = 'graduation photography camera student' },
    @{ Id = '50063'; Title = '博物馆特展预约票 2 张'; Query = 'museum entrance ticket' },
    @{ Id = '50064'; Title = '校园音乐节内场票'; Query = 'music festival ticket' },
    @{ Id = '50065'; Title = '手作陶瓷小猫摆件'; Query = 'ceramic cat figurine' },
    @{ Id = '50066'; Title = '动漫角色正版景品'; Query = 'anime character figurine' },
    @{ Id = '50067'; Title = '校园纪念钥匙扣 两个'; Query = 'souvenir keychains' },
    @{ Id = '50068'; Title = '城市风景明信片 20 张'; Query = 'city landscape postcards' },
    @{ Id = '50069'; Title = '向日葵桌面装饰'; Query = 'sunflower desk decoration' },
    @{ Id = '50070'; Title = '校园社团纪念徽章 6 枚'; Query = 'souvenir pin badges' },
    @{ Id = '50071'; Title = '15 寸电脑双肩包'; Query = 'laptop backpack' },
    @{ Id = '50072'; Title = '春秋防风外套 L 码'; Query = 'windbreaker jacket' },
    @{ Id = '60001'; Title = '张雪峰粽子玩偶'; Query = '张雪峰公仔玩偶' },
    @{ Id = '60002'; Title = '巧乐兹雪碧冰红茶三件套'; Query = '巧乐兹雪碧冰红茶三件套' },
    @{ Id = '60003'; Title = '科比同款冰红茶（梗图版）'; Query = '牢大冰红茶梗图' },
    @{ Id = '60004'; Title = '奶龙奶蛙宿舍门神贴'; Query = '奶龙奶蛙梗图' },
    @{ Id = '60005'; Title = '蔡徐坤打篮球小鸡立牌'; Query = '蔡徐坤打篮球鸡表情包' },
    @{ Id = '60006'; Title = '哈基米宿舍循环播放器'; Query = '哈基米猫梗图' },
    @{ Id = '60007'; Title = '尊嘟假嘟粉色小熊抱枕'; Query = '尊嘟假嘟表情包' },
    @{ Id = '60008'; Title = '退退退宿舍驱邪门贴'; Query = '退退退表情包' },
    @{ Id = '60009'; Title = '乌萨奇发疯桌面摆件'; Query = '乌萨奇表情包' },
    @{ Id = '60010'; Title = '派大星你知不知道鼠标垫'; Query = '派大星知不知道表情包' },
    @{ Id = '60011'; Title = '先天圣体大学生发疯立牌'; Query = '先天圣体大学生表情包' },
    @{ Id = '60012'; Title = '曼波小猫午夜循环钥匙扣'; Query = '曼波表情包' },
    @{ Id = '60013'; Title = '香蕉猫悲伤充电宝'; Query = '香蕉猫梗图' },
    @{ Id = '60014'; Title = '悲伤蛙期末复习抱枕'; Query = '悲伤蛙表情包' },
    @{ Id = '60015'; Title = '吉吉国王红温桌面摆件'; Query = '吉吉国王表情包' },
    @{ Id = '60016'; Title = '无语菩萨答辩护身符'; Query = '无语菩萨表情包' },
    @{ Id = '1001'; Title = '高等数学（第七版）上下册'; Query = 'higher mathematics textbooks calculus' },
    @{ Id = '1002'; Title = 'MacBook Air 2019 13 寸'; Query = 'MacBook Air 2019 13 inch' },
    @{ Id = '1003'; Title = '护眼台灯 可调光'; Query = 'adjustable LED desk lamp' },
    @{ Id = '1004'; Title = '斯伯丁篮球 室内外 7 号球'; Query = 'Spalding basketball' },
    @{ Id = '1005'; Title = '机械键盘 青轴'; Query = 'mechanical computer keyboard' },
    @{ Id = '1006'; Title = '20 寸行李箱 九成新'; Query = 'small rolling suitcase' },
    @{ Id = '1007'; Title = 'AirPods 二代'; Query = 'Apple AirPods second generation' },
    @{ Id = '1008'; Title = '卡西欧计算器 fx-991CN X'; Query = 'Casio fx-991 calculator' },
    @{ Id = '1009'; Title = '宿舍收纳箱 三件套'; Query = 'plastic storage boxes' },
    @{ Id = '1010'; Title = '羽毛球拍双拍 轻量款'; Query = 'badminton rackets pair' },
    @{ Id = '1011'; Title = '考研英语真题 近五年'; Query = 'English exam preparation books' },
    @{ Id = '1012'; Title = '小米显示器 24 寸'; Query = 'Xiaomi computer monitor' },
    @{ Id = '1013'; Title = '宿舍床边置物架'; Query = 'bedside shelf organizer' },
    @{ Id = '1015'; Title = '蓝牙键盘便携款'; Query = 'portable Bluetooth keyboard' },
    @{ Id = '1016'; Title = '篮球训练包 九成新'; Query = 'basketball sports backpack' },
    @{ Id = '1017'; Title = '演唱会门票转让'; Query = 'concert ticket' },
    @{ Id = '1018'; Title = '蓝牙音箱 便携款'; Query = 'portable Bluetooth speaker' },
    @{ Id = '1019'; Title = '疑似批量耳机转售'; Query = 'wireless earphones' }
)

$copies = @{
    '1014' = '1008'
    '2001' = '1008'
    '2002' = '1009'
    '2003' = '1010'
    '9001' = '1002'
    '9002' = '1001'
    '9003' = '1003'
    '9004' = '1005'
    '9005' = '1006'
}

$directImages = @{
    '50009' = @{ FileTitle = 'IPad Air 4th generation - 2.jpg'; DownloadUrl = 'https://upload.wikimedia.org/wikipedia/commons/d/da/IPad_Air_4th_generation_-_2.jpg'; SourcePage = 'https://commons.wikimedia.org/wiki/File:IPad_Air_4th_generation_-_2.jpg'; License = 'See Wikimedia Commons source page'; Artist = 'See Wikimedia Commons source page' }
    '50022' = @{ FileTitle = 'SONGMICS Vacuum Seal Bags'; DownloadUrl = 'https://live.staticflickr.com/4296/36059386505_ec96b21e23_b.jpg'; SourcePage = 'https://www.flickr.com/photos/songmics/36059386505/'; License = 'See Flickr source page'; Artist = 'Songmics_US' }
    '50028' = @{ FileTitle = 'Ellie rollerblades Jun 2025 5'; DownloadUrl = 'https://live.staticflickr.com/65535/54674610435_9778d5fdfd_b.jpg'; SourcePage = 'https://www.flickr.com/photos/chris-parker/54674610435/'; License = 'See Flickr source page'; Artist = 'Chris Parker' }
    '50043' = @{ FileTitle = 'Hot tolls Curling Iron'; DownloadUrl = 'https://live.staticflickr.com/65535/53254560296_4da010205d_b.jpg'; SourcePage = 'https://www.flickr.com/photos/199326649@N04/53254560296/'; License = 'See Flickr source page'; Artist = 'See Flickr source page' }
    '50045' = @{ FileTitle = 'Kulturbeutel1.jpg'; DownloadUrl = 'https://upload.wikimedia.org/wikipedia/commons/b/be/Kulturbeutel1.jpg'; SourcePage = 'https://commons.wikimedia.org/wiki/File:Kulturbeutel1.jpg'; License = 'See Wikimedia Commons source page'; Artist = 'See Wikimedia Commons source page' }
    '50048' = @{ FileTitle = 'Lipstick attachment Makeup Organiser and Cosmetic Organizer'; DownloadUrl = 'https://live.staticflickr.com/65535/53419072227_3fbda749fa_b.jpg'; SourcePage = 'https://www.flickr.com/photos/199473638@N06/53419072227/'; License = 'See Flickr source page'; Artist = 'See Flickr source page' }
    '60001' = @{ FileTitle = '张雪峰粽子玩偶网络梗图'; DownloadUrl = 'https://i02piccdn.sogoucdn.com/40fc4d2a7a4b2de9'; SourcePage = 'https://pic.sogou.com/pics?query=张雪峰公仔玩偶'; License = '网络梗图搜索结果，仅用于课程演示；发布前需复核授权'; Artist = '来源作者待核验' }
    '60002' = @{ FileTitle = '巧乐兹雪碧冰红茶组合网络梗图'; DownloadUrl = 'https://i02piccdn.sogoucdn.com/eaa37f2ac0d49ca7'; SourcePage = 'https://pic.sogou.com/pics?query=巧乐兹雪碧冰红茶三件套'; License = '网络梗图搜索结果，仅用于课程演示；发布前需复核授权'; Artist = '来源作者待核验' }
    '60003' = @{ FileTitle = '科比冰红茶网络梗图'; DownloadUrl = 'https://i03piccdn.sogoucdn.com/a3dd55ce6fbd2e84'; SourcePage = 'https://pic.sogou.com/pics?query=牢大冰红茶梗图'; License = '网络梗图搜索结果，仅用于课程演示；发布前需复核授权'; Artist = '来源作者待核验' }
    '60004' = @{ FileTitle = '奶龙奶蛙网络梗图'; DownloadUrl = 'https://i02piccdn.sogoucdn.com/3ad9a76ec8d27989'; SourcePage = 'https://pic.sogou.com/pics?query=奶龙奶蛙梗图'; License = '网络梗图搜索结果，仅用于课程演示；发布前需复核授权'; Artist = '来源作者待核验' }
    '60005' = @{ FileTitle = '蔡徐坤打篮球网络梗图'; DownloadUrl = 'https://i02piccdn.sogoucdn.com/68c450ba93cc1d5f'; SourcePage = 'https://pic.sogou.com/pics?query=蔡徐坤打篮球鸡表情包'; License = '网络梗图搜索结果，仅用于课程演示；发布前需复核授权'; Artist = '来源作者待核验' }
    '60006' = @{ FileTitle = '哈基米猫网络梗图'; DownloadUrl = 'https://i02piccdn.sogoucdn.com/a02b295574252b5b'; SourcePage = 'https://pic.sogou.com/pics?query=哈基米猫梗图'; License = '网络梗图搜索结果，仅用于课程演示；发布前需复核授权'; Artist = '来源作者待核验' }
    '60007' = @{ FileTitle = '尊嘟假嘟网络梗图'; DownloadUrl = 'https://i01piccdn.sogoucdn.com/4dd2604037b1cf3e'; SourcePage = 'https://pic.sogou.com/pics?query=尊嘟假嘟表情包'; License = '网络梗图搜索结果，仅用于课程演示；发布前需复核授权'; Artist = '来源作者待核验' }
    '60008' = @{ FileTitle = '退退退网络梗图'; DownloadUrl = 'https://i02piccdn.sogoucdn.com/1008607f3c53d9d2'; SourcePage = 'https://pic.sogou.com/pics?query=退退退表情包'; License = '网络梗图搜索结果，仅用于课程演示；发布前需复核授权'; Artist = '来源作者待核验' }
    '60009' = @{ FileTitle = '乌萨奇发疯网络梗图'; DownloadUrl = 'https://i03piccdn.sogoucdn.com/8d32cf137c06c523'; SourcePage = 'https://pic.sogou.com/pics?query=乌萨奇表情包'; License = '网络梗图搜索结果，仅用于课程演示；发布前需复核授权'; Artist = '来源作者待核验' }
    '60010' = @{ FileTitle = '派大星你知不知道网络梗图'; DownloadUrl = 'https://i04piccdn.sogoucdn.com/1a9a8f42cd6105b7'; SourcePage = 'https://pic.sogou.com/pics?query=派大星知不知道表情包'; License = '网络梗图搜索结果，仅用于课程演示；发布前需复核授权'; Artist = '来源作者待核验' }
    '60011' = @{ FileTitle = '先天圣体大学生网络梗图'; DownloadUrl = 'https://i01piccdn.sogoucdn.com/adb84bad53487ec1'; SourcePage = 'https://pic.sogou.com/pics?query=先天圣体大学生表情包'; License = '网络梗图搜索结果，仅用于课程演示；发布前需复核授权'; Artist = '来源作者待核验' }
    '60012' = @{ FileTitle = '曼波小猫网络梗图'; DownloadUrl = 'https://i01piccdn.sogoucdn.com/eb092f28845143fc'; SourcePage = 'https://pic.sogou.com/pics?query=曼波表情包'; License = '网络梗图搜索结果，仅用于课程演示；发布前需复核授权'; Artist = '来源作者待核验' }
    '60013' = @{ FileTitle = '香蕉猫网络梗图'; DownloadUrl = 'https://i02piccdn.sogoucdn.com/fc302143280970f1'; SourcePage = 'https://pic.sogou.com/pics?query=香蕉猫梗图'; License = '网络梗图搜索结果，仅用于课程演示；发布前需复核授权'; Artist = '来源作者待核验' }
    '60014' = @{ FileTitle = '悲伤蛙网络梗图'; DownloadUrl = 'https://i04piccdn.sogoucdn.com/0690a7a2ab481349'; SourcePage = 'https://pic.sogou.com/pics?query=悲伤蛙表情包'; License = '网络梗图搜索结果，仅用于课程演示；发布前需复核授权'; Artist = '来源作者待核验' }
    '60015' = @{ FileTitle = '吉吉国王红温网络梗图'; DownloadUrl = 'https://i03piccdn.sogoucdn.com/5742e0b6653ac114'; SourcePage = 'https://pic.sogou.com/pics?query=吉吉国王表情包'; License = '网络梗图搜索结果，仅用于课程演示；发布前需复核授权'; Artist = '来源作者待核验' }
    '60016' = @{ FileTitle = '无语菩萨网络梗图'; DownloadUrl = 'https://i04piccdn.sogoucdn.com/f32747498ea94ff5'; SourcePage = 'https://pic.sogou.com/pics?query=无语菩萨表情包'; License = '网络梗图搜索结果，仅用于课程演示；发布前需复核授权'; Artist = '来源作者待核验' }
}

function Get-NetworkImage {
    param(
        [string]$Query,
        [string]$Id
    )

    $words = @($Query -split '\s+')
    $downloadUrl = $null
    for ($count = $words.Count; $count -ge 1; $count--) {
        $attempt = $words[0..($count - 1)] -join ' '
        $searchUrl = "https://commons.wikimedia.org/w/index.php?search=$([uri]::EscapeDataString($attempt))&title=Special:MediaSearch&type=image"
        $html = (Invoke-WebRequest -UseBasicParsing -Uri $searchUrl -Headers @{ 'User-Agent' = $userAgent }).Content
        $downloadUrl = [regex]::Matches(
            $html,
            'https://upload\.wikimedia\.org/wikipedia/commons/(?!thumb/)[^"'' <>]+?\.(?:jpg|jpeg|png|webp)'
        ) | ForEach-Object {
            [System.Net.WebUtility]::HtmlDecode($_.Value)
        } | Select-Object -Unique -First 1
        if ($downloadUrl) {
            break
        }
        Start-Sleep -Milliseconds 300
    }
    if (-not $downloadUrl) {
        throw "No Wikimedia Commons image found for '$Query'."
    }

    $fileName = [uri]::UnescapeDataString(($downloadUrl -split '/')[-1])
    $sourceFileName = [uri]::EscapeDataString($fileName) -replace '%2F', '/'
    return [pscustomobject]@{
        FileTitle = $fileName
        DownloadUrl = $downloadUrl
        SourcePage = "https://commons.wikimedia.org/wiki/File:$sourceFileName"
        License = 'See Wikimedia Commons source page'
        Artist = 'See Wikimedia Commons source page'
    }
}

$sourceFile = Join-Path $OutputDirectory 'sources.json'
$sources = New-Object System.Collections.Generic.List[object]
if ($OnlyIds.Count -gt 0 -and (Test-Path $sourceFile)) {
    $existingSources = Get-Content -Raw -Encoding UTF8 $sourceFile | ConvertFrom-Json
    foreach ($existingSource in $existingSources) {
        if ($existingSource.Id -notin $OnlyIds) {
            $sources.Add($existingSource)
        }
    }
}
$selectedItems = if ($OnlyIds.Count -gt 0) {
    @($items | Where-Object Id -in $OnlyIds)
} else {
    $items
}
foreach ($item in $selectedItems) {
    Write-Output "Fetching $($item.Id) $($item.Title)"
    $source = if ($directImages.ContainsKey($item.Id)) {
        [pscustomobject]$directImages[$item.Id]
    } else {
        Get-NetworkImage -Query $item.Query -Id $item.Id
    }
    $temporaryFile = Join-Path $temporaryDirectory "$($item.Id).source"
    $outputFile = Join-Path $OutputDirectory "$($item.Id).webp"
    $sourceForProxy = $source.DownloadUrl -replace '^https?://', ''
    $proxyUrl = "https://wsrv.nl/?url=$sourceForProxy&w=960&h=720&fit=cover&output=jpg"
    try {
        Invoke-WebRequest -UseBasicParsing -Uri $proxyUrl -OutFile $temporaryFile -Headers @{ 'User-Agent' = $userAgent }
    } catch {
        Start-Sleep -Seconds 2
        Invoke-WebRequest -UseBasicParsing -Uri $source.DownloadUrl -OutFile $temporaryFile -Headers @{ 'User-Agent' = $userAgent; 'Referer' = 'https://commons.wikimedia.org/' }
    }
    & $cwebp -quiet -q 82 $temporaryFile -o $outputFile
    if ($LASTEXITCODE -ne 0) {
        throw "cwebp failed for $($item.Id)."
    }

    $sources.Add([pscustomobject]@{
        Id = $item.Id
        Title = $item.Title
        Query = $item.Query
        FileTitle = $source.FileTitle
        SourcePage = $source.SourcePage
        License = $source.License
        Artist = $source.Artist
    })
    Start-Sleep -Milliseconds 150
}

if ($OnlyIds.Count -eq 0) {
foreach ($entry in $copies.GetEnumerator()) {
    Copy-Item -Force (Join-Path $OutputDirectory "$($entry.Value).webp") (Join-Path $OutputDirectory "$($entry.Key).webp")
    $original = $sources | Where-Object Id -eq $entry.Value | Select-Object -First 1
    $sources.Add([pscustomobject]@{
        Id = $entry.Key
        Title = "复用 $($entry.Value) 的同款商品图片"
        Query = $original.Query
        FileTitle = $original.FileTitle
        SourcePage = $original.SourcePage
        License = $original.License
        Artist = $original.Artist
    })
}

$variantCopies = @{
    '1003-1' = '1003'; '1003-2' = '1003'; '1003-3' = '1003'
    '9001-1' = '9001'; '9001-2' = '9001'
    '9002-1' = '9002'; '9002-2' = '9002'
    '9003-1' = '9003'; '9003-2' = '9003'
    '9004-1' = '9004'; '9004-2' = '9004'
    '9005-1' = '9005'; '9005-2' = '9005'
}
foreach ($entry in $variantCopies.GetEnumerator()) {
    Copy-Item -Force (Join-Path $OutputDirectory "$($entry.Value).webp") (Join-Path $OutputDirectory "$($entry.Key).webp")
}
}

$sources | Sort-Object Id | ConvertTo-Json -Depth 4 | Set-Content -Encoding UTF8 $sourceFile
Remove-Item -Recurse -Force -LiteralPath $temporaryDirectory
Write-Output "Updated $(@($selectedItems).Count) catalog covers and wrote $sourceFile"
