export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const API_KEY = process.env.TOUR_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: "TOUR_API_KEY 환경 변수가 설정되지 않았습니다." });
  }

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const eventStartDate = `${year}${month}${day}`;

  const serviceKey = encodeURIComponent(decodeURIComponent(API_KEY));
  const url = `https://apis.data.go.kr/B551011/KorService1/searchFestival1?serviceKey=${serviceKey}&numOfRows=30&pageNo=1&MobileOS=ETC&MobileApp=MoudaWonju&_type=json&arrange=A&areaCode=32&sigunguCode=13&eventStartDate=${eventStartDate}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API응답 에러: ${response.status}`);
    }
    const data = await response.json();
    const items = data.response?.body?.items?.item || [];

    const formattedData = items.map((item, index) => {
      return {
        id: item.contentid || index,
        title: item.title,
        category: item.cat3 === 'A02080100' ? '축제/영화제' : '팝업/행사',
        startDate: item.eventstartdate,
        endDate: item.eventenddate,
        lat: parseFloat(item.mapy) || 37.3422,
        lng: parseFloat(item.mapx) || 127.9201,
        address: item.addr1 || "강원특별자치도 원주시",
        image: item.firstimage || "https://placehold.co/400x200?text=Mouda+Wonju",
        transitInfo: "원주시내 버스 이용 (강원대 원주캠퍼스/시청/터미널 방향 버스 노선 탑승 후 하차)",
        parkingInfo: "행사장 내 임시 주차장 이용 가능 (혼잡 시 인근 공영주차장 이용 권장)"
      };
    });

    return res.status(200).json(formattedData);
  } catch (error) {
    console.error("Tour API Fetch Error:", error);
    const fallbackData = [
      {
        id: "fb1",
        title: "원주 옥상영화제 (예시)",
        category: "축제/영화제",
        startDate: `${year}${month}${String(parseInt(day)+3).padStart(2, '0')}`,
        endDate: `${year}${month}${String(parseInt(day)+5).padStart(2, '0')}`,
        lat: 37.3456,
        lng: 127.9351,
        address: "강원특별자치도 원주시 중앙동",
        image: "https://placehold.co/400x200?text=Wonju+Film+Festival",
        transitInfo: "시내버스 2, 31, 51번 탑승 후 '중앙시장' 정류장 하차 도보 3분",
        parkingInfo: "전통시장 주차타워 이용 (1시간 무료 제공)"
      },
      {
        id: "fb2",
        title: "원주 문화 팝업 스토어 (예시)",
        category: "팝업/행사",
        startDate: `${year}${month}${String(parseInt(day)+7).padStart(2, '0')}`,
        endDate: `${year}${month}${String(parseInt(day)+10).padStart(2, '0')}`,
        lat: 37.3512,
        lng: 127.9421,
        address: "강원특별자치도 원주시 자유시장 일원",
        image: "https://placehold.co/400x200?text=Wonju+Popup+Store",
        transitInfo: "시내버스 3, 4, 16번 이용 후 원주역/시목 정류장 하차",
        parkingInfo: "원주천 둔치 하천변 공영주차장(무료) 이용 후 도보 이동"
      }
    ];
    return res.status(200).json(fallbackData);
  }
}
