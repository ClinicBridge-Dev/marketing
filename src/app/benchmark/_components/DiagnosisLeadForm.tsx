"use client"

import { useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import toast from "react-hot-toast"
import { Button } from "@/components/common/Button"
import { diagnosisFormSchema, type DiagnosisFormData } from "@/lib/validators"
import { trackConversion } from "@/lib/gtag"
import { trackMetaDiagnosisSubmit } from "@/lib/metaPixel"

const DEPARTMENTS = ["피부과", "성형외과", "치과", "한의원", "기타"]
const JAPAN_EXPERIENCE_OPTIONS = ["처음 진출", "검토 중", "이미 진출해 있음"]

interface DiagnosisLeadFormProps {
  score: number
  tier: string
}

export function DiagnosisLeadForm({ score, tier }: DiagnosisLeadFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const submitLockRef = useRef(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DiagnosisFormData>({
    resolver: zodResolver(diagnosisFormSchema),
  })

  const onSubmit = async (data: DiagnosisFormData) => {
    if (data.hp) return // honeypot
    if (submitLockRef.current) return

    submitLockRef.current = true
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/diagnosis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, score, tier }),
      })

      const result: { ok?: boolean } | null = await response.json().catch(() => null)
      if (response.ok && result?.ok === true) {
        trackMetaDiagnosisSubmit()
        reset()
        trackConversion()
        setIsSubmitted(true)
        toast.success("진단 신청이 정상적으로 접수되었습니다.")
      } else {
        toast.error("전송 중 오류가 발생했습니다. 다시 시도해주세요.")
      }
    } catch (error) {
      console.error("Diagnosis form submission error:", error)
      toast.error("전송 중 오류가 발생했습니다. 다시 시도해주세요.")
    } finally {
      submitLockRef.current = false
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="p-8 rounded-2xl bg-white text-center">
        <p className="text-xl font-bold text-gray-900 mb-2">신청이 접수되었습니다</p>
        <p className="text-gray-600" style={{ wordBreak: "keep-all" }}>
          영업일 기준 1~2일 내로 담당 컨설턴트가 연락드리겠습니다.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-8 rounded-2xl bg-white space-y-5 text-left">
      <input type="text" {...register("hp")} className="hidden" tabIndex={-1} autoComplete="off" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold text-gray-900 mb-1 block">담당자 성함</label>
          <input
            {...register("name")}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C1452D]/30"
            placeholder="홍길동"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-900 mb-1 block">연락처</label>
          <input
            {...register("phone")}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C1452D]/30"
            placeholder="010-1234-5678"
          />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-gray-900 mb-1 block">이메일</label>
        <input
          {...register("email")}
          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C1452D]/30"
          placeholder="name@hospital.com"
        />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold text-gray-900 mb-1 block">병원명</label>
          <input
            {...register("hospitalName")}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C1452D]/30"
            placeholder="OO의원"
          />
          {errors.hospitalName && <p className="text-red-500 text-xs mt-1">{errors.hospitalName.message}</p>}
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-900 mb-1 block">진료과</label>
          <select
            {...register("department")}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C1452D]/30 bg-white"
            defaultValue=""
          >
            <option value="" disabled>
              선택해주세요
            </option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department.message}</p>}
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-gray-900 mb-1 block">홈페이지</label>
        <input
          {...register("website")}
          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C1452D]/30"
          placeholder="https:// 또는 '없음'"
        />
        {errors.website && <p className="text-red-500 text-xs mt-1">{errors.website.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold text-gray-900 mb-1 block">일본 진출 경험</label>
          <select
            {...register("japanExperience")}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C1452D]/30 bg-white"
            defaultValue=""
          >
            <option value="" disabled>
              선택해주세요
            </option>
            {JAPAN_EXPERIENCE_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          {errors.japanExperience && <p className="text-red-500 text-xs mt-1">{errors.japanExperience.message}</p>}
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-900 mb-1 block">현재 해외환자 월 내원 수</label>
          <input
            {...register("monthlyForeignPatients")}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C1452D]/30"
            placeholder="예: 5명, 없음"
          />
          {errors.monthlyForeignPatients && (
            <p className="text-red-500 text-xs mt-1">{errors.monthlyForeignPatients.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-gray-900 mb-1 block">가장 키우고 싶은 진료</label>
        <input
          {...register("topTreatment")}
          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C1452D]/30"
          placeholder="예: 리쥬란, 임플란트 등"
        />
        {errors.topTreatment && <p className="text-red-500 text-xs mt-1">{errors.topTreatment.message}</p>}
      </div>

      <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 전송 중...
          </>
        ) : (
          "우리 병원 일본 진출 가능성 무료 진단 신청 →"
        )}
      </Button>
    </form>
  )
}
