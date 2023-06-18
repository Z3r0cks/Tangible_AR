import sqlite3

# connect to database
conn = sqlite3.connect('food_data.sqlite')
c = conn.cursor()
# Nährstoffe, Allergien, Vitamine, Mineralstoffe, Spurenelemente
# Nutrients, allergies, vitamins, minerals, trace elements

food_nutrients = [
    # (Lebensmittel_ID, Name, Kohlenhydrate, Eiweis, Fett, Ballaststoffe, Zucker, Salz)
    (0, "Banane", 20030, 40417, 180, 2000, 17270, 3),
    (1, "Brot", 40417, 7612, 1302, 7237, 946, 1078),
    (2, "Butter", 600, 670, 83199, 0, 600, 13),
    (3, "Emmentaler", 0, 27655, 29849, 0, 0, 692),
    (4, "Ei (gegart)", 1530, 11850, 9320, 0, 1530, 297),
    (5, "Milch", 4700, 3382, 3569, 0, 4700, 114),
    (6, "Salami", 221, 20300, 35599, 65, 211, 3938),
    (7, "Tomate", 2600, 950, 210, 1300, 2520, 8),
    ("Food_ID", "Food_Name", "Kohlenhydrate", "Eiweiß",
     "Fett", "Ballaststoffe", "Zucker", "Salz"),
    ("mg")
]

food_vitamins = [
    # (Lebensmittel_ID, Name, vitamina, vitaminb1, vitaminb2, vitaminb3, vitaminb5, vitaminb6,vitaminb7, vitaminb9, vitaminb12, vitaminc, vitamind, vitamine, vitamink)
    (0, "Banane", 36, 44, 57, 1683, 230, 363, 5, 14, 0, 11000, 0, 270, 0),
    (1, "Brot", 7, 143, 112, 6446, 639, 199, 5.7, 34, 0, 0, 0, 903, 7),
    (2, "Butter", 970, 5, 22, 201, 47, 5, 0, 0, 0, 200, 1.24, 2000, 7),
    (3, "Emmentaler", 681, 11, 215, 7110, 400, 52, 3, 9, 3.1, 500, 1.1, 540, 3),
    (4, "Ei (gegart)", 274, 80, 326, 3165, 1280, 62, 20, 59, 1.5, 0, 2.78, 1960, 9),
    (5, "Milch", 76, 37, 180, 780, 350, 39, 4, 9, 0.4, 1700, 0.09, 70, 1),
    (6, "Salami", 8, 180, 200, 8133, 483, 459, 2.1, 1, 1.4, 28318, 0, 740, 14),
    (7, "Tomate", 692, 57, 35, 1193, 310, 100, 4, 33, 0, 19255, 0, 800, 6),
    ("Food_ID", "Food_Name", "Vitamin A", "Vitamin B1", "Vitamin B2", "Vitamin B3", "Vitamin B5", "Vitamin B6",
     "Vitamin B7", "Vitamin B9", "Vitamin B12", "Vitamin C", "Vitamin D", "Vitamin E", "Vitamin K"),
    ("µg")
]

food_minerals = [
    # (Lebensmittel_ID, Name, Natrium, Kalium, Calcium, Magnesium, Phosphor, Schwefel, Chlorid)
    (0, "Banane", 1, 367, 7, 30, 22, 13, 109),
    (1, "Brot", 424, 292, 26, 77, 238, 88, 678),
    (2, "Butter", 5, 16, 13, 3, 21, 9, 23),
    (3, "Emmentaler", 335, 157, 1372, 47, 840, 200, 420),
    (4, "Ei (gegart)", 137, 140, 48, 10, 200, 180, 180),
    (5, "Milch", 45, 140, 120, 12, 92, 30, 102),
    (6, "Salami", 2130, 220, 35, 39, 167, 248, 2390),
    (7, "Tomate", 3, 235, 9, 11, 22, 11, 30),
    ("Food_ID", "Food_Name", "Natrium", "Kalium", "Calcium",
     "Magnesium", "Phosphor", "Schwefel", "Chlorid"),
    ("mg")
]

food_trace_elements = [
    # (Lebensmittel_ID, Name, Eisen, Zink, Kuper, Mangan, Fluorid, Iodid)
    (0, "Banane", 352, 162, 108, 259, 14, 2),
    (1, "Brot", 2727, 2100, 340, 2089, 64, 2.9),
    (2, "Butter", 0, 230, 0, 0, 71, 2.1),
    (3, "Emmentaler", 300, 5790, 380, 60, 60, 10.4),
    (4, "Ei (gegart)", 1739, 1416, 62, 71, 110, 9.4),
    (5, "Milch", 60, 400, 7, 2, 17, 11.7),
    (6, "Salami", 1438, 3695, 146, 77, 21, 6.7),
    (7, "Tomate", 316, 85, 57, 108, 24, 1.1),
    ("Food_ID", "Food_Name", "Eisen", "Zink",
     "Kupfer", "Mangan", "Fluorid", "Iodid"),
    ("µg")
]

food_allergens = [
    (0, "Banane", "Nicht enthalten", "Nicht enthalten", "Enthalten",
     "Ja (aber nur Bio Bananen)", "Ja (aber nur Bio Bananen)"),
    (1, "Brot", "Enthalten", "Nicht enthalten", "Enthalten",
     "Ja (außer sie enthalten E471, dann eventuell)", "Ja (außer sie enthalten E471, dann eventuell)"),
    (2, "Butter", "Nicht enthalten", "Enthalten", "Nicht enthalten", "Nein", "Ja"),
    (3, "Emmentaler", "Nicht enthalten",
     "Nicht enthalten", "Nicht enthalten", "Nein", "Ja"),
    (4, "Ei (gegart)", "Nicht enthalten",
     "Nicht enthalten", "Nicht enthalten", "Nein", "Ja"),
    (5, "Milch", "Nicht enthalten", "Enthalten", "Nicht enthalten", "Nein", "Ja"),
    (6, "Salami", "Nicht enthalten", "Nicht enthalten", "Enthalten", "Nein", "Nein"),
    (7, "Tomate", "Nicht enthalten", "Nicht enthalten", "Enthalten", "Ja", "Ja"),
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
