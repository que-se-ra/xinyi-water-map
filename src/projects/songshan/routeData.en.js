// routeData.en.js —— 松山路線的英文內容，依 route id / station id 對應中文版。
// 🔴 所有英文名稱為暫譯，待使用者確認（見 docs/en-translation-open-questions.md 第 6 條）。
// 站點說明尚未撰寫；缺的欄位自動退回中文（見 src/i18n/useRoutes.js）。

export const routesEn = {
  "songshan-route-01": {
    "name": "Route 1",
    "subtitle": "Baroque Garden → Sweetgum Avenue → Songshan Hub Visitor Centre → Creative Street → Xinren Village Farm",
    "startStation": "Baroque Garden",
    "stations": {
      "C": {
        "name": "Baroque Garden",
        "badge": "Stop C"
      },
      "D": {
        "name": "Sweetgum Avenue",
        "badge": "Stop D"
      },
      "E": {
        "name": "Songshan Hub Visitor Centre",
        "badge": "Stop E"
      },
      "A": {
        "name": "Creative Street",
        "badge": "Stop A"
      },
      "B": {
        "name": "Xinren Village Farm",
        "badge": "Stop B"
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
        "badge": "Stop E"
      },
      "D": {
        "name": "Sweetgum Avenue",
        "badge": "Stop D"
      },
      "C": {
        "name": "Baroque Garden",
        "badge": "Stop C"
      },
      "A": {
        "name": "Creative Street",
        "badge": "Stop A"
      },
      "B": {
        "name": "Xinren Village Farm",
        "badge": "Stop B"
      }
    }
  }
};
