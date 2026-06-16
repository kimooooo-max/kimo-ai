// 자취 저녁 룰렛 - 자취생 저녁 한 끼 랜덤 추천기
// 메뉴 데이터: 1인분 기준으로 현실적으로 해먹을 수 있는 저녁 메뉴 모음
const MENUS = [
  // 밥 · 한그릇
  { name: "김치볶음밥", emoji: "🍳", cat: "bap", level: 1, time: 15, ing: ["밥", "익은 김치", "계란", "대파", "참기름"], tip: "김치를 기름에 먼저 달달 볶아 신맛을 날린 뒤 밥을 넣으면 훨씬 깊은 맛이 나요." },
  { name: "계란볶음밥", emoji: "🍚", cat: "bap", level: 1, time: 10, ing: ["밥", "계란", "대파", "간장", "굴소스"], tip: "센 불에 파기름부터 내고 밥을 넣으면 고슬고슬 중국집 스타일이 돼요." },
  { name: "참치마요덮밥", emoji: "🐟", cat: "bap", level: 1, time: 8, ing: ["밥", "참치캔", "마요네즈", "간장", "김가루"], tip: "참치 기름은 살짝만 빼고 마요와 간장 조금이면 끝. 계란프라이를 얹으면 완벽해요." },
  { name: "스팸마요덮밥", emoji: "🥫", cat: "bap", level: 1, time: 12, ing: ["밥", "스팸", "계란", "마요네즈", "김가루"], tip: "스팸은 키친타올로 기름을 한 번 닦고 구우면 덜 짜고 더 고소해요." },
  { name: "제육덮밥", emoji: "🌶️", cat: "bap", level: 2, time: 20, ing: ["밥", "앞다리살", "고추장", "양파", "대파"], tip: "고기에 양념을 20분만 미리 재워두면 맛이 확 배어요." },
  { name: "카레라이스", emoji: "🍛", cat: "bap", level: 1, time: 25, ing: ["밥", "고형카레", "감자", "당근", "양파"], tip: "고형카레 2조각이면 1~2인분. 우유 한 스푼 넣으면 부드러워져요." },
  { name: "오므라이스", emoji: "🍳", cat: "bap", level: 2, time: 20, ing: ["밥", "계란", "케첩", "양파", "햄"], tip: "밥은 케첩에 미리 볶고, 계란은 반숙으로 덮으면 보들보들해요." },
  { name: "비빔밥", emoji: "🥗", cat: "bap", level: 1, time: 12, ing: ["밥", "계란프라이", "애호박", "당근", "고추장"], tip: "냉장고 자투리 채소 다 넣고 참기름·고추장이면 실패가 없어요." },
  { name: "새우볶음밥", emoji: "🍤", cat: "bap", level: 1, time: 15, ing: ["밥", "냉동새우", "계란", "대파", "굴소스"], tip: "냉동새우는 찬물에 5분 담가 해동하고 물기를 꼭 빼세요." },
  { name: "소고기덮밥", emoji: "🥩", cat: "bap", level: 2, time: 20, ing: ["밥", "소불고기감", "양파", "간장", "설탕"], tip: "양파를 푹 익혀 단맛을 끌어내면 일본식 규동 맛이 나요." },
  { name: "마파두부덮밥", emoji: "🌶️", cat: "bap", level: 2, time: 20, ing: ["밥", "두부", "다진 돼지고기", "두반장", "대파"], tip: "두부는 끓는 소금물에 살짝 데치면 안 부서지고 간도 잘 배요." },
  { name: "김치알밥", emoji: "🍳", cat: "bap", level: 1, time: 12, ing: ["밥", "김치", "날치알", "계란", "김가루"], tip: "뚝배기에 참기름 두르고 누룽지처럼 살짝 태우면 더 맛있어요." },
  { name: "오징어덮밥", emoji: "🦑", cat: "bap", level: 2, time: 20, ing: ["밥", "오징어", "양파", "고추장", "대파"], tip: "해물은 센 불에 빠르게 볶아야 질겨지지 않아요." },
  { name: "닭갈비볶음밥", emoji: "🍗", cat: "bap", level: 2, time: 25, ing: ["밥", "닭다리살", "고추장", "양배추", "깻잎"], tip: "닭갈비 먹고 남은 양념에 밥을 볶으면 그게 진짜 별미죠." },
  { name: "콩나물밥", emoji: "🌱", cat: "bap", level: 2, time: 25, ing: ["쌀", "콩나물", "양념간장", "대파", "참기름"], tip: "밥물을 평소보다 적게 잡아야 질지 않아요. 양념간장에 쓱쓱 비벼 드세요." },

  // 면
  { name: "라면", emoji: "🍜", cat: "noodle", level: 1, time: 7, ing: ["라면", "계란", "대파"], tip: "물 550ml에 스프를 먼저 풀고, 끓으면 면을 넣으세요. 계란은 마지막 30초에." },
  { name: "짜파게티", emoji: "🍝", cat: "noodle", level: 1, time: 10, ing: ["짜파게티", "계란프라이", "냉동채소"], tip: "면수를 8숟갈만 남기고 버려야 꼬들꼬들하게 비벼져요." },
  { name: "콩나물 해장라면", emoji: "🌶️", cat: "noodle", level: 1, time: 8, ing: ["라면", "콩나물", "청양고추", "계란", "대파"], tip: "콩나물 한 줌이면 국물이 시원해져요. 뚜껑 덮고 끝까지 안 열기." },
  { name: "비빔면", emoji: "🌶️", cat: "noodle", level: 1, time: 8, ing: ["비빔면", "오이", "계란", "김가루"], tip: "면을 찬물에 여러 번 헹궈 전분기를 빼야 쫄깃해요." },
  { name: "잔치국수", emoji: "🍜", cat: "noodle", level: 1, time: 15, ing: ["소면", "멸치다시팩", "애호박", "계란지단", "김가루"], tip: "국물은 멸치·다시마로 5분이면 충분. 소면은 따로 삶아 찬물에 헹구세요." },
  { name: "비빔국수", emoji: "🌶️", cat: "noodle", level: 1, time: 12, ing: ["소면", "고추장", "오이", "설탕", "식초"], tip: "고추장·고춧가루·설탕·식초를 비슷한 비율로 하면 새콤달콤해요." },
  { name: "토마토 파스타", emoji: "🍅", cat: "noodle", level: 2, time: 20, ing: ["스파게티면", "토마토소스", "마늘", "양파"], tip: "면수 한 국자를 소스에 넣으면 소스가 면에 착 붙어요." },
  { name: "알리오올리오", emoji: "🧄", cat: "noodle", level: 2, time: 18, ing: ["스파게티면", "마늘", "올리브유", "페페론치노"], tip: "마늘은 약한 불에서 천천히 익혀 향을 기름에 충분히 우려내세요." },
  { name: "크림 파스타", emoji: "🥛", cat: "noodle", level: 2, time: 20, ing: ["스파게티면", "생크림", "베이컨", "마늘"], tip: "우유보다 생크림이 안 분리돼요. 슬라이스 치즈 한 장 녹이면 더 진해요." },
  { name: "로제 파스타", emoji: "🌸", cat: "noodle", level: 2, time: 22, ing: ["스파게티면", "토마토소스", "생크림", "베이컨"], tip: "토마토소스와 크림을 2:1로 섞으면 분홍빛 로제가 완성돼요." },
  { name: "볶음우동", emoji: "🍳", cat: "noodle", level: 1, time: 15, ing: ["우동면", "양배추", "어묵", "간장", "굴소스"], tip: "우동면은 끓는 물에 30초만 풀어 바로 볶아야 안 불어요." },
  { name: "가락우동", emoji: "🍲", cat: "noodle", level: 1, time: 12, ing: ["우동면", "쯔유", "어묵", "대파"], tip: "쯔유 1 : 물 7 비율이면 간이 딱 맞아요." },
  { name: "김치말이국수", emoji: "❄️", cat: "noodle", level: 1, time: 12, ing: ["소면", "김치국물", "김치", "오이", "얼음"], tip: "김치국물에 물·설탕 약간, 얼음 동동. 여름 저녁에 최고예요." },
  { name: "떡라면", emoji: "🍜", cat: "noodle", level: 1, time: 10, ing: ["라면", "떡국떡", "계란", "대파"], tip: "떡은 미리 물에 불려두면 라면과 같이 익어요." },
  { name: "메밀소바", emoji: "🍱", cat: "noodle", level: 1, time: 12, ing: ["메밀면", "쯔유", "무", "김가루"], tip: "면을 찬물에 바짝 헹궈 차갑게, 무는 갈아서 쯔유에 풀어요." },
  { name: "해물 토마토 파스타", emoji: "🦐", cat: "noodle", level: 3, time: 30, ing: ["스파게티면", "냉동해물", "토마토소스", "마늘", "올리브유"], tip: "해물은 따로 볶아 빼두었다가 마지막에 합쳐야 안 질겨요." },

  // 국물 · 찌개
  { name: "김치찌개", emoji: "🍲", cat: "soup", level: 2, time: 25, ing: ["신김치", "돼지고기", "두부", "대파"], tip: "고기를 먼저 볶다가 김치를 넣어 같이 볶은 뒤 물을 부어야 깊은 맛이 나요." },
  { name: "된장찌개", emoji: "🍲", cat: "soup", level: 1, time: 20, ing: ["된장", "두부", "애호박", "양파", "청양고추"], tip: "된장은 끓기 직전에 풀어야 구수한 향이 안 날아가요." },
  { name: "순두부찌개", emoji: "🌶️", cat: "soup", level: 2, time: 18, ing: ["순두부", "계란", "고춧가루", "바지락", "대파"], tip: "기름에 고춧가루를 살짝 볶아 고추기름을 내면 색과 맛이 확 살아요." },
  { name: "부대찌개", emoji: "🍲", cat: "soup", level: 2, time: 25, ing: ["스팸", "소시지", "라면사리", "김치", "베이크드빈"], tip: "베이크드빈 한 스푼이 들어가야 그 분식집 부대찌개 맛이 나요." },
  { name: "참치김치찌개", emoji: "🐟", cat: "soup", level: 1, time: 20, ing: ["신김치", "참치캔", "두부", "대파"], tip: "고기 대신 참치캔이면 5분 더 빨라요. 참치는 마지막에 넣으세요." },
  { name: "미역국", emoji: "🍲", cat: "soup", level: 1, time: 25, ing: ["건미역", "소고기", "국간장", "참기름"], tip: "불린 미역을 참기름에 충분히 볶아야 뽀얗고 진한 국물이 나와요." },
  { name: "계란국", emoji: "🥚", cat: "soup", level: 1, time: 10, ing: ["계란", "대파", "국간장", "다진마늘"], tip: "끓는 국물에 계란을 천천히 돌려 부으면 몽글몽글 예쁘게 익어요." },
  { name: "콩나물국", emoji: "🌱", cat: "soup", level: 1, time: 15, ing: ["콩나물", "대파", "국간장", "다진마늘"], tip: "뚜껑은 처음부터 끝까지 열거나 닫거나 하나로. 중간에 열면 비려요." },
  { name: "어묵탕", emoji: "🍢", cat: "soup", level: 1, time: 20, ing: ["어묵", "무", "대파", "멸치육수"], tip: "무를 먼저 푹 끓여 단맛을 우려낸 뒤 어묵을 넣으세요." },
  { name: "떡국", emoji: "🥟", cat: "soup", level: 1, time: 20, ing: ["떡국떡", "계란", "김", "멸치육수"], tip: "떡은 찬물에 잠깐 불려 넣으면 더 빨리 부드럽게 익어요." },
  { name: "만둣국", emoji: "🥟", cat: "soup", level: 1, time: 15, ing: ["냉동만두", "계란", "대파", "멸치육수"], tip: "냉동만두는 해동 없이 바로. 계란 풀어 마무리하면 든든해요." },
  { name: "북엇국", emoji: "🐟", cat: "soup", level: 1, time: 20, ing: ["북어채", "계란", "무", "참기름"], tip: "북어채를 참기름에 달달 볶다가 물을 부으면 뽀얀 국물이 우러나요." },
  { name: "육개장", emoji: "🌶️", cat: "soup", level: 3, time: 50, ing: ["양지", "고사리", "숙주", "대파", "고춧가루"], tip: "대파를 듬뿍, 고기는 결대로 찢어 넣어야 제대로 된 육개장이에요." },

  // 간단 · 한 접시
  { name: "계란말이", emoji: "🍳", cat: "side", level: 1, time: 12, ing: ["계란", "대파", "당근", "맛소금"], tip: "약불에서 천천히, 반쯤 익었을 때 돌돌 말면 안 터져요." },
  { name: "계란찜", emoji: "🥚", cat: "side", level: 1, time: 15, ing: ["계란", "새우젓", "대파", "물"], tip: "계란과 물을 1:1로, 한 번 체에 내리면 푸딩처럼 부드러워요." },
  { name: "두부김치", emoji: "🍲", cat: "side", level: 1, time: 15, ing: ["두부", "김치", "돼지고기", "대파"], tip: "두부는 데치거나 굽고, 김치는 설탕 약간 넣고 볶으면 궁합 최고." },
  { name: "김치전", emoji: "🥞", cat: "side", level: 1, time: 15, ing: ["김치", "부침가루", "물", "청양고추"], tip: "반죽은 약간 되직하게, 기름 넉넉히 둘러 바삭하게 부치세요." },
  { name: "떡볶이", emoji: "🌶️", cat: "side", level: 1, time: 15, ing: ["떡볶이떡", "고추장", "어묵", "대파", "설탕"], tip: "물에 고추장·고춧가루·설탕을 풀고 떡을 넣어 졸이면 끝." },
  { name: "라볶이", emoji: "🍜", cat: "side", level: 1, time: 18, ing: ["떡볶이떡", "라면", "어묵", "고추장"], tip: "라면 스프는 반만 넣어야 안 짜고 떡볶이 맛이 살아요." },
  { name: "스팸구이와 계란", emoji: "🥫", cat: "side", level: 1, time: 8, ing: ["스팸", "계란", "김치", "밥"], tip: "바쁜 날 최고의 한 끼. 스팸은 얇게 썰어 노릇하게 구우세요." },
  { name: "어묵볶음", emoji: "🍢", cat: "side", level: 1, time: 12, ing: ["어묵", "간장", "설탕", "대파"], tip: "간장·설탕·물엿을 조금 넣고 졸이면 반찬으로 며칠 가요." },
  { name: "소시지야채볶음", emoji: "🌭", cat: "side", level: 1, time: 12, ing: ["소시지", "양파", "피망", "케첩"], tip: "소시지에 칼집을 내면 양념도 잘 배고 모양도 예뻐요." },
  { name: "감자채볶음", emoji: "🥔", cat: "side", level: 1, time: 15, ing: ["감자", "당근", "소금", "식용유"], tip: "채 썬 감자를 찬물에 헹궈 전분을 빼면 안 들러붙어요." },
  { name: "김밥", emoji: "🍙", cat: "side", level: 2, time: 25, ing: ["밥", "단무지", "계란", "햄", "시금치"], tip: "밥에 참기름·소금으로 밑간하고 꾹꾹 눌러 말면 안 터져요." },
  { name: "길거리 토스트", emoji: "🍞", cat: "side", level: 1, time: 12, ing: ["식빵", "계란", "양배추", "설탕", "케첩"], tip: "양배추 계란전을 부쳐 끼우고 설탕 솔솔, 케첩으로 마무리." },
  { name: "케사디아", emoji: "🫓", cat: "side", level: 1, time: 15, ing: ["또띠아", "슬라이스 치즈", "햄", "피자소스"], tip: "약불에 눌러 구워야 치즈가 녹고 또띠아가 바삭해져요." },
  { name: "군만두", emoji: "🥟", cat: "side", level: 1, time: 10, ing: ["냉동만두", "식용유", "간장", "식초"], tip: "기름 두르고 물 두 스푼 넣어 뚜껑 덮으면 겉바속촉." },
  { name: "두부조림", emoji: "🟫", cat: "side", level: 1, time: 20, ing: ["두부", "간장", "고춧가루", "대파"], tip: "두부를 노릇하게 구운 뒤 양념을 끼얹어 졸이면 간이 잘 배요." },
  { name: "애호박전", emoji: "🥞", cat: "side", level: 1, time: 15, ing: ["애호박", "부침가루", "계란", "식용유"], tip: "애호박은 0.5cm로 썰어 소금에 살짝 절였다 부치면 더 달아요." },

  // 든든하게
  { name: "제육볶음", emoji: "🌶️", cat: "hearty", level: 2, time: 25, ing: ["앞다리살", "고추장", "양파", "대파", "마늘"], tip: "센 불에서 빠르게 볶아야 고기가 안 질기고 불맛이 나요." },
  { name: "닭갈비", emoji: "🍗", cat: "hearty", level: 2, time: 30, ing: ["닭다리살", "고추장", "양배추", "고구마", "떡"], tip: "양념에 30분 재운 닭이 훨씬 맛있어요. 마지막에 치즈 추가!" },
  { name: "닭볶음탕", emoji: "🍗", cat: "hearty", level: 3, time: 40, ing: ["닭", "감자", "당근", "고추장", "간장"], tip: "닭은 끓는 물에 한 번 데쳐 기름과 잡내를 빼면 국물이 깔끔해요." },
  { name: "돈까스", emoji: "🍖", cat: "hearty", level: 3, time: 30, ing: ["돼지등심", "빵가루", "계란", "밀가루"], tip: "밀가루→계란→빵가루 순서. 기름은 빵가루가 바로 떠오르는 170도에서." },
  { name: "함박스테이크", emoji: "🍴", cat: "hearty", level: 3, time: 30, ing: ["다진고기", "양파", "빵가루", "계란", "데미소스"], tip: "반죽을 충분히 치대 공기를 빼야 구울 때 안 갈라져요." },
  { name: "닭가슴살 스테이크", emoji: "🥗", cat: "hearty", level: 1, time: 20, ing: ["닭가슴살", "양상추", "방울토마토", "발사믹"], tip: "닭가슴살에 칼집을 내고 구우면 속까지 빨리 익고 부드러워요." },
  { name: "고등어구이", emoji: "🐟", cat: "hearty", level: 1, time: 15, ing: ["고등어", "소금", "식용유", "레몬"], tip: "껍질 쪽부터 노릇하게, 뒤집은 뒤엔 불을 줄여 속까지 익혀요." },
  { name: "삼겹살구이", emoji: "🥓", cat: "hearty", level: 1, time: 15, ing: ["삼겹살", "쌈장", "상추", "마늘"], tip: "노릇하게 구운 뒤 키친타올로 기름을 한 번 빼면 더 담백해요." },
  { name: "소불고기", emoji: "🥩", cat: "hearty", level: 2, time: 25, ing: ["소불고기감", "간장", "배", "양파", "당근"], tip: "간 배나 사과를 넣으면 고기가 연해지고 단맛이 자연스러워요." },
  { name: "잡채", emoji: "🥢", cat: "hearty", level: 3, time: 35, ing: ["당면", "시금치", "당근", "양파", "간장"], tip: "당면은 삶아 바로 양념에 무쳐야 불지 않아요. 채소는 따로 볶기." },
  { name: "코다리조림", emoji: "🐟", cat: "hearty", level: 2, time: 30, ing: ["코다리", "무", "고춧가루", "간장", "대파"], tip: "무를 바닥에 깔고 그 위에 코다리를 올려 졸이면 비리지 않아요." },
  { name: "닭다리 오븐구이", emoji: "🍗", cat: "hearty", level: 2, time: 35, ing: ["닭다리", "소금", "후추", "올리브유", "로즈마리"], tip: "에어프라이어 200도 25분이면 겉바속촉. 중간에 한 번 뒤집기." },
];

