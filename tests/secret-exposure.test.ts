import { execSync } from "node:child_process"
import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

// 비밀값 노출 정적 검사 (rules.md R01).
// 코드를 실행하지 않고 파일 내용만 읽어 확인한다.

const SRC_DIR = "src"
// 서버에서만 써야 하는 모듈. 브라우저 코드("use client")에서 불러오면 비밀값이 번들에 섞일 수 있다.
const SERVER_ONLY_MODULES = ["slack", "googleSheets", "trello", "inquiryEventId"]
// 이름에 이런 말이 들어간 환경변수는 브라우저에 공개되는 NEXT_PUBLIC_ 으로 만들면 안 된다.
const SECRET_NAME_PATTERN = /NEXT_PUBLIC_[A-Z0-9_]*(SECRET|TOKEN|API_KEY|WEBHOOK|PASSWORD|PRIVATE)/

function listSourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return listSourceFiles(path)
    return /\.(ts|tsx|js|jsx)$/.test(entry.name) ? [path] : []
  })
}

const sourceFiles = listSourceFiles(SRC_DIR).map((path) => ({ path, code: readFileSync(path, "utf8") }))
const clientFiles = sourceFiles.filter(({ code }) => /^\s*["']use client["']/.test(code))

describe("비밀값 노출 방지", () => {
  it("브라우저 코드는 NEXT_PUBLIC_ 이 아닌 환경변수를 읽지 않는다", () => {
    const violations = clientFiles.flatMap(({ path, code }) =>
      [...code.matchAll(/process\.env\.([A-Z0-9_]+)/g)]
        .map((match) => match[1])
        .filter((name) => !name.startsWith("NEXT_PUBLIC_") && name !== "NODE_ENV")
        .map((name) => `${path}: ${name}`),
    )
    expect(violations).toEqual([])
  })

  it("브라우저 코드는 서버 전용 모듈을 불러오지 않는다", () => {
    const importPattern = new RegExp(`from\\s+["']@/lib/(${SERVER_ONLY_MODULES.join("|")})["']`)
    const violations = clientFiles.filter(({ code }) => importPattern.test(code)).map(({ path }) => path)
    expect(violations).toEqual([])
  })

  it("비밀값처럼 보이는 이름에 NEXT_PUBLIC_ 을 붙이지 않는다", () => {
    const files = [...sourceFiles, { path: ".env.example", code: readFileSync(".env.example", "utf8") }]
    const violations = files.flatMap(({ path, code }) =>
      [...code.matchAll(new RegExp(SECRET_NAME_PATTERN, "g"))].map((match) => `${path}: ${match[0]}`),
    )
    expect(violations).toEqual([])
  })

  it("실제 값이 든 .env 파일을 커밋하지 않는다 (.env.example 만 허용)", () => {
    const tracked = execSync("git ls-files", { encoding: "utf8" }).split("\n")
    const envFiles = tracked.filter((file) => /(^|\/)\.env(\.|$)/.test(file) && !file.endsWith(".env.example"))
    expect(envFiles).toEqual([])
  })
})
