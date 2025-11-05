import os
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:8100"}}, supports_credentials=True)


app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)

with app.app_context():
    db.create_all()

    if not User.query.filter_by(username="anca").first():
        db.session.add(User(username="anca", password_hash=generate_password_hash("parola123")))
        db.session.add(User(username="student", password_hash=generate_password_hash("student")))
        db.session.commit()


@app.post("/auth/login")
def login():
    data = request.get_json() or {}
    username = (data.get("username") or "").strip().lower()
    password = data.get("password") or ""

    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"ok": False, "error": "Utilizator inexistent."}), 401

    if not check_password_hash(user.password_hash, password):
        return jsonify({"ok": False, "error": "Parolă incorectă."}), 401


    return jsonify({"ok": True, "user": {"username": username}})


@app.get("/health")
def health():
    return {"ok": True}

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
