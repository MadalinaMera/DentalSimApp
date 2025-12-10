import os
import datetime
import requests
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.sql.expression import func

# --- APP CONFIGURATION ---
app = Flask(__name__)

# 1. CORS: Allow your frontend (Ionic) to communicate with this backend
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# 2. DATABASE: SQLite file
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///dentalsim.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# 3. SECURITY: JWT Secret Key (Change this in production!)
app.config['JWT_SECRET_KEY'] = 'super-secret-dental-key-change-me'

db = SQLAlchemy(app)
jwt = JWTManager(app)

COLAB_URL = "https://adrenergic-maisie-unenlightened.ngrok-free.dev"
HF_URL = f"{COLAB_URL}/generate"
HF_HEADERS = {"Content-Type": "application/json"}

# --- DATABASE MODELS ---

class Classroom(db.Model):
    __tablename__ = 'classroom'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    join_code = db.Column(db.String(20), unique=True, nullable=False)
    students = db.relationship('User', backref='classroom', lazy=True)

class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    xp = db.Column(db.Integer, default=0)
    classroom_id = db.Column(db.Integer, db.ForeignKey('classroom.id'), nullable=True)

    streak = db.Column(db.Integer, default=0)
    last_active_date = db.Column(db.Date, nullable=True)

    # --- NEW: ROLE COLUMN ---
    role = db.Column(db.String(50), default='Dental Student')
    # ------------------------

    badges = db.relationship('UserBadge', backref='user', lazy=True)
    sessions = db.relationship('ChatSession', backref='user', lazy=True)

class Disease(db.Model):
    __tablename__ = 'disease'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    system_prompt = db.Column(db.Text, nullable=False)

class ChatSession(db.Model):
    __tablename__ = 'chat_session'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    disease_id = db.Column(db.Integer, db.ForeignKey('disease.id'), nullable=False)
    start_time = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    end_time = db.Column(db.DateTime, nullable=True)
    is_completed = db.Column(db.Boolean, default=False)
    was_correct = db.Column(db.Boolean, default=False)
    
    messages = db.relationship('ChatMessage', backref='session', lazy=True, order_by="ChatMessage.timestamp")
    disease = db.relationship('Disease')

class ChatMessage(db.Model):
    __tablename__ = 'chat_message'
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('chat_session.id'), nullable=False)
    sender = db.Column(db.String(20), nullable=False) # 'student', 'patient', 'system'
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class UserBadge(db.Model):
    __tablename__ = 'user_badge'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    badge_name = db.Column(db.String(50), nullable=False)
    awarded_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

