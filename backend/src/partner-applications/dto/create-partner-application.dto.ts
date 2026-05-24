export class CreatePartnerApplicationDto {
  companyName: string;
  taxCode: string;
  address: string;
  website?: string;
  licenseUrl?: string;
  // URL của file PDF hợp đồng đã ký
  contractUrl?: string;
  representativeName: string;
  signatureDataUrl?: string;
}
