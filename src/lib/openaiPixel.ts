// OpenAI Ads(ChatGPT 광고) Measurement Pixel 연동 모듈
// 공식 문서: https://developers.openai.com/ads/measurement-pixel
//
// - 픽셀 ID는 NEXT_PUBLIC_OPENAI_PIXEL_ID 가 있을 때만 활성화된다 (코드 기본값 없음).
//   개인정보처리방침·동의 문구를 반영한 뒤 환경변수를 넣는 것으로 운영 반영을 명시적으로 한다.
// - 이 모듈이 보내는 이벤트 데이터에는 개인정보(이름·연락처·이메일·상담 내용)를 넣지 않는다.
// - 단, 자동 고급 매칭(AAM)이 켜져 있어 SDK가 폼 입력값을 해시해 전환에 붙인다 (코드로 끌 수 없음).
//   자세한 내용: docs/analytics/openai-ads-pixel.md

declare global {
  interface Window {
    oaiq?: (...args: unknown[]) => void;
  }
}

export const OPENAI_PIXEL_ID = process.env.NEXT_PUBLIC_OPENAI_PIXEL_ID?.trim() || undefined;

const OPENAI_PIXEL_SDK_URL = 'https://bzrcdn.openai.com/sdk/oaiq.min.js';

// debug: true 이면 SDK가 브라우저 콘솔에 동작 로그를 남긴다. 개발 환경은 기본 켜짐.
const OPENAI_PIXEL_DEBUG =
  process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_OPENAI_PIXEL_DEBUG === 'true';

// 공식 설치 스니펫. oaiq 큐를 먼저 만들고 SDK를 비동기로 불러온 뒤 init 한다.
export const getOpenAIPixelInitScript = (pixelId: string) => {
  const initOptions = JSON.stringify({ pixelId, ...(OPENAI_PIXEL_DEBUG ? { debug: true } : {}) });
  return `
    (function (w, d, s, u) {
      if (w.oaiq) return;
      var q = function () {
        q.q.push(arguments);
      };
      q.q = [];
      w.oaiq = q;
      var js = d.createElement(s);
      js.async = true;
      js.src = u;
      var f = d.getElementsByTagName(s)[0];
      f.parentNode.insertBefore(js, f);
    })(window, document, "script", "${OPENAI_PIXEL_SDK_URL}");

    oaiq("init", ${initOptions});
  `;
};

// 설치 스니펫이 실행된 뒤에만 oaiq 함수가 존재한다 (SDK 로드 전에는 큐에 쌓였다가 전송됨).
const getOaiq = () => {
  if (typeof window === 'undefined' || !OPENAI_PIXEL_ID) return undefined;
  return typeof window.oaiq === 'function' ? window.oaiq : undefined;
};

// 같은 접수 건이 재렌더링 등으로 두 번 호출돼도 한 번만 보낸다.
const sentLeadEventIds = new Set<string>();

// 상담 신청 접수 전환 (lead_created)
// 서버가 신청을 접수하고 돌려준 inquiryId 를 event_id 로 쓴다.
// OpenAI는 pixelId + 이벤트명 + event_id 가 같은 이벤트 중 처음 받은 것만 집계한다.
export const trackLeadCreated = (eventId: string) => {
  const oaiq = getOaiq();
  if (!oaiq || !eventId || sentLeadEventIds.has(eventId)) return;

  sentLeadEventIds.add(eventId);
  // 측정 실패가 접수 완료 흐름(완료 페이지 이동)을 깨지 않도록 예외를 삼킨다.
  try {
    oaiq('measure', 'lead_created', { type: 'customer_action' }, { event_id: eventId });
  } catch (error) {
    console.error('[openaiPixel] lead_created 전송 실패:', error);
  }
};
