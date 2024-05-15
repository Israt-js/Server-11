const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;
const corsOptions = {
    origin:['http://localhost:5173', 'http://localhost:5174', 'bjet-11-fc192.web.app'],
    credentials: true,
    optionSuccessStatus: 200,
}
app.use(cors(corsOptions));
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.BD_PASS}@cluster0.8ibeotr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // Connect the client to the server	(optional starting in v4.7)
    const data = client.db("createAssignmentDB");
    const assignCollection = data.collection("assignData")

    app.get('/createAssign', async(req, res) => {
        const cursor = assignCollection.find();
        const result = await cursor.toArray();
        res.send(result)
      })

      app.post('/createAssign', async (req, res) => {
        try {
            const assignData = req.body;
            const result = await assignCollection.insertOne(assignData);
            res.json({ insertedId: result.insertedId });
        } catch (error) {
            console.error('Error creating assignment:', error);
            res.status(500).json({ error: 'Error creating assignment' });
        }
    });

    app.get('/createAssign/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await assignCollection.findOne(query);
      res.send(result)
    } )

    app.get('/createAssign/:_id', async (req, res) => {
      const { _id } = req.params;
      try {
        const result = await assignCollection.findOne({ _id: new ObjectId(_id) });
        if (!result) {
          return res.status(404).json({ message: 'not found' });
        }
        res.json(result);
      } catch (error) {
        console.error('Error fetching :', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    });

    app.put('/createAssign/:id', async (req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const options = {upsert:true}
      const update = req.body;
      const assign = {
        $set:{
          title:update.title,
          description:update.description,
          marks:update.marks,
          thumbnailUrl:update.thumbnailUrl,
          difficulty:update.difficulty
        }
      
      }
      const result = await assignCollection.update(filter, assign, options);
      res.send(result)
      })
      app.delete('/createAssign/:id', async (req, res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await assignCollection.deleteOne(query);
        res.send(result)
      })
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('make server')
})
app.listen(port, ()=>{
    console.log('server is running')
})
