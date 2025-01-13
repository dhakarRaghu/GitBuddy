// 'use strict';

// import { auth } from '@clerk/nextjs/server';
// import Razorpay from 'razorpay';

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID!,
//   key_secret: process.env.RAZORPAY_KEY_SECRET!,
// });

// export async function createRazorpayOrder(credits: number) {
//   const { userId } = await auth();
//   if (!userId) {
//     throw new Error('Unauthorized');
//   }

//   // Calculate amount in paise (Razorpay uses the smallest currency unit)
//   const amount = Math.round((credits / 50) * 100 * 100); // USD to cents, then to paise

//   // Create an order
//   const order = await razorpay.orders.create({
//     amount,
//     currency: 'INR', // Change this to the appropriate currency
//     receipt: `receipt_${userId}_${Date.now()}`,
//     notes: {
//       credits,
//       userId: userId.toString(),
//     },
//   });

//   return order; // Return order details to initialize Razorpay on the client
// }
