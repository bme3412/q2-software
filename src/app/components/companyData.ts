export interface Source {
  id: string;
  name: string;
  ticker: string;
  category: string;
  type: 'earnings';
  checked: boolean;
}

export interface SourceGroup {
  id: string;
  name: string;
  sources: Source[];
  expanded: boolean;
}

// Real company data from transcripts
export const COMPANY_DATA: SourceGroup[] = [
  {
    id: 'ad-tech',
    name: 'Ad Tech',
    expanded: false,
    sources: [
      { id: 'APP', name: 'AppLovin Corporation', ticker: 'APP', category: 'ad-tech', type: 'earnings', checked: false },
      { id: 'BRZE', name: 'Braze Inc', ticker: 'BRZE', category: 'ad-tech', type: 'earnings', checked: false },
      { id: 'DV', name: 'DoubleVerify Holdings', ticker: 'DV', category: 'ad-tech', type: 'earnings', checked: false },
      { id: 'IAS', name: 'Integral Ad Science', ticker: 'IAS', category: 'ad-tech', type: 'earnings', checked: false },
      { id: 'KVYO', name: 'Klaviyo Inc', ticker: 'KVYO', category: 'ad-tech', type: 'earnings', checked: false },
      { id: 'SEMR', name: 'Semrush Holdings', ticker: 'SEMR', category: 'ad-tech', type: 'earnings', checked: false },
      { id: 'SPT', name: 'Sprout Social', ticker: 'SPT', category: 'ad-tech', type: 'earnings', checked: false },
      { id: 'TTD', name: 'The Trade Desk', ticker: 'TTD', category: 'ad-tech', type: 'earnings', checked: false },
      { id: 'ZETA', name: 'Zeta Global Holdings', ticker: 'ZETA', category: 'ad-tech', type: 'earnings', checked: false },
    ]
  },
  {
    id: 'commerce-webplatform',
    name: 'Commerce & Web Platform',
    expanded: false,
    sources: [
      { id: 'LSPD-CN', name: 'Lightspeed Commerce', ticker: 'LSPD-CN', category: 'commerce-webplatform', type: 'earnings', checked: false },
      { id: 'SHOP', name: 'Shopify Inc', ticker: 'SHOP', category: 'commerce-webplatform', type: 'earnings', checked: false },
    ]
  },
  {
    id: 'data-ai-analytics',
    name: 'Data, AI & Analytics',
    expanded: false,
    sources: [
      { id: 'AI', name: 'C3.ai Inc', ticker: 'AI', category: 'data-ai-analytics', type: 'earnings', checked: false },
      { id: 'AMPL', name: 'Amplitude Inc', ticker: 'AMPL', category: 'data-ai-analytics', type: 'earnings', checked: false },
      { id: 'DOMO', name: 'Domo Inc', ticker: 'DOMO', category: 'data-ai-analytics', type: 'earnings', checked: false },
      { id: 'INFA', name: 'Informatica Inc', ticker: 'INFA', category: 'data-ai-analytics', type: 'earnings', checked: false },
      { id: 'MSTR', name: 'MicroStrategy Inc', ticker: 'MSTR', category: 'data-ai-analytics', type: 'earnings', checked: false },
      { id: 'NXL-AU', name: 'Nuix Ltd', ticker: 'NXL-AU', category: 'data-ai-analytics', type: 'earnings', checked: false },
      { id: 'PLTR', name: 'Palantir Technologies', ticker: 'PLTR', category: 'data-ai-analytics', type: 'earnings', checked: false },
      { id: 'TDC', name: 'Teradata Corporation', ticker: 'TDC', category: 'data-ai-analytics', type: 'earnings', checked: false },
    ]
  },
  {
    id: 'data-ai-apac',
    name: 'Data, AI & Analytics (APAC)',
    expanded: false,
    sources: [
      { id: 'KC', name: 'Kingsoft Cloud Holdings', ticker: 'KC', category: 'data-ai-apac', type: 'earnings', checked: false },
      { id: 'TUYA', name: 'Tuya Inc', ticker: 'TUYA', category: 'data-ai-apac', type: 'earnings', checked: false },
    ]
  },
  {
    id: 'design-cad',
    name: 'Design & CAD',
    expanded: false,
    sources: [
      { id: 'ADSK', name: 'Autodesk Inc', ticker: 'ADSK', category: 'design-cad', type: 'earnings', checked: false },
      { id: 'BSY', name: 'Bentley Systems', ticker: 'BSY', category: 'design-cad', type: 'earnings', checked: false },
      { id: 'DSY-FP', name: 'Dassault Systèmes', ticker: 'DSY-FP', category: 'design-cad', type: 'earnings', checked: false },
      { id: 'HEXAB-SS', name: 'Hexagon AB', ticker: 'HEXAB-SS', category: 'design-cad', type: 'earnings', checked: false },
      { id: 'NEM-DE', name: 'Nemetschek SE', ticker: 'NEM-DE', category: 'design-cad', type: 'earnings', checked: false },
      { id: 'PTC', name: 'PTC Inc', ticker: 'PTC', category: 'design-cad', type: 'earnings', checked: false },
      { id: 'U', name: 'Unity Software Inc', ticker: 'U', category: 'design-cad', type: 'earnings', checked: false },
    ]
  },
  {
    id: 'devtools-devops',
    name: 'DevTools & DevOps',
    expanded: false,
    sources: [
      { id: 'DDOG', name: 'Datadog Inc', ticker: 'DDOG', category: 'devtools-devops', type: 'earnings', checked: false },
      { id: 'DT', name: 'Dynatrace Inc', ticker: 'DT', category: 'devtools-devops', type: 'earnings', checked: false },
      { id: 'ESTC', name: 'Elastic NV', ticker: 'ESTC', category: 'devtools-devops', type: 'earnings', checked: false },
      { id: 'FROG', name: 'JFrog Ltd', ticker: 'FROG', category: 'devtools-devops', type: 'earnings', checked: false },
      { id: 'GTLB', name: 'GitLab Inc', ticker: 'GTLB', category: 'devtools-devops', type: 'earnings', checked: false },
      { id: 'PD', name: 'PagerDuty Inc', ticker: 'PD', category: 'devtools-devops', type: 'earnings', checked: false },
      { id: 'TEAM', name: 'Atlassian Corporation', ticker: 'TEAM', category: 'devtools-devops', type: 'earnings', checked: false },
    ]
  },
  {
    id: 'financial-software',
    name: 'Financial Software',
    expanded: false,
    sources: [
      { id: 'ADYEN-NA', name: 'Adyen NV', ticker: 'ADYEN-NA', category: 'financial-software', type: 'earnings', checked: false },
      { id: 'BILL', name: 'Bill.com Holdings', ticker: 'BILL', category: 'financial-software', type: 'earnings', checked: false },
      { id: 'BR', name: 'Broadridge Financial', ticker: 'BR', category: 'financial-software', type: 'earnings', checked: false },
      { id: 'FDS', name: 'FactSet Research Systems', ticker: 'FDS', category: 'financial-software', type: 'earnings', checked: false },
      { id: 'FI', name: 'Fiserv Inc', ticker: 'FI', category: 'financial-software', type: 'earnings', checked: false },
      { id: 'FLYW', name: 'Flywire Corporation', ticker: 'FLYW', category: 'financial-software', type: 'earnings', checked: false },
      { id: 'INTU', name: 'Intuit Inc', ticker: 'INTU', category: 'financial-software', type: 'earnings', checked: false },
      { id: 'JKHY', name: 'Jack Henry & Associates', ticker: 'JKHY', category: 'financial-software', type: 'earnings', checked: false },
      { id: 'MSCI', name: 'MSCI Inc', ticker: 'MSCI', category: 'financial-software', type: 'earnings', checked: false },
      { id: 'PYPL', name: 'PayPal Holdings', ticker: 'PYPL', category: 'financial-software', type: 'earnings', checked: false },
      { id: 'SPGI', name: 'S&P Global Inc', ticker: 'SPGI', category: 'financial-software', type: 'earnings', checked: false },
      { id: 'SSNC', name: 'SS&C Technologies', ticker: 'SSNC', category: 'financial-software', type: 'earnings', checked: false },
      { id: 'TMV-DE', name: 'TeamViewer AG', ticker: 'TMV-DE', category: 'financial-software', type: 'earnings', checked: false },
      { id: 'XRO-AU', name: 'Xero Limited', ticker: 'XRO-AU', category: 'financial-software', type: 'earnings', checked: false },
      { id: 'XYZ', name: 'Exlservice Holdings', ticker: 'XYZ', category: 'financial-software', type: 'earnings', checked: false },
    ]
  },
  {
    id: 'horizontal-saas',
    name: 'Horizontal SaaS',
    expanded: true,
    sources: [
      { id: 'ADBE', name: 'Adobe Inc', ticker: 'ADBE', category: 'horizontal-saas', type: 'earnings', checked: false },
      { id: 'ASAN', name: 'Asana Inc', ticker: 'ASAN', category: 'horizontal-saas', type: 'earnings', checked: false },
      { id: 'BOX', name: 'Box Inc', ticker: 'BOX', category: 'horizontal-saas', type: 'earnings', checked: false },
      { id: 'CRM', name: 'Salesforce Inc', ticker: 'CRM', category: 'horizontal-saas', type: 'earnings', checked: false },
      { id: 'DOCU', name: 'DocuSign Inc', ticker: 'DOCU', category: 'horizontal-saas', type: 'earnings', checked: false },
      { id: 'EGHT', name: '8x8 Inc', ticker: 'EGHT', category: 'horizontal-saas', type: 'earnings', checked: false },
      { id: 'FIVN', name: 'Five9 Inc', ticker: 'FIVN', category: 'horizontal-saas', type: 'earnings', checked: false },
      { id: 'HUBS', name: 'HubSpot Inc', ticker: 'HUBS', category: 'horizontal-saas', type: 'earnings', checked: false },
      { id: 'MNDY', name: 'Monday.com Ltd', ticker: 'MNDY', category: 'horizontal-saas', type: 'earnings', checked: false },
      { id: 'NICE', name: 'NICE Ltd', ticker: 'NICE', category: 'horizontal-saas', type: 'earnings', checked: false },
      { id: 'NOW', name: 'ServiceNow Inc', ticker: 'NOW', category: 'horizontal-saas', type: 'earnings', checked: false },
      { id: 'RNG', name: 'RingCentral Inc', ticker: 'RNG', category: 'horizontal-saas', type: 'earnings', checked: false },
      { id: 'WDAY', name: 'Workday Inc', ticker: 'WDAY', category: 'horizontal-saas', type: 'earnings', checked: false },
      { id: 'ZM', name: 'Zoom Video Communications', ticker: 'ZM', category: 'horizontal-saas', type: 'earnings', checked: false },
    ]
  },
  {
    id: 'platforms-systems',
    name: 'Platforms & Systems',
    expanded: false,
    sources: [
      { id: 'AKAM', name: 'Akamai Technologies', ticker: 'AKAM', category: 'platforms-systems', type: 'earnings', checked: false },
      { id: 'CFLT', name: 'Confluent Inc', ticker: 'CFLT', category: 'platforms-systems', type: 'earnings', checked: false },
      { id: 'GDDY', name: 'GoDaddy Inc', ticker: 'GDDY', category: 'platforms-systems', type: 'earnings', checked: false },
      { id: 'IBM', name: 'International Business Machines', ticker: 'IBM', category: 'platforms-systems', type: 'earnings', checked: false },
      { id: 'MDB', name: 'MongoDB Inc', ticker: 'MDB', category: 'platforms-systems', type: 'earnings', checked: false },
      { id: 'MSFT', name: 'Microsoft Corporation', ticker: 'MSFT', category: 'platforms-systems', type: 'earnings', checked: false },
      { id: 'NET', name: 'Cloudflare Inc', ticker: 'NET', category: 'platforms-systems', type: 'earnings', checked: false },
      { id: 'NTNX', name: 'Nutanix Inc', ticker: 'NTNX', category: 'platforms-systems', type: 'earnings', checked: false },
      { id: 'ORCL', name: 'Oracle Corporation', ticker: 'ORCL', category: 'platforms-systems', type: 'earnings', checked: false },
      { id: 'OTEX', name: 'Open Text Corporation', ticker: 'OTEX', category: 'platforms-systems', type: 'earnings', checked: false },
      { id: 'PRGS', name: 'Progress Software', ticker: 'PRGS', category: 'platforms-systems', type: 'earnings', checked: false },
      { id: 'SAP', name: 'SAP SE', ticker: 'SAP', category: 'platforms-systems', type: 'earnings', checked: false },
      { id: 'SNOW', name: 'Snowflake Inc', ticker: 'SNOW', category: 'platforms-systems', type: 'earnings', checked: false },
    ]
  },
  {
    id: 'security',
    name: 'Security',
    expanded: false,
    sources: [
      { id: '4704-JP', name: 'Trend Micro Inc', ticker: '4704-JP', category: 'security', type: 'earnings', checked: false },
      { id: 'BB-CN', name: 'BlackBerry Limited', ticker: 'BB-CN', category: 'security', type: 'earnings', checked: false },
      { id: 'CHKP', name: 'Check Point Software', ticker: 'CHKP', category: 'security', type: 'earnings', checked: false },
      { id: 'CRWD', name: 'CrowdStrike Holdings', ticker: 'CRWD', category: 'security', type: 'earnings', checked: false },
      { id: 'CYBR', name: 'CyberArk Software', ticker: 'CYBR', category: 'security', type: 'earnings', checked: false },
      { id: 'FTNT', name: 'Fortinet Inc', ticker: 'FTNT', category: 'security', type: 'earnings', checked: false },
      { id: 'GEN', name: 'Gen Digital Inc', ticker: 'GEN', category: 'security', type: 'earnings', checked: false },
      { id: 'OKTA', name: 'Okta Inc', ticker: 'OKTA', category: 'security', type: 'earnings', checked: false },
      { id: 'PANW', name: 'Palo Alto Networks', ticker: 'PANW', category: 'security', type: 'earnings', checked: false },
      { id: 'QLYS', name: 'Qualys Inc', ticker: 'QLYS', category: 'security', type: 'earnings', checked: false },
      { id: 'RPD', name: 'Rapid7 Inc', ticker: 'RPD', category: 'security', type: 'earnings', checked: false },
      { id: 'S', name: 'SentinelOne Inc', ticker: 'S', category: 'security', type: 'earnings', checked: false },
      { id: 'TENB', name: 'Tenable Holdings', ticker: 'TENB', category: 'security', type: 'earnings', checked: false },
      { id: 'VRNS', name: 'Varonis Systems', ticker: 'VRNS', category: 'security', type: 'earnings', checked: false },
      { id: 'ZS', name: 'Zscaler Inc', ticker: 'ZS', category: 'security', type: 'earnings', checked: false },
    ]
  },
  {
    id: 'vertical-saas',
    name: 'Vertical SaaS',
    expanded: true,
    sources: [
      { id: 'BL', name: 'Blackline Inc', ticker: 'BL', category: 'vertical-saas', type: 'earnings', checked: false },
      { id: 'BLKB', name: 'Blackbaud Inc', ticker: 'BLKB', category: 'vertical-saas', type: 'earnings', checked: false },
      { id: 'CCCS', name: 'CCC Intelligent Solutions', ticker: 'CCCS', category: 'vertical-saas', type: 'earnings', checked: false },
      { id: 'DH', name: 'Definitive Healthcare', ticker: 'DH', category: 'vertical-saas', type: 'earnings', checked: false },
      { id: 'DOCS', name: 'Doximity Inc', ticker: 'DOCS', category: 'vertical-saas', type: 'earnings', checked: false },
      { id: 'DOX', name: 'Amdocs Limited', ticker: 'DOX', category: 'vertical-saas', type: 'earnings', checked: false },
      { id: 'DSG-CA', name: 'Descartes Systems Group', ticker: 'DSG-CA', category: 'vertical-saas', type: 'earnings', checked: false },
      { id: 'GWRE', name: 'Guidewire Software', ticker: 'GWRE', category: 'vertical-saas', type: 'earnings', checked: false },
      { id: 'IOT', name: 'Samsara Inc', ticker: 'IOT', category: 'vertical-saas', type: 'earnings', checked: false },
      { id: 'KXS-CA', name: 'Kinaxis Inc', ticker: 'KXS-CA', category: 'vertical-saas', type: 'earnings', checked: false },
      { id: 'NCNO', name: 'nCino Inc', ticker: 'NCNO', category: 'vertical-saas', type: 'earnings', checked: false },
      { id: 'PCOR', name: 'Procore Technologies', ticker: 'PCOR', category: 'vertical-saas', type: 'earnings', checked: false },
      { id: 'PHR', name: 'Phreesia Inc', ticker: 'PHR', category: 'vertical-saas', type: 'earnings', checked: false },
      { id: 'QTWO', name: 'Q2 Holdings Inc', ticker: 'QTWO', category: 'vertical-saas', type: 'earnings', checked: false },
      { id: 'TOST', name: 'Toast Inc', ticker: 'TOST', category: 'vertical-saas', type: 'earnings', checked: false },
      { id: 'TYL', name: 'Tyler Technologies', ticker: 'TYL', category: 'vertical-saas', type: 'earnings', checked: false },
      { id: 'VEEV', name: 'Veeva Systems Inc', ticker: 'VEEV', category: 'vertical-saas', type: 'earnings', checked: false },
      { id: 'WK', name: 'Workiva Inc', ticker: 'WK', category: 'vertical-saas', type: 'earnings', checked: false },
      { id: 'WTC-AU', name: 'WiseTech Global Limited', ticker: 'WTC-AU', category: 'vertical-saas', type: 'earnings', checked: false },
    ]
  }
];
