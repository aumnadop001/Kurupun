from flask import Flask, render_template, request, redirect, url_for, jsonify
import mysql.connector
def get_mysql_connection():
    return mysql.connector.connect(
        host='localhost',
        user='user',
        password='userpassword',
        database='pasadu2025'
    )

app = Flask(__name__)

# หน้าแรก
@app.route('/')
def index():
    return render_template('index.html')

# 5 หน้าอื่น
@app.route('/withdrawal')
def withdrawal():
    q = request.args.get('q', default='', type=str)
    connection = get_mysql_connection()
    cursor = connection.cursor(dictionary=True)
    if q:
        sql = """
        SELECT * FROM description
        WHERE Des_id LIKE %s OR Des_name LIKE %s OR keyword LIKE %s
        LIMIT 20
        """
        like_q = f"%{q}%"
        cursor.execute(sql, (like_q, like_q, like_q))
    else:
        cursor.execute("SELECT * FROM description LIMIT 20")
    data = cursor.fetchall()
    cursor.close()
    connection.close()
    if request.headers.get('Accept') == 'application/json' or request.args.get('json') == '1':
        return jsonify(data)
    return render_template('withdrawal.html', data=data)

@app.route('/inventorycontrol')
def inventorycontrol():
    return render_template('inventorycontrol.html')

@app.route('/fixed_asset')
def fixed_asset():
    return render_template('fixed_asset.html')

@app.route('/page4')
def page4():
    return render_template('page4.html')

@app.route('/page5')
def page5():
    return render_template('page5.html')

# หน้า Login
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        user = request.form['username']
        pw = request.form['password']
        if user == "admin" and pw == "1234":
            return redirect(url_for('index'))
        else:
            return render_template('login.html', error="ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง")
    return render_template('login.html')

if __name__ == '__main__':
    app.run(debug=True)
