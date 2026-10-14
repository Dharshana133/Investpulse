import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), "portfolio.db")

def view_database():
    if not os.path.exists(db_path):
        print(f"[!] Database file '{db_path}' not found yet. Start the backend to initialize it.")
        return

    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    print("\n" + "=" * 65)
    print("        INVESTPULSE - SQLITE DATABASE INSPECTION TOOL")
    print("=" * 65)

    tables = ["users", "transactions", "watchlist_items"]

    for table in tables:
        print(f"\n[TABLE]: {table.upper()}")
        print("-" * 65)
        cur.execute(f"PRAGMA table_info({table});")
        columns = [col[1] for col in cur.fetchall()]
        print("Columns: " + " | ".join(columns))
        print("-" * 65)

        cur.execute(f"SELECT * FROM {table};")
        rows = cur.fetchall()
        if not rows:
            print(f"  (No records in '{table}' yet)")
        else:
            for row in rows:
                # Mask password hash for security presentation
                formatted_row = list(row)
                if table == "users" and len(formatted_row) >= 3:
                    formatted_row[2] = formatted_row[2][:15] + "...[HASHED]"
                print("  " + " | ".join(str(val) for val in formatted_row))

    print("\n" + "=" * 65)
    conn.close()

if __name__ == "__main__":
    view_database()
