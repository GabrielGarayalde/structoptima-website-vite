// import * as tf from "@tensorflow/tfjs";

export default function predictResult(params, model_FCM, model_FCM2) {
  // Topopt FCM
  const input_FCM = tf.tensor2d(params, [1, 4]);
  const output_FCM = model_FCM.predict(input_FCM);
  const values_FCM = output_FCM.dataSync();

  // Topopt FCM2
  const input_FCM2 = tf.tensor(values_FCM, [1, 40]);
  const output_FCM2 = model_FCM2.predict(input_FCM2);
  const values_FCM2 = output_FCM2.dataSync();

  return Array.from(values_FCM2);
}
