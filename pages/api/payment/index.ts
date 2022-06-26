import { MongoClient } from "mongodb";
import type { NextApiRequest, NextApiResponse } from "next";
import { PaymentFields, PaymentResponse } from "../../../interfaces/payment";

const client = new MongoClient("mongodb://root:example@mongo:27017");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PaymentResponse | { error: string }>
) {
  switch (req.method) {
    case "POST":
      try {
        const body: PaymentFields = req.body;

        await client.connect();
        const payments = client.db().collection("payments");
        const payment = await payments.insertOne(body);
        client.close();

        res.status(200).json({
          requestId: payment.insertedId.toString(),
          amount: Number(body.amount),
        });
        break;
      } catch (error) {
        res.status(500).json({ error: String(error) });
        break;
      }
    default:
      res.status(405).end();
      break;
  }
}
