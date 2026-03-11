import { useState, useEffect } from "react";
import axios from "axios";

export interface PatientDetail {
  id: number;
  fullName: string;
  thaiId: string;
  phoneNumber: string;
  birthdate: string;
  gender: string;
  bloodGroup: string;
  chronicDisease: string | null;
}

export function usePatientDetail(patientId: number | null) {
  const [patient, setPatient] = useState<PatientDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!patientId || patientId <= 0) {
      setPatient(null);
      return;
    }
    setLoading(true);
    axios
      .get(`/api/treatment/med-assist/patient/${patientId}`)
      .then((r) => setPatient(r.data?.data || null))
      .catch(() => setPatient(null))
      .finally(() => setLoading(false));
  }, [patientId]);

  return { patient, loading };
}

export function getAge(birthdate: string): string {
  const dob = new Date(birthdate);
  if (isNaN(dob.getTime())) return "-";
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return `${age} ปี`;
}

export function formatGender(g: string) {
  return g === "MALE" ? "ชาย" : g === "FEMALE" ? "หญิง" : g || "-";
}
