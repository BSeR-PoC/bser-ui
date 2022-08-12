// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  fhirClientId: 'd9278654-7899-4d58-ac64-0208a4c469b0', // OMOPonFHIR Smart Client ID.
  //fhirClientId: 'b7a96f8d-2ef1-44b4-b067-3946b2808883', // OMOPonFHIR Smart Client ID.
  fhirScope: 'launch profile openid online_access patient/Patient.read patient/Condition.read patient/Observation.read patient/MedicationStatement.read', // App Smart FHIR Scope.
  fhirIss: 'https://apps.hdap.gatech.edu/omopv53onfhir4/fhir', // App Smart FHIR ISS. (Server)
  fhirRedirectUri: 'https://localhost:4200/', // App Smart Redirect URL.
  bserProviderServer: 'https://apps.hdap.gatech.edu/cqf-ruler-r4/fhir/' // Server base to manage BSeR workflow resources, Service Providers, etc.
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
