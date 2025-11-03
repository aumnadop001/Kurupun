from flask import (
    Blueprint,
    jsonify,
    request,
    render_template,
    redirect,
    url_for,
    session,
)
from modules.login import (
    authenticate_user,
    validate_login_data,
    register_user,
    validate_register_data,
)

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/api/login", methods=["POST"])
def api_login():
    try:
        if not request.is_json:
            return (
                jsonify(
                    {
                        "success": False,
                        "message": "Content-Type ต้องเป็น application/json",
                    }
                ),
                400,
            )

        data = request.get_json()
        if not data:
            return jsonify({"success": False, "message": "ไม่พบข้อมูล JSON"}), 400

        username = data.get("username", "").strip()
        password = data.get("password", "").strip()

        is_valid, error_message = validate_login_data(username, password)
        if not is_valid:
            return jsonify({"success": False, "message": error_message}), 400

        user = authenticate_user(username, password)
        if user:
            session["logged_in"] = True
            session["user_id"] = str(user.get("_id", ""))
            session["username"] = user["username"]
            return jsonify(
                {
                    "success": True,
                    "message": "เข้าสู่ระบบสำเร็จ",
                    "user": {"username": user["username"]},
                }
            )
        else:
            return jsonify({"success": False, "message": "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"}), 401

    except Exception as e:
        return jsonify({"success": False, "message": f"เกิดข้อผิดพลาด: {str(e)}"}), 500


@auth_bp.route("/api/register", methods=["POST"])
def api_register():
    try:
        if not request.is_json:
            return (
                jsonify(
                    {
                        "success": False,
                        "message": "Content-Type ต้องเป็น application/json",
                    }
                ),
                400,
            )

        data = request.get_json()
        if not data:
            return jsonify({"success": False, "message": "ไม่พบข้อมูล JSON"}), 400

        username = data.get("username", "").strip()
        password = data.get("password", "").strip()
        confirm_password = data.get("confirm_password", "").strip()
        email = data.get("email", "").strip()
        full_name = data.get("full_name", "").strip()

        is_valid, error_message = validate_register_data(
            username, password, confirm_password, email, full_name
        )
        if not is_valid:
            return jsonify({"success": False, "message": error_message}), 400

        result = register_user(username, password, email, full_name)
        if result["success"]:
            return jsonify({"success": True, "message": "สมัครสมาชิกสำเร็จ"})
        else:
            return jsonify({"success": False, "message": result["message"]}), 400

    except Exception as e:
        return jsonify({"success": False, "message": f"เกิดข้อผิดพลาด: {str(e)}"}), 500


@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    if "logged_in" in session and session["logged_in"]:
        return redirect(url_for("main.index"))

    if request.method == "POST":
        try:
            username = request.form.get("username", "").strip()
            password = request.form.get("password", "").strip()

            is_valid, error_message = validate_login_data(username, password)
            if not is_valid:
                return render_template("login.html", error=error_message)

            user = authenticate_user(username, password)
            if user:
                session["logged_in"] = True
                session["user_id"] = str(user.get("_id", ""))
                session["username"] = user["username"]
                return redirect(url_for("main.index"))
            else:
                return render_template("login.html", error="ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง")

        except Exception as e:
            return render_template("login.html", error=f"เกิดข้อผิดพลาด: {str(e)}")

    return render_template("login.html")


@auth_bp.route("/register", methods=["GET", "POST"])
def register():
    if "logged_in" in session and session["logged_in"]:
        return redirect(url_for("main.index"))

    if request.method == "POST":
        try:
            username = request.form.get("username", "").strip()
            password = request.form.get("password", "").strip()
            confirm_password = request.form.get("confirm_password", "").strip()
            email = request.form.get("email", "").strip()
            full_name = request.form.get("full_name", "").strip()

            is_valid, error_message = validate_register_data(
                username, password, confirm_password, email, full_name
            )
            if not is_valid:
                return render_template(
                    "register.html",
                    error=error_message,
                    form_data={
                        "username": username,
                        "email": email,
                        "full_name": full_name,
                    },
                )

            result = register_user(username, password, email, full_name)
            if result["success"]:
                return redirect(url_for("auth.login"))
            else:
                return render_template(
                    "register.html",
                    error=result["message"],
                    form_data={
                        "username": username,
                        "email": email,
                        "full_name": full_name,
                    },
                )

        except Exception as e:
            return render_template("register.html", error=f"เกิดข้อผิดพลาด: {str(e)}")

    return render_template("register.html")


@auth_bp.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("auth.login"))
