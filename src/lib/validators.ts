import { z } from "zod"

export const contactFormSchema = z.object({
  name: z.string().min(2, "이름을 입력해주세요"),
  phone: z.string().min(10, "올바른 전화번호를 입력해주세요"),
  hospital: z.string().min(2, "소속/직책을 입력해주세요"),
  email: z.string().email("올바른 이메일을 입력해주세요"),
  message: z.string().min(10, "도입 검토 내용을 10자 이상 입력해주세요"),
  hp: z.string().optional(), // honeypot field
})

export type ContactFormData = z.infer<typeof contactFormSchema>

export const diagnosisFormSchema = z.object({
  name: z.string().min(2, "담당자 성함을 입력해주세요"),
  phone: z.string().min(10, "올바른 전화번호를 입력해주세요"),
  email: z.string().email("올바른 이메일을 입력해주세요"),
  hospitalName: z.string().min(2, "병원명을 입력해주세요"),
  department: z.string().min(1, "진료과를 선택해주세요"),
  website: z.string().min(2, "홈페이지 주소를 입력해주세요 (없으면 '없음')"),
  japanExperience: z.string().min(1, "일본 진출 경험 여부를 선택해주세요"),
  topTreatment: z.string().min(2, "가장 키우고 싶은 진료를 입력해주세요"),
  monthlyForeignPatients: z.string().min(1, "현재 해외환자 월 내원 수를 입력해주세요"),
  score: z.number().optional(),
  tier: z.string().optional(),
  hp: z.string().optional(), // honeypot field
})

export type DiagnosisFormData = z.infer<typeof diagnosisFormSchema>

export const inquiryPageFormSchema = z.object({
  // 정성 질문
  targetCountries: z.array(z.string()).min(1, "해외 마케팅 희망 국가를 1개 이상 선택해주세요"),
  interests: z.array(z.string()).min(1, "관심 있는 서비스를 선택해주세요"),
  expectedRevenue: z.string().min(1, "목표 해외 환자 월 매출을 선택해주세요"),
  budget: z.string().min(1, "월 예산 범위를 입력해주세요"),
  businessIntro: z.string().min(10, "병원/사업 소개를 10자 이상 입력해주세요").max(800),
  challenges: z.string().min(10, "현재 겪고 있는 어려움을 10자 이상 입력해주세요").max(800),
  implementationTiming: z.string().min(1, "도입 희망 시기를 입력해주세요"),
  // 연락처
  hospitalName: z.string().min(2, "병원명/회사명을 입력해주세요"),
  name: z.string().min(2, "직책/성함을 입력해주세요"),
  region: z.string().min(1, "지역을 입력해주세요"),
  website: z.string().min(2, "홈페이지 주소를 입력해주세요 (없으면 '없음')"),
  phone: z.string().min(10, "올바른 전화번호를 입력해주세요"),
  email: z.string().email("올바른 이메일을 입력해주세요"),
  privacyConsent: z.literal(true, "개인정보 수집·이용에 동의해주세요"),
  hp: z.string().optional(), // honeypot field
  inflow: z.string().max(200).optional(), // 유입 경로(utm), 주소에서 자동으로 채움
})

export type InquiryPageFormData = z.infer<typeof inquiryPageFormSchema>
