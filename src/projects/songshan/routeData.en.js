// routeData.en.js —— 松山路線的英文內容，依 route id / station id 對應中文版。
// 🔴 所有英文名稱為暫譯，待使用者確認（見 docs/en-translation-open-questions.md 第 6 條）。
// 站點說明（2026-10-27）：譯自松山文創園區提供的中文介紹。建築與機構名稱沿用園區官網英文頁的用法
//   （Taipei New Horizon Building、Taipei Dome、Office Building、Songshan Tobacco Factory）；
//   人名（陳履坦、林元朗）查不到官方英文寫法，依專案規則保留中文不自行拼音。臺北酒廠暫譯 Taipei Winery。
// 缺的欄位自動退回中文（見 src/i18n/useRoutes.js）。

export const routesEn = {
  "songshan-route-01": {
    "name": "Route 1",
    "subtitle": "Baroque Garden → Sweetgum Avenue → Songshan Hub Visitor Centre → Creative Street → Xinren Village Farm",
    "startStation": "Baroque Garden",
    "stations": {
      "C": {
        "name": "Baroque Garden",
        "badge": "Stop C",
        "hook": "Laid out in 1958 by 林元朗, a technical specialist at the Taipei Winery, at the invitation of factory director 陳履坦, the garden follows a geometric plan that blends Chinese and Western elements.",
        "body": "Its fountain, a three-tier champagne-tower design rarely seen at the time, also served as a reserve of water for firefighting.",
        "imgCaps": [
          "Baroque Garden | Photo courtesy of Songshan Cultural and Creative Park"
        ],
        "credit": "Songshan Cultural and Creative Park"
      },
      "D": {
        "name": "Sweetgum Avenue",
        "badge": "Stop D",
        "hook": "Sweetgum Avenue lies just south of the cigarette factory in the grounds of the former Songshan Tobacco Factory, and takes its name from the sweetgum trees that are its main landscape trees.",
        "body": "Today it is also the walkway linking the park with the Taipei Dome area.",
        "imgCaps": [
          "Sweetgum Avenue | Photo courtesy of Songshan Cultural and Creative Park"
        ],
        "credit": "Songshan Cultural and Creative Park"
      },
      "E": {
        "name": "Songshan Hub Visitor Centre",
        "badge": "Stop E",
        "hook": "The Office Building once held the factory staff's offices and meeting rooms. Its floors and window frames are solid wood and its stone walls were made to order, giving it a distinctive and carefully crafted style.",
        "body": "The small roundabout in front of it was once a turning circle reserved for VIP cars. Today it often hosts creative markets, street art and art installations.",
        "imgCaps": [
          "Office Building (A6) | Photo courtesy of Songshan Cultural and Creative Park"
        ],
        "credit": "Songshan Cultural and Creative Park"
      },
      "A": {
        "name": "Creative Street",
        "badge": "Stop A",
        "hook": "Creative Street runs along the boundary between Songshan Cultural and Creative Park and the Taipei New Horizon Building.",
        "body": "It was once the main vehicle route between the factory's warehouses and the cigarette factory: tobacco leaf and other raw materials were carried along it to the cigarette factory for processing and manufacture.",
        "imgCaps": [
          "Creative Street | Photo courtesy of Songshan Cultural and Creative Park"
        ],
        "credit": "Songshan Cultural and Creative Park"
      },
      "B": {
        "name": "Xinren Village Farm",
        "badge": "Stop B",
        "hook": "Since 2015 the Taipei City Government has promoted its Garden City policy, bringing departments together to green the city. About 730 garden sites have been set up, nearly 200,000 square metres in all, or roughly 28 football pitches of growing space.",
        "body": "Beyond the public demonstration gardens it started on public land, the city encourages residents to propose their own sites from the bottom up, with the city government helping communities build them by hand. It also promotes an agricultural supplies industry and urban farming, and runs all kinds of events and talks, hoping residents will get to know the Garden City better and more people will take part. The Songshan Food and Agriculture Education Garden (松菸食農教育園區) here is one of these resident-proposed sites, planned as the largest urban rice paddy in Taiwan devoted to food and agriculture education.\n\nThe garden is a complete, regular plot of 2,500 square metres right next to Songshan Cultural and Creative Park, within a 10-minute walk of MRT Sun Yat-sen Memorial Hall or Taipei City Hall Station. It is intended as a demonstration site for circular and sustainable farming where Taipei's primary and secondary schools can hold field trips and food-and-farming activities. Through hands-on experience in nature, children can watch rice grow and help bring in the harvest, and environmental education can nurture their respect and care for the land. At weekends parents can come and learn together with their children, so that food and agriculture education is no longer just something learned from books, giving urban farming a new face.",
        "imgCaps": [
          "Planting rice at the Songshan Food and Agriculture Education Garden | Photo courtesy of the Department of Economic Development, Taipei City Government",
          "A rice-planting event at the Songshan Food and Agriculture Education Garden | Photo courtesy of the Department of Economic Development, Taipei City Government"
        ],
        "credit": "the Department of Economic Development, Taipei City Government"
      }
    }
  },
  "songshan-route-02": {
    "name": "Route 2",
    "subtitle": "Songshan Hub Visitor Centre → Sweetgum Avenue → Baroque Garden → Creative Street → Xinren Village Farm",
    "startStation": "Songshan Hub Visitor Centre",
    "stations": {
      "E": {
        "name": "Songshan Hub Visitor Centre",
        "badge": "Stop E",
        "hook": "The Office Building once held the factory staff's offices and meeting rooms. Its floors and window frames are solid wood and its stone walls were made to order, giving it a distinctive and carefully crafted style.",
        "body": "The small roundabout in front of it was once a turning circle reserved for VIP cars. Today it often hosts creative markets, street art and art installations.",
        "imgCaps": [
          "Office Building (A6) | Photo courtesy of Songshan Cultural and Creative Park"
        ],
        "credit": "Songshan Cultural and Creative Park"
      },
      "D": {
        "name": "Sweetgum Avenue",
        "badge": "Stop D",
        "hook": "Sweetgum Avenue lies just south of the cigarette factory in the grounds of the former Songshan Tobacco Factory, and takes its name from the sweetgum trees that are its main landscape trees.",
        "body": "Today it is also the walkway linking the park with the Taipei Dome area.",
        "imgCaps": [
          "Sweetgum Avenue | Photo courtesy of Songshan Cultural and Creative Park"
        ],
        "credit": "Songshan Cultural and Creative Park"
      },
      "C": {
        "name": "Baroque Garden",
        "badge": "Stop C",
        "hook": "Laid out in 1958 by 林元朗, a technical specialist at the Taipei Winery, at the invitation of factory director 陳履坦, the garden follows a geometric plan that blends Chinese and Western elements.",
        "body": "Its fountain, a three-tier champagne-tower design rarely seen at the time, also served as a reserve of water for firefighting.",
        "imgCaps": [
          "Baroque Garden | Photo courtesy of Songshan Cultural and Creative Park"
        ],
        "credit": "Songshan Cultural and Creative Park"
      },
      "A": {
        "name": "Creative Street",
        "badge": "Stop A",
        "hook": "Creative Street runs along the boundary between Songshan Cultural and Creative Park and the Taipei New Horizon Building.",
        "body": "It was once the main vehicle route between the factory's warehouses and the cigarette factory: tobacco leaf and other raw materials were carried along it to the cigarette factory for processing and manufacture.",
        "imgCaps": [
          "Creative Street | Photo courtesy of Songshan Cultural and Creative Park"
        ],
        "credit": "Songshan Cultural and Creative Park"
      },
      "B": {
        "name": "Xinren Village Farm",
        "badge": "Stop B",
        "hook": "Since 2015 the Taipei City Government has promoted its Garden City policy, bringing departments together to green the city. About 730 garden sites have been set up, nearly 200,000 square metres in all, or roughly 28 football pitches of growing space.",
        "body": "Beyond the public demonstration gardens it started on public land, the city encourages residents to propose their own sites from the bottom up, with the city government helping communities build them by hand. It also promotes an agricultural supplies industry and urban farming, and runs all kinds of events and talks, hoping residents will get to know the Garden City better and more people will take part. The Songshan Food and Agriculture Education Garden (松菸食農教育園區) here is one of these resident-proposed sites, planned as the largest urban rice paddy in Taiwan devoted to food and agriculture education.\n\nThe garden is a complete, regular plot of 2,500 square metres right next to Songshan Cultural and Creative Park, within a 10-minute walk of MRT Sun Yat-sen Memorial Hall or Taipei City Hall Station. It is intended as a demonstration site for circular and sustainable farming where Taipei's primary and secondary schools can hold field trips and food-and-farming activities. Through hands-on experience in nature, children can watch rice grow and help bring in the harvest, and environmental education can nurture their respect and care for the land. At weekends parents can come and learn together with their children, so that food and agriculture education is no longer just something learned from books, giving urban farming a new face.",
        "imgCaps": [
          "Planting rice at the Songshan Food and Agriculture Education Garden | Photo courtesy of the Department of Economic Development, Taipei City Government",
          "A rice-planting event at the Songshan Food and Agriculture Education Garden | Photo courtesy of the Department of Economic Development, Taipei City Government"
        ],
        "credit": "the Department of Economic Development, Taipei City Government"
      }
    }
  }
};
