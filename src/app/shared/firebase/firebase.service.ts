import { Injectable } from '@angular/core';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { Firestore, getFirestore } from 'firebase/firestore';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  private readonly app: FirebaseApp = initializeApp(environment.firebase);

  readonly firestore: Firestore = getFirestore(this.app);
}
