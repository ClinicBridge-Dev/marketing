"use client"

import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { Check, Loader2 } from "lucide-react"
import toast from "react-hot-toast"
import { Button } from "@/components/common/Button"
import { cn } from "@/lib/utils"
import { inquiryPageFormSchema, type InquiryPageFormData } from "@/lib/validators"
import { trackConversion, trackLead } from "@/lib/gtag"
import { trackLeadCreated } from "@/lib/openaiPixel"
import {
  COUNTRY_OPTIONS,
  INTEREST_OPTIONS,
  PRICE_NOTE,
  REVENUE_OPTIONS,
  type InterestOption,
} from "@/data/inquiryOptions"

// 유입 경로로 남길 주소 파라미터 (예: 웹 리포트의 무료 진단 버튼은 utm_medium=report)
const INFLOW_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_content"] as const

// 3단계 폼. 부담이 적은 질문(관심 서비스)부터 묻고, 매출·예산과 연락처는 뒤로 둔다.
// 각 단계의 '다음'은 그 단계 항목만 검증한다.
const STEPS: { title: string; description: string; fields: (keyof InquiryPageFormData)[] }[] = [
  {
    title: "어떤 도움이 필요하신가요?",
    description: "관심 있는 서비스와 국가를 골라 주세요.",
    fields: ["interests", "targetCountries"],
  },
  {
    title: "병원 상황을 알려주세요",
    description: "첫 상담에서 바로 구체적인 이야기를 나눌 수 있도록 준비하는 데 씁니다.",
    fields: ["expectedRevenue", "budget", "businessIntro", "challenges", "implementationTiming"],
  },
  {
    title: "연락받으실 정보를 알려주세요",
    description: "전담 컨설턴트가 영업일 기준 1~2일 이내에 직접 연락드립니다.",
    fields: ["hospitalName", "name", "region", "website", "phone", "email", "privacyConsent"],
  },
]

interface FieldLabelProps {
  htmlFor: string
  children: React.ReactNode
  /** 제목 옆에 옅게 붙는 안내 (예: 복수 선택 가능) */
  hint?: string
}

function FieldLabel({ htmlFor, children, hint }: FieldLabelProps) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-sm font-semibold text-gray-900">
      {children}
      {hint && <span className="ml-1.5 text-xs font-normal text-gray-500">{hint}</span>}
    </label>
  )
}

function ErrorText({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1.5 text-sm text-red-600">{message}</p>
}

/** 복수 선택은 네모(체크), 하나만 고르는 선택은 동그라미로 구분한다 */
function CheckMark({ active, single = false }: { active: boolean; single?: boolean }) {
  return (
    <span
      className={cn(
        "flex h-5 w-5 shrink-0 items-center justify-center border transition-colors",
        single ? "rounded-full" : "rounded-md",
        active ? "border-primary bg-primary text-white" : "border-gray-300 bg-white"
      )}
      aria-hidden
    >
      {active && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
    </span>
  )
}

/** 국가·목표 매출처럼 짧은 선택지. 선택하면 체크 표시가 붙는다. */
function ChoiceChip({
  label,
  active,
  onClick,
  single = false,
}: {
  label: string
  active: boolean
  onClick: () => void
  single?: boolean
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "flex min-h-[44px] items-center gap-2 rounded-xl border px-4 text-sm transition-colors",
        active
          ? "border-primary bg-primary/5 font-semibold text-primary ring-1 ring-primary"
          : "border-gray-300 bg-white text-gray-700 hover:border-primary/50"
      )}
    >
      <CheckMark active={active} single={single} />
      {label}
    </button>
  )
}

/** 관심 서비스 카드(하나만 선택). 가격이 없는 선택지는 점선으로 상품과 구분한다. */
function ServiceCard({ option, active, onClick }: { option: InterestOption; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors sm:p-5",
        option.price ? "border-solid" : "border-dashed",
        active ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-gray-200 bg-white hover:border-primary/50"
      )}
    >
      <span className="mt-0.5">
        <CheckMark active={active} single />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-bold text-gray-900">{option.value}</span>
        <span className="mt-1 block text-sm leading-relaxed text-gray-600">{option.description}</span>
        {option.price && <span className="mt-2 block text-sm font-bold text-gray-900">{option.price}</span>}
      </span>
    </button>
  )
}

const inputClass =
  "w-full px-3.5 py-3 text-[15px] border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"

interface InquiryFormProps {
  onSuccess: () => void
}

