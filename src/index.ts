import express from "express";
import authRoutes from "./routes/userRoutes";
import documentRoutes from "./routes/documentRoutes";
import tagRoutes from "./routes/tagRoutes";
import downloadRoutes from "./routes/downloadRoutes";
import searchRoute from "./routes/searchRoute";
import permissionRoutes from "./routes/permissionRoutes";

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/api/users", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/downloads", downloadRoutes);
app.use("/api/search", searchRoute);
app.use("/api/permissions", permissionRoutes);

export default app; 
