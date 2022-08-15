import { Injectable } from '@angular/core'

@Injectable()

export class AppConstants{

  WEIGHT_UNITS = [
    'kg', 'lb'
  ];

  HEIGHT_UNITS = [
    'cm', 'in'
  ];

  BSER_REFERRAL_RECIPIENT_PRACTITIONER_ROLE_PROFILE = "http://hl7.org/fhir/us/bser/StructureDefinition/BSeR-ReferralRecipientPractitionerRole";
}
