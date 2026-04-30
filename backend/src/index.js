import express from 'express';
import routes from "./routes/index.js";
import "dotenv/config";
import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { startEventListener } from "./services/eventListener.js";

await connectDB();


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.use("/api", routes);

const PORT = ENV.PORT;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

startEventListener();