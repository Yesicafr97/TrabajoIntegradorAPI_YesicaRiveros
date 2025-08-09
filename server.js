const express = require('express');
const mongoose = require('mongoose');


const app = express();
const PORT = 3000;

app.use(express.json());

const MONGODB_URI = 'mongodb://localhost:27017/tareasDB';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Conexión a MongoDB exitosa');
  })
  .catch(err => {
    console.error('Error de conexión a la base de datos:', err);
  });


const tareaSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: true,
  },
  descripcion: {
    type: String,
  },
  completada: {
    type: Boolean,
    default: false,
  },
});

const Tarea = mongoose.model('Tarea', tareaSchema);

app.get('/api/tareas', async (req, res) => {
  try {
    const tareas = await Tarea.find();
    res.json(tareas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/tareas', async (req, res) => {
  const tarea = new Tarea({
    titulo: req.body.titulo,
    descripcion: req.body.descripcion,
  });

  try {
    const nuevaTarea = await tarea.save();
    res.status(201).json(nuevaTarea);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


app.get('/api/tareas/:id', async (req, res) => {
  try {
    const tarea = await Tarea.findById(req.params.id);
    if (!tarea) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }
    res.json(tarea);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


app.put('/api/tareas/:id', async (req, res) => {
  try {
    const tarea = await Tarea.findById(req.params.id);
    if (!tarea) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }
    if (req.body.titulo != null) {
      tarea.titulo = req.body.titulo;
    }
    if (req.body.descripcion != null) {
      tarea.descripcion = req.body.descripcion;
    }
    if (req.body.completada != null) {
      tarea.completada = req.body.completada;
    }

    const tareaActualizada = await tarea.save();
    res.json(tareaActualizada);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/tareas/:id', async (req, res) => {
  try {
    const tarea = await Tarea.findById(req.params.id);
    if (!tarea) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }
    await tarea.deleteOne();
    res.json({ message: 'Tarea eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


app.listen(PORT, () => {
  console.log(`Servidor de tareas escuchando en http://localhost:${PORT}`);
});