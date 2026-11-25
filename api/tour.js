// api/tour.js
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

  // API 키 안전 인코딩 처리
  const serviceKey = API_KEY.includes('%') ? API_KEY : encodeURIComponent(API_KEY);
  const url = `https://apis.data.go.kr/B551011/KorService1/searchFestival1?serviceKey=${serviceKey}&numOfRows=30&pageNo=1&MobileOS=ETC&MobileApp=MoudaWonju&_type=json&arrange=A&areaCode=32&sigunguCode=13&eventStartDate=${eventStartDate}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API 응답 에러: ${response.status}`);
    }
    const data = await response.json();
    const items = data.response?.body?.items?.item || [];

    // 배열 형태 유효성 검사 및 정제
    const itemList = Array.isArray(items) ? items : [items];

    const formattedData = itemList.map((item, index) => {
      const start = item.eventstartdate ? String(item.eventstartdate) : eventStartDate;
      const end = item.eventenddate ? String(item.eventenddate) : eventStartDate;
      
      return {
        id: String(item.contentid || index + 1),
        title: item.title || "원주 행사",
        category: item.cat3 === 'A02080100' ? '축제/영화제' : '팝업/행사',
        startDate: start,
        endDate: end,
        lat: parseFloat(item.mapy) || 37.3422,
        lng: parseFloat(item.mapx) || 127.9201,
        address: item.addr1 || "강원특별자치도 원주시",
        image: item.firstimage || "https://via.placeholder.com/400x200?text=모으다+원주",
        transitInfo: item.addr1 ? `${item.addr1} 인근 시내버스 노선 이용 후 하차` : "원주시내 버스 이용 (터미널/원주역/시청 방향 노선)",
        parkingInfo: "행사장 인근 공영주차장 또는 시내 주차 타워 이용 가능"
      };
    });

    return res.status(200).json(formattedData);
  } catch (error) {
    console.error("Tour API Fetch Error:", error);

    // API 장애 또는 키 미승인 시 작동하는 백업 데이터
    const fallbackData = [
      {
        id: "fb1",
        title: "원주 옥상영화제",
        category: "축제/영화제",
        startDate: `${year}${month}${day}`,
        endDate: `${year}${month}${String(parseInt(day) + 3).padStart(2, '0')}`,
        lat: 37.3456,
        lng: 127.9351,
        address: "강원특별자치도 원주시 중앙동",
        image: "https://via.placeholder.com/400x200?text=원주+옥상영화제",
        transitInfo: "시내버스 2, 31, 51번 탑승 후 '중앙시장' 정류장 하차 (도보 3분)",
        parkingInfo: "전통시장 주차타워 및 인근 공영주차장 이용"
      },
      {
        id: "fb2",
        title: "원주 문화 팝업 스토어",
        category: "팝업/행사",
        startDate: `${year}${month}${day}`,
        endDate: `${year}${month}${String(parseInt(day) + 7).padStart(2, '0')}`,
        lat: 37.3512,
        lng: 127.9421,
        address: "강원특별자치도 원주시 무실동",
        image: "https://via.placeholder.com/400x200?text=원주+소규모+팝업",
        transitInfo: "시내버스 51, 81, 90번 이용 후 '원주시청' 정류장 하차",
        parkingInfo: "원주시청 주차장 및 무실동 공영주차장 이용"
      }
    ];
    return res.status(200).json(fallbackData);
  }
}