# --- SEED DATA (Your Diseases) ---
DISEASE_DATA = [
    {
        "name": "Simple Caries",
        "prompt": """### ROLE
You are a simulated dental patient. You are talking to a dental student.
Your diagnosis is **Simple Caries** (HIDDEN). Do not reveal the diagnosis name directly.

### SYMPTOMS YOU HAVE (TRUE - CONFIRM THESE)
* **Provoked Pain:** You feel a sharp, quick "zing" specifically to **cold** and **sweets**.
* **Short Duration:** The pain disappears **immediately** (1-2 seconds) after the stimulus is gone.
* **Food Impaction:** Food sometimes gets stuck between teeth.

### SYMPTOMS YOU DO NOT HAVE (FALSE - DENY THESE)
* **NO Spontaneous Pain:** The tooth NEVER hurts on its own.
* **NO Night Pain:** You sleep perfectly fine.
* **NO Percussion Pain:** Tapping on the tooth does NOT hurt.
* **NO Heat Sensitivity:** Hot coffee does not bother you.

### BEHAVIOR GUIDELINES
1. **Be Layman:** Use words like "cavity" or "sting".
2. **Be Calm:** You are annoyed by the sweet sensitivity, but not in agony.
3. **Refuse Irrelevance:** If asked about hobbies/dinner, refuse politely."""
    },
    {
        "name": "Reversible Pulpitis",
        "prompt": """### ROLE
You are a simulated dental patient. Diagnosis: **Reversible Pulpitis** (HIDDEN).

### SYMPTOMS YOU HAVE (TRUE)
* **Provoked Pain:** Sharp pain to **cold** and **air**.
* **Short Duration:** Pain stops quickly (under 30 seconds) after stimulus removal.
* **Biting Pain:** You feel pain when chewing directly on that tooth (due to a cavity).
* **History:** You have a deep cavity or old filling.

### SYMPTOMS YOU DO NOT HAVE (FALSE)
* **NO Spontaneous Pain:** Never hurts without a trigger.
* **NO Night Pain:** Does not wake you up.
* **NO Heat Sensitivity:** Heat does not trigger it.
* **NO Pulsating:** It is not a heartbeat pain.

### BEHAVIOR GUIDELINES
1. **Be Layman:** Describe symptoms simply.
2. **Be Concise:** Short answers."""
    },
    {
        "name": "Irreversible Pulpitis",
        "prompt": """### ROLE
You are a simulated dental patient. Diagnosis: **Irreversible Pulpitis** (HIDDEN).

### SYMPTOMS YOU HAVE (TRUE)
* **Spontaneous Pain:** Starts hurting suddenly without reason.
* **Night Pain:** Severe pain wakes you up at night.
* **Lingering Cold Pain:** Pain to cold lasts for minutes (lingers > 60s).
* **Radiating:** Pain shoots to the ear/temple.

### SYMPTOMS YOU DO NOT HAVE (FALSE)
* **NO Swelling:** Face is not swollen.
* **NO Bad Taste:** No pus discharge.
* **NO Heat Relief:** Cold does not make it better (actually makes it worse).

### BEHAVIOR GUIDELINES
1. **Be Distressed:** You are tired and in pain.
2. **Refuse Irrelevance:** Do not answer personal questions."""
    },
    {
        "name": "Acute Total Pulpitis",
        "prompt": """### ROLE
You are a simulated dental patient. Diagnosis: **Acute Total Pulpitis** (HIDDEN).

### SYMPTOMS YOU HAVE (TRUE)
* **Violent Pain:** Unbearable throbbing pain (9/10).
* **Thermal Sensitivity:** BOTH Cold and Heat cause extreme, lingering pain.
* **Night Pain:** Keeps you awake all night.
* **Spontaneous:** Hurts constantly.

### SYMPTOMS YOU DO NOT HAVE (FALSE)
* **NO Swelling:** No visible swelling yet.
* **NO Fistula:** No bump on the gum.

### BEHAVIOR GUIDELINES
1. **Be Agitated:** You are in agony. Demand help.
2. **Short Temper:** Get angry if the doctor asks stupid questions."""
    },
    {
        "name": "Pulp Necrosis",
        "prompt": """### ROLE
You are a simulated dental patient. Diagnosis: **Pulp Necrosis** (HIDDEN).

### SYMPTOMS YOU HAVE (TRUE)
* **Dead Tooth:** You feel NOTHING to cold or heat (Negative Vitality Test).
* **History:** You had severe pain days ago, but it suddenly stopped.
* **Mild Tenderness:** Tapping the tooth feels slightly "different".

### SYMPTOMS YOU DO NOT HAVE (FALSE)
* **NO Severe Pain:** Currently, nothing hurts badly.
* **NO Response to Cold:** Explicitly say "I don't feel anything".

### BEHAVIOR GUIDELINES
1. **Be Confused:** Wonder why the pain stopped but the tooth feels "numb"."""
    },
    {
        "name": "Acute Apical Periodontitis",
        "prompt": """### ROLE
You are a simulated dental patient. Diagnosis: **Acute Apical Periodontitis** (HIDDEN).

### SYMPTOMS YOU HAVE (TRUE)
* **High Tooth:** Sensation that the tooth is "longer" or "taller".
* **Biting Pain:** Severe pain when chewing/touching the tooth.
* **Percussion:** Extreme pain on vertical tapping.

### SYMPTOMS YOU DO NOT HAVE (FALSE)
* **NO Cold Sensation:** The nerve is likely dead (or dying).
* **NO Swelling:** Face is not swollen (distinguishes from abscess).

### BEHAVIOR GUIDELINES
1. **Be Protective:** You are afraid to close your mouth fully."""
    },
    {
        "name": "Chronic Apical Periodontitis",
        "prompt": """### ROLE
You are a simulated dental patient. Diagnosis: **Chronic Apical Periodontitis** (HIDDEN).

### SYMPTOMS YOU HAVE (TRUE)
* **Fistula:** A small "pimple" on the gum that comes and goes.
* **Bad Taste:** Salty/metallic taste (pus draining).
* **Dead Tooth:** No feeling to cold/heat.

### SYMPTOMS YOU DO NOT HAVE (FALSE)
* **NO Severe Pain:** It is just a dull annoyance/pressure.
* **NO Night Pain:** You sleep fine.

### BEHAVIOR GUIDELINES
1. **Be Calm:** Describe the recurring bump on the gum."""
    },
    {
        "name": "Periodontal Abscess",
        "prompt": """### ROLE
You are a simulated dental patient. Diagnosis: **Periodontal Abscess** (HIDDEN).

### SYMPTOMS YOU HAVE (TRUE)
* **Vital Tooth:** You FEEL cold normally (nerve is alive).
* **Gum Pain:** Pain is "in the gum", not deep in the tooth.
* **Swelling:** Localized gum swelling/pus.
* **Lateral Pain:** Hurts if pushed from the side.

### SYMPTOMS YOU DO NOT HAVE (FALSE)
* **NO Vertical Pain:** Tapping top of tooth is usually fine.
* **NO Dead Nerve:** Confirm you feel temperature.

### BEHAVIOR GUIDELINES
1. **Complain:** Mention food getting stuck between teeth."""
    },
    {
        "name": "Pericoronitis",
        "prompt": """### ROLE
You are a simulated dental patient. Diagnosis: **Pericoronitis** (HIDDEN).

### SYMPTOMS YOU HAVE (TRUE)
* **Trismus:** Cannot open mouth fully (jaw locks).
* **Swallowing Pain:** Pain radiates to ear/throat.
* **Location:** Wisdom tooth (very back).
* **Bad Taste:** Salty discharge.

### SYMPTOMS YOU DO NOT HAVE (FALSE)
* **NO Cold Sensitivity:** Tooth is fine, gum is the problem.
* **NO Night Pain:** It's constant dull ache.

### BEHAVIOR GUIDELINES
1. **Be Muffled:** Indicate it's hard to speak/open mouth."""
    }
]
# Note: For brevity in this response, I shortened the prompts, but you should paste 
# your full DISEASE_DATA list here so the AI works correctly.

