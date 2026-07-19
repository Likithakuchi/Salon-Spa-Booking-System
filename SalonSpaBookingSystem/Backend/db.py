import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent / 'salon_spa.db'

def get_connection():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    # 1. Customer table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS customers (
        customer_id INTEGER PRIMARY KEY,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT NOT NULL,
        gender TEXT NOT NULL,
        password TEXT NOT NULL
    )
    """)
    
    # 2. Service table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS services (
        service_id INTEGER PRIMARY KEY,
        service_name TEXT NOT NULL UNIQUE,
        category TEXT NOT NULL,
        duration INTEGER NOT NULL,
        price REAL NOT NULL,
        description TEXT
    )
    """)
    
    # 3. Stylist table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS stylists (
        stylist_id INTEGER PRIMARY KEY,
        stylist_name TEXT NOT NULL UNIQUE,
        specialization TEXT NOT NULL,
        experience INTEGER NOT NULL,
        phone TEXT NOT NULL,
        availability TEXT NOT NULL
    )
    """)
    
    # 4. Appointment table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS appointments (
        appointment_id INTEGER PRIMARY KEY,
        customer_name TEXT NOT NULL,
        stylist_name TEXT NOT NULL,
        service_name TEXT NOT NULL,
        appointment_date TEXT NOT NULL,
        appointment_time TEXT NOT NULL,
        total_amount REAL NOT NULL,
        appointment_status TEXT NOT NULL
    )
    """)
    
    # 5. Payment table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS payments (
        payment_id INTEGER PRIMARY KEY,
        customer_name TEXT NOT NULL,
        appointment_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        payment_method TEXT NOT NULL,
        payment_status TEXT NOT NULL,
        payment_date TEXT NOT NULL
    )
    """)
    
    conn.commit()
    
    # Seed data if empty
    # Check Customer
    cursor.execute("SELECT COUNT(*) FROM customers")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO customers (customer_id, full_name, email, phone, gender, password)
        VALUES (101, 'Rahul Sharma', 'rahul@gmail.com', '9876543210', 'Male', 'rahul123')
        """)
        
    # Check Service
    cursor.execute("SELECT COUNT(*) FROM services")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO services (service_id, service_name, category, duration, price, description)
        VALUES (201, 'Hair Spa', 'Spa', 60, 1200.0, 'Deep conditioning hair spa treatment')
        """)
        # Add some extra featured services for beautiful UI representation
        cursor.execute("""
        INSERT INTO services (service_id, service_name, category, duration, price, description)
        VALUES (202, 'Swedish Massage', 'Massage', 90, 2500.0, 'Full body relaxing Swedish massage with essential oils')
        """)
        cursor.execute("""
        INSERT INTO services (service_id, service_name, category, duration, price, description)
        VALUES (203, 'Bridal Makeover', 'Hair Styling', 120, 5000.0, 'Premium hair styling, draping, and makeup session')
        """)
        cursor.execute("""
        INSERT INTO services (service_id, service_name, category, duration, price, description)
        VALUES (204, 'Hydra Facial', 'Facial', 45, 1800.0, 'Deep cleansing, exfoliating and skin hydration treatment')
        """)
        cursor.execute("""
        INSERT INTO services (service_id, service_name, category, duration, price, description)
        VALUES (205, 'Classic Pedicure', 'Pedicure', 40, 800.0, 'Luxury scrub, nail shaping, and foot massage')
        """)
        
    # Check Stylist
    cursor.execute("SELECT COUNT(*) FROM stylists")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO stylists (stylist_id, stylist_name, specialization, experience, phone, availability)
        VALUES (301, 'Priya Sharma', 'Hair Styling', 6, '9988776655', 'Available')
        """)
        cursor.execute("""
        INSERT INTO stylists (stylist_id, stylist_name, specialization, experience, phone, availability)
        VALUES (302, 'David Miller', 'Massage', 8, '9876543211', 'Available')
        """)
        cursor.execute("""
        INSERT INTO stylists (stylist_id, stylist_name, specialization, experience, phone, availability)
        VALUES (303, 'Aisha Khan', 'Facial', 5, '9876543212', 'Busy')
        """)
        
    # Check Appointment
    cursor.execute("SELECT COUNT(*) FROM appointments")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO appointments (appointment_id, customer_name, stylist_name, service_name, appointment_date, appointment_time, total_amount, appointment_status)
        VALUES (401, 'Rahul Sharma', 'Priya Sharma', 'Hair Spa', '2026-08-20', '11:30', 1200.0, 'Booked')
        """)
        
    # Check Payment
    cursor.execute("SELECT COUNT(*) FROM payments")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO payments (payment_id, customer_name, appointment_id, amount, payment_method, payment_status, payment_date)
        VALUES (501, 'Rahul Sharma', 401, 1200.0, 'UPI', 'Paid', '2026-08-20')
        """)
        
    conn.commit()
    conn.close()

