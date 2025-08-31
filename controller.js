const Task = require('../models/task');

const validStatuses = ['pending', 'in-progress', 'completed'];

// Create a new task
exports.createTask = async (req, res) => {
    try {
        const { title, description, status } = req.body;

        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }

        const task = await Task.create({ title, description, status });
        res.status(201).json(task);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get tasks with optional search and filter
exports.getTasks = async (req, res) => {
    const { keyword, status, page = 1, limit = 10 } = req.query;
    const query = {};

    if (keyword) {
        query.$or = [
            { title: { $regex: keyword, $options: 'i' } },
            { description: { $regex: keyword, $options: 'i' } }
        ];
    }

    if (status && validStatuses.includes(status)) {
        query.status = status;
    }

    try {
        const tasks = await Task.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update a task
exports.updateTask = async (req, res) => {
    try {
        const { status } = req.body;

        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }

        const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json(task);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Delete a task
exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json({ message: 'Task deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};