import { vi } from "vitest"

// 테스트 중 외부로 나가는 요청을 모두 가로챈다.
// 등록한 주소만 정해 둔 가짜 응답을 돌려주고, 그 밖의 주소는 바로 실패시킨다.
// 실제 Slack·구글 시트·Trello·광고 서비스로 요청이 나가는 일이 없도록 하기 위함이다.

type FakeResponder = (url: string, init?: RequestInit) => Response | Promise<Response>

export interface FetchCall {
  url: string
  init?: RequestInit
}

export function guardFetch(routes: Record<string, FakeResponder> = {}) {
  const calls: FetchCall[] = []

  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url
    calls.push({ url, init })
    const prefix = Object.keys(routes).find((route) => url.startsWith(route))
    if (!prefix) {
      throw new Error(`테스트에서 허용하지 않은 외부 요청: ${url}`)
    }
    return routes[prefix](url, init)
  })

  vi.stubGlobal("fetch", fetchMock)
  return { calls, fetchMock }
}

export const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } })

export const textResponse = (body: string, status: number) => new Response(body, { status })
