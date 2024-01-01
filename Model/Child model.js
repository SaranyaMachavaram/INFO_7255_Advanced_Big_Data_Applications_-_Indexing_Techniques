// const redis = require('redis');
// const client = redis.createClient();

// const PlanServiceCostSharesSchema = new Schema({
//   deductible: Number,
//   _org: String,
//   copay: Number,
//   objectId: String,
//   objectType: String,
// });

// const LinkedServiceSchema = new Schema({
//   _org: String,
//   objectId: String,
//   objectType: String,
//   name: String,
// });

// const LinkedPlanServicesSchema = new Schema({
//   linkedService: LinkedServiceSchema,
//   planserviceCostShares: PlanServiceCostSharesSchema,
//   _org: String,
//   objectId: String,
//   objectType: String,
// });

// const PlanCostSharesSchema = new Schema({
//   deductible: Number,
//   _org: String,
//   copay: Number,
//   objectId: String,
//   objectType: String,
// });

// const PlanSchema = new Schema({
//   planCostShares: PlanCostSharesSchema,
//   linkedPlanServices: [LinkedPlanServicesSchema],
//   _org: String,
//   objectId: String,
//   objectType: String,
//   planType: String,
//   creationDate: String,
// });

// const planKey = `plan:${PlanSchema._org}:${PlanSchema.objectId}`;

// // Convert the planData to a JSON string
// const planDataString = JSON.stringify(PlanSchema);

// client.hmset(planKey, 'data', planDataString, (err, reply) => {
//   if (err) {
//     console.error(err);
//   } else {
//     console.log(`Stored Plan in Redis: ${planKey}`);
//   }
// });

// // Retrieve the Plan data from Redis
// client.hget(planKey, 'data', (err, result) => {
//   if (err) {
//     console.error(err);
//   } else {
//     const plan = JSON.parse(result);
//     console.log('Retrieved Plan from Redis:', plan);
//     // Use the retrieved data as needed
//   }
// });