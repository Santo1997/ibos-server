const express = require("express");
const {MongoClient, ServerApiVersion, ObjectId} = require("mongodb");
require("dotenv").config();
var cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qpcvbrd.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();

    const chairStore = client.db("iBOS").collection("chairs");
    const cartData = client.db("iBOS").collection("carts");

    app.get("/chairs", async (req, res) => {
      const result = await chairStore.find().toArray();
      res.send(result);
    });

    app.get("/carts", async (req, res) => {
      const result = await cartData.find().toArray();
      res.send(result);
    });

    app.post("/addCart", async (req, res) => {
      const cartItm = req.body;
      const query = {cartId: cartItm.cartId, user: cartItm.user};
      const existingCart = await cartData.findOne(query);
      if (existingCart) {
        return res.send(existingCart);
      }
      const result = await cartData.insertOne(cartItm);
      res.send(result);
    });

    app.put("/carts/:id", async (req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const option = {upsert: true};
      const updateCls = req.body;
      const setCls = {
        $set: {
          qty: updateCls.qty,
        },
      };

      const result = await cartData.updateOne(filter, setCls, option);
      res.send(result);
    });

    app.delete("/carts/:id", async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const toy = await cartData.deleteOne(query);
      res.send(toy);
    });

    await client.db("admin").command({ping: 1});
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello iBOS World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
