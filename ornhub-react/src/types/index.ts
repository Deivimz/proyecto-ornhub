// src/types/index.ts

export interface Comment {
  text: string;
  user: string;
  userEmail: string;
  timestamp: string;
}

export interface Modulo {
  id?: string;
  titulo: string;
  imagen: string;
  link: string;
  autor: string;
  autorEmail: string;
  views: number;
  likes: number;
  dislikes: number;
  likedBy: string[];
  dislikedBy: string[];
  comments: Comment[];
}
