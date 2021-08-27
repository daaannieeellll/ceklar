import os

from flask import Flask, render_template, request, redirect

def create_app(test_config=None):
    """Create and configure an instance of the Flask application."""
    app = Flask(__name__, instance_relative_config=True)

    @app.before_request
    def before_request():
        if app.env == "development":
            return
        if request.is_secure:
            return

        url = request.url.replace("http://", "https://", 1)
        code = 301
        return redirect(url, code=code)

    @app.route("/")
    def index():
        return render_template('index.html')

    # apply the blueprints to the app
    from .pwa import bp
    app.register_blueprint(bp)

    return app
