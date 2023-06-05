import sqlite3

# Verbindung zur Datenbank erstellen (oder Datenbank erstellen, falls sie noch nicht existiert)
conn = sqlite3.connect('food_data.sqlite')
c = conn.cursor()

# Tabelle erstellen
c.execute('''
    CREATE TABLE food (
        id INTEGER PRIMARY KEY,
        name TEXT,
        dummy_content TEXT,
        value INTEGER
    )
''')

# Daten vorbereiten
foods = [
    (0, "banana", "Content banana"),
    (1, "bread", "Content bread"),
    (2, "butter", "Content butter"),
    (3, "cheese", "Content cheese"),
    (4, "egg", "Content egg"),
    (5, "milk", "Content milk"),
    (6, "sausage", "Content sausage"),
    (7, "tomato", "Content tomato"),
]

# Daten in die Tabelle einfügen
c.executemany('''
    INSERT INTO food (id, name, dummy_content, value) 
    VALUES (?, ?, ?, 1)
''', foods)

# Änderungen speichern und Verbindung schließen
conn.commit()
conn.close()
