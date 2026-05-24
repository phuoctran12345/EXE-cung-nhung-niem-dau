export class CreatePartnerApplicationDto {
  companyName: string;
  taxCode: string;
  address: string;
  website?: string;
  licenseUrl?: string;
  representativeName: string;
  signatureDataUrl?: string;
}
