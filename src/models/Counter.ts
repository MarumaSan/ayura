import mongoose from 'mongoose';

const CounterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
});

if (mongoose.models.Counter) {
    delete mongoose.models.Counter;
}

export const Counter = mongoose.model('Counter', CounterSchema);
