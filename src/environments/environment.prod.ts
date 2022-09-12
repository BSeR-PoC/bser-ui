// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  //fhirClientId: 'd9278654-7899-4d58-ac64-0208a4c469b0', // OMOPonFHIR Smart Client ID.
  fhirClientId: '52636c0a-17c3-4536-827e-bf83d57e469a', // EPIC Id
  fhirScope: 'profile launch openid fhirUser online_access patient/Patient.read', // App Smart FHIR Scope.
  fhirIss: 'https://apps.hdap.gatech.edu/omopv53onfhir4/fhir', // App Smart FHIR ISS. (Server)
  fhirRedirectUri: ' https://apps.hdap.gatech.edu/bser-ui/',
  bserProviderServer: 'https://apps.hdap.gatech.edu/cqf-ruler-r4/fhir/', // Server base to manage BSeR workflow resources, Service Providers, etc.
  bserEngineEndpoint: 'https://apps.hdap.gatech.edu/bser-engine/fhir/$referral-request'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
