import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Building, MapPin, Calendar, Hash, Globe, Phone } from 'lucide-react';
import { industryOptions, entityTypeOptions, usStates } from '@/data/industry-options';
import { searchNAICSCodes, getNAICSByCode, type NAICSCode } from '@/data/naics-codes';
import { companyInfoSchema } from '@shared/schema';

interface CompanyInfoSectionProps {
  data: any;
  onDataChange: (data: any) => void;
  onValidationChange: (isValid: boolean) => void;
}

export default function CompanyInfoSection({ 
  data = {}, 
  onDataChange, 
  onValidationChange 
}: CompanyInfoSectionProps) {
  const [naicsSearchQuery, setNaicsSearchQuery] = useState('');
  const [naicsSearchResults, setNaicsSearchResults] = useState<NAICSCode[]>([]);
  const [showNaicsResults, setShowNaicsResults] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: any) => {
    const newData = { ...data, [field]: value };
    onDataChange(newData);
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddressChange = (field: string, value: string) => {
    const newAddress = { ...data.address, [field]: value };
    handleInputChange('address', newAddress);
  };

  const handleNaicsSearch = (query: string) => {
    setNaicsSearchQuery(query);
    if (query.length >= 2) {
      const results = searchNAICSCodes(query);
      setNaicsSearchResults(results);
      setShowNaicsResults(true);
    } else {
      setNaicsSearchResults([]);
      setShowNaicsResults(false);
    }
  };

  const selectNaicsCode = (naics: NAICSCode) => {
    handleInputChange('naicsCode', naics.code);
    handleInputChange('naicsDescription', naics.title);
    setNaicsSearchQuery(`${naics.code} - ${naics.title}`);
    setShowNaicsResults(false);
  };

  const clearNaicsCode = () => {
    handleInputChange('naicsCode', '');
    handleInputChange('naicsDescription', '');
    setNaicsSearchQuery('');
    setShowNaicsResults(false);
  };

  // Format EIN input
  const formatEIN = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length >= 2) {
      return `${cleanValue.slice(0, 2)}-${cleanValue.slice(2, 9)}`;
    }
    return cleanValue;
  };

  const handleEINChange = (value: string) => {
    const formatted = formatEIN(value);
    handleInputChange('ein', formatted);
  };

  // Format phone number
  const formatPhoneNumber = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length >= 6) {
      return `(${cleanValue.slice(0, 3)}) ${cleanValue.slice(3, 6)}-${cleanValue.slice(6, 10)}`;
    } else if (cleanValue.length >= 3) {
      return `(${cleanValue.slice(0, 3)}) ${cleanValue.slice(3)}`;
    }
    return cleanValue;
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    handleInputChange('phone', formatted);
  };

  // Validate section
  useEffect(() => {
    try {
      companyInfoSchema.parse(data);
      setValidationErrors({});
      onValidationChange(true);
    } catch (error: any) {
      const errors: Record<string, string> = {};
      if (error.errors) {
        error.errors.forEach((err: any) => {
          const path = err.path.join('.');
          errors[path] = err.message;
        });
      }
      setValidationErrors(errors);
      onValidationChange(false);
    }
  }, [data, onValidationChange]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1800 + 1 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-6">
      {/* Basic Company Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Building className="w-5 h-5 mr-2 text-blue-600" />
            Basic Company Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="legalName">Legal Business Name *</Label>
              <Input
                id="legalName"
                value={data.legalName || ''}
                onChange={(e) => handleInputChange('legalName', e.target.value)}
                placeholder="Enter your exact legal business name"
                className={validationErrors['legalName'] ? 'border-red-500' : ''}
                required
              />
              {validationErrors['legalName'] && (
                <p className="text-sm text-red-600">{validationErrors['legalName']}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ein">Federal EIN *</Label>
              <Input
                id="ein"
                value={data.ein || ''}
                onChange={(e) => handleEINChange(e.target.value)}
                placeholder="12-3456789"
                maxLength={10}
                className={validationErrors['ein'] ? 'border-red-500' : ''}
                required
              />
              {validationErrors['ein'] && (
                <p className="text-sm text-red-600">{validationErrors['ein']}</p>
              )}
              <p className="text-xs text-slate-500">
                Your 9-digit Employer Identification Number from the IRS
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entityType">Business Entity Type *</Label>
              <Select
                value={data.entityType || ''}
                onValueChange={(value) => handleInputChange('entityType', value)}
              >
                <SelectTrigger className={validationErrors['entityType'] ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select entity type" />
                </SelectTrigger>
                <SelectContent>
                  {entityTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors['entityType'] && (
                <p className="text-sm text-red-600">{validationErrors['entityType']}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="yearFounded">Year Founded *</Label>
              <Select
                value={data.yearFounded?.toString() || ''}
                onValueChange={(value) => handleInputChange('yearFounded', parseInt(value))}
              >
                <SelectTrigger className={validationErrors['yearFounded'] ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent className="max-h-48">
                  {years.slice(0, 50).map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors['yearFounded'] && (
                <p className="text-sm text-red-600">{validationErrors['yearFounded']}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">Industry *</Label>
            <Select
              value={data.industry || ''}
              onValueChange={(value) => handleInputChange('industry', value)}
            >
              <SelectTrigger className={validationErrors['industry'] ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select your industry" />
              </SelectTrigger>
              <SelectContent>
                {industryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-slate-500">{option.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {validationErrors['industry'] && (
              <p className="text-sm text-red-600">{validationErrors['industry']}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Business Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <MapPin className="w-5 h-5 mr-2 text-blue-600" />
            Business Address
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="street">Street Address *</Label>
            <Input
              id="street"
              value={data.address?.street || ''}
              onChange={(e) => handleAddressChange('street', e.target.value)}
              placeholder="123 Main Street, Suite 100"
              className={validationErrors['address.street'] ? 'border-red-500' : ''}
              required
            />
            {validationErrors['address.street'] && (
              <p className="text-sm text-red-600">{validationErrors['address.street']}</p>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={data.address?.city || ''}
                onChange={(e) => handleAddressChange('city', e.target.value)}
                placeholder="City"
                className={validationErrors['address.city'] ? 'border-red-500' : ''}
                required
              />
              {validationErrors['address.city'] && (
                <p className="text-sm text-red-600">{validationErrors['address.city']}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Select
                value={data.address?.state || ''}
                onValueChange={(value) => handleAddressChange('state', value)}
              >
                <SelectTrigger className={validationErrors['address.state'] ? 'border-red-500' : ''}>
                  <SelectValue placeholder="State" />
                </SelectTrigger>
                <SelectContent className="max-h-48">
                  {usStates.map((state) => (
                    <SelectItem key={state.value} value={state.value}>
                      {state.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors['address.state'] && (
                <p className="text-sm text-red-600">{validationErrors['address.state']}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="zipCode">ZIP Code *</Label>
              <Input
                id="zipCode"
                value={data.address?.zipCode || ''}
                onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                placeholder="12345"
                className={validationErrors['address.zipCode'] ? 'border-red-500' : ''}
                required
              />
              {validationErrors['address.zipCode'] && (
                <p className="text-sm text-red-600">{validationErrors['address.zipCode']}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Phone className="w-5 h-5 mr-2 text-blue-600" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Business Phone Number *</Label>
              <Input
                id="phone"
                value={data.phone || ''}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="(555) 123-4567"
                className={validationErrors['phone'] ? 'border-red-500' : ''}
                required
              />
              {validationErrors['phone'] && (
                <p className="text-sm text-red-600">{validationErrors['phone']}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website (Optional)</Label>
              <Input
                id="website"
                type="url"
                value={data.website || ''}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://www.yourcompany.com"
                className={validationErrors['website'] ? 'border-red-500' : ''}
              />
              {validationErrors['website'] && (
                <p className="text-sm text-red-600">{validationErrors['website']}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* NAICS Code Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Hash className="w-5 h-5 mr-2 text-blue-600" />
            NAICS Code (Optional)
          </CardTitle>
          <p className="text-sm text-slate-600">
            North American Industry Classification System code for your primary business activity
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.naicsCode ? (
            <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div>
                <div className="font-medium text-emerald-800">
                  {data.naicsCode} - {data.naicsDescription}
                </div>
                <div className="text-sm text-emerald-600">Selected NAICS Code</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearNaicsCode}
                className="text-emerald-700 border-emerald-300"
              >
                Change
              </Button>
            </div>
          ) : (
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search NAICS codes (e.g., 'software', 'consulting', '541511')"
                  value={naicsSearchQuery}
                  onChange={(e) => handleNaicsSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {showNaicsResults && naicsSearchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  {naicsSearchResults.map((naics) => (
                    <button
                      key={naics.code}
                      onClick={() => selectNaicsCode(naics)}
                      className="w-full p-3 text-left hover:bg-slate-50 border-b border-slate-100 last:border-b-0"
                    >
                      <div className="font-medium text-slate-900">{naics.code} - {naics.title}</div>
                      <div className="text-sm text-slate-600">{naics.description}</div>
                    </button>
                  ))}
                </div>
              )}
              
              {showNaicsResults && naicsSearchResults.length === 0 && naicsSearchQuery.length >= 2 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg p-3">
                  <div className="text-sm text-slate-600">No NAICS codes found for "{naicsSearchQuery}"</div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}