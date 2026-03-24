import { db } from '../firebase';
import { collection, addDoc, getDocs, query, where, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export interface PatientRecord {
  id?: string;
  doctorId: string;
  patientName: string;
  age: string;
  gender: string;
  phone: string;
  scanDate: string;
  tumorDetected: boolean;
  tumorType?: string;
  confidence?: number;
  notes: string;
  createdAt?: string;
}

// Save patient record
export const savePatientRecord = async (record: PatientRecord): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'patients'), {
      ...record,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving patient:', error);
    return '';
  }
};

// Get all patients for a specific doctor
export const getDoctorPatients = async (doctorId: string): Promise<PatientRecord[]> => {
  try {
    const q = query(
      collection(db, 'patients'),
      where('doctorId', '==', doctorId)
    );
    const snapshot = await getDocs(q);
    const records = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as PatientRecord));
    // Sort by createdAt descending in JS (no composite index needed)
    return records.sort((a, b) =>
      new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
    );
  } catch (error) {
    console.error('Error fetching patients:', error);
    return [];
  }
};

// Update patient notes
export const updatePatientNotes = async (patientId: string, notes: string) => {
  try {
    await updateDoc(doc(db, 'patients', patientId), { notes });
  } catch (error) {
    console.error('Error updating notes:', error);
  }
};

// Delete patient record
export const deletePatientRecord = async (patientId: string) => {
  try {
    await deleteDoc(doc(db, 'patients', patientId));
  } catch (error) {
    console.error('Error deleting patient:', error);
  }
};