from flask import Flask, session
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Import blueprints
from routes.main import main_bp
from routes.auth import auth_bp
from routes.withdrawal import withdrawal_bp
from routes.inventory_control import inventory_bp
from routes.asset_control import asset_control_bp
from routes.asset_distribute import asset_distribute_bp
from routes.fixed_asset import fixed_asset_bp


def create_app():
    app = Flask(__name__)
    app.secret_key = os.getenv("SECRET_KEY", "your-secret-key-here")

    # Register blueprints
    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(withdrawal_bp)
    app.register_blueprint(inventory_bp)
    app.register_blueprint(asset_control_bp)
    app.register_blueprint(asset_distribute_bp)
    app.register_blueprint(fixed_asset_bp)

    # Context processor for templates
    @app.context_processor
    def inject_user():
        return dict(
            session=session,
            is_logged_in=session.get("logged_in", False),
            current_user=session.get("username", ""),
        )

    return app


if __name__ == "__main__":
    app = create_app()
    # app.run(debug=True)
    app.run(host="0.0.0.0", port=5000, debug=True)