# Auto initialize database on load
init_db()

# --- Customer CRUD ---
def get_next_customer_id():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT MAX(customer_id) FROM customers")
    val = cursor.fetchone()[0]
    conn.close()
    return (val + 1) if val is not None else 101

def add_customer(data):
    conn = get_connection()
    cursor = conn.cursor()
    cid = data.get('customer_id') or get_next_customer_id()
    cursor.execute("""
        INSERT INTO customers (customer_id, full_name, email, phone, gender, password)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (cid, data['full_name'], data['email'], data['phone'], data['gender'], data['password']))
    conn.commit()
    conn.close()
    return cid

def get_customers():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM customers")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_customer_by_id(customer_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM customers WHERE customer_id = ?", (customer_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def update_customer(customer_id, data):
    conn = get_connection()
    cursor = conn.cursor()
    # Support partial updates
    cursor.execute("SELECT * FROM customers WHERE customer_id = ?", (customer_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return False
    current = dict(row)
    
    full_name = data.get('full_name', current['full_name'])
    email = data.get('email', current['email'])
    phone = data.get('phone', current['phone'])
    gender = data.get('gender', current['gender'])
    password = data.get('password', current['password'])
    
    cursor.execute("""
        UPDATE customers
        SET full_name = ?, email = ?, phone = ?, gender = ?, password = ?
        WHERE customer_id = ?
    """, (full_name, email, phone, gender, password, customer_id))
    conn.commit()
    conn.close()
    return True

def delete_customer(customer_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT 1 FROM customers WHERE customer_id = ?", (customer_id,))
    if not cursor.fetchone():
        conn.close()
        return False
    cursor.execute("DELETE FROM customers WHERE customer_id = ?", (customer_id,))
    conn.commit()
    conn.close()
    return True


# --- Service CRUD ---
def get_next_service_id():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT MAX(service_id) FROM services")
    val = cursor.fetchone()[0]
    conn.close()
    return (val + 1) if val is not None else 201

def add_service(data):
    conn = get_connection()
    cursor = conn.cursor()
    sid = data.get('service_id') or get_next_service_id()
    cursor.execute("""
        INSERT INTO services (service_id, service_name, category, duration, price, description)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (sid, data['service_name'], data['category'], int(data['duration']), float(data['price']), data.get('description', '')))
    conn.commit()
    conn.close()
    return sid

