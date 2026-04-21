export interface PublicUser {
  id: string;
  name: string;
  email: string;
  rollNo: string;
  department: string;
  hostelName: string;
  role: "student" | "admin";
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  rollNo: string;
  department: string;
  hostelName: string;
  passwordHash: string;
}
