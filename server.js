const express = require('express');
const app = express();
// Middleware to parse incoming JSON requests
app.use(express.json());
const PORT = process.env.PORT || 3000;
const sqlite3 = require('sqlite3').verbose();
const ALLOWED_STATUSES = ["not started", "in progress", "completed", "cancelled"];
const ALLOWED_PRIORITIES = ["low", "medium", "high"];
const db = new sqlite3.Database('./taskflow.db', (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.run(`CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL, 
            description TEXT, 
            status TEXT, 
            priority TEXT, 
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('Error creating table', err.message);
            } else {
                console.log('Tasks table ready.');
            }

        });
    }
});

app.post('/tasks', (req, res) => {
    const title = req.body?.title;
    const status = req.body?.status;
    const priority = req.body?.priority ?? "medium";
    const description = req.body?.description;
    const query = `INSERT INTO tasks (title, description, status, priority) VALUES (?, ?, ?, ?)`;

    if (typeof title !== 'string') {
        res.status(400).json({message: "Error, title input type is not string type."});
        return;
    } 
    if (title.trim() === '') {
        res.status(400).json({message: "Error, title input is blank"});
        return;
    }
    if (!ALLOWED_STATUSES.includes(status)) {
        res.status(400).json({message: `Error, status is not an option. Available options: ${ALLOWED_STATUSES.join(', ')}`});
        return;
    }
    if (!ALLOWED_PRIORITIES.includes(priority)) {
        res.status(400).json({message: `Error, priorities is not an option. Available options: ${ALLOWED_PRIORITIES.join(', ')}`});
        return;
    }
    if (description !== undefined && typeof description !== 'string') {
        res.status(400).json({message: "Error, description input is not string type."});
        return;
    }


    const parameters = [title.trim(), description, status, priority];

    db.run(query, parameters, function(err) {
    if (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message});
    } else {
        res.status(201).json({id: this.lastID, message: "Task created successfully"});
    }}
    )
});

// A simple test route
app.get('/', (req, res) => {
    res.json({ message: "Welcome to TaskFlow API! Server is running successfully." });
});

app.get('/tasks', (req, res) => {
    const query = `SELECT * FROM tasks`
    db.all(query, [], (err, tasks) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({error: err.message});
        } else {
            res.status(200).json({tasks, count: tasks.length})
        }
    });
})

// Start the server
app.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
});

