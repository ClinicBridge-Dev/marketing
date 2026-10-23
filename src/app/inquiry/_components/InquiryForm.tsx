"use client"

import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import toast from "react-hot-toast"
import { Button } from "@/components/common/Button"
import { cn } from "@/lib/utils"
import { inquiryPageFormSchema, type InquiryPageFormData } from "@/lib/validators"
import { trackConversion, trackLead } from "@/lib/gtag"
import { trackLeadCreated } from "@/lib/openaiPixel"
import { COUNTRY_OPTIONS, INTEREST_OPTIONS, PRICE_NOTE, REVENUE_OPTIONS } from "@/data/inquiryOptions"

// 유입 경로로 남길 주소 파라미터 (예: 웹 리포트의 무료 진단 버튼은 utm_medium=report)
const INFLOW_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_content"] as const

interface FieldLabelProps {
  htmlFor: string
  children: React.ReactNode
}

function FieldLabel({ htmlFor, children }: FieldLabelProps) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-semibold text-gray-900 mb-1.5">
      {children}
    </label>
  )
}

function ErrorText({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-sm text-red-600">{message}</p>
}

const inputClass =
  "w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"

interface InquiryFormProps {
  onSuccess: () => void
}

export function InquiryForm({ onSuccess }: InquiryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  // 버튼 비활성화(state)는 다음 렌더 후에 반영되므로, 빠른 연타로 같은 신청이 두 번 전송되지 않게 ref로 막는다.
  const submitLockRef = useRef(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
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

  const toggleInterest = (option: string) => {
    const next = selectedInterests.includes(option)
      ? selectedInterests.filter((i) => i !== option)
      : [...selectedInterests, option]
    setValue("interests", next, { shouldValidate: true })
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
      <input type="text" {...register("hp")} className="hidden" tabIndex={-1} autoComplete="off" />
      <input type="hidden" {...register("inflow")} />

      {/* 정성 질문 */}
      <section className="space-y-6">
        <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-3">
          귀사에 대해 알려주세요
        </h2>

        <div>
          <FieldLabel htmlFor="targetCountries">해외 마케팅 희망 국가 * (복수 선택 가능)</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {COUNTRY_OPTIONS.map((option) => {
              const active = selectedCountries.includes(option)
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggleCountry(option)}
                  className={cn(
                    "px-4 py-2 text-sm rounded-full border transition-colors",
                    active
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-gray-700 border-gray-300 hover:border-primary/50"
                  )}
                >
                  {option}
                </button>
              )
            })}
          </div>
          <ErrorText message={errors.targetCountries?.message} />
        </div>

        <div>
          <FieldLabel htmlFor="interests">관심 있는 서비스 * (복수 선택 가능)</FieldLabel>
          <div className="grid gap-2">
            {INTEREST_OPTIONS.map((option) => {
              const active = selectedInterests.includes(option.value)
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleInterest(option.value)}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-lg border transition-colors",
                    active ? "border-primary bg-primary/5" : "bg-white border-gray-300 hover:border-primary/50"
                  )}
                >
                  <span className="flex items-start justify-between gap-3">
                    <span className={cn("text-sm font-semibold", active ? "text-primary" : "text-gray-900")}>
                      {option.value}
                    </span>
                    <span
                      className={cn(
                        "mt-0.5 h-4 w-4 shrink-0 rounded border",
                        active ? "bg-primary border-primary" : "border-gray-300"
                      )}
                      aria-hidden
                    />
                  </span>
                  <span className="block text-sm text-gray-600 mt-1">{option.description}</span>
                  {option.price && <span className="block text-xs text-gray-500 mt-1">{option.price}</span>}
                </button>
              )
            })}
          </div>
          <p className="mt-1.5 text-xs text-gray-400">{PRICE_NOTE}</p>
          <ErrorText message={errors.interests?.message} />
        </div>

        <div>
          <FieldLabel htmlFor="expectedRevenue">목표 해외 환자 월 매출 *</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {REVENUE_OPTIONS.map((option) => {
              const active = selectedRevenue === option
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setValue("expectedRevenue", option, { shouldValidate: true })}
                  className={cn(
                    "px-4 py-2 text-sm rounded-full border transition-colors",
                    active
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-gray-700 border-gray-300 hover:border-primary/50"
                  )}
                >
                  {option}
                </button>
              )
            })}
          </div>
          <ErrorText message={errors.expectedRevenue?.message} />
        </div>

        <div>
          <FieldLabel htmlFor="budget">월 예산 범위 *</FieldLabel>
          <input
            id="budget"
            {...register("budget")}
            className={inputClass}
            placeholder="예: 월 500~1,000만원"
          />
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
          <div className="flex justify-end text-xs text-gray-400 mt-1">{businessIntro.length}/800</div>
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
          <div className="flex justify-end text-xs text-gray-400 mt-1">{challenges.length}/800</div>
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
      </section>

      {/* 연락처 */}
      <section className="space-y-6">
        <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-3">연락처</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel htmlFor="phone">연락처 *</FieldLabel>
            <input id="phone" type="tel" {...register("phone")} className={inputClass} placeholder="010-1234-5678" />
            <ErrorText message={errors.phone?.message} />
          </div>
          <div>
            <FieldLabel htmlFor="email">이메일 *</FieldLabel>
            <input id="email" type="email" {...register("email")} className={inputClass} placeholder="name@hospital.com" />
            <ErrorText message={errors.email?.message} />
          </div>
        </div>

        <div>
          <label className="flex items-start gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              {...register("privacyConsent")}
              className="mt-0.5 h-4 w-4 accent-primary"
            />
            <span>
              <Link href="/privacy" target="_blank" className="text-primary underline underline-offset-2">
                개인정보 수집·이용
              </Link>
              에 동의합니다 *
            </span>
          </label>
          <ErrorText message={errors.privacyConsent?.message} />
        </div>
      </section>

      <Button type="submit" disabled={isSubmitting} variant="gradient" size="lg" className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            전송 중...
          </>
        ) : (
          "상담 신청하기"
        )}
      </Button>
    </form>
  )
}
