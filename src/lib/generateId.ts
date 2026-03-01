import { Counter } from '@/models/Counter';

/**
 * Generates a sequential ID with a given prefix.
 * Example: generateSequentialId('userId', 'usr') -> 'usr-001'
 * 
 * @param sequenceName The unique name for this counter in the DB (e.g., 'userId')
 * @param prefix The prefix to prepend to the number (e.g., 'usr')
 * @param padding The number of digits to pad with zeros (default: 3)
 * @returns A promise that resolves to the formatted sequential ID string.
 */
export async function generateSequentialId(sequenceName: string, prefix: string, padding: number = 3): Promise<string> {
    const counter = await Counter.findByIdAndUpdate(
        sequenceName,
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );

    // Pad the sequence number with leading zeros
    const paddedSeq = String(counter.seq).padStart(padding, '0');
    return `${prefix}-${paddedSeq}`;
}
