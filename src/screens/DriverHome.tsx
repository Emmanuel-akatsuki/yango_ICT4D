import React,{
 useEffect,
 useState
}
from 'react';

import {
 View,
 Text,
 FlatList,
 TouchableOpacity,
}
from 'react-native';

import {
 collection,
 onSnapshot
}
from 'firebase/firestore';

import {
 db
}
from '../firebase/firebaseConfig';

import {
 acceptRide
}
from '../services/rideService';

export default function DriverHome({ route }: any){
 const { userName } = route.params || { userName: 'Chauffeur' };

 const [rides,setRides] =
 useState<any[]>([]);

 useEffect(()=>{

   const unsubscribe =
   onSnapshot(

    collection(
      db,
      'commandes'
    ),

    snapshot=>{

      const data =
      snapshot.docs.map(
      doc=>({

        id:doc.id,
        ...doc.data(),

      }));

      setRides(
       data as any[]
      );
    },
   );

   return unsubscribe;

 },[]);

 const handleAccept =
 async (ride:any)=>{

   await acceptRide(

    ride.id,

    'driver123',

    'Paul'

   );

 };

 return(

  <View
   style={{
    flex:1,
    padding:20,
   }}>

    <Text
     style={{
      fontSize: 18,
      color: '#333',
      marginBottom: 5,
     }}>
      Bienvenue, {userName}
    </Text>
    <Text
     style={{
      fontSize:22,
      fontWeight:'bold',
      color:'red',
     }}>
      Courses disponibles
    </Text>

    <FlatList

      data={
       rides.filter(
       r=>
       r.status==='pending'
       )
      }

      keyExtractor={
      item=>item.id
      }

      renderItem={

      ({item})=>(

       <View
        style={{
         backgroundColor:
         '#fff',

         padding:15,

         marginVertical:10,

         borderRadius:15,
        }}>

        <Text>
          {item.pickup}
        </Text>

        <Text>
          {item.destination}
        </Text>

        <Text>
          Type: {item.vehicleType?.label || 'Standard'}
        </Text>

        <TouchableOpacity

         onPress={()=>
         handleAccept(item)
         }

         style={{
          backgroundColor:
          'red',

          padding:10,

          borderRadius:10,

          marginTop:10,
         }}>

          <Text
           style={{
            color:'white'
           }}>
            Accepter
          </Text>

        </TouchableOpacity>

       </View>

      )
     }

    />

  </View>

 );

}