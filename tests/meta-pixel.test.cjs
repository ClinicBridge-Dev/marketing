const { test } = require('node:test')
const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')

const code = ts.transpileModule(readFileSync('src/lib/metaPixel.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText

function fixture({ hostname = 'www.clinicbridge.co.kr', storage = new Map(), denied = false, disabled = false } = {}) {
  const scripts = []
  const window = { location: { hostname, pathname: '/inquiry', search: '?email=private@example.com' } }
  const context = {
    window, exports: {}, process: { env: { NEXT_PUBLIC_META_PIXEL_ENABLED: disabled ? 'false' : '' } },
    document: { createElement: () => ({}), head: { appendChild: (script) => scripts.push(script) } },
    sessionStorage: {
      getItem: (key) => { if (denied) throw Error('denied'); return storage.get(key) },
      setItem: (key, value) => { if (denied) throw Error('denied'); storage.set(key, value) },
    },
  }
  vm.runInNewContext(code, context)
  const events = () => (window.fbq?.queue || []).filter(([cmd]) => cmd === 'trackSingle' || cmd === 'trackSingleCustom')
  return { api: context.exports, window, scripts, events }
}

test('initializes once, queues before SDK load, deduplicates same route but tracks back navigation', () => {
  const f = fixture()
  f.api.trackMetaPageView('/inquiry')
  f.api.trackMetaPageView('/inquiry') // StrictMode/re-render/query-only change
  f.window.location.pathname = '/services'
  f.api.trackMetaPageView('/services')
  f.window.location.pathname = '/inquiry'
  f.api.trackMetaPageView('/inquiry')
  assert.equal(f.scripts.length, 1)
  assert.equal(f.scripts[0].async, true)
  assert.equal(f.window.fbq.queue.filter(([cmd]) => cmd === 'init').length, 1)
  assert.deepEqual(Array.from(f.window.fbq.queue[0]), ['set', 'autoConfig', false, '1979462026345832'])
  assert.equal(f.events().length, 3)
  assert.ok(f.events().every((event) => event[2] === 'PageView'))
})

test('never loads or emits on localhost, preview, campaign, or when disabled', () => {
  for (const opts of [{ hostname: 'localhost' }, { hostname: 'marketing-preview.vercel.app' }, { hostname: 'campaign.clinicbridge.co.kr' }, { disabled: true }]) {
    const f = fixture(opts)
    for (const name of ['trackMetaPageView', 'trackMetaConsultClick', 'trackMetaInquiryStart', 'trackMetaConsultationSubmit', 'trackMetaDiagnosisSubmit']) f.api[name]('/inquiry')
    assert.equal(f.scripts.length, 0)
    assert.equal(f.events().length, 0)
  }
})

test('first interaction emits once across reloads in the same session', () => {
  const storage = new Map()
  const first = fixture({ storage })
  first.api.trackMetaInquiryStart()
  first.api.trackMetaInquiryStart()
  assert.equal(first.events().length, 1)
  assert.equal(first.events()[0][2], 'InquiryStart')
  const reload = fixture({ storage })
  reload.api.trackMetaInquiryStart()
  assert.equal(reload.events().length, 0)
})

test('storage denial still allows one start and successful submissions', () => {
  const f = fixture({ denied: true })
  f.api.trackMetaInquiryStart()
  f.api.trackMetaInquiryStart()
  f.api.trackMetaConsultationSubmit()
  assert.equal(f.events().length, 2)
})

test('separate conversions, no Lead, no form values or query strings; two real submissions remain two', () => {
  const f = fixture()
  f.api.trackMetaConsultClick('header')
  f.api.trackMetaConsultationSubmit()
  f.api.trackMetaConsultationSubmit()
  f.api.trackMetaDiagnosisSubmit()
  assert.deepEqual(Array.from(f.events(), (e) => e[2]), ['ConsultClick', 'ConsultationSubmit', 'ConsultationSubmit', 'DiagnosisSubmit'])
  for (const event of f.events()) {
    assert.equal(event[0], 'trackSingleCustom')
    assert.equal(event[1], '1979462026345832')
    assert.equal(event[3].site_area, 'main')
    assert.equal(event[3].page_path, '/inquiry')
  }
  assert.ok(!JSON.stringify(f.events()).includes('private@example.com'))
})

test('direct completion visit only sends PageView; SDK errors never escape tracking helpers', () => {
  const f = fixture()
  f.window.location.pathname = '/inquiry/complete'
  f.api.trackMetaPageView('/inquiry/complete')
  assert.equal(f.events().length, 1)
  assert.equal(f.events()[0][2], 'PageView')
  f.window.fbq.callMethod = () => { throw Error('blocked SDK') }
  assert.doesNotThrow(() => {
    f.api.trackMetaPageView('/services')
    f.api.trackMetaConsultClick('header')
    f.api.trackMetaInquiryStart()
    f.api.trackMetaConsultationSubmit()
    f.api.trackMetaDiagnosisSubmit()
  })
})
