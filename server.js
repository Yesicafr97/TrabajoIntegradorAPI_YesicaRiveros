const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;

app.use(express.json());


const MONGODB_URI = 'mongodb://localhost:27017/tasksdb'; 
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Conexión a MongoDB exitosa'))
.catch(err => console.error('Error de conexión a MongoDB:', err));

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true, 
    trim: true 
  },
  description: {
    type: String,
    trim: true
  },
  prioridad: {
    type: String,
    enum: ['alta', 'media', 'baja'], 
    default: 'media'
  },
  completed: {
    type: Boolean,
    default: false
  },
  
  dueDate: {
    type: Date,
    required: true
  }
}, {
  timestamps: true 
});


const Task = mongoose.model('Task', taskSchema);

app.post('/tasks', async (req, res) => {
  try {
    const newTask = new Task(req.body);
    const savedTask = await newTask.save();
    res.status(201).json(savedTask); 
  } catch (error) {
    res.status(400).json({ message: 'Error al crear la tarea', error: error.message });
  }
});

app.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.status(200).json(tasks); 
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las tareas', error: error.message });
  }
});

app.get('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la tarea', error: error.message });
  }
});


app.put('/tasks/:id', async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedTask) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }
    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar la tarea', error: error.message });
  }
});

app.delete('/tasks/:id', async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }
    res.status(200).json({ message: 'Tarea eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la tarea', error: error.message });
  }
});

app.put('/tasks/complete/:id', async (req, res) => {
  try {
    const completedTask = await Task.findByIdAndUpdate(req.params.id, { completed: true }, { new: true });
    if (!completedTask) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }
    res.status(200).json({ message: 'Tarea marcada como completada', task: completedTask });
  } catch (error) {
    res.status(500).json({ message: 'Error al marcar la tarea como completada', error: error.message });
  }
});

app.get('/tasks/by-priority/:priority', async (req, res) => {
  try {
    const priority = req.params.priority.toLowerCase();
    const tasks = await Task.find({ prioridad: priority });
    if (tasks.length === 0) {
      return res.status(404).json({ message: `No se encontraron tareas con prioridad '${priority}'` });
    }
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las tareas por prioridad', error: error.message });
  }
});

app.get('/tasks/due-soon/:days', async (req, res) => {
  try {
    const days = parseInt(req.params.days);
    if (isNaN(days) || days < 0) {
      return res.status(400).json({ message: 'El número de días debe ser un número positivo' });
    }

    const now = new Date();
    const dueDateLimit = new Date();
    dueDateLimit.setDate(now.getDate() + days);

    const tasks = await Task.find({ dueDate: { $gte: now, $lte: dueDateLimit } }).sort({ dueDate: 1 });

    if (tasks.length === 0) {
      return res.status(404).json({ message: `No se encontraron tareas que venzan en los próximos ${days} días` });
    }

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las tareas próximas a vencer', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor de tareas escuchando en http:\\localhost:${PORT}`);
});