# --- ROUTES ---

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "message": "DentalSim Backend is running"})

@app.route("/auth/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username", "").strip().lower()
    password = data.get("password", "")
    class_code = data.get("class_code", "").strip()

    # NEW: Get role from request, default to 'Dental Student' if missing
    role = data.get("role", "Dental Student").strip()

    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username taken"}), 409

    assigned_class_id = None
    if class_code:
        classroom = Classroom.query.filter_by(join_code=class_code).first()
        if classroom:
            assigned_class_id = classroom.id

    new_user = User(
        username=username,
        password_hash=generate_password_hash(password),
        classroom_id=assigned_class_id,
        role=role  # <--- SAVE THE ROLE HERE
    )
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User created", "username": username}), 201
@app.route("/auth/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username", "").strip().lower()
    password = data.get("password", "")

    user = User.query.filter_by(username=username).first()

    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid credentials"}), 401

    token = create_access_token(identity=str(user.id))
    
    return jsonify({
        "token": token,
        "user": {
            "username": user.username,
            "xp": user.xp,
            "badge_count": len(user.badges)
        }
    })

@app.route("/chat/start/random", methods=["POST"])
@jwt_required()
def start_random_chat():
    current_user_id = get_jwt_identity()
    
    disease = Disease.query.order_by(func.random()).first()
    if not disease:
        return jsonify({"error": "No diseases in database"}), 500

    # Create new session
    new_session = ChatSession(user_id=current_user_id, disease_id=disease.id)
    db.session.add(new_session)
    db.session.commit()
    
    # Optional: Log system prompt as the first 'hidden' message if you want history
    # db.session.add(ChatMessage(session_id=new_session.id, sender="system", content=disease.system_prompt))
    # db.session.commit()

    print("New chat session started:", new_session.id, "Disease:", disease.name)
    return jsonify({
        "ok": True,
        "session_id": new_session.id,
        "message": "** The patient has entered the office. **"
    })

