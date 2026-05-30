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
const console = require("node:console");
const { verify } = require("node:crypto");
const { createRemoteJWKSet, jwtVerify } = require("jose-cjs");
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
// jwt
const JWKS =createRemoteJWKSet(new URL("http://localhost:3000/api/auth/jwks"))
const verifyToken = async (req,res,next)=>{
   const authHeader = req?.headers.authorization;
   if(!authHeader){
    res.status(401).json({message:"unauthorise"})
   }
   const token = authHeader.split(' ')[1]
   if(!token){
     res.status(401).json({message:"unauthorise"})
   }

   try{
    const {payload} = await jwtVerify(token,JWKS)
    console.log(payload)
    next()

  }catch(error){
    return res.status(403).json({message:"Forbidden"})
  };

}

async function run() {
  try {
    await client.connect();

    const db = client.db("pawhaven");
    const pawhavenCullaction = db.collection('pets');
    const AdoptionCullaction = db.collection('adoptions');


    app.get("/pets", async (req, res) => {
      const result = await pawhavenCullaction.find().toArray()
      res.json(result)
    });
  //midlewar
    app.get('/pets/:id',verifyToken, async (req, res) => {
      const id = req.params.id;
      const result = await pawhavenCullaction.findOne({ _id: new ObjectId(id) })
      res.json(result);
    });
    
    app.post('/pets',verifyToken, async (req, res) => {
      const petData = req.body;
      console.log(petData)
    
      const result = await pawhavenCullaction.insertOne(petData);
      res.json(result)
    });


       app.patch('/pets/:id', async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;
      console.log(updatedData)
      const result = await pawhavenCullaction.updateOne({ _id: new ObjectId(id) },{$set:updatedData})
      res.json(result)
    })
     
       app.delete('/pets/:id',verifyToken, async (req, res) => {
      const id = req.params.id;
      const result = await pawhavenCullaction.deleteOne({ _id: new ObjectId(id)});
      res.json(result)
    });
    
       app.delete('/adoptions/:id',verifyToken,async (req, res) => {
      const id = req.params.id;
      const result = await AdoptionCullaction.deleteOne({ _id: new ObjectId(id)});
      res.json(result)
    });


    
    app.get("/adoptions", async (req, res) => {
      const result = await AdoptionCullaction.find().toArray()
      res.json(result);
    });

     app.get('/adoptions/:userId', async (req, res) => {
      const userId = req.params.userId;
      const result = await AdoptionCullaction.find({userId:userId}).toArray()
      res.json(result);
    });
// middlewar
    app.post('/adoptions',verifyToken, async (req, res) => {
  const adoptionData = req.body;
  console.log(adoptionData)
 
  const result = await AdoptionCullaction.insertOne(adoptionData);
  res.json(result)
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