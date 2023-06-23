import sqlite3

# connect to database
conn = sqlite3.connect('food_data.sqlite')
c = conn.cursor()
# Nährstoffe, Allergien, Vitamine, Mineralstoffe, Spurenelemente
# Nutrients, allergies, vitamins, minerals, trace elements

food_nutrients = [
    # (Lebensmittel_ID, Name, Kohlenhydrate, Eiweis, Fett, Ballaststoffe, Zucker, Salz)
    (1, "Banane", 20030, 40417, 180, 2000, 17270, 3),
    (2, "Brot", 40417, 7612, 1302, 7237, 946, 1078),
    (3, "Butter", 600, 670, 83199, 0, 600, 13),
    (4, "Emmentaler", 0, 27655, 29849, 0, 0, 692),
    (5, "Ei (gegart)", 1530, 11850, 9320, 0, 1530, 297),
    (7, "Milch", 4700, 3382, 3569, 0, 4700, 114),
    (10, "Salami", 221, 20300, 35599, 65, 211, 3938),
    (11, "Tomate", 2600, 950, 210, 1300, 2520, 8),
    ("Food_ID", "Food_Name", "Kohlenhydrate", "Eiweiß",
     "Fett", "Ballaststoffe", "Zucker", "Salz"),
    ("mg")
]

food_vitamins = [
    # (Lebensmittel_ID, Name, vitamina, vitaminb1, vitaminb2, vitaminb3, vitaminb5, vitaminb6,vitaminb7, vitaminb9, vitaminb12, vitaminc, vitamind, vitamine, vitamink)
    (1, "Banane", 36, 44, 57, 1683, 230, 363, 5, 14, 0, 11000, 0, 270, 0),
    (2, "Brot", 7, 143, 112, 6446, 639, 199, 5.7, 34, 0, 0, 0, 903, 7),
    (3, "Butter", 970, 5, 22, 201, 47, 5, 0, 0, 0, 200, 1.24, 2000, 7),
    (4, "Emmentaler", 681, 11, 215, 7110, 400, 52, 3, 9, 3.1, 500, 1.1, 540, 3),
    (5, "Ei (gegart)", 274, 80, 326, 3165, 1280, 62, 20, 59, 1.5, 0, 2.78, 1960, 9),
    (7, "Milch", 76, 37, 180, 780, 350, 39, 4, 9, 0.4, 1700, 0.09, 70, 1),
    (10, "Salami", 8, 180, 200, 8133, 483, 459, 2.1, 1, 1.4, 28318, 0, 740, 14),
    (11, "Tomate", 692, 57, 35, 1193, 310, 100, 4, 33, 0, 19255, 0, 800, 6),
    ("Food_ID", "Food_Name", "Vitamin A", "Vitamin B1", "Vitamin B2", "Vitamin B3", "Vitamin B5", "Vitamin B6",
     "Vitamin B7", "Vitamin B9", "Vitamin B12", "Vitamin C", "Vitamin D", "Vitamin E", "Vitamin K"),
    ("µg")
]

food_minerals = [
    # (Lebensmittel_ID, Name, Natrium, Kalium, Calcium, Magnesium, Phosphor, Schwefel, Chlorid)
    (1, "Banane", 1, 367, 7, 30, 22, 13, 109),
    (2, "Brot", 424, 292, 26, 77, 238, 88, 678),
    (3, "Butter", 5, 16, 13, 3, 21, 9, 23),
    (4, "Emmentaler", 335, 157, 1372, 47, 840, 200, 420),
    (5, "Ei (gegart)", 137, 140, 48, 10, 200, 180, 180),
    (7, "Milch", 45, 140, 120, 12, 92, 30, 102),
    (10, "Salami", 2130, 220, 35, 39, 167, 248, 2390),
    (11, "Tomate", 3, 235, 9, 11, 22, 11, 30),
    ("Food_ID", "Food_Name", "Natrium", "Kalium", "Calcium",
     "Magnesium", "Phosphor", "Schwefel", "Chlorid"),
    ("mg")
]

food_trace_elements = [
    # (Lebensmittel_ID, Name, Eisen, Zink, Kuper, Mangan, Fluorid, Iodid)
    (1, "Banane", 352, 162, 108, 259, 14, 2),
    (2, "Brot", 2727, 2100, 340, 2089, 64, 2.9),
    (3, "Butter", 0, 230, 0, 0, 71, 2.1),
    (4, "Emmentaler", 300, 5790, 380, 60, 60, 10.4),
    (5, "Ei (gegart)", 1739, 1416, 62, 71, 110, 9.4),
    (7, "Milch", 60, 400, 7, 2, 17, 11.7),
    (10, "Salami", 1438, 3695, 146, 77, 21, 6.7),
    (11, "Tomate", 316, 85, 57, 108, 24, 1.1),
    ("Food_ID", "Food_Name", "Eisen", "Zink",
     "Kupfer", "Mangan", "Fluorid", "Iodid"),
    ("µg")
]

food_allergens = [
    (1, "Banane", False, False, True, True, True),
    (2, "Brot", True, False, True, True, True),
    (3, "Butter", False, True, False, False, True),
    (4, "Emmentaler", False,
     False, False, False, True),
    (5, "Ei (gegart)", False,
     False, False, False, True),
    (7, "Milch", False, True, False, False, True),
    (10, "Salami", False, False, True, False, False),
    (11, "Tomate", False, False, True, True, True),
    ("Food_ID", "Food_Name", "Gluten", "Lactose",
     "Fructose", "Vegan", "Vegetarisch"),
    ("")
]

tables = [[food_nutrients, 8, "food_nutrients"], [food_allergens, 7, "food_allergens"],
          [food_vitamins, 15, "food_vitamins"], [food_minerals, 9, "food_minerals"], [food_trace_elements, 8, "food_trace_elements"]]

# create tables
for table in tables:
    # Tabellenname und Spaltenanzahl extrahieren
    table_name = table[0][0]
    num_columns = table[1]

    # Spaltennamen extrahieren
    column_names = table[0][-2]
    column_names = [name.replace(" ", "_") for name in column_names]

    columns = ", ".join([f"{name} TEXT" for name in column_names])
    columns = columns.replace("Lebensmittel_ID TEXT",
                              "Lebensmittel_ID INTEGER PRIMARY KEY", 1)

    # # Tabelle erstellen
    c.execute(f'''
        CREATE TABLE IF NOT EXISTS {table[2]} (
           {columns}
        )
    ''')

    # placeholders = ", ".join(["?" for i in range(num_columns)])

    # # insert data
    # c.executemany(
    #     f'INSERT INTO {table_name} VALUES ({placeholders})', table[0][0:8])


c.executemany(
    'INSERT INTO food_nutrients VALUES (?,?,?,?,?,?,?,?)', food_nutrients[0:8])
c.executemany('INSERT INTO food_allergens VALUES (?,?,?,?,?,?,?)',
              food_allergens[0:8])
c.executemany(
    'INSERT INTO food_vitamins VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', food_vitamins[0:8])
c.executemany('INSERT INTO food_minerals VALUES (?,?,?,?,?,?,?,?,?)',
              food_minerals[0:8])
c.executemany('INSERT INTO food_trace_elements VALUES (?,?,?,?,?,?,?,?)',
              food_trace_elements[0:8])

conn.commit()
conn.close()
