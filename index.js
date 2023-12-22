const express = require('express');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6oh3q2n.mongodb.net/?retryWrites=true&w=majority`;

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
    // await client.connect();
    // Send a ping to confirm a successful connection
    
    const userCollection = client.db('taskDb').collection('users');
    const postCollection = client.db('taskDb').collection('posts');
    const postsCollection = client.db('taskDb').collection('previousTask');

    //user related api
    app.post('/users',  async(req, res) =>{
        const user = req.body;
        
        const query = { email: user.email}
        const existingUser = await userCollection.findOne(query);
        if(existingUser){
        return res.send({ message: 'user already exists', insertedId: null})
        }
        const result = await userCollection.insertOne(user);
        // console.log('user data', result)

        res.send(result);
    });

    app.get('/users',  async(req, res) =>{
        const result = await userCollection.find().toArray();
        res.send(result);
      });

      // post related api
    app.post('/posts', async(req, res) =>{
        const post = req.body;
        const result = await postCollection.insertOne(post);
        res.send(result);
      });

      app.get('/posts', async(req, res) =>{
        const result = await postCollection.find().toArray();
        res.send(result);
      });

      app.get('/previousTask', async(req, res) =>{
        const result = await postsCollection.find().toArray();
        res.send(result);
      });

      app.put('/posts/:id', async(req, res) => {
        const id = req.params.id;
        const filter = {_id: new ObjectId(id)}
        const options = {upsert: true};
        const updatedTask = req.body;
        
        const task = {
          $set: {
            name: updatedTask.title, 
            brand_name: updatedTask.description, 
            type: updatedTask.deadlines, 
            price: updatedTask.priority, 
          }
        }
  
        const result = await postCollection.updateOne(filter, task, options)
        res.send(result); 
      })

      app.delete('/posts/:id', async(req, res) =>{
        const id = req.params.id;
        const query = { _id: new ObjectId(id)};
        const result = await postCollection.deleteOne(query);
        res.send(result);
      })
    
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req,res) =>{
    res.send('task server is running')
})

app.listen(port, () =>{
    console.log(`task server running on the port ${port}`)
})