// pages/api/rpc.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // const response = await fetch("https://eth.merkle.io/", {
  //   method: req.method,
  //   headers: { "Content-Type": "application/json" },
  //   body: req.method === "POST" ? JSON.stringify(req.body) : undefined,
  // });
  
  // const data = await response.text();
  // res.setHeader("Content-Type", "application/json");
  // res.status(response.status).send(data);
}
