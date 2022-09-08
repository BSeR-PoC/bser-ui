import { Injectable } from '@angular/core';
import { oauth2 as SmartClient } from 'fhirclient';
import { environment } from "../../environments/environment";
import {BehaviorSubject, from, Observable, of, skipWhile, switchMap, tap} from 'rxjs';
import {Patient} from "@fhir-typescript/r4-core/dist/fhir/Patient";
import {Practitioner} from "@fhir-typescript/r4-core/dist/fhir/Practitioner";


@Injectable({
  providedIn: 'root'
})
export class FhirClientService {

  private fhirClient: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private patient: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public patient$ = this.patient.asObservable();
  private patientObj: Patient;
  private practitionerObj: Practitioner;
  private serverUrl: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  public serverUrl$ = this.serverUrl.asObservable();

  constructor() {}

   getClient() {
     return this.fhirClient.asObservable();
  }

  authorize() {
    console.log("AUTHORIZING");
    SmartClient.authorize(
      {
        clientId: environment.fhirClientId,
        scope: environment.fhirScope,
        //iss: environment.fhirIss,
        redirectUri: environment.fhirRedirectUri
      }
    );
  }

  // readyClientNew(cbSuccess, cbError) {
  //   SmartClient.ready()
  //     .then(client => {
  //       this.fhirClient = client;
  //       client.patient.read()
  //         .then((data) => {
  //           this.patient = data;
  //           console.log(data);
  //           cbSuccess(data);
  //         })
  //         .catch((error: any) => {
  //           console.log(error)
  //           cbError(error);
  //         });
  //     })
  //     .catch((error: any) => {
  //       console.error(error);
  //       cbError(error);
  //     })
  // }
  readyClient() {
    SmartClient.ready()
      .then(client => {
        this.fhirClient.next(client);
        this.serverUrl.next(client.getState("serverUrl"));
        client.patient.read()
           .then((data) => {
             this.patient.next(data);
          })
          .catch((error: any) => {
            console.error(error)
          });
        client.patient.read()
          .then((data) => {
            this.patient.next(data);
          })
          .catch((error: any) => {
            console.error(error)
          });
      })
      .catch((error: any) => {
        console.error(error);
      })
  }

  // getClient(): Observable<any> {
  //   console.log("READYING")
  //   return from (SmartClient.ready())
  // }


  getPatient(): Observable<Patient> {
    if (this.patientObj) {
      return of(this.patientObj)
    }
    return this.getPatientClient().pipe(
      tap((result: Patient) => {
        this.patientObj = Object.assign(new Patient(), result)
      })
    )
  }

  getPractitioner(): Observable<Practitioner> {
    if (this.practitionerObj) {
      console.log(this.practitionerObj instanceof Practitioner)
      return of(this.practitionerObj)
    }
    return this.getPractitionerClient().pipe(
      tap((result: Practitioner) => {
        console.log(result);
        this.practitionerObj = Object.assign(new Practitioner(), result)
        console.log(this.practitionerObj instanceof Practitioner)
      })
    )
  }

  getPatientClient(): Observable<any>{
    console.log("getPatientClient called")
    return this.getClient().pipe(
      skipWhile((client) => client === null),
      switchMap(client => {
        return from (client.patient.read())
      })
    )
  }

  getPractitionerClient(): Observable<any>{
    console.log("getPractitionerClient called")
    return this.getClient().pipe(
      skipWhile((client) => client === null),
      switchMap(client => {
        return from (client.user.read())
      })
    )
  }


  getRequestFromClient(requestString: string): Observable<any>{
    return this.getClient().pipe(
      skipWhile((client) => client === null),
      switchMap(client => {
        requestString = requestString.replace("${patient.id}", client.patient.id)
        return from (client.request(requestString))
      })
    )
  }


  getCoverage(): Observable<any>{
    return this.getRequestFromClient("Coverage?beneficiary=${patient.id}&_include=Coverage:payor")
    // return this.getClient().pipe(
    //   skipWhile((client) => client === null),
    //   switchMap(client => {
    //     return from (client.request("Coverage?beneficiary=" + client.patient.id + "&_include=Coverage:payor"))
    //   })
    //)
  }

  // getPractitionerClient(): Observable<any>{
  //   return this.getClient().pipe(
  //     switchMap(client => {
  //       return from (client.practitionerObj.read())
  //     })
  //   )
  // }
  // saveDraftServiceRequest(): Observable<any> {

  // }

}
