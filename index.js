/** @format */

const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send({ status: true, message: "Server is running" });
});

const uri = process.env.URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const bannerCollection = client.db("foodGarden").collection("bannerImage");
    const menuCollection = client.db("foodGarden").collection("menuList");
    const foodCollection = client.db("foodGarden").collection("foodList");
    const orderCollection = client.db("foodGarden").collection("orders");

    app.get("/banner", async (req, res) => {
      const banners = await bannerCollection.find().toArray();

      res.send(banners);
    });

    app.get("/menu", async (req, res) => {
      const menus = await menuCollection.find().toArray();

      res.send(menus);
    });

    app.get("/food/:category", async (req, res) => {
      const category = req.params.category;
      const query = { foodCategory: category };
      const foods = await foodCollection.find(query).toArray();
      res.send(foods);
    });

    app.get("/foods", async (req, res) => {
      const foods = await foodCollection.find().toArray();
      res.send(foods);
    });

    //order routes
    app.get("/orders", async (req, res) => {
      const orders = await orderCollection.find().toArray();

      res.send(orders);
    });

    app.post("/orders/:id", async (req, res) => {
      const orderedFood = req.body;
      const id = req.params.id;
      const query = {
        foodId: id,
      };
      const existingOrder = await orderCollection.findOne(query);

      if (existingOrder) {
        return res.send({ message: "Already added" });
      }

      const ordered = await orderCollection.insertOne(orderedFood);
      res.send(ordered);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server is running on Port ${port}`);
});
