import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

// 자동 테스트 설정. 실행: npm test (자세한 내용: docs/testing/README.md)
// tests/*.test.cjs 는 node:test 로 따로 실행하므로 여기서는 .test.ts 만 모은다.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    // 운영 서버(Vercel)와 같은 UTC로 실행해, 한국 시간 처리를 빠뜨리면 실패하게 한다.
    env: { TZ: "UTC" },
    include: ["tests/**/*.test.ts"],
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
  },
})