const CAT = {
  all: "전체",
  bap: "밥·한그릇",
  noodle: "면",
  soup: "국물·찌개",
  side: "간단·한 접시",
  hearty: "든든하게",
};
const CAT_ORDER = ["all", "bap", "noodle", "soup", "side", "hearty"];

const LEVELS = [
  { v: 0, label: "전체" },
  { v: 1, label: "⚡ 초간단" },
  { v: 2, label: "🍳 보통" },
  { v: 3, label: "🔥 제대로" },
];
const LEVEL_TAG = { 1: "초간단", 2: "보통", 3: "제대로" };

const FAV_KEY = "dinner-roulette-favorites-v1";

const qs = (sel) => document.querySelector(sel);
const el = {
  catChips: qs("#catChips"),
  levelChips: qs("#levelChips"),
  card: qs("#resultCard"),
  emoji: qs("#resultEmoji"),
  name: qs("#resultName"),
  tags: qs("#resultTags"),
  ing: qs("#resultIng"),
  tip: qs("#resultTip"),
  actions: qs("#resultActions"),
  favBtn: qs("#favBtn"),
  ytLink: qs("#ytLink"),
  recipeLink: qs("#recipeLink"),
  roll: qs("#rollBtn"),
  count: qs("#count"),
  favs: qs("#favs"),
  favList: qs("#favList"),
};

