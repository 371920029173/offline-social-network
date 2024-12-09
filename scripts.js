const db = window.indexedDB.open('socialNetworkDB', 1);

db.onsuccess = function(event) {
    const database = event.target.result;
    loadMessages(database);
};

db.onerror = function(event) {
    console.error('Database error:', event.target.errorCode);
};

db.onupgradeneeded = function(event) {
    const database = event.target.result;
    const objectStore = database.createObjectStore('messages', { keyPath: 'id', autoIncrement: true });
    objectStore.createIndex('timestamp', 'timestamp', { unique: false });
};

function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    if (message) {
        const transaction = db.result.transaction(['messages'], 'readwrite');
        const objectStore = transaction.objectStore('messages');
        const request = objectStore.add({ message: message, timestamp: new Date().getTime() });
        request.onsuccess = function() {
            messageInput.value = '';
            loadMessages(db.result);
        };
    }
}

function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const transaction = db.result.transaction(['messages'], 'readwrite');
            const objectStore = transaction.objectStore('messages');
            const request = objectStore.add({ file: e.target.result, timestamp: new Date().getTime() });
            request.onsuccess = function() {
                fileInput.value = '';
                loadMessages(db.result);
            };
        };
        reader.readAsDataURL(file);
    }
}

function loadMessages(database) {
    const messagesDiv = document.getElementById('messages');
    messagesDiv.innerHTML = '';
    const transaction = database.transaction(['messages'], 'readonly');
    const objectStore = transaction.objectStore('messages');
    const request = objectStore.openCursor();
    request.onsuccess = function(event) {
        const cursor = event.target.result;
        if (cursor) {
            const messageDiv = document.createElement('div');
            if (cursor.value.file) {
                const img = new Image();
                img.src = cursor.value.file;
                messageDiv.appendChild(img);
            } else {
                messageDiv.textContent = cursor.value.message;
            }
            messagesDiv.appendChild(messageDiv);
            cursor.continue();
        }
    };
}