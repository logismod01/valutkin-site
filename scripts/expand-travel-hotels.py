from pathlib import Path

# Второй известный вариант размещения для каждой страны.
# Диапазоны — редакционные ориентиры в USD, а не live-тарифы.
hotels = {
"TR":("Çırağan Palace Kempinski Istanbul",5,"Стамбул",380,1200),
"TH":("The Siam",5,"Бангкок",420,1100),
"AE":("Emirates Palace Mandarin Oriental",5,"Абу-Даби",450,1500),
"EG":("Marriott Mena House Cairo",5,"Гиза",220,700),
"GR":("Four Seasons Astir Palace Hotel Athens",5,"Афины",650,1900),
"ES":("Hotel Arts Barcelona",5,"Барселона",420,1300),
"IT":("Danieli, Venice",5,"Венеция",650,1800),
"CY":("Parklane, a Luxury Collection Resort",5,"Лимасол",320,1000),
"MV":("Baros Maldives",5,"Северный Мале",700,2200),
"ID":("The Mulia Bali",5,"Нуса-Дуа",380,1200),
"VN":("InterContinental Danang Sun Peninsula Resort",5,"Дананг",450,1400),
"MX":("Four Seasons Resort Punta Mita",5,"Пунта-Мита",850,2600),
"DO":("Casa de Campo Resort & Villas",5,"Ла-Романа",500,1800),
"CU":("Iberostar Grand Packard",5,"Гавана",220,600),
"TN":("La Badira",5,"Хаммамет",180,500),
"MA":("La Mamounia",5,"Марракеш",550,1800),
"PT":("Four Seasons Hotel Ritz Lisbon",5,"Лиссабон",600,1700),
"HR":("Hotel Dubrovnik Palace",5,"Дубровник",300,900),
"ME":("Regent Porto Montenegro",5,"Тиват",350,1200),
"GE":("Stamba Hotel",5,"Тбилиси",180,500),
"LK":("Cinnamon Grand Colombo",5,"Коломбо",140,400),
"IN":("The Oberoi Udaivilas",5,"Удайпур",550,1600),
"MY":("The Datai Langkawi",5,"Лангкави",600,1600),
"PH":("The Peninsula Manila",5,"Манила",200,600),
"BR":("Hotel Fasano Rio de Janeiro",5,"Рио-де-Жанейро",550,1600),
"RU":("Grand Hotel Europe",5,"Санкт-Петербург",280,800),
"BY":("Minsk Marriott Hotel",5,"Минск",130,350),
"FR":("Hôtel de Crillon",5,"Париж",1200,3500),
"DE":("Bayerischer Hof Munich",5,"Мюнхен",450,1300),
"GB":("Claridge’s",5,"Лондон",900,2800),
"US":("Bellagio Las Vegas",5,"Лас-Вегас",250,1100),
"CA":("Fairmont Château Frontenac",5,"Квебек",350,1000),
"JP":("Park Hyatt Kyoto",5,"Киото",900,2600),
"CN":("The Middle House",5,"Шанхай",450,1300),
"KR":("Four Seasons Hotel Seoul",5,"Сеул",450,1200),
"SG":("Marina Bay Sands",5,"Сингапур",650,1800),
"AU":("Crown Towers Melbourne",5,"Мельбурн",350,1100),
"NZ":("Park Hyatt Auckland",5,"Окленд",350,950),
"CH":("The Dolder Grand",5,"Цюрих",800,2400),
"AT":("Park Hyatt Vienna",5,"Вена",600,1700),
"CZ":("Augustine, a Luxury Collection Hotel",5,"Прага",400,1100),
"HU":("Aria Hotel Budapest",5,"Будапешт",350,950),
"NL":("Waldorf Astoria Amsterdam",5,"Амстердам",750,2200),
"NO":("Sommerro",5,"Осло",320,850),
"FI":("Hotel St. George Helsinki",5,"Хельсинки",280,750),
"IS":("Hotel Rangá",4,"Хелла",350,900),
"ZA":("One&Only Cape Town",5,"Кейптаун",700,2000),
"AR":("Four Seasons Hotel Buenos Aires",5,"Буэнос-Айрес",450,1200),
"CL":("Mandarin Oriental Santiago",5,"Сантьяго",300,850),
"PE":("JW Marriott El Convento Cusco",5,"Куско",350,950),
"KZ":("The Ritz-Carlton Almaty",5,"Алматы",350,900),
}

path=Path("travel-guide-data.js")
text=path.read_text()
if "VALUTKIN_HOTEL_EXTRAS" not in text:
    lines=[]
    for code,row in hotels.items():
        name,stars,city,low,high=row
        name=name.replace('"','\\"'); city=city.replace('"','\\"')
        lines.append(f'{code}:["{name}",{stars},"{city}",{low},{high}],')
    block="\n// Альтернативные известные отели. Ориентиры требуют проверки перед бронированием.\nconst VALUTKIN_HOTEL_EXTRAS={\n"+"\n".join(lines)+"\n};\nObject.entries(VALUTKIN_HOTEL_EXTRAS).forEach(([code,hotel])=>{const row=window.VALUTKIN_TRAVEL_GUIDE[code];if(row)row.hotels=[row.hotel,hotel];});\n"
    path.write_text(text+block)
