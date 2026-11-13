/**
 * Google Apps Script (구글 앱스 스크립트)
 * 
 * [초등 5학년 영어 단어 팡팡 - 구글 스프레드시트 기록 연동 스크립트]
 * 
 * 구글 시트의 1행 헤더:
 * timestamp | name | play_count | correct_count | wrong_count
 * 
 * -------------------------------------------------------------
 * [적용 방법 (1분 완료)]:
 * 1. 구글 스프레드시트를 새로 만들거나 기존 시트를 엽니다.
 * 2. 상단 메뉴에서 [확장 프로그램] > [Apps Script]를 클릭합니다.
 * 3. 기존 코드를 모두 지우고 아래의 코드를 그대로 복사하여 붙여넣습니다.
 * 4. 상단 [저장 (디스크 아이콘)]을 누릅니다.
 * 5. 우측 상단 파란색 [배포] 버튼 > [새 배포] 클릭
 *    - 유형 선택: [웹 앱] (톱니바퀴 아이콘)
 *    - 설명: 영어 단어 게임 점수 기록
 *    - 다음 사용자로서 실행: [나] (Me)
 *    - 액세스 권한이 있는 사용자: [모든 사용자] (Anyone)  <-- 중요!
 * 6. [배포] 클릭 후 나오는 [웹 앱 URL]을 복사하여 게임의 '구글 시트 연동 설정'에 입력하면 끝!
 * -------------------------------------------------------------
 */

function doPost(e) {
  return handleRequest(e);
}

function doGet(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  var lock = LockService.getScriptLock();
  // 동시 접속 충돌 방지 (최대 30초 대기)
  lock.tryLock(30000);

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();

    // 1. 헤더가 없는 경우 자동으로 1행에 헤더 생성
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["timestamp", "name", "play_count", "correct_count", "wrong_count"]);
      // 1행 헤더 서식 스타일링
      var headerRange = sheet.getRange(1, 1, 1, 5);
      headerRange.setBackground("#4f46e5");
      headerRange.setFontColor("#ffffff");
      headerRange.setFontWeight("bold");
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }

    // 2. 파라미터 파싱 (POST JSON, Form 데이터, GET 쿼리스트링 모두 지원)
    var data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    // 날짜/시간 포맷 (한국 표준시 KST)
    var formattedTime = data.timestamp;
    if (!formattedTime) {
      var now = new Date();
      formattedTime = Utilities.formatDate(now, "Asia/Seoul", "yyyy-MM-dd HH:mm:ss");
    }

    var studentName = data.name || "익명 학생";
    var playCount = Number(data.play_count) || 1;
    var correctCount = Number(data.correct_count) || 0;
    var wrongCount = Number(data.wrong_count) || 0;

    // 3. 스프레드시트에 새 행 추가
    sheet.appendRow([
      formattedTime,
      studentName,
      playCount,
      correctCount,
      wrongCount
    ]);

    // 4. 마지막 추가된 행 중앙 정렬 및 서식
    var lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 1, 1, 5).setHorizontalAlignment("center");

    // 5. 성공 응답 반환 (JSON)
    var result = {
      status: "success",
      message: "정상적으로 기록되었습니다.",
      row: lastRow,
      data: {
        timestamp: formattedTime,
        name: studentName,
        play_count: playCount,
        correct_count: correctCount,
        wrong_count: wrongCount
      }
    };

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    var errorResult = {
      status: "error",
      message: error.toString()
    };
    return ContentService.createTextOutput(JSON.stringify(errorResult))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
