from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///diary.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Модель заметки
class Note(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.String(20), nullable=False)  # формат: "dd.mm.yyyy hh:mm"
    text = db.Column(db.Text, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'date': self.date,
            'text': self.text
        }

@app.before_first_request
def create_tables():
    db.create_all()

# Главная страница (отдаёт index.html)
@app.route('/')
def index():
    return render_template('index.html')

# API: Получение заметок с фильтрацией по дате или поиском
@app.route('/api/notes', methods=['GET'])
def get_notes():
    date_filter = request.args.get('date')
    search_query = request.args.get('search')
    
    query = Note.query
    
    if date_filter:
        # Фильтр по дате (только дата без времени)
        notes = query.filter(Note.date.like(f"{date_filter}%")).all()
    elif search_query:
        notes = query.filter(Note.text.ilike(f"%{search_query}%")).all()
    else:
        notes = query.all()
    
    return jsonify([note.to_dict() for note in notes])

# API: Добавление новой заметки
@app.route('/api/notes', methods=['POST'])
def add_note():
    data = request.json
    text = data.get('text')
    
    if not text:
        return jsonify({'error': 'Нет текста'}), 400
    
    now = datetime.now()
    date_str = now.strftime("%d.%m.%Y %H:%M")
    
    new_note = Note(date=date_str, text=text)
    
    try:
        db.session.add(new_note)
        db.session.commit()
        return jsonify(new_note.to_dict()), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# API: Удаление заметки по ID
@app.route('/api/notes/<int:note_id>', methods=['DELETE'])
def delete_note(note_id):
    note = Note.query.get_or_404(note_id)
    
    try:
        db.session.delete(note)
        db.session.commit()
        return jsonify({'message': 'Заметка удалена'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# API: Редактирование заметки по ID
@app.route('/api/notes/<int:note_id>', methods=['PUT'])
def edit_note(note_id):
    note = Note.query.get_or_404(note_id)
    data = request.json
    new_text = data.get('text')
    
    if not new_text:
        return jsonify({'error': 'Нет текста'}), 400
    
    note.text = new_text
    
    try:
        db.session.commit()
        return jsonify(note.to_dict())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Обслуживание статических файлов (если нужно)
@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory(os.path.join(app.root_path, 'static'), path)

if __name__ == '__main__':
    app.run(debug=True)