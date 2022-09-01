import { Injectable } from '@angular/core';
import { oauth2 as SmartClient } from 'fhirclient';
import { environment } from "../environments/environment";
import {from, Observable, of, switchMap, tap} from 'rxjs';
import {Patient} from "@fhir-typescript/r4-core/dist/fhir/Patient";
import {Practitioner} from "@fhir-typescript/r4-core/dist/fhir/Practitioner";


@Injectable({
  providedIn: 'root'
})
export class FhirClientService {

  private fhirClient: any;
  private patient: any;
  private patientObj: Patient;
  private practitionerObj: Practitioner;
  private serverUrl: string;

  constructor() {}

  getFhirClient() {
    return this.fhirClient;
  }

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
    return this.getClient().pipe(
      switchMap(client => {
        console.log(client.getState("serverUrl"));
        return from (client.patient.read())
      })
    )
  }

  getPractitionerClient(): Observable<any>{
    return this.getClient().pipe(
      switchMap(client => {
        return from (client.user.read())
      })
    )
  }

  getCoverage(): Observable<any>{
    return this.getClient().pipe(
      switchMap(client => {
        return from (client.request("Coverage?beneficiary=" + client.patient.id + "&_include=Coverage:payor"))
      })
    )
  }

  getClientState(): Observable<any> {
    return this.getClient().pipe()
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
