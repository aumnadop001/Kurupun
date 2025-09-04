from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)

# หน้าแรก
@app.route('/')
def index():
    return render_template('index.html')

# 5 หน้าอื่น
@app.route('/page1')
def page1():
    return render_template('page1.html')

@app.route('/page2')
def page2():
    return render_template('page2.html')

@app.route('/page3')
def page3():
    return render_template('page3.html')

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
