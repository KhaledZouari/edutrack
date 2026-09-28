export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Administrateur',
  TEACHER: 'Enseignant',
  STUDENT: 'Etudiant',
};