@app.route("/chat", methods=["POST"])
@jwt_required()
def chat():
    data = request.get_json()
    session_id = data.get("session_id")
    user_message = data.get("message", "")

    # Validate Session
    session = ChatSession.query.filter_by(id=session_id).first()
    if not session:
        return jsonify({"error": "Invalid session"}), 404
    
    # 1. Save Student Message
    db.session.add(ChatMessage(session_id=session.id, sender="student", content=user_message))
    db.session.commit()

    # 2. Build History for LLM
    # We fetch the last 10 messages to keep context window manageable
    recent_msgs = ChatMessage.query.filter_by(session_id=session.id).order_by(ChatMessage.timestamp.desc()).limit(10).all()
    recent_msgs.reverse() # Put them back in chronological order

    conversation_history = [{"role": "system", "content": session.disease.system_prompt}]
    for msg in recent_msgs:
        role = "user" if msg.sender == "student" else "assistant"
        conversation_history.append({"role": role, "content": msg.content})

    # 3. Call External LLM (Colab)
    payload = {
        "messages": conversation_history,
        "max_new_tokens": 150,
        "temperature": 0.2
    }

    try:
        response = requests.post(HF_URL, json=payload, headers=HF_HEADERS, timeout=120)
        
        if response.status_code == 200:
            ai_data = response.json()
            bot_reply = ai_data.get("generated_text", "")
            
            # 4. Save Patient Reply
            db.session.add(ChatMessage(session_id=session.id, sender="patient", content=bot_reply))
            db.session.commit()

            return jsonify({"reply": bot_reply})
        else:
            return jsonify({"error": f"LLM Error: {response.status_code}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/chat/diagnose", methods=["POST"])
@jwt_required()
def check_diagnosis():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    session_id = data.get("session_id")
    student_diagnosis = data.get("diagnosis", "").strip().lower()

    session = ChatSession.query.filter_by(id=session_id, user_id=current_user_id).first()
    if not session:
        return jsonify({"error": "Session not found"}), 404

    correct_name = session.disease.name.lower()
    is_correct = correct_name in student_diagnosis
    
    xp_gained = 0
    message = ""

    if is_correct:
        xp_gained = 100
        session.was_correct = True
        message = f"Correct! The diagnosis was {session.disease.name}."
        
        # Check for Speedster Badge (Example: < 2 mins)
        duration = (datetime.datetime.utcnow() - session.start_time).total_seconds()
        if duration < 120:
            # Check if badge already exists
            existing_badge = UserBadge.query.filter_by(user_id=current_user_id, badge_name="Speedster").first()
            if not existing_badge:
                db.session.add(UserBadge(user_id=current_user_id, badge_name="Speedster"))
                xp_gained += 50
                message += " [BADGE UNLOCKED: Speedster]"
    else:
        xp_gained = 20
        message = f"Incorrect. The correct diagnosis was {session.disease.name}."


    # Update User XP
    user = User.query.get(current_user_id)
    user.xp += xp_gained

    ## Streak Logic
    today = datetime.date.today()

    # If this is the first time playing today...
    if user.last_active_date != today:
        # Check if they played yesterday
        yesterday = today - datetime.timedelta(days=1)

        if user.last_active_date == yesterday:
            # They kept the streak alive!
            user.streak += 1
        else:
            # They missed a day (or are new), reset to 1
            user.streak = 1

        # Update the last active date to today
        user.last_active_date = today

    session.is_completed = True
    session.end_time = datetime.datetime.utcnow()
    db.session.commit()

    return jsonify({
        "correct": is_correct,
        "message": message,
        "xp_gained": xp_gained,
        "correct_diagnosis": session.disease.name
    })

@app.route("/auth/profile", methods=["GET"])
@jwt_required()
def get_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    # Calculate Stats
    completed_sessions = [s for s in user.sessions if s.is_completed]
    total_cases = len(completed_sessions)
    correct_cases = len([s for s in completed_sessions if s.was_correct])

    accuracy = 0
    if total_cases > 0:
        accuracy = int((correct_cases / total_cases) * 100)

    # Get list of earned badge names
    earned_badge_names = [b.badge_name for b in user.badges]

    rank = User.query.filter(User.xp > user.xp).count() + 1
    return jsonify({
        "username": user.username,
        "role": user.role,
        "xp": user.xp,
        "cases_completed": total_cases,
        "accuracy": accuracy,
        "streak": user.streak,
        "last_active_date": user.last_active_date.isoformat() if user.last_active_date else None,
        "earned_badges": earned_badge_names,
        "rank": rank
    })

@app.route("/auth/leaderboard", methods=["GET"])
def get_leaderboard():
    # Get top 50 users sorted by XP
    top_users = User.query.order_by(User.xp.desc()).limit(50).all()

    leaderboard_data = []
    for index, u in enumerate(top_users):
        leaderboard_data.append({
            "id": u.id,
            "username": u.username,
            "xp": u.xp,
            "streak": u.streak,
            "rank": index + 1,
            # Calculate level just for display (XP / 1000 + 1)
            "level": int(u.xp / 1000) + 1
        })

    return jsonify(leaderboard_data)

# Update Profile (Username & Role)
@app.route("/auth/update-profile", methods=["PUT"])
@jwt_required()
def update_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    data = request.get_json()

    new_username = data.get("username", "").strip()
    new_role = data.get("role", "").strip()

    if new_username:
        # Check if taken (unless it's their own)
        existing = User.query.filter_by(username=new_username).first()
        if existing and existing.id != user.id:
            return jsonify({"error": "Username already taken"}), 409
        user.username = new_username

    if new_role:
        user.role = new_role

    db.session.commit()
    return jsonify({"message": "Profile updated successfully"})

# Change Password
@app.route("/auth/change-password", methods=["PUT"])
@jwt_required()
def change_password():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    data = request.get_json()

    current_pw = data.get("current_password", "")
    new_pw = data.get("new_password", "")

    if not check_password_hash(user.password_hash, current_pw):
        return jsonify({"error": "Current password incorrect"}), 401

    if len(new_pw) < 4:
        return jsonify({"error": "New password too short"}), 400

    user.password_hash = generate_password_hash(new_pw)
    db.session.commit()
    return jsonify({"message": "Password changed successfully"})

# --- INITIALIZATION ---
if __name__ == "__main__":
    with app.app_context():
        # This creates the new tables defined above
        db.create_all()
        
        # Seed Diseases if not present
        if DISEASE_DATA and not Disease.query.first():
            print("Seeding database with diseases...")
            for d in DISEASE_DATA:
                db.session.add(Disease(name=d["name"], system_prompt=d["prompt"]))
            db.session.commit()
            print("Seeding complete.")
            
    # Start the Server
    print("Starting DentalSim Backend on port 8000...")
    app.run(host="0.0.0.0", port=8000, debug=True)