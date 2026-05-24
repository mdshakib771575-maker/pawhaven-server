const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require('express')
const app = express();
const dotenv = require("dotenv")
const cors = require('cors')
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json())

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
dotenv.config();
const uri = process.env.MONGODB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();

    const db = client.db("pawhaven");
    const destinationCullaction = db.collection('pets');


    app.get("/pets", async (req, res) => {
      const result = await destinationCullaction.find().toArray()
      res.json(result)
    });

    app.get('/pets/:id', async (req, res) => {
      const id = req.params.id;
      const result = await destinationCullaction.findOne({ _id: new ObjectId(id) })
      res.json(result);
    });
 


  
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World')
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})