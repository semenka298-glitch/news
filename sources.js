// 30+ RSS-источников. `cat` — категория для узкоспециализированных изданий (если не задана,
// категория определяется по ключевым словам). Нерабочие ленты просто пропускаются и видны на /api/sources.
export const SOURCES = [
  { id: 'lenta', name: 'Lenta.ru', url: 'https://lenta.ru/rss/news' },
  { id: 'ria', name: 'РИА Новости', url: 'https://ria.ru/export/rss2/archive/index.xml' },
  { id: 'tass', name: 'ТАСС', url: 'https://tass.ru/rss/v2.xml' },
  { id: 'rbc', name: 'РБК', url: 'https://rssexport.rbc.ru/rbcnews/news/30/full.rss' },
  { id: 'kommersant', name: 'Коммерсантъ', url: 'https://www.kommersant.ru/RSS/news.xml' },
  { id: 'interfax', name: 'Интерфакс', url: 'https://www.interfax.ru/rss.asp' },
  { id: 'iz', name: 'Известия', url: 'https://iz.ru/xml/rss/all.xml' },
  { id: 'vedomosti', name: 'Ведомости', url: 'https://www.vedomosti.ru/rss/news' },
  { id: 'gazeta', name: 'Газета.Ru', url: 'https://www.gazeta.ru/export/rss/first.xml' },
  { id: 'rg', name: 'Российская газета', url: 'https://rg.ru/xml/index.xml' },
  { id: 'kp', name: 'Комсомольская правда', url: 'https://www.kp.ru/rss/allsections.xml' },
  { id: 'mk', name: 'Московский комсомолец', url: 'https://www.mk.ru/rss/news/index.xml' },
  { id: 'aif', name: 'АиФ', url: 'https://aif.ru/rss/all.php' },
  { id: 'meduza', name: 'Meduza', url: 'https://meduza.io/rss/all' },
  { id: 'bbc', name: 'BBC Русская служба', url: 'https://feeds.bbci.co.uk/russian/rss.xml' },
  { id: 'vz', name: 'Взгляд', url: 'https://vz.ru/rss.xml' },
  { id: 'ng', name: 'Независимая газета', url: 'https://www.ng.ru/rss/' },
  { id: 'novaya', name: 'Новая газета', url: 'https://novayagazeta.ru/feed/rss' },
  { id: 'prime', name: 'ПРАЙМ', url: 'https://1prime.ru/export/rss2/index.xml', cat: 'Экономика' },
  { id: 'rtvi', name: 'RTVI', url: 'https://rtvi.com/rss/' },
  { id: 'newsru', name: 'NEWSru.com', url: 'https://rss.newsru.com/top/big/' },
  { id: 'sportsru', name: 'Sports.ru', url: 'https://www.sports.ru/rss/main.xml', cat: 'Спорт' },
  { id: 'sport-express', name: 'Спорт-Экспресс', url: 'https://www.sport-express.ru/services/materials/news/se/', cat: 'Спорт' },
  { id: 'regnum', name: 'REGNUM', url: 'https://regnum.ru/rss' },
  { id: 'mailru', name: 'Новости Mail.ru', url: 'https://news.mail.ru/rss/main/' },
  { id: 'bfm', name: 'BFM.ru', url: 'https://www.bfm.ru/news.rss', cat: 'Экономика' },
  { id: 'ferra', name: 'Ferra', url: 'https://www.ferra.ru/export/news-rss.xml', cat: 'Технологии' },
  { id: 'popmech', name: 'Популярная механика', url: 'https://www.popmech.ru/out/public-all.xml', cat: 'Наука' },
  { id: 'naked', name: 'Naked Science', url: 'https://naked-science.ru/feed', cat: 'Наука' },
  { id: 'dtf', name: 'DTF', url: 'https://dtf.ru/rss', cat: 'Технологии' },
  { id: 'habr', name: 'Хабр Новости', url: 'https://habr.com/ru/rss/news/?fl=ru', cat: 'Технологии' },
  { id: '3dnews', name: '3DNews', url: 'https://3dnews.ru/news/rss/', cat: 'Технологии' },
  { id: 'cnews', name: 'CNews', url: 'https://www.cnews.ru/inc/rss/news.xml', cat: 'Технологии' },
  { id: 'ixbt', name: 'iXBT', url: 'https://www.ixbt.com/export/news.rss', cat: 'Технологии' },
  { id: 'nplus1', name: 'N+1', url: 'https://nplus1.ru/rss', cat: 'Наука' },
  { id: 'lifehacker', name: 'Лайфхакер', url: 'https://lifehacker.ru/feed/' },
];

