// Trello API 관련 타입 정의 및 서비스 함수

export interface TrelloCard {
  id: string
  name: string
  desc: string
  idList: string
  pos: number
  due?: string
  labels?: string[]
  urlSource?: string
}

export interface TrelloCardResponse {
  id: string
  name: string
  desc: string
  idList: string
  pos: number
  shortUrl: string
  url: string
  dateLastActivity: string
  idBoard: string
}

export interface TrelloError {
  message: string
  code?: string
}

export interface TrelloConfig {
  apiKey: string
  token: string
  boardId: string
  listId: string
}

export interface ContactFormData {
  name: string
  phone: string
  hospital: string
  email: string
  message: string
}

export interface TrelloCardInput {
  name: string
  description: string
}

/**
 * Trello API를 사용하여 카드를 생성하는 함수
 */
export async function createTrelloCard(
  config: TrelloConfig,
  card: TrelloCardInput
): Promise<TrelloCardResponse> {
  const { apiKey, token, listId } = config
  const cardName = card.name
  const cardDescription = card.description

  const url = `https://api.trello.com/1/cards`
  
  const params = new URLSearchParams({
    key: apiKey,
    token: token,
    idList: listId,
    name: cardName,
    desc: cardDescription,
    pos: 'top', // 리스트 상단에 추가
  })

  try {
    console.log('🚀 Trello API 요청:', {
      url: url,
      method: 'POST',
      idList: listId,
      name: cardName,
      desc: cardDescription.substring(0, 100) + '...',
      pos: 'top'
    })

    // OAuth 헤더 방식으로 인증
    const authHeader = `OAuth oauth_consumer_key="${apiKey}", oauth_token="${token}"`
    
    const response = await fetch(`${url}?${params}`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        `Trello API 오류: ${response.status} - ${errorData.message || response.statusText}`
      )
    }

    const cardData: TrelloCardResponse = await response.json()
    console.log(`✅ Trello 카드 생성 완료:`, {
      cardId: cardData.id,
      cardName: cardData.name,
      shortUrl: cardData.shortUrl,
      listId: cardData.idList
    })
    return cardData
  } catch (error) {
    console.error('Trello 카드 생성 실패:', error)
    throw error
  }
}

/**
 * Trello 설정을 환경변수에서 가져오는 함수
 */
export function getTrelloConfig(): TrelloConfig | null {
  const apiKey = process.env.TRELLO_API_KEY?.trim()
  const token = process.env.TRELLO_API_TOKEN?.trim()
  const boardId = process.env.TRELLO_BOARD_ID?.trim()
  const listId = process.env.TRELLO_LIST_ID?.trim()

  // 디버깅을 위한 로그
  console.log('🔍 Trello 환경변수 확인:', {
    apiKey: apiKey ? `${apiKey.substring(0, 8)}... (길이: ${apiKey.length})` : '❌ 없음',
    token: token ? `${token.substring(0, 8)}... (길이: ${token.length})` : '❌ 없음',
    boardId: boardId ? `${boardId.substring(0, 8)}... (길이: ${boardId.length})` : '❌ 없음',
    listId: listId ? `${listId.substring(0, 8)}... (길이: ${listId.length})` : '❌ 없음',
  })

  // API 키 형식 검증
  if (apiKey && !/^[a-f0-9]{32}$/.test(apiKey)) {
    console.error('❌ API 키 형식이 올바르지 않습니다. 32자리 영숫자여야 합니다.')
    console.error('❌ 현재 API 키:', apiKey)
    return null
  }

  // 토큰 형식 검증 (ATTA로 시작하는 새로운 형식)
  if (token && !/^ATTA[a-f0-9]{64}$/.test(token)) {
    console.error('❌ 토큰 형식이 올바르지 않습니다. ATTA로 시작하는 68자리여야 합니다.')
    console.error('❌ 현재 토큰:', token)
    return null
  }

  if (!apiKey || !token || !boardId || !listId) {
    console.warn('❌ Trello 환경변수가 설정되지 않았습니다.')
    return null
  }

  return {
    apiKey,
    token,
    boardId,
    listId,
  }
}

/**
 * Trello API 인증 테스트 함수
 */
export async function testTrelloAuth(config: TrelloConfig): Promise<boolean> {
  const { apiKey, token } = config
  
  const url = `https://api.trello.com/1/members/me`
  const params = new URLSearchParams({
    key: apiKey,
    token: token,
  })

  try {
    console.log('🧪 Trello API 인증 테스트 중...')
    
    // OAuth 헤더 방식으로 인증 시도 (새로운 토큰 형식)
    const authHeader = `OAuth oauth_consumer_key="${apiKey}", oauth_token="${token}"`
    
    console.log("🔍 인증 헤더:", authHeader.substring(0, 50) + "...")
    console.log("🚀 Trello API 요청 URL:", url)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    })
    
    console.log("📝 Trello API 응답:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('❌ Trello API 인증 실패:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        url: url,
        apiKey: `${apiKey.substring(0, 8)}...`,
        token: `${token.substring(0, 8)}...`,
        authHeader: authHeader.substring(0, 50) + '...'
      })
      return false
    }

    const userData = await response.json()
    console.log('✅ Trello API 인증 성공:', {
      username: userData.username,
      fullName: userData.fullName
    })
    return true
  } catch (error) {
    console.error('❌ Trello API 인증 테스트 실패:', error)
    return false
  }
}
