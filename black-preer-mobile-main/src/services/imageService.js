// import { db } from '../config/firebase';
// import { collection, addDoc } from 'firebase/firestore';
// import { getAuth } from 'firebase/auth';

// // Save prediction result to Firestore only 
// export const savePredictionToFirebase = async (predictionData) => {
//   const auth = getAuth();
//   const user = auth.currentUser;
//   const userId = user ? user.uid : 'guest';

//   await addDoc(collection(db, 'predictions'), {
//     userId: userId,
//     modelName: 'variety_resnet50v2',
//     feature: 'variety_identification',
//     predictedLabel: predictionData.result,
//     confidence: predictionData.confidence,
//     probabilities: predictionData.variety_probs || {},
//     stage: predictionData.stage || '',
//     createdAt: new Date()
//   });
// };