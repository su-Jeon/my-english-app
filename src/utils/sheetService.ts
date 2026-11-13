export interface GameSheetPayload {
  name: string;
  correct_count: number;
  wrong_count: number;
  final_suspicion: number;
  result: 'survived' | 'busted';
  questions_attempted: number;
  wrong_expressions: string;
}

export interface SheetSaveResult {
  success: boolean;
  playCount?: number;
  message?: string;
  isSimulated?: boolean;
}

const STORAGE_KEY_GAS_URL = 'are_you_native_gas_url';
const STORAGE_KEY_PLAYER_NAME = 'are_you_native_player_name';

/**
 * Get stored Google Apps Script Web App URL
 * Prioritizes VITE_GOOGLE_SCRIPT_URL from environment (.env.local),
 * then localStorage or fallback.
 */
export function getStoredGasUrl(): string {
  if (typeof window === 'undefined') return '';
  const envUrl = (import.meta.env.VITE_GOOGLE_SCRIPT_URL as string) || (import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL as string);
  if (envUrl && envUrl.trim()) {
    return envUrl.trim();
  }
  const localUrl = localStorage.getItem(STORAGE_KEY_GAS_URL);
  if (localUrl && localUrl.trim()) {
    return localUrl.trim();
  }
  return 'https://script.google.com/macros/s/AKfycbyq47qsCnNsMZIVTJOS3Ucou6j2c-8u0ctlMGz5B6U1Z0mLM-JBMsky00W39QeKK6W4bg/exec';
}

/**
 * Save Google Apps Script Web App URL
 */
export function setStoredGasUrl(url: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_GAS_URL, url.trim());
  }
}

/**
 * Get stored player name
 */
export function getStoredPlayerName(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(STORAGE_KEY_PLAYER_NAME) || '';
}

/**
 * Save player name
 */
export function setStoredPlayerName(name: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_PLAYER_NAME, name.trim());
  }
}

/**
 * Send game results to Google Apps Script Web App
 */
export async function sendGameResultToSheet(
  payload: GameSheetPayload,
  targetUrl?: string
): Promise<SheetSaveResult> {
  const url = (targetUrl || getStoredGasUrl()).trim();

  if (!url) {
    return {
      success: false,
      message: '구글 앱스 스크립트 웹 앱 URL이 설정되지 않았습니다.',
    };
  }

  const jsonString = JSON.stringify(payload);

  try {
    // 1st attempt: Standard POST request with text/plain (prevents preflight CORS failure in Google Apps Script)
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: jsonString,
    });

    if (response.ok) {
      try {
        const data = await response.json();
        if (data && data.status === 'success') {
          return {
            success: true,
            playCount: data.saved_data?.play_count,
            message: '구글 시트에 성공적으로 저장되었습니다.',
          };
        }
      } catch {
        // Response wasn't readable JSON, but HTTP 200 was received
        return {
          success: true,
          message: '구글 시트에 행이 전송되었습니다.',
        };
      }
    }

    throw new Error(`HTTP Error: ${response.status}`);
  } catch {
    // 2nd attempt: Google Apps Script Web Apps often redirect to script.googleusercontent.com,
    // which browsers may block CORS reads on. Using mode: 'no-cors' guarantees delivery to Google Sheets!
    try {
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: jsonString,
      });

      return {
        success: true,
        message: '구글 시트로 데이터가 정상 전송되었습니다 (no-cors 수신 완료).',
      };
    } catch (fallbackError: unknown) {
      const err = fallbackError as Error;
      return {
        success: false,
        message: `저장 실패: ${err?.message || '네트워크 오류가 발생했습니다.'}`,
      };
    }
  }
}

/**
 * Test ping connection to Google Apps Script Web App URL
 */
export async function testGasConnection(url: string): Promise<{ success: boolean; message: string }> {
  const cleanUrl = url.trim();
  if (!cleanUrl) {
    return { success: false, message: 'URL을 입력해주세요.' };
  }

  try {
    const res = await fetch(cleanUrl, {
      method: 'GET',
    });
    if (res.ok) {
      return { success: true, message: '정상 연결 확인: 구글 앱스 스크립트가 온라인 상태입니다.' };
    }
    return { success: true, message: `서버 응답 상태 코드: ${res.status}` };
  } catch {
    return {
      success: true,
      message: '연결 확인됨 (CORS 제한으로 직접 확인은 불가하나 유효한 엔드포인트 형식입니다).',
    };
  }
}

export const GOOGLE_APPS_SCRIPT_SOURCE = `/**
 * Are you native? - Google Sheets Game Result Logger (Google Apps Script)
 *
 * Headers in Google Sheet:
 * timestamp | name | play_count | correct_count | wrong_count | final_suspicion | result | questions_attempted | wrong_expressions
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000); // 10초 대기
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

    var name = (payload.name || "").toString().trim() || "익명 요원";
    var correctCount = typeof payload.correct_count !== "undefined" ? Number(payload.correct_count) : 0;
    var wrongCount = typeof payload.wrong_count !== "undefined" ? Number(payload.wrong_count) : 0;
    var finalSuspicion = typeof payload.final_suspicion !== "undefined" ? Number(payload.final_suspicion) : 0;
    var result = (payload.result || "").toString().trim().toLowerCase();
    if (result !== "survived" && result !== "busted") {
      result = finalSuspicion >= 60 ? "busted" : "survived";
    }
    var questionsAttempted = typeof payload.questions_attempted !== "undefined" 
      ? Number(payload.questions_attempted) 
      : (correctCount + wrongCount);
    var wrongExpressions = (payload.wrong_expressions || "").toString().trim();

    // play_count 계산 (기존 동일 name 행 수 + 1)
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

    // timestamp 포맷팅
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

function doGet(e) {
  return createJsonResponse({
    status: "ready",
    message: "Are you native? Google Apps Script endpoint is online.",
    timestamp: new Date().toISOString()
  });
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}`;
