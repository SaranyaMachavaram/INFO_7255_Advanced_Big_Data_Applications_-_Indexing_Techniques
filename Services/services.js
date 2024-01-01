const Redis = require('ioredis');
const redis = new Redis();
require('dotenv').config();
const { Client } = require('@elastic/elasticsearch');

const esClient = new Client({
  node: 'http://localhost:9200', // Replace with your Elasticsearch URL
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME, // Use environment variables or replace with your actual credentials
    password: process.env.ELASTICSEARCH_PASSWORD,
  },
});

const { OAuth2Client } = require('google-auth-library');

const clientID = process.env.clientID 
const client = new OAuth2Client(clientID);

async function verifyIdToken(token) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: clientID, 
    });

    const payload = ticket.getPayload();
    console.log('User Info:', payload);
    return payload;
  } catch (error) {
    console.error('Failed to verify ID token:', error);
    throw error;
  }
}

function verifyToken(req, res, next) {
  const token = req.headers['authorization'];
  console.log(token)
  // if (!token || !token.startsWith('Bearer')) {
  //   return res.status(401).json({ message: 'Invalid authorization header' });
  // }
  // if (!token) {
  //   return res.status(401).json({ message: 'No access token provided' });
  // }

  verifyIdToken(token)
    .then(() => {
      next(); 
    })
    .catch((error) => {
      console.error('Token verification failed:', error);
      return res.status(403).json({ message: 'Invalid access token' });
    });
}

const createService = async (req, res) => {
  try {
    verifyToken(req, res, async () => {
      try {
        const newPlan = {
          planCostShares: req.body.planCostShares,
          linkedPlanServices: req.body.linkedPlanServices,
          _org: req.body._org,
          objectId: req.body.objectId,
          objectType: req.body.objectType,
          planType: req.body.planType,
          creationDate: req.body.creationDate
        };
      
        const planKey = `plan:${newPlan.objectId}`;
        const planExists = await redis.exists(planKey);
      
        if (planExists) {
          return res.status(400).json({
            message: "Plan data already exists in the database",
            existingKey: planKey,
          });
        } else {
          await redis.set(planKey, JSON.stringify(newPlan));
          return res.status(201).json(newPlan);
        }
      } catch (err) {
        console.log("error:", err);
        return res.status(400).json({ error: err.message });
      }
    });
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(403).json({ message: 'Invalid access token' });
  }
};


const getService = async (req, res) => {
  try {
    const keys = await redis.keys('plan:*');
    const plans = await redis.mget(...keys);
    const parsedPlans = plans.map((plan) => JSON.parse(plan));
    res.status(200).json(parsedPlans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const patchService = async (req, res) => {
  try {
    const oldObjectId = req.params.objectId;
    const planKey = `plan:${oldObjectId}`;
    const existingPlan = await redis.get(planKey);

    if (!existingPlan) {
      return res.status(404).json({
        message: "Plan data doesn't exist in the database",
      });
    }

    const updatedFields = req.body;
    let updatedPlan = JSON.parse(existingPlan);

    if (updatedFields.planCostShares !== undefined) {
      updatedPlan.planCostShares = updatedFields.planCostShares;
    }
    if (updatedFields.linkedPlanServices !== undefined) {
      updatedPlan.linkedPlanServices = updatedFields.linkedPlanServices;
    }


    const newObjectId = updatedFields.objectId || oldObjectId;

    if (newObjectId !== oldObjectId) {
    
      const newPlanKey = `plan:${newObjectId}`;
      await redis.set(newPlanKey, JSON.stringify(updatedPlan));
      await redis.del(planKey);

      updatedPlan = { ...updatedPlan, objectId: newObjectId };
    } else {
      await redis.set(planKey, JSON.stringify(updatedPlan));
    }

    const responsePlan = { ...updatedPlan, objectId: newObjectId };
    return res.status(200).json(responsePlan);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const mergeService = async (req, res) => {
  const objectId = req.params.objectId; 
  const planKey = `plan:${objectId}`;
  const existingPlan = await redis.get(planKey);

  if (!existingPlan) {
      return res.status(404).json({
          message: "Plan data doesn't exist in the database",
      });
  }

  const newData = req.body;

  console.log(newData)
  
  let mergedPlan = JSON.parse(existingPlan);

  mergedPlan = { ...mergedPlan, ...newData };

  console.log(mergedPlan)

  await redis.set(planKey, JSON.stringify(mergedPlan));

  return res.status(200).json(mergedPlan);
};


const deleteService = async (req, res) => {
  try {
    const objectId = req.params.objectId;

    const planExists = await redis.exists(`plan:${objectId}`);

    if (planExists) {
      await redis.del(`plan:${objectId}`);
      return res.status(200).json({ message: 'Plan deleted successfully' });
    } else {
      return res.status(404).json({
        message: "Cannot delete as plan data doesn't exist in the database",
      });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


// Generate a unique index name for each request (or use a default if needed)
const generateIndexName = () => {
  const timestamp = Date.now();
  return `my_index_${timestamp}`;
};

// Index a parent document
const indexParentDocument = async (parentData,res,req) => {
  const indexName = generateIndexName();

  try {
    const response = await esClient.index({
      index: indexName,
      body: {
        ...parentData,
      },
    });

    console.log('Indexed Parent Document:', indexName);
    const redis = new Redis(); // Initialize Redis client
    const parentDataKey = `parent:${indexName}`; // Use a unique key
    await redis.set(parentDataKey, JSON.stringify(response.body));

    return res.status(200).json({ message: 'Plan entered successfully' });
  } catch (error) {
    console.error('Error creating parent document:', error);
    throw error;
  }
}; 

// Index a child document related to a parent
const indexChildDocument = async (parentID,ChildData,res) => {
  const indexName = generateIndexName();
  console.log("jfdkjb",parentID)
  try {
    const response = await esClient.index({
      index: indexName,
      routing:parentID,
      body: {
        ...ChildData
        },
      },
    );

    console.log('Indexed Child Document:', indexName);
    const redis = new Redis(); // Initialize Redis client
    const ChildDataKey = `Child:${indexName}`; // Use a unique key
    await redis.set(ChildDataKey, JSON.stringify(response.body));

    return res.status(200).json({ message: 'Child Plan entered successfully' });
  } catch (error) {
    console.error('Error creating parent document:', error);
    throw error;
  }
};

const deleteCascadeService = async (parentId) => {
  try {
    const extractedId = parentId.split(':').pop();
    const deleteResponse = await esClient.deleteByQuery({
      index: 'my-index',
      body: {
        query: {
          bool: {
            should: [
              { term: { "objectId": parentId } }, 
              { term: { "routing": parentId} } 
            ]
          }
        },
      },
    });

    console.log('Elasticsearch delete response:', deleteResponse);
    await redis.del(parentId);

    const childKeysPattern = `Child:my_index_*`;
    const childKeys = await redis.keys(childKeysPattern);
    console.log('Child keys:', childKeys);

    await Promise.all(childKeys.map(key => redis.del(key)));

    console.log('Redis keys deleted successfully');

    return { message: 'Parent and associated child documents deleted successfully' };
  } catch (error) {
    console.error('Error during deletion process:', error);
    throw error;
  }
};

module.exports = {
  createService,
  getService,
  deleteService,
  patchService,
  verifyToken,
  mergeService,
  deleteCascadeService,
  indexParentDocument, 
  indexChildDocument
};