/**
 * ====================================================================
 * Are you native? - Google Sheets Game Result Logger (Google Apps Script)
 * ====================================================================
 * 
 * [시트 헤더 구성]
 * timestamp | name | play_count | correct_count | wrong_count | final_suspicion | result | questions_attempted | wrong_expressions
 * 
 * [배포 방법]
 * 1. 구글 스프레드시트 상단 메뉴 > [확장 프로그램] > [Apps Script] 클릭
 * 2. 기존 코드를 모두 지우고 본 스크립트 내용 전체를 붙여넣기 후 저장 (Ctrl+S)
 * 3. 오른쪽 상단 [배포] > [새 배포] 클릭
 * 4. 톱니바퀴 아이콘 > [웹 앱] 선택
 * 5. 설정:
 *    - 설명: Are you native logger
 *    - 다음 사용자 권한으로 실행: 나(내 계정)
 *    - 액세스 권한이 있는 사용자: 모든 사용자 (Anyone)  <-- 중요!
 * 6. [배포] 클릭 후 생성된 '웹 앱 URL'을 복사하여 게임 앱의 구글 시트 설정에 입력
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  // 동시 요청 처리 충돌 방지를 위해 최대 10초 대기
  try {
    lock.waitLock(10000);
  } catch (err) {
    return createJsonResponse({
      status: "error",
      message: "Server busy, could not acquire lock"
    });
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();

    // 시트가 비어 있는 경우 헤더 자동 생성
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "timestamp",
        "name",
        "play_count",
        "correct_count",
        "wrong_count",
        "final_suspicion",
        "result",
        "questions_attempted",
        "wrong_expressions"
      ]);
    }

    // POST로 전달된 JSON 데이터 파싱
    var payload = {};
    if (e && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        payload = e.parameter || {};
      }
    } else if (e && e.parameter) {
      payload = e.parameter;
    }

    // 각 필드 값 정제
    var name = (payload.name || "").toString().trim();
    if (!name) {
      name = "익명 요원";
    }

    var correctCount = typeof payload.correct_count !== "undefined" ? Number(payload.correct_count) : 0;
    var wrongCount = typeof payload.wrong_count !== "undefined" ? Number(payload.wrong_count) : 0;
    var finalSuspicion = typeof payload.final_suspicion !== "undefined" ? Number(payload.final_suspicion) : 0;
    
    // result: "survived" 또는 "busted"
    var result = (payload.result || "").toString().trim().toLowerCase();
    if (result !== "survived" && result !== "busted") {
      result = finalSuspicion >= 60 ? "busted" : "survived";
    }

    // questions_attempted: 시도한 문항 수
    var questionsAttempted = typeof payload.questions_attempted !== "undefined" 
      ? Number(payload.questions_attempted) 
      : (correctCount + wrongCount);

    // wrong_expressions: 틀린 문항의 원어민 표현 쉼표 구분 문자열
    var wrongExpressions = (payload.wrong_expressions || "").toString().trim();

    // play_count 계산:
    // 기존 행 중 name 열(2번째 열, B열)에서 동일한 name이 나타난 횟수 + 1
    var playCount = 1;
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      var nameColumnValues = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
      var existingCount = 0;
      for (var i = 0; i < nameColumnValues.length; i++) {
        var cellName = (nameColumnValues[i][0] || "").toString().trim();
        if (cellName.toLowerCase() === name.toLowerCase()) {
          existingCount++;
        }
      }
      playCount = existingCount + 1;
    }

    // timestamp: 저장 시점 날짜와 시간 (한국 시간 Asia/Seoul 기준 포맷팅)
    var timeZone = Session.getScriptTimeZone() || "Asia/Seoul";
    var formattedTimestamp = Utilities.formatDate(new Date(), timeZone, "yyyy-MM-dd HH:mm:ss");

    // 행 추가
    sheet.appendRow([
      formattedTimestamp,
      name,
      playCount,
      correctCount,
      wrongCount,
      finalSuspicion,
      result,
      questionsAttempted,
      wrongExpressions
    ]);

    var responseData = {
      status: "success",
      message: "Row appended successfully",
      saved_data: {
        timestamp: formattedTimestamp,
        name: name,
        play_count: playCount,
        correct_count: correctCount,
        wrong_count: wrongCount,
        final_suspicion: finalSuspicion,
        result: result,
        questions_attempted: questionsAttempted,
        wrong_expressions: wrongExpressions
      }
    };

    return createJsonResponse(responseData);

  } catch (error) {
    return createJsonResponse({
      status: "error",
      message: error.toString()
    });
  } finally {
    lock.releaseLock();
  }
}

/**
 * GET 요청 처리 (웹 앱 상태 및 연결 테스트용)
 */
function doGet(e) {
  return createJsonResponse({
    status: "ready",
    message: "Are you native? Google Apps Script endpoint is online.",
    timestamp: new Date().toISOString()
  });
}

/**
 * JSON 응답 생성 헬퍼
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
