document.addEventListener('DOMContentLoaded', function() {
const noteTextarea = document.getElementById('note-text');
const saveButton = document.getElementById('save-button');
const entriesDiv = document.getElementById('entries');
const dateFilterInput = document.getElementById('date-filter');
const filterButton = document.getElementById('filter-button');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const sortSelect = document.getElementById('sort-select'); // Добавляем элемент выбора сортировки

    // Загрузка существующих записей из localStorage при загрузке страницы
    loadEntries();

    saveButton.addEventListener('click', function() {
        const note = noteTextarea.value;

        if (note.trim() !== '') {
            saveEntry(note);
            noteTextarea.value = ''; // Очистить поле ввода
        }
    });

    filterButton.addEventListener('click', function() {
        const selectedDate = dateFilterInput.value;
        filterEntriesByDate(selectedDate);
    });

    searchButton.addEventListener('click', function() {
        const searchTerm = searchInput.value.toLowerCase();
        searchEntries(searchTerm);
    });

    // Обработчик события для сортировки
    sortSelect.addEventListener('change', function() {
        const sortOrder = sortSelect.value;
        sortEntries(sortOrder);
    });

    function saveEntry(note) {
        const now = new Date();
        const dateString = formatDate(now);
        const entry = { date: dateString, text: note };

        let entries = JSON.parse(localStorage.getItem('diaryEntries') || '[]');
        entries.push(entry);
        try {
            localStorage.setItem('diaryEntries', JSON.stringify(entries));
        } catch (e) {
            console.error("Ошибка сохранения в localStorage:", e); // Обработка ошибок localStorage
            alert("Не удалось сохранить запись.  Возможно, localStorage заполнен.");
            return;
        }

        displayEntry(entry);
    }

     function displayEntry(entry) {
         const entryDiv = document.createElement('div');
         entryDiv.classList.add('entry');

         const dateDiv = document.createElement('div');
         dateDiv.classList.add('date');
         dateDiv.textContent = entry.date;

         const textDiv = document.createElement('div');
         textDiv.textContent = entry.text;

         const editButton = document.createElement('button');
         editButton.textContent = 'Редактировать';
         editButton.classList.add('edit-button'); // Добавляем класс

         editButton.addEventListener('click', function() {
             noteTextarea.value = entry.text; // Заполняем текстовое поле для редактирования
             deleteEntry(entry); // Удаляем старую запись
             entryDiv.remove(); // Удаляем запись из интерфейса
         });

         const deleteButton = document.createElement('button');
         deleteButton.textContent = 'Удалить';
         deleteButton.classList.add('delete-button'); // Добавляем класс

         deleteButton.addEventListener('click', function() {
             if (confirm("Вы уверены, что хотите удалить эту запись?")) { // Добавляем подтверждение
                 deleteEntry(entry);
                 entryDiv.remove();
             }
         });

         entryDiv.appendChild(dateDiv);
         entryDiv.appendChild(textDiv);
         entryDiv.appendChild(editButton);
         entryDiv.appendChild(deleteButton);

         entriesDiv.prepend(entryDiv);
     }

     function deleteEntry(entryToDelete) {
       let entries = JSON.parse(localStorage.getItem('diaryEntries') || '[]');
       entries = entries.filter(entry => !(entry.date === entryToDelete.date && entry.text === entryToDelete.text));
       try {
            localStorage.setItem('diaryEntries', JSON.stringify(entries));
       } catch (e) {
            console.error("Ошибка сохранения в localStorage:", e);
            alert("Не удалось удалить запись.  Возможно, localStorage заполнен.");
       }
     }

     function loadEntries() {
       try {
            const entries = JSON.parse(localStorage.getItem('diaryEntries') || '[]');
            entries.forEach(entry => displayEntry(entry));
       } catch (e) {
            console.error("Ошибка загрузки из localStorage:", e);
            alert("Не удалось загрузить записи из localStorage.");
       }
     }

     function formatDate(date) {
       const day = String(date.getDate()).padStart(2, '0');
       const month = String(date.getMonth() + 1).padStart(2, '0');
       const year = date.getFullYear();
       const hours = String(date.getHours()).padStart(2, '0');
       const minutes = String(date.getMinutes()).padStart(2, '0');

       return `${day}.${month}.${year} ${hours}:${minutes}`;
     }

    function filterEntriesByDate(selectedDate) {
        entriesDiv.innerHTML = ''; // Очистить текущие записи

        let entries = JSON.parse(localStorage.getItem('diaryEntries') || '[]');
        const filteredEntries = entries.filter(entry => {
            // Сравниваем только дату (без времени)
            const entryDate = new Date(entry.date.split(' ')[0].split('.').reverse().join('-'));
            const filterDate = new Date(selectedDate);

            return (
                entryDate.getFullYear() === filterDate.getFullYear() &&
                entryDate.getMonth() === filterDate.getMonth() &&
                entryDate.getDate() === filterDate.getDate()
            );
        });

        filteredEntries.forEach(entry => displayEntry(entry));
    }

    function searchEntries(searchTerm) {
        entriesDiv.innerHTML = ''; // Очистить текущие записи

        let entries = JSON.parse(localStorage.getItem('diaryEntries') || '[]');
        const filteredEntries = entries.filter(entry => {
            return entry.text.toLowerCase().includes(searchTerm);
        });

        filteredEntries.forEach(entry => displayEntry(entry));
    }

    function sortEntries(sortOrder) {
        entriesDiv.innerHTML = ''; // Очистить текущие записи

        let entries = JSON.parse(localStorage.getItem('diaryEntries') || '[]');

        entries.sort((a, b) => {
            const dateA = parseDate(a.date);
            const dateB = parseDate(b.date);

            if (sortOrder === 'newest') {
                return dateB.getTime() - dateA.getTime(); // От новых к старым
            } else {
                return dateA.getTime() - dateB.getTime(); // От старых к новым
            }
        });

        entries.forEach(entry => displayEntry(entry));
    }

    function parseDate(dateString) {
        const parts = dateString.split(/\.| /); // Разделяем дату и время
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Месяцы в JavaScript начинаются с 0
        const year = parseInt(parts[2], 10);
        const hours = parseInt(parts[3], 10);
        const minutes = parseInt(parts[4], 10);

        return new Date(year, month, day, hours, minutes);
    }
});

