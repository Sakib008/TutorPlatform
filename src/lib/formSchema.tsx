import {z} from "zod";


export const loginSchema = z.object({
    email: z.email().trim(),
    password: z.string().min(6, "Password must be at least 6 characters long"),
})

export const registerSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters long"),
    email: z.email().trim(),
    password: z.string().min(6, "Password must be at least 6 characters long"),
})

export const sessionSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters long"),
    description : z.string().min(3, "Description must be at least 3 characters long").optional(),
})

export const videoSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters long"),
    description: z.string().min(3, "Description must be at least 3 characters long").optional(),
    file: z.instanceof(File) ,
    sessionId: z.string(),
})