// NAICS (North American Industry Classification System) codes for common industries
export interface NAICSCode {
  code: string;
  title: string;
  description: string;
}

export const naicsCodes: NAICSCode[] = [
  // Technology & Software
  { code: "541511", title: "Custom Computer Programming Services", description: "Software development, web development, mobile apps" },
  { code: "541512", title: "Computer Systems Design Services", description: "IT consulting, system architecture, technology planning" },
  { code: "541513", title: "Computer Facilities Management Services", description: "IT operations, cloud management, system administration" },
  { code: "541519", title: "Other Computer Related Services", description: "Other computer and IT services" },
  { code: "518210", title: "Data Processing, Hosting, and Related Services", description: "Cloud computing, data centers, SaaS platforms" },
  { code: "334111", title: "Electronic Computer Manufacturing", description: "Computer hardware, servers, networking equipment" },
  { code: "334220", title: "Radio and Television Broadcasting Equipment", description: "Broadcasting technology, media equipment" },
  { code: "334418", title: "Printed Circuit Assembly Manufacturing", description: "Electronic circuit boards, hardware components" },
  
  // Professional Services
  { code: "541110", title: "Offices of Lawyers", description: "Legal services, law firms" },
  { code: "541211", title: "Offices of Certified Public Accountants", description: "Accounting, tax preparation, financial auditing" },
  { code: "541214", title: "Payroll Services", description: "Payroll processing, HR services" },
  { code: "541330", title: "Engineering Services", description: "Civil, mechanical, electrical, software engineering" },
  { code: "541611", title: "Administrative Management Consulting", description: "Business consulting, management advisory" },
  { code: "541613", title: "Marketing Consulting Services", description: "Marketing strategy, digital marketing, advertising" },
  { code: "541618", title: "Other Management Consulting Services", description: "Strategy consulting, operations consulting" },
  { code: "541711", title: "Research and Development in Biotechnology", description: "Biotech research, pharmaceutical development" },
  { code: "541712", title: "Research and Development in Physical Sciences", description: "Scientific research, laboratory services" },
  { code: "541715", title: "Research and Development in Physical Sciences", description: "Materials science, chemistry, physics research" },
  
  // Healthcare
  { code: "621111", title: "Offices of Physicians", description: "Medical practices, clinics" },
  { code: "621210", title: "Offices of Dentists", description: "Dental practices, oral healthcare" },
  { code: "621512", title: "Diagnostic Imaging Centers", description: "MRI, X-ray, medical imaging services" },
  { code: "621610", title: "Home Health Care Services", description: "In-home medical care, nursing services" },
  { code: "623110", title: "Nursing Care Facilities", description: "Nursing homes, long-term care" },
  { code: "325412", title: "Pharmaceutical Preparation Manufacturing", description: "Drug manufacturing, pharmaceutical production" },
  { code: "339112", title: "Surgical and Medical Instrument Manufacturing", description: "Medical devices, surgical equipment" },
  
  // Manufacturing
  { code: "311111", title: "Dog and Cat Food Manufacturing", description: "Pet food production" },
  { code: "311230", title: "Breakfast Cereal Manufacturing", description: "Cereal and breakfast food production" },
  { code: "311812", title: "Commercial Bakeries", description: "Bread, pastry, commercial baking" },
  { code: "312111", title: "Soft Drink Manufacturing", description: "Beverage production, soft drinks" },
  { code: "321114", title: "Wood Preservation", description: "Treated lumber, wood processing" },
  { code: "325211", title: "Plastics Material and Resin Manufacturing", description: "Plastic production, synthetic materials" },
  { code: "336111", title: "Automobile Manufacturing", description: "Vehicle manufacturing, automotive" },
  { code: "336411", title: "Aircraft Manufacturing", description: "Aerospace, aircraft production" },
  
  // Financial Services
  { code: "522110", title: "Commercial Banking", description: "Banks, lending institutions" },
  { code: "522210", title: "Credit Card Issuing", description: "Credit card companies, payment processing" },
  { code: "522291", title: "Consumer Lending", description: "Personal loans, consumer finance" },
  { code: "523110", title: "Investment Banking and Securities", description: "Investment services, securities trading" },
  { code: "524113", title: "Direct Life Insurance Carriers", description: "Life insurance companies" },
  { code: "524126", title: "Direct Property and Casualty Insurance", description: "Property insurance, casualty insurance" },
  { code: "525910", title: "Open-End Investment Funds", description: "Mutual funds, investment funds" },
  
  // Retail & E-commerce
  { code: "454110", title: "Electronic Shopping and Mail-Order Houses", description: "E-commerce, online retail, mail order" },
  { code: "441110", title: "New Car Dealers", description: "Automotive sales, car dealerships" },
  { code: "444110", title: "Home Centers", description: "Home improvement stores, hardware stores" },
  { code: "445110", title: "Supermarkets and Grocery Stores", description: "Food retail, grocery chains" },
  { code: "448110", title: "Men's Clothing Stores", description: "Apparel retail, clothing stores" },
  { code: "722511", title: "Full-Service Restaurants", description: "Restaurants, food service" },
  { code: "722513", title: "Limited-Service Restaurants", description: "Fast food, quick service restaurants" },
  
  // Construction & Real Estate
  { code: "236115", title: "New Single-Family Housing Construction", description: "Home building, residential construction" },
  { code: "236220", title: "Commercial and Institutional Building Construction", description: "Commercial construction, office buildings" },
  { code: "238110", title: "Poured Concrete Foundation Contractors", description: "Foundation work, concrete services" },
  { code: "238210", title: "Electrical Contractors", description: "Electrical installation, wiring services" },
  { code: "238220", title: "Plumbing, Heating, and Air-Conditioning Contractors", description: "HVAC, plumbing services" },
  { code: "531110", title: "Lessors of Residential Buildings", description: "Property management, apartment rentals" },
  { code: "531120", title: "Lessors of Nonresidential Buildings", description: "Commercial real estate, office leasing" },
  { code: "531210", title: "Offices of Real Estate Agents and Brokers", description: "Real estate services, property sales" },
  
  // Transportation & Logistics
  { code: "484110", title: "General Freight Trucking, Local", description: "Local delivery, trucking services" },
  { code: "484121", title: "General Freight Trucking, Long-Distance", description: "Long-haul trucking, freight transport" },
  { code: "488510", title: "Freight Transportation Arrangement", description: "Logistics, freight brokerage" },
  { code: "492110", title: "Couriers and Express Delivery Services", description: "Package delivery, courier services" },
  { code: "493110", title: "General Warehousing and Storage", description: "Warehousing, distribution centers" },
  
  // Agriculture & Food
  { code: "111110", title: "Soybean Farming", description: "Agricultural production, crop farming" },
  { code: "111150", title: "Corn Farming", description: "Corn production, grain farming" },
  { code: "112111", title: "Beef Cattle Ranching and Farming", description: "Cattle operations, livestock" },
  { code: "112210", title: "Hog and Pig Farming", description: "Pork production, swine operations" },
  { code: "114111", title: "Finfish Fishing", description: "Commercial fishing, seafood harvesting" },
  
  // Energy & Utilities
  { code: "211111", title: "Crude Petroleum and Natural Gas Extraction", description: "Oil and gas production" },
  { code: "221111", title: "Hydroelectric Power Generation", description: "Renewable energy, power generation" },
  { code: "221112", title: "Fossil Fuel Electric Power Generation", description: "Traditional power generation" },
  { code: "221113", title: "Nuclear Electric Power Generation", description: "Nuclear power plants" },
  { code: "221114", title: "Solar Electric Power Generation", description: "Solar energy, renewable power" },
  { code: "221115", title: "Wind Electric Power Generation", description: "Wind energy, renewable power" },
  
  // Media & Entertainment
  { code: "515120", title: "Television Broadcasting", description: "TV stations, broadcasting" },
  { code: "515210", title: "Cable and Satellite Broadcasting", description: "Cable TV, satellite services" },
  { code: "519130", title: "Internet Publishing and Broadcasting", description: "Online media, digital content" },
  { code: "711130", title: "Musical Groups and Artists", description: "Entertainment, music industry" },
  { code: "712110", title: "Museums", description: "Cultural institutions, museums" },
  { code: "713110", title: "Amusement and Theme Parks", description: "Entertainment venues, theme parks" },
];

export function searchNAICSCodes(query: string): NAICSCode[] {
  if (!query || query.trim().length < 2) {
    return [];
  }
  
  const searchTerm = query.toLowerCase();
  return naicsCodes.filter(naics => 
    naics.code.includes(searchTerm) ||
    naics.title.toLowerCase().includes(searchTerm) ||
    naics.description.toLowerCase().includes(searchTerm)
  ).slice(0, 10); // Limit to 10 results for performance
}

export function getNAICSByCode(code: string): NAICSCode | undefined {
  return naicsCodes.find(naics => naics.code === code);
}