import {
  addDoc,
  collection,
  updateDoc,
  doc,
} from 'firebase/firestore';

import {db} from '../firebase/firebaseConfig';

export const createRide = async (
  rideData: any,
) => {
  return await addDoc(
    collection(db, 'commandes'),
    rideData,
  );
};

export const acceptRide = async (
  rideId: string,
  driverId: string,
  driverName: string,
) => {

  const rideRef = doc(
    db,
    'commandes',
    rideId,
  );

  return await updateDoc(
    rideRef,
    {
      status: 'accepted',
      driverId,
      driverName,
    },
  );
};