import * as express from "express";
import * as cors from "cors";

const app = express();
app.use(cors({credentials: true}));
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/", async (req: express.Request, res: express.Response) => {
  res.send({
    status: {
      app: "ok",
    },
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});