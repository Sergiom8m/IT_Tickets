import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(public database: AngularFirestore) { }

  createDoc(data: any, path: string, id: string) {
    return this.database.collection(path).doc(id).set(data)
  }

  getDoc<tipo>(path: string, id: string) {
    // .valueChanges() devuelve un observable que se actualiza cada vez que cambia el documento
    return this.database.collection<tipo>(path).doc(id).valueChanges() 
  }

  deleteDoc(path: string, id: string) {
    return this.database.collection(path).doc(id).delete()
  }

  updateDoc(data: any, path: string, id: string) {
    return this.database.collection(path).doc(id).update(data)
  }

  getId() {
    return this.database.createId()
  }

  getCollection<tipo>(path: string) {
    // .valueChanges() devuelve un observable que se actualiza cada vez que cambia el documento
    return this.database.collection<tipo>(path).valueChanges()
  }

  getCollectionQuery<tipo>(path: string, queryFn: (ref: any) => any) {
    return this.database.collection<tipo>(path, queryFn).valueChanges();
  }

}
