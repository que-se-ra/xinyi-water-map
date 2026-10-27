/**
 * 建立松菸專屬的熱舒適問卷 Google 表單與回覆試算表（2026-10-27）。
 *
 * 用法（只需要做一次）：
 *   1. 用要擁有表單的 Google 帳號打開 https://script.google.com ，按「新專案」。
 *   2. 先全選（⌘A）刪掉編輯器裡原本的 function myFunction() {}，再把這整份內容貼上，按儲存。
 *      （不要貼在 myFunction 的大括號裡面，否則執行時找不到 createSongshanSurveyForm。）
 *   3. 上方函式選 createSongshanSurveyForm，按「執行」，依畫面授權
 *      （會出現「Google 尚未驗證這個應用程式」，因為是你自己寫的腳本：按「進階」→「前往…」）。
 *   4. 執行完，把下方「執行記錄」整段複製給網站維護者，填進 src/lib/survey-forms.js。
 *
 * 注意：
 *   - 題目順序不能改（後台依欄位順序解析）；題目文字之後可以在表單裡自由修改。
 *   - 第一題的選項文字要和網站一字不差，改了要同步改 src/projects/songshan/index.js 的 survey.relations。
 *   - 不要開「收集電子郵件」或「每人限填一次」：這兩個會強制填答者登入 Google，網站就無法代為送出。
 *   - 回覆試算表會設成「知道連結的人可檢視」，後台分析才讀得到（和信水義河的回覆試算表相同做法）。
 */

var RELATIONS = [
  '在園區工作',
  '經常造訪（散步、休閒）',
  '偶爾來訪（看展、活動、市集）',
  '初次造訪（第一次來）',
  '經常經過（周邊通勤）',
  '研究場域／活動合作',
];

function createSongshanSurveyForm() {
  var form = FormApp.create('松山文創園區「體感溫度」地圖：熱舒適經驗調查');
  form
    .setDescription(
      '在松山文創園區，哪裡最熱？哪裡最涼？邀請您分享在園區裡的體感經驗，協助我們描繪園區的「體感溫度」地圖，作為改善園區環境的參考。\n' +
        '建議使用網站版問卷填寫，地點題可以直接在地圖上點選：https://xinyi-water-map-theta.vercel.app/songshan/survey'
    )
    .setCollectEmail(false)
    .setLimitOneResponsePerUser(false)
    .setAllowResponseEdits(false);

  var place = '網站問卷送出的地點答案會附上地圖座標，例如「巴洛克花園（25.04366, 121.56057）」。';

  var q1 = form
    .addMultipleChoiceItem()
    .setTitle('您與松山文創園區的關係？')
    .setChoiceValues(RELATIONS)
    .showOtherOption(true)
    .setRequired(true);
  var q2 = form
    .addScaleItem()
    .setTitle('在松山文創園區戶外活動時，整體的熱舒適感受是？')
    .setBounds(1, 5)
    .setLabels('悶熱＆難以久待', '涼爽＆舒適宜人')
    .setRequired(true);
  var q3 = form
    .addTextItem()
    .setTitle('松山文創園區哪個地點或路段，讓您覺得最熱、最不舒適？')
    .setHelpText(place)
    .setRequired(true);
  var q4 = form
    .addTextItem()
    .setTitle('為什麼那裡讓您覺得不舒適？')
    .setHelpText('例如：缺乏樹蔭或遮陽設施、水泥鋪面日曬吸熱、通風不良、冷氣室外機排熱…')
    .setRequired(true);
  var q5 = form
    .addTextItem()
    .setTitle('松山文創園區哪個地點，讓您覺得最涼爽、最舒適？')
    .setHelpText(place)
    .setRequired(true);
  var q6 = form
    .addParagraphTextItem()
    .setTitle('為什麼那裡讓您覺得舒適？')
    .setHelpText('例如：有大樹綠蔭遮蔽、草地旁涼爽、靠近生態池水體、古蹟建築迴廊通風…')
    .setRequired(true);
  var q7 = form
    .addTextItem()
    .setTitle('如果能優先改善一個地方，您希望優先改善哪裡？')
    .setHelpText(place)
    .setRequired(true);

  var sheet = SpreadsheetApp.create('松山文創園區熱舒適經驗調查（回覆）');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, sheet.getId());
  DriveApp.getFileById(sheet.getId()).setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  // 預填網址裡的 entry.xxxx 就是網站送出時要用的欄位代號
  var prefill = form
    .createResponse()
    .withItemResponse(q1.createResponse(RELATIONS[0]))
    .withItemResponse(q2.createResponse(3))
    .withItemResponse(q3.createResponse('Q3'))
    .withItemResponse(q4.createResponse('Q4'))
    .withItemResponse(q5.createResponse('Q5'))
    .withItemResponse(q6.createResponse('Q6'))
    .withItemResponse(q7.createResponse('Q7'))
    .toPrefilledUrl();

  Logger.log(
    '\n===== 請把這段整個複製給網站維護者 =====\n' +
      '填答網址：' + form.getPublishedUrl() + '\n' +
      '編輯網址：' + form.getEditUrl() + '\n' +
      '回覆試算表：' + sheet.getUrl() + '\n' +
      '預填網址：' + prefill + '\n' +
      '=========================================='
  );
}