export function InquiryForm({ onSuccess }: InquiryFormProps) {
  const [step, setStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  // 버튼 비활성화(state)는 다음 렌더 후에 반영되므로, 빠른 연타로 같은 신청이 두 번 전송되지 않게 ref로 막는다.
  const submitLockRef = useRef(false)
  const topRef = useRef<HTMLDivElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<InquiryPageFormData>({
    resolver: zodResolver(inquiryPageFormSchema),
    defaultValues: { targetCountries: [], interests: [] },
  })

  const businessIntro = watch("businessIntro") ?? ""
  const challenges = watch("challenges") ?? ""
  const selectedCountries = watch("targetCountries") ?? []
  const selectedInterests = watch("interests") ?? []
  const selectedRevenue = watch("expectedRevenue")

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const inflow = INFLOW_PARAMS.map((k) => params.get(k)).filter(Boolean).join(" / ")
    if (inflow) setValue("inflow", inflow.slice(0, 200))
  }, [setValue])

  const toggleCountry = (option: string) => {
    const next = selectedCountries.includes(option)
      ? selectedCountries.filter((i) => i !== option)
      : [...selectedCountries, option]
    setValue("targetCountries", next, { shouldValidate: true })
  }

  const goTo = (next: number) => {
    setStep(next)
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const handleNext = async () => {
    if (await trigger(STEPS[step].fields)) goTo(step + 1)
  }

  const onSubmit = async (data: InquiryPageFormData) => {
    if (data.hp) return // honeypot
    if (submitLockRef.current) return

    submitLockRef.current = true
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const result: { ok?: boolean; inquiryId?: string } | null = await response.json().catch(() => null)

      // 서버가 신청을 실제로 접수한 경우(ok + inquiryId)에만 성공 처리와 광고 전환을 보낸다.
      // 전환은 이 제출 핸들러에서만 보내므로 완료 페이지 새로고침·재렌더링으로 다시 집계되지 않는다.
      if (response.ok && result?.ok === true && typeof result.inquiryId === "string") {
        reset({ targetCountries: [], interests: [] })
        trackConversion()
        trackLead("inquiry")
        trackLeadCreated(result.inquiryId)
        onSuccess()
      } else {
        toast.error("전송 중 오류가 발생했습니다. 다시 시도해주세요.")
      }
    } catch (error) {
      console.error("Inquiry form submission error:", error)
      toast.error("전송 중 오류가 발생했습니다. 다시 시도해주세요.")
    } finally {
      submitLockRef.current = false
      setIsSubmitting(false)
    }
  }

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <input type="text" {...register("hp")} className="hidden" tabIndex={-1} autoComplete="off" />
      <input type="hidden" {...register("inflow")} />

      {/* 진행 표시 */}
      <div ref={topRef} className="scroll-mt-24">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-primary">
            {step + 1} / {STEPS.length}
          </span>
          <span className="text-gray-400">약 2분</span>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-1.5" aria-hidden>
          {STEPS.map((s, i) => (
            <span key={s.title} className={cn("h-1.5 rounded-full", i <= step ? "bg-primary" : "bg-gray-200")} />
          ))}
        </div>
        <h2 className="mt-6 text-xl font-bold text-gray-900 sm:text-2xl">{current.title}</h2>
        <p className="mt-1.5 text-sm text-gray-600">{current.description}</p>
      </div>

      <div className="mt-8 space-y-8">
        {step === 0 && (
          <>
            <div>
              <FieldLabel htmlFor="interests" hint={`하나만 선택 · ${PRICE_NOTE}`}>
                관심 있는 서비스 *
              </FieldLabel>
              <div className="grid gap-3" role="radiogroup">
                {INTEREST_OPTIONS.map((option) => (
                  <ServiceCard
                    key={option.value}
                    option={option}
                    active={selectedInterests[0] === option.value}
                    // 저장 형식(문자열 배열)은 그대로 두고 한 개만 담는다
                    onClick={() => setValue("interests", [option.value], { shouldValidate: true })}
                  />
                ))}
              </div>
              <ErrorText message={errors.interests?.message} />
            </div>

            <div>
              <FieldLabel htmlFor="targetCountries" hint="복수 선택 가능">
                해외 마케팅 희망 국가 *
              </FieldLabel>
              <div className="flex flex-wrap gap-2">
                {COUNTRY_OPTIONS.map((option) => (
                  <ChoiceChip
                    key={option}
                    label={option}
                    active={selectedCountries.includes(option)}
                    onClick={() => toggleCountry(option)}
                  />
                ))}
              </div>
              <ErrorText message={errors.targetCountries?.message} />
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div>
              <FieldLabel htmlFor="expectedRevenue">목표 해외 환자 월 매출 *</FieldLabel>
              <div className="grid gap-2 sm:grid-cols-3">
                {REVENUE_OPTIONS.map((option) => (
                  <ChoiceChip
                    key={option}
                    label={option}
                    active={selectedRevenue === option}
                    single
                    onClick={() => setValue("expectedRevenue", option, { shouldValidate: true })}
                  />
                ))}
              </div>
              <ErrorText message={errors.expectedRevenue?.message} />
            </div>

            <div>
              <FieldLabel htmlFor="budget">월 마케팅 예산 *</FieldLabel>
              <input id="budget" {...register("budget")} className={inputClass} placeholder="예: 월 500~1,000만원" />
              <ErrorText message={errors.budget?.message} />
            </div>

            <div>
              <FieldLabel htmlFor="businessIntro">병원/사업 소개 *</FieldLabel>
              <textarea
                id="businessIntro"
                {...register("businessIntro")}
                rows={4}
                maxLength={800}
                className={cn(inputClass, "resize-none")}
                placeholder="진료과, 병원 규모, 주요 시술/서비스 등을 자유롭게 적어주세요"
              />
              <div className="mt-1 flex justify-end text-xs text-gray-400">{businessIntro.length}/800</div>
              <ErrorText message={errors.businessIntro?.message} />
            </div>

            <div>
              <FieldLabel htmlFor="challenges">현재 겪고 있는 어려움 *</FieldLabel>
              <textarea
                id="challenges"
                {...register("challenges")}
                rows={4}
                maxLength={800}
                className={cn(inputClass, "resize-none")}
                placeholder="글로벌 환자 유치, 콘텐츠, 채널 운영 등에서 겪고 있는 어려움을 적어주세요"
              />
              <div className="mt-1 flex justify-end text-xs text-gray-400">{challenges.length}/800</div>
              <ErrorText message={errors.challenges?.message} />
            </div>

            <div>
              <FieldLabel htmlFor="implementationTiming">도입 희망 시기 *</FieldLabel>
              <input
                id="implementationTiming"
                {...register("implementationTiming")}
                className={inputClass}
                placeholder="예: 1개월 이내"
              />
              <ErrorText message={errors.implementationTiming?.message} />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <FieldLabel htmlFor="hospitalName">병원명/회사명 *</FieldLabel>
                <input id="hospitalName" {...register("hospitalName")} className={inputClass} placeholder="OO의원" />
                <ErrorText message={errors.hospitalName?.message} />
              </div>
              <div>
                <FieldLabel htmlFor="name">직책/성함 *</FieldLabel>
                <input id="name" {...register("name")} className={inputClass} placeholder="대표원장 홍길동" />
                <ErrorText message={errors.name?.message} />
              </div>
              <div>
                <FieldLabel htmlFor="region">지역 *</FieldLabel>
                <input id="region" {...register("region")} className={inputClass} placeholder="서울 강남구" />
                <ErrorText message={errors.region?.message} />
              </div>
              <div>
                <FieldLabel htmlFor="website">홈페이지 *</FieldLabel>
                <input
                  id="website"
                  {...register("website")}
                  className={inputClass}
                  placeholder="https:// 또는 '없음'"
                />
                <ErrorText message={errors.website?.message} />
              </div>
              <div>
                <FieldLabel htmlFor="phone">연락처 *</FieldLabel>
                <input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  {...register("phone")}
                  className={inputClass}
                  placeholder="010-1234-5678"
                />
                <ErrorText message={errors.phone?.message} />
              </div>
              <div>
                <FieldLabel htmlFor="email">이메일 *</FieldLabel>
                <input
                  id="email"
                  type="email"
                  inputMode="email"
                  {...register("email")}
                  className={inputClass}
                  placeholder="name@hospital.com"
                />
                <ErrorText message={errors.email?.message} />
              </div>
            </div>

            <div>
              <label className="flex cursor-pointer items-start gap-2 text-sm text-gray-600">
                <input type="checkbox" {...register("privacyConsent")} className="mt-0.5 h-4 w-4 accent-primary" />
                <span>
                  <Link href="/privacy" target="_blank" className="text-primary underline underline-offset-2">
                    개인정보 수집·이용
                  </Link>
                  에 동의합니다 *
                </span>
              </label>
              <ErrorText message={errors.privacyConsent?.message} />
            </div>
          </>
        )}
      </div>

      {/* 단계 이동 */}
      <div className="mt-10 flex gap-3">
        {step > 0 && (
          <button
            type="button"
            onClick={() => goTo(step - 1)}
            className="min-h-[52px] rounded-xl border border-gray-300 px-5 text-sm font-semibold text-gray-700 hover:border-gray-400"
          >
            이전
          </button>
        )}
        {isLast ? (
          <Button type="submit" disabled={isSubmitting} variant="gradient" size="lg" className="flex-1">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                전송 중...
              </>
            ) : (
              "상담 신청하기"
            )}
          </Button>
        ) : (
          <Button type="button" onClick={handleNext} variant="gradient" size="lg" className="flex-1">
            다음
          </Button>
        )}
      </div>
    </form>
  )
}