export const CATEGORIES = [
  'Политика', 'Экономика', 'Мир', 'Общество', 'Происшествия',
  'Спорт', 'Технологии', 'Наука', 'Культура',
];

// Ключевые слова (корни) для определения категории по заголовку и описанию.
export const KEYWORDS = {
  'Политика': ['путин', 'кремл', 'госдум', 'совфед', 'правительств', 'президент', 'министр', 'выбор', 'депутат', 'мишустин', 'песков', 'лавров', 'партия', 'санкци', 'законопроект', 'губернатор', 'мид '],
  'Экономика': ['рубл', 'доллар', 'евро', 'курс', 'инфляц', 'ключев', 'банк', 'биржа', 'акци', 'нефть', 'газпром', 'экономик', 'ввп', 'бизнес', 'налог', 'тариф', 'ипотек', 'кредит', 'компани', 'рынок', 'цены', 'зарплат', 'бюджет', 'инвест'],
  'Мир': ['сша', 'китай', 'украин', 'евросоюз', 'нато', 'трамп', 'байден', 'израил', 'газа', 'иран', 'германи', 'франци', 'британи', 'лондон', 'вашингтон', 'пекин', 'брюссел', 'оон', 'турци', 'япони', 'индия', 'сирия', 'зеленск'],
  'Происшествия': ['пожар', 'дтп', 'авари', 'взрыв', 'погиб', 'задержан', 'арестов', 'убийств', 'следственн', 'суд ', 'приговор', 'мошенник', 'полици', 'чп ', 'обрушен', 'крушени', 'теракт', 'спасател', 'уголовн', 'нападени'],
  'Спорт': ['футбол', 'хоккей', 'матч', 'чемпионат', 'олимпи', 'теннис', 'баскетбол', 'спортсмен', 'сборн', 'лига', 'турнир', 'кубок', 'нхл', 'ухо', 'биатлон', 'фигурн', 'шахмат', 'формул', 'ufc', 'мма'],
  'Технологии': ['смартфон', 'iphone', 'apple', 'google', 'microsoft', 'нейросет', 'искусственн', 'процессор', 'видеокарт', 'интернет', 'приложени', 'windows', 'android', 'ии ', 'роботы', 'робот', 'софт', 'кибер', 'хакер', 'telegram', 'whatsapp', 'gadget', 'гаджет', 'samsung', 'xiaomi', 'tesla'],
  'Наука': ['учен', 'исследовани', 'астроном', 'космос', 'космическ', 'nasa', 'роскосмос', 'планет', 'физик', 'биолог', 'открыти', 'эксперимент', 'вирус', 'вакцин', 'медицин', 'палеонтолог', 'климат', 'генетик', 'мозг'],
  'Культура': ['фильм', 'кино', 'сериал', 'актер', 'актёр', 'актрис', 'режисс', 'музык', 'концерт', 'театр', 'выставк', 'книг', 'писател', 'премь', 'певиц', 'певец', 'альбом', 'премьер', 'артист', 'шоу', 'музей', 'оскар'],
};

// Соответствие тегов <category> из RSS нашим категориям.
export const TAG_MAP = [
  [/полит|власт|госуд/i, 'Политика'],
  [/эконом|бизнес|финанс|рынк|деньг|недвижим/i, 'Экономика'],
  [/мир|междунар|за рубеж|world|в мире/i, 'Мир'],
  [/происшеств|криминал|силов|чп|право/i, 'Происшествия'],
  [/спорт|футбол|хоккей/i, 'Спорт'],
  [/техно|интернет|гаджет|it|софт|медиа/i, 'Технологии'],
  [/наук|космос|здоровь|медиц/i, 'Наука'],
  [/культур|кино|музык|афиш|искусств|шоу|развлеч/i, 'Культура'],
  [/обществ|жизнь|регион|росс|общ/i, 'Общество'],
];


