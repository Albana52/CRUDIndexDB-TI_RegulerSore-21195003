document.addEventListener('DOMContentLoaded', function () {
    const request = indexedDB.open('StudentDB', 1);

    request.onupgradeneeded = function (e) {
        const db = e.target.result;

        if (!db.objectStoreNames.contains('students')) {
            db.createObjectStore('students', { keyPath: 'id', autoIncrement: true });
        }
    };

    request.onsuccess = function (e) {
        const db = e.target.result;

        document.getElementById('student-form').addEventListener('submit', function (event) {
            event.preventDefault();
            const name = document.getElementById('name').value;
            const nim = document.getElementById('nim').value;

            if (name.trim() === '' || nim.trim() === '') return;

            const transaction = db.transaction(['students'], 'readwrite');
            const store = transaction.objectStore('students');

            store.add({ name: name, nim: nim });

            transaction.oncomplete = function () {
                loadStudents();
                document.getElementById('name').value = '';
                document.getElementById('nim').value = '';
            };
        });

        document.getElementById('student-list').addEventListener('click', function (event) {
            if (event.target.tagName === 'BUTTON') {
                const id = parseInt(event.target.getAttribute('data-id'));
                const transaction = db.transaction(['students'], 'readwrite');
                const store = transaction.objectStore('students');

                store.delete(id);

                transaction.oncomplete = function () {
                    loadStudents();
                };
            }
        });

        document.getElementById('student-list').addEventListener('dblclick', function (event) {
            if (event.target.tagName === 'LI') {
                const id = parseInt(event.target.getAttribute('data-id'));
                const newName = prompt('Edit Name:', event.target.textContent.split(' - ')[0]);
                const newNIM = prompt('Edit NIM:', event.target.textContent.split(' - ')[1]);

                if (newName === null || newName.trim() === '' || newNIM === null || newNIM.trim() === '') return;

                const transaction = db.transaction(['students'], 'readwrite');
                const store = transaction.objectStore('students');

                store.get(id).onsuccess = function (e) {
                    const data = e.target.result;
                    data.name = newName;
                    data.nim = newNIM;
                    store.put(data);
                };

                transaction.oncomplete = function () {
                    loadStudents();
                };
            }
        });

        function loadStudents() {
            const transaction = db.transaction(['students'], 'readonly');
            const store = transaction.objectStore('students');
            const list = document.getElementById('student-list');

            list.innerHTML = '';

            store.openCursor().onsuccess = function (event) {
                const cursor = event.target.result;
                if (cursor) {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        ${cursor.value.name} - ${cursor.value.nim}
                        <button data-id="${cursor.value.id}">Delete</button>
                    `;
                    li.setAttribute('data-id', cursor.value.id);
                    list.appendChild(li);
                    cursor.continue();
                }
            };
        }

        loadStudents();
    };
});