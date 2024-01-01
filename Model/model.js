// const Redis = require('ioredis');
// const redis = new Redis(); // Connects to 127.0.0.1:6379 by default

// class RedisPlanModel {
//     async savePlan(planId, planData) {
//         const planKey = `plan:${planId}`;
//         await redis.set(planKey, JSON.stringify(planData));
//     }

//     async getPlan(planId) {
//         const planKey = `plan:${planId}`;
//         const planData = await redis.get(planKey);
//         return planData ? JSON.parse(planData) : null;
//     }


// // Example usage of RedisPlanModel
// async function main() {
//     const planModel = new RedisPlanModel();
//     const planId = '12345';
//     const planData = {
//         planCostShares: {
//             deductible: 1000,
//             _org: 'someOrg',
//             copay: 20,
//             objectId: 'planCostSharesId1',
//             objectType: 'PlanCostShares'
//         },
//         linkedPlanServices: [
//             {
//                 linkedService: {
//                     _org: 'someOrg',
//                     objectId: 'linkedServiceId1',
//                     objectType: 'LinkedService',
//                     name: 'ServiceName'
//                 },
//                 planserviceCostShares: {
//                     deductible: 500,
//                     _org: 'someOrg',
//                     copay: 10,
//                     objectId: 'planServiceCostSharesId1',
//                     objectType: 'PlanServiceCostShares'
//                 },
//                 _org: 'someOrg',
//                 objectId: 'linkedPlanServicesId1',
//                 objectType: 'LinkedPlanServices'
//             }
//             // ... other linked plan services
//         ],
//         _org: 'someOrg',
//         objectId: 'planId1',
//         objectType: 'Plan',
//         planType: 'Basic',
//         creationDate: '2023-01-01'
//     };

//     // Save the plan data to Redis
//     await planModel.savePlan(planId, planData);
//     console.log(`Plan ${planId} saved to Redis.`);

//     // Retrieve the plan data from Redis
//     const retrievedPlan = await planModel.getPlan(planId);
//     console.log('Retrieved Plan Data:', retrievedPlan);
// }

// main().catch(err => {
//     console.error('Error:', err);
// });
