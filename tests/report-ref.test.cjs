const { test } = require('node:test')
const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const crypto = require('node:crypto')
const ts = require('typescript')

const code = ts.transpileModule(readFileSync('src/lib/reportRef.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText
const mod = { exports: {} }
new Function('module', 'exports', 'Buffer', code)(mod, mod.exports, Buffer)
const { isReportRefToken, parseReportRef } = mod.exports

// 캠페인 /api/go 와 같은 방식으로 만든 토큰 (lib/report-link.js sign)
function sign(data, secret = 'test') {
  const body = Buffer.from(JSON.stringify(data)).toString('base64url')
  const sig = crypto.createHmac('sha256', secret).update(body).digest().subarray(0, 16).toString('base64url')
  return `${body}.${sig}`
}

test('캠페인 토큰에서 리드 ID를 읽는다', () => {
  const token = sign({ k: 'i', l: 'lead_1793245781753_g9z9vj' })
  assert.equal(isReportRefToken(token), true)
  assert.deepEqual({ ...parseReportRef(token) }, { token, leadId: 'lead_1793245781753_g9z9vj' })
})

test('다른 종류의 토큰(리포트 열람·메일 클릭)은 받지 않는다', () => {
  assert.equal(parseReportRef(sign({ k: 'r', l: 'lead_1_a', c: '병원' })), null)
  assert.equal(parseReportRef(sign({ k: 'c', l: 'lead_1_a', c: '병원' })), null)
})

test('형식이 틀리거나 리드 ID가 이상하면 null', () => {
  for (const bad of [undefined, null, 42, '', 'abc', 'a.b', 'x'.repeat(700), sign({ k: 'i', l: 'internal-team' }), sign({ k: 'i', l: '<script>' }), 'e30.AAAAAAAAAAAAAAAAAAAAAA']) {
    assert.equal(parseReportRef(bad), null, String(bad).slice(0, 30))
  }
})
