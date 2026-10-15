// ============================================================
// 松山文創園區 —— 「城市裡的微氣候觀察｜互動地圖工作坊」走讀路線（2026-10-15 版，直角示意圖）
// 站點（使用者提供）：A 文創大街、B 新仁里農園、C 巴洛克花園、D 楓香大道、E 松山匯 遊客中心
//   路線一：A → B → D → E → C
//   路線二：A → E → D → B → C
//
// 這是「示意路線」：路徑只用直線與直角，沿著園區外框走（上邊 A–B、右邊、下邊、左邊），
// 站點對齊到這個格網上（相對實測位置最多移動約 15 公尺），不是 GPS 軌跡。
//   格網：左邊 x=121.55919（A、E）、右邊 x=121.56141（D）、上邊 y=25.04423（A、B）、
//         下邊 y=25.04321（D）、E 與 C 同在 y=25.04366，C 在 x=121.56057。
//   轉角：J = 右上角（上邊與右邊相交）、T = 上邊通往 C 的岔口、BL = 左下角。
// 原始座標來源：A / B / D / E 為使用者 2026-10-15 實地步行 GPX 的航點；
//   C 巴洛克花園 GPX 沒有，由 OpenStreetMap 底圖目測中央噴水池草坪推算，🔴 待現場確認。
//   原本依 GPX 軌跡畫的版本在 git 歷史 commit 51b09b8。
// 折返不重複畫：segment 的 skipLeading = N 表示畫線時省略開頭 N 個點。
//   路線一 B→D 回頭走上邊那段和 A→B 重疊，只畫右上角 J 到 D；
//   路線二 B→C 回頭走上邊那段和 D→B 重疊，只畫 J → T → C。
// 站點說明（hook / body / imgs）尚未撰寫，留空。
// ============================================================

export const routes = [
  {
    "id": "songshan-route-01",
    "name": "路線一",
    "subtitle": "文創大街 → 新仁里農園 → 楓香大道 → 松山匯 → 巴洛克花園",
    "color": "#2F80A8",
    "colorDark": "#1F5F80",
    "startStation": "文創大街",
    "stationCount": 5,
    "stations": [
      {
        "id": "A",
        "name": "文創大街",
        "lat": 25.04423,
        "lng": 121.55919,
        "badge": "站 A",
        "hook": "",
        "body": "",
        "imgs": []
      },
      {
        "id": "B",
        "name": "新仁里農園",
        "lat": 25.04423,
        "lng": 121.56232,
        "badge": "站 B",
        "hook": "",
        "body": "",
        "imgs": []
      },
      {
        "id": "D",
        "name": "楓香大道",
        "lat": 25.04321,
        "lng": 121.56141,
        "badge": "站 D",
        "hook": "",
        "body": "",
        "imgs": []
      },
      {
        "id": "E",
        "name": "松山匯 遊客中心",
        "lat": 25.04366,
        "lng": 121.55919,
        "badge": "站 E",
        "hook": "",
        "body": "",
        "imgs": []
      },
      {
        "id": "C",
        "name": "巴洛克花園",
        "lat": 25.04366,
        "lng": 121.56057,
        "badge": "站 C",
        "hook": "",
        "body": "",
        "imgs": []
      }
    ],
    "segments": [
      {
        "from": "A",
        "to": "B"
      },
      {
        "from": "B",
        "to": "D",
        "waypoints": [
          {
            "lat": 25.04423,
            "lng": 121.56141
          }
        ],
        "skipLeading": 1
      },
      {
        "from": "D",
        "to": "E",
        "waypoints": [
          {
            "lat": 25.04321,
            "lng": 121.55919
          }
        ]
      },
      {
        "from": "E",
        "to": "C"
      }
    ]
  },
  {
    "id": "songshan-route-02",
    "name": "路線二",
    "subtitle": "文創大街 → 松山匯 → 楓香大道 → 新仁里農園 → 巴洛克花園",
    "color": "#D9822B",
    "colorDark": "#A8611B",
    "startStation": "文創大街",
    "stationCount": 5,
    "stations": [
      {
        "id": "A",
        "name": "文創大街",
        "lat": 25.04423,
        "lng": 121.55919,
        "badge": "站 A",
        "hook": "",
        "body": "",
        "imgs": []
      },
      {
        "id": "E",
        "name": "松山匯 遊客中心",
        "lat": 25.04366,
        "lng": 121.55919,
        "badge": "站 E",
        "hook": "",
        "body": "",
        "imgs": []
      },
      {
        "id": "D",
        "name": "楓香大道",
        "lat": 25.04321,
        "lng": 121.56141,
        "badge": "站 D",
        "hook": "",
        "body": "",
        "imgs": []
      },
      {
        "id": "B",
        "name": "新仁里農園",
        "lat": 25.04423,
        "lng": 121.56232,
        "badge": "站 B",
        "hook": "",
        "body": "",
        "imgs": []
      },
      {
        "id": "C",
        "name": "巴洛克花園",
        "lat": 25.04366,
        "lng": 121.56057,
        "badge": "站 C",
        "hook": "",
        "body": "",
        "imgs": []
      }
    ],
    "segments": [
      {
        "from": "A",
        "to": "E"
      },
      {
        "from": "E",
        "to": "D",
        "waypoints": [
          {
            "lat": 25.04321,
            "lng": 121.55919
          }
        ]
      },
      {
        "from": "D",
        "to": "B",
        "waypoints": [
          {
            "lat": 25.04423,
            "lng": 121.56141
          }
        ]
      },
      {
        "from": "B",
        "to": "C",
        "waypoints": [
          {
            "lat": 25.04423,
            "lng": 121.56141
          },
          {
            "lat": 25.04423,
            "lng": 121.56057
          }
        ],
        "skipLeading": 1
      }
    ]
  }
];