const state = {
  cat: "all",
  level: 0,
  recent: [],
  current: null,
  rolling: false,
};
let favorites = loadFavs();
let rollTimer = null;

init();

function init() {
  renderChips(el.catChips, CAT_ORDER.map((k) => ({ v: k, label: CAT[k] })), "cat");
  renderChips(el.levelChips, LEVELS, "level");
  renderFavs();
  updateCount();
  el.roll.addEventListener("click", roll);
  el.favBtn.addEventListener("click", toggleCurrentFav);
}

function loadFavs() {
  try {
    return JSON.parse(localStorage.getItem(FAV_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveFavs() {
  try {
    localStorage.setItem(FAV_KEY, JSON.stringify(favorites));
  } catch (e) {
    /* localStorage 사용 불가 시 무시 */
  }
}

function renderChips(container, items, key) {
  container.innerHTML = "";
  items.forEach((item) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip" + (state[key] === item.v ? " active" : "");
    btn.textContent = item.label;
    btn.addEventListener("click", () => {
      state[key] = item.v;
      renderChips(container, items, key);
      updateCount();
    });
    container.appendChild(btn);
  });
}

function pool() {
  return MENUS.filter(
    (m) =>
      (state.cat === "all" || m.cat === state.cat) &&
      (state.level === 0 || m.level === state.level),
  );
}

function updateCount() {
  const n = pool().length;
  if (n === 0) {
    el.count.textContent = "이 조건엔 만들 게 없어요 😅 필터를 살짝 풀어보세요.";
    el.count.classList.add("empty");
    el.roll.disabled = true;
  } else {
    el.count.textContent = `이 조건에서 고를 수 있는 메뉴 ${n}개`;
    el.count.classList.remove("empty");
    el.roll.disabled = false;
  }
}

function pickRandom(list) {
  const avoidCount = Math.min(state.recent.length, Math.max(0, list.length - 1), 4);
  const avoid = new Set(state.recent.slice(-avoidCount));
  let candidates = list.filter((m) => !avoid.has(m.name));
  if (!candidates.length) candidates = list;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function roll() {
  if (state.rolling) return;
  const list = pool();
  if (!list.length) return;

  const pick = pickRandom(list);
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduce || list.length === 1) {
    settle(pick);
    return;
  }

  state.rolling = true;
  el.roll.disabled = true;
  el.card.classList.remove("pop");
  el.card.classList.add("teasing");
  hideDetails();

  let elapsed = 0;
  let delay = 55;
  const tick = () => {
    const teaser = list[Math.floor(Math.random() * list.length)];
    el.emoji.textContent = teaser.emoji;
    el.name.textContent = teaser.name;
    elapsed += delay;
    delay += 7;
    if (elapsed < 760) {
      rollTimer = setTimeout(tick, delay);
    } else {
      settle(pick);
    }
  };
  tick();
}

function settle(menu) {
  clearTimeout(rollTimer);
  state.rolling = false;
  el.roll.disabled = false;
  el.card.classList.remove("teasing");
  showMenu(menu);
  el.card.classList.remove("pop");
  void el.card.offsetWidth; // 애니메이션 재시작
  el.card.classList.add("pop");
  el.roll.textContent = "🎲 다른 거 추천!";
  recordRecent(menu.name);
}

function recordRecent(name) {
  state.recent.push(name);
  if (state.recent.length > 8) state.recent.shift();
}

function hideDetails() {
  el.tags.innerHTML = "";
  el.ing.innerHTML = "";
  el.tip.hidden = true;
  el.actions.hidden = true;
}

function showMenu(menu) {
  state.current = menu;
  el.emoji.textContent = menu.emoji;
  el.name.textContent = menu.name;

  el.tags.innerHTML = "";
  addTag(CAT[menu.cat], "cat");
  addTag(`⏱ 약 ${menu.time}분`, "time");
  addTag(LEVEL_TAG[menu.level], "level" + menu.level);

  el.ing.innerHTML = "";
  menu.ing.forEach((name) => {
    const span = document.createElement("span");
    span.className = "ing";
    span.textContent = name;
    el.ing.appendChild(span);
  });

  if (menu.tip) {
    el.tip.textContent = "💡 " + menu.tip;
    el.tip.hidden = false;
  } else {
    el.tip.hidden = true;
  }

  el.ytLink.href =
    "https://www.youtube.com/results?search_query=" +
    encodeURIComponent(menu.name + " 레시피");
  el.recipeLink.href =
    "https://www.10000recipe.com/recipe/list.html?q=" + encodeURIComponent(menu.name);
  el.actions.hidden = false;
  updateFavBtn();
}

function addTag(text, cls) {
  const span = document.createElement("span");
  span.className = "tag " + cls;
  span.textContent = text;
  el.tags.appendChild(span);
}

function updateFavBtn() {
  const on = state.current && favorites.includes(state.current.name);
  el.favBtn.classList.toggle("on", !!on);
  el.favBtn.textContent = on ? "❤️ 찜됨" : "🤍 찜";
}

function toggleCurrentFav() {
  if (!state.current) return;
  const name = state.current.name;
  const idx = favorites.indexOf(name);
  if (idx >= 0) favorites.splice(idx, 1);
  else favorites.unshift(name);
  saveFavs();
  updateFavBtn();
  renderFavs();
}

function renderFavs() {
  if (!favorites.length) {
    el.favs.hidden = true;
    el.favList.innerHTML = "";
    return;
  }
  el.favs.hidden = false;
  el.favList.innerHTML = "";
  favorites.forEach((name) => {
    const menu = MENUS.find((m) => m.name === name);
    if (!menu) return;

    const chip = document.createElement("span");
    chip.className = "fav-chip";

    const label = document.createElement("span");
    label.className = "fav-name";
    label.textContent = menu.emoji + " " + name;
    label.addEventListener("click", () => {
      showMenu(menu);
      el.card.classList.remove("pop");
      void el.card.offsetWidth;
      el.card.classList.add("pop");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    const remove = document.createElement("button");
    remove.type = "button";
    remove.setAttribute("aria-label", name + " 찜 해제");
    remove.textContent = "✕";
    remove.addEventListener("click", () => {
      const i = favorites.indexOf(name);
      if (i >= 0) favorites.splice(i, 1);
      saveFavs();
      updateFavBtn();
      renderFavs();
    });

    chip.appendChild(label);
    chip.appendChild(remove);
    el.favList.appendChild(chip);
  });
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}
