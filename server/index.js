import express from "express"
import { BetterPay } from "better-pay"

const app = express();
app.use(express.json())
app.use(cors());

const provider = new BetterPay({
  provider: 'square',
  apiToken: process.env.API_TOKEN
});

app.post("/confirm", async (req, res) => {
  const { sourceId, amount, currency } = req.body;
  
  const response = await provider.confirmPayment({
    sourceId: sourceId,
    amount: amount,
    currency: currency
  });
  
  res.json({ message: response });
  
});


app.listen(4000, () => {
  console.log("running");
})