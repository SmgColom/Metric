// PATH: localhost:3000/api/articles
import connectMongo from "@/lib/mongodb/connectMongo";

async function articleApi(req, res){
  try {
    // Connect to the db
    await connectMongo();
    res.send("Testing 1,2,3...");

    // DIFFERENT HTTP METHODS = CREATE DIFFERENT ENDPOINTS
    // GET: Get all articles


    // *NEW* - POST: Add new articles to the db

  } catch(error){
    throw new Error(`Unsupported HTTP method: ${req.method}`);
  }
}

export default articleApi;