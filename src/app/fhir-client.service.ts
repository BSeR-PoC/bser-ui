import { Injectable } from '@angular/core';
import { oauth2 as SmartClient } from 'fhirclient';
import { environment } from "../environments/environment";
import {from, Observable, of, switchMap, tap} from 'rxjs';
import {Patient} from "@fhir-typescript/r4-core/dist/fhir/Patient";


@Injectable({
  providedIn: 'root'
})
export class FhirClientService {

  private fhirClient: any;
  private patient: any;
  private patientObj: Patient;

  constructor() {}

  authorize() {
    SmartClient.authorize(
      {
        clientId: environment.fhirClientId,
        scope: environment.fhirScope,
        //iss: environment.fhirIss,
        redirectUri: environment.fhirRedirectUri
      }
    );
  }

  readyClientNew(cbSuccess, cbError) {
    SmartClient.ready()
      .then(client => {
        this.fhirClient = client;
        client.patient.read()
          .then((data) => {
            this.patient = data;
            console.log(data);
            cbSuccess(data);
          })
          .catch((error: any) => {
            console.log(error)
            cbError(error);
          });
      })
      .catch((error: any) => {
        console.error(error);
        cbError(error);
      })
  }


  readyClient() {
    SmartClient.ready()
      .then(client => {
        this.fhirClient = client;
        client.patient.read()
          .then((data) => {
            this.patient = data;
          })
          .catch((error: any) => {
            console.error(error)
          });
      })
      .catch((error: any) => {
        console.error(error);
      })
  }

  getClient(): Observable<any> {
    return from (SmartClient.ready())
  }

  // getPatient(): Observable<any>{
  //   if(this.patientObj){
  //     return of(this.patientObj)
  //   }
  //   else {
  //     return this.getClient().pipe(
  //       tap((result: any) => {
  //         this.patientObj = Object.assign(new Patient(), result);
  //       }),
  //       switchMap(client => {
  //         return from (client.patient.read())
  //       })
  //     )
  //   }
  // }

  // getPatient(): Observable<any>{
  //   return this.getClient().pipe(
  //     switchMap(client => {
  //       return from (client.patient.read())
  //     })
  //   )
  // }

  getPatient(): Observable<Patient> {
    if (this.patientObj) {
      console.log(this.patientObj instanceof Patient)
      return of(this.patientObj)
    }
    return this.getPatientClient().pipe(
      tap((result: Patient) => {
        console.log(result);
        this.patientObj = Object.assign(new Patient(), result)
        console.log(this.patientObj instanceof Patient)
      })
    )
  }

  getPatientClient(): Observable<any>{
    return this.getClient().pipe(
      switchMap(client => {
        return from (client.patient.read())
      })
    )
  }

  // saveDraftServiceRequest(): Observable<any> {
    
  // }

}