def get_services():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM services")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_service_by_id(service_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM services WHERE service_id = ?", (service_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def update_service(service_id, data):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM services WHERE service_id = ?", (service_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return False
    current = dict(row)
    
    service_name = data.get('service_name', current['service_name'])
    category = data.get('category', current['category'])
    duration = data.get('duration', current['duration'])
    price = data.get('price', current['price'])
    description = data.get('description', current['description'])
    
    cursor.execute("""
        UPDATE services
        SET service_name = ?, category = ?, duration = ?, price = ?, description = ?
        WHERE service_id = ?
    """, (service_name, category, int(duration), float(price), description, service_id))
    conn.commit()
    conn.close()
    return True

def delete_service(service_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT 1 FROM services WHERE service_id = ?", (service_id,))
    if not cursor.fetchone():
        conn.close()
        return False
    cursor.execute("DELETE FROM services WHERE service_id = ?", (service_id,))
    conn.commit()
    conn.close()
    return True


# --- Stylist CRUD ---
def get_next_stylist_id():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT MAX(stylist_id) FROM stylists")
    val = cursor.fetchone()[0]
    conn.close()
    return (val + 1) if val is not None else 301

def add_stylist(data):
    conn = get_connection()
    cursor = conn.cursor()
    sid = data.get('stylist_id') or get_next_stylist_id()
    cursor.execute("""
        INSERT INTO stylists (stylist_id, stylist_name, specialization, experience, phone, availability)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (sid, data['stylist_name'], data['specialization'], int(data['experience']), data['phone'], data['availability']))
    conn.commit()
    conn.close()
    return sid

def get_stylists():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM stylists")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_stylist_by_id(stylist_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM stylists WHERE stylist_id = ?", (stylist_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def update_stylist(stylist_id, data):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM stylists WHERE stylist_id = ?", (stylist_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return False
    current = dict(row)
    
    stylist_name = data.get('stylist_name', current['stylist_name'])
    specialization = data.get('specialization', current['specialization'])
    experience = data.get('experience', current['experience'])
    phone = data.get('phone', current['phone'])
    availability = data.get('availability', current['availability'])
    
    cursor.execute("""
        UPDATE stylists
        SET stylist_name = ?, specialization = ?, experience = ?, phone = ?, availability = ?
        WHERE stylist_id = ?
    """, (stylist_name, specialization, int(experience), phone, availability, stylist_id))
    conn.commit()
    conn.close()
    return True

def delete_stylist(stylist_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT 1 FROM stylists WHERE stylist_id = ?", (stylist_id,))
    if not cursor.fetchone():
        conn.close()
        return False
    cursor.execute("DELETE FROM stylists WHERE stylist_id = ?", (stylist_id,))
    conn.commit()
    conn.close()
    return True


# --- Appointment CRUD ---
def get_next_appointment_id():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT MAX(appointment_id) FROM appointments")
    val = cursor.fetchone()[0]
    conn.close()
    return (val + 1) if val is not None else 401

def add_appointment(data):
    conn = get_connection()
    cursor = conn.cursor()
    aid = data.get('appointment_id') or get_next_appointment_id()
    cursor.execute("""
        INSERT INTO appointments (appointment_id, customer_name, stylist_name, service_name, appointment_date, appointment_time, total_amount, appointment_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (aid, data['customer_name'], data['stylist_name'], data['service_name'], data['appointment_date'], data['appointment_time'], float(data['total_amount']), data['appointment_status']))
    conn.commit()
    conn.close()
    return aid

def get_appointments():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM appointments")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_appointment_by_id(appointment_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM appointments WHERE appointment_id = ?", (appointment_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def update_appointment(appointment_id, data):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM appointments WHERE appointment_id = ?", (appointment_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return False
    current = dict(row)
    
    customer_name = data.get('customer_name', current['customer_name'])
    stylist_name = data.get('stylist_name', current['stylist_name'])
    service_name = data.get('service_name', current['service_name'])
    appointment_date = data.get('appointment_date', current['appointment_date'])
    appointment_time = data.get('appointment_time', current['appointment_time'])
    total_amount = data.get('total_amount', current['total_amount'])
    appointment_status = data.get('appointment_status', current['appointment_status'])
    
    cursor.execute("""
        UPDATE appointments
        SET customer_name = ?, stylist_name = ?, service_name = ?, appointment_date = ?, appointment_time = ?, total_amount = ?, appointment_status = ?
        WHERE appointment_id = ?
    """, (customer_name, stylist_name, service_name, appointment_date, appointment_time, float(total_amount), appointment_status, appointment_id))
    conn.commit()
    conn.close()
    return True

def delete_appointment(appointment_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT 1 FROM appointments WHERE appointment_id = ?", (appointment_id,))
    if not cursor.fetchone():
        conn.close()
        return False
    cursor.execute("DELETE FROM appointments WHERE appointment_id = ?", (appointment_id,))
    conn.commit()
    conn.close()
    return True


# --- Payment CRUD ---
def get_next_payment_id():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT MAX(payment_id) FROM payments")
    val = cursor.fetchone()[0]
    conn.close()
    return (val + 1) if val is not None else 501

def add_payment(data):
    conn = get_connection()
    cursor = conn.cursor()
    pid = data.get('payment_id') or get_next_payment_id()
    cursor.execute("""
        INSERT INTO payments (payment_id, customer_name, appointment_id, amount, payment_method, payment_status, payment_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (pid, data['customer_name'], int(data['appointment_id']), float(data['amount']), data['payment_method'], data['payment_status'], data['payment_date']))
    conn.commit()
    conn.close()
    return pid

def get_payments():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM payments")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_payment_by_id(payment_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM payments WHERE payment_id = ?", (payment_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def update_payment(payment_id, data):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM payments WHERE payment_id = ?", (payment_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return False
    current = dict(row)
    
    customer_name = data.get('customer_name', current['customer_name'])
    appointment_id = data.get('appointment_id', current['appointment_id'])
    amount = data.get('amount', current['amount'])
    payment_method = data.get('payment_method', current['payment_method'])
    payment_status = data.get('payment_status', current['payment_status'])
    payment_date = data.get('payment_date', current['payment_date'])
    
    cursor.execute("""
        UPDATE payments
        SET customer_name = ?, appointment_id = ?, amount = ?, payment_method = ?, payment_status = ?, payment_date = ?
        WHERE payment_id = ?
    """, (customer_name, int(appointment_id), float(amount), payment_method, payment_status, payment_date, payment_id))
    conn.commit()
    conn.close()
    return True

def delete_payment(payment_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT 1 FROM payments WHERE payment_id = ?", (payment_id,))
    if not cursor.fetchone():
        conn.close()
        return False
    cursor.execute("DELETE FROM payments WHERE payment_id = ?", (payment_id,))
    conn.commit()
    conn.close()
    return True
