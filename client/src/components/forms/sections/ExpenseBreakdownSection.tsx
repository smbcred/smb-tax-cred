import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, PlusIcon, TrashIcon, DollarSignIcon, PercentIcon, TrendingUpIcon } from 'lucide-react';
import { SUPPLY_CATEGORIES, SOFTWARE_CATEGORIES, JOB_ROLES, CONTRACTOR_TYPES } from '@/data/expense-categories';

interface Employee {
  id: string;
  name: string;
  role: string;
  annualSalary: number;
  rdTimePercentage: number;
  benefitsRate: number;
  startDate?: string;
  endDate?: string;
}

interface Contractor {
  id: string;
  name: string;
  type: string;
  totalCost: number;
  rdTimePercentage: number;
  description: string;
  startDate?: string;
  endDate?: string;
}

interface Supply {
  id: string;
  description: string;
  category: string;
  totalCost: number;
  rdAllocation: number;
  vendor?: string;
  purchaseDate?: string;
}

interface Software {
  id: string;
  name: string;
  category: string;
  monthlyCost: number;
  rdAllocation: number;
  vendor?: string;
  startDate?: string;
  endDate?: string;
}

interface ExpenseBreakdownData {
  employees?: Employee[];
  contractors?: Contractor[];
  supplies?: Supply[];
  software?: Software[];
  totalEmployeeCosts?: number;
  totalContractorCosts?: number;
  totalSupplyCosts?: number;
  totalSoftwareCosts?: number;
  totalQualifiedExpenses?: number;
}

interface ExpenseBreakdownSectionProps {
  data: ExpenseBreakdownData;
  onDataChange: (field: string, value: any) => void;
  onValidationChange: (isValid: boolean) => void;
}

const ExpenseBreakdownSection: React.FC<ExpenseBreakdownSectionProps> = ({
  data,
  onDataChange,
  onValidationChange
}) => {
  const [employees, setEmployees] = useState<Employee[]>(data.employees || []);
  const [contractors, setContractors] = useState<Contractor[]>(data.contractors || []);
  const [supplies, setSupplies] = useState<Supply[]>(data.supplies || []);
  const [software, setSoftware] = useState<Software[]>(data.software || []);

  // Calculate totals automatically
  useEffect(() => {
    const totalEmployeeCosts = employees.reduce((sum, emp) => 
      sum + (emp.annualSalary * (1 + emp.benefitsRate / 100) * (emp.rdTimePercentage / 100)), 0
    );
    
    const totalContractorCosts = contractors.reduce((sum, contractor) => 
      sum + (contractor.totalCost * (contractor.rdTimePercentage / 100)), 0
    );
    
    const totalSupplyCosts = supplies.reduce((sum, supply) => 
      sum + (supply.totalCost * (supply.rdAllocation / 100)), 0
    );
    
    const totalSoftwareCosts = software.reduce((sum, soft) => 
      sum + (soft.monthlyCost * 12 * (soft.rdAllocation / 100)), 0
    );
    
    const totalQualifiedExpenses = totalEmployeeCosts + totalContractorCosts + totalSupplyCosts + totalSoftwareCosts;

    // Update parent data
    onDataChange('employees', employees);
    onDataChange('contractors', contractors);
    onDataChange('supplies', supplies);
    onDataChange('software', software);
    onDataChange('totalEmployeeCosts', totalEmployeeCosts);
    onDataChange('totalContractorCosts', totalContractorCosts);
    onDataChange('totalSupplyCosts', totalSupplyCosts);
    onDataChange('totalSoftwareCosts', totalSoftwareCosts);
    onDataChange('totalQualifiedExpenses', totalQualifiedExpenses);

    // Validation - at least one expense category must have data
    const hasExpenses = employees.length > 0 || contractors.length > 0 || supplies.length > 0 || software.length > 0;
    onValidationChange(hasExpenses && totalQualifiedExpenses > 0);
  }, [employees, contractors, supplies, software, onDataChange, onValidationChange]);

  const addEmployee = () => {
    const newEmployee: Employee = {
      id: `emp_${Date.now()}`,
      name: '',
      role: '',
      annualSalary: 0,
      rdTimePercentage: 100,
      benefitsRate: 25
    };
    setEmployees([...employees, newEmployee]);
  };

  const updateEmployee = (id: string, field: keyof Employee, value: any) => {
    setEmployees(employees.map(emp => 
      emp.id === id ? { ...emp, [field]: value } : emp
    ));
  };

  const removeEmployee = (id: string) => {
    setEmployees(employees.filter(emp => emp.id !== id));
  };

  const addContractor = () => {
    const newContractor: Contractor = {
      id: `contractor_${Date.now()}`,
      name: '',
      type: '',
      totalCost: 0,
      rdTimePercentage: 100,
      description: ''
    };
    setContractors([...contractors, newContractor]);
  };

  const updateContractor = (id: string, field: keyof Contractor, value: any) => {
    setContractors(contractors.map(contractor => 
      contractor.id === id ? { ...contractor, [field]: value } : contractor
    ));
  };

  const removeContractor = (id: string) => {
    setContractors(contractors.filter(contractor => contractor.id !== id));
  };

  const addSupply = () => {
    const newSupply: Supply = {
      id: `supply_${Date.now()}`,
      description: '',
      category: '',
      totalCost: 0,
      rdAllocation: 100
    };
    setSupplies([...supplies, newSupply]);
  };

  const updateSupply = (id: string, field: keyof Supply, value: any) => {
    setSupplies(supplies.map(supply => 
      supply.id === id ? { ...supply, [field]: value } : supply
    ));
  };

  const removeSupply = (id: string) => {
    setSupplies(supplies.filter(supply => supply.id !== id));
  };

  const addSoftware = () => {
    const newSoftware: Software = {
      id: `software_${Date.now()}`,
      name: '',
      category: '',
      monthlyCost: 0,
      rdAllocation: 100
    };
    setSoftware([...software, newSoftware]);
  };

  const updateSoftware = (id: string, field: keyof Software, value: any) => {
    setSoftware(software.map(soft => 
      soft.id === id ? { ...soft, [field]: value } : soft
    ));
  };

  const removeSoftware = (id: string) => {
    setSoftware(software.filter(soft => soft.id !== id));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="border-primary/20 bg-primary/5 dark:bg-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <TrendingUpIcon className="h-5 w-5" />
            Expense Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{formatCurrency(data.totalEmployeeCosts || 0)}</div>
              <div className="text-sm text-muted-foreground">Employee Costs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{formatCurrency(data.totalContractorCosts || 0)}</div>
              <div className="text-sm text-muted-foreground">Contractor Costs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{formatCurrency(data.totalSupplyCosts || 0)}</div>
              <div className="text-sm text-muted-foreground">Supply Costs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{formatCurrency(data.totalSoftwareCosts || 0)}</div>
              <div className="text-sm text-muted-foreground">Software Costs</div>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{formatCurrency(data.totalQualifiedExpenses || 0)}</div>
            <div className="text-lg text-muted-foreground">Total Qualified R&D Expenses</div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="employees" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="employees">Employees ({employees.length})</TabsTrigger>
          <TabsTrigger value="contractors">Contractors ({contractors.length})</TabsTrigger>
          <TabsTrigger value="supplies">Supplies ({supplies.length})</TabsTrigger>
          <TabsTrigger value="software">Software ({software.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Employee Expenses</h3>
              <p className="text-sm text-muted-foreground">Add employees who work on R&D activities</p>
            </div>
            <Button onClick={addEmployee} className="flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              Add Employee
            </Button>
          </div>

          {employees.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <p>No employees added yet. Click "Add Employee" to get started.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {employees.map((employee) => (
                <Card key={employee.id}>
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">Employee Details</CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeEmployee(employee.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`emp-name-${employee.id}`}>Employee Name *</Label>
                        <Input
                          id={`emp-name-${employee.id}`}
                          value={employee.name}
                          onChange={(e) => updateEmployee(employee.id, 'name', e.target.value)}
                          placeholder="John Smith"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`emp-role-${employee.id}`}>Job Role *</Label>
                        <Select value={employee.role} onValueChange={(value) => updateEmployee(employee.id, 'role', value)}>
                          <SelectTrigger id={`emp-role-${employee.id}`}>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            {JOB_ROLES.map((role) => (
                              <SelectItem key={role} value={role}>{role}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`emp-salary-${employee.id}`}>Annual Salary *</Label>
                        <div className="relative">
                          <DollarSignIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id={`emp-salary-${employee.id}`}
                            type="number"
                            value={employee.annualSalary || ''}
                            onChange={(e) => updateEmployee(employee.id, 'annualSalary', parseFloat(e.target.value) || 0)}
                            placeholder="75000"
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`emp-rd-time-${employee.id}`}>R&D Time % *</Label>
                        <div className="relative">
                          <PercentIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id={`emp-rd-time-${employee.id}`}
                            type="number"
                            min="0"
                            max="100"
                            value={employee.rdTimePercentage || ''}
                            onChange={(e) => updateEmployee(employee.id, 'rdTimePercentage', parseFloat(e.target.value) || 0)}
                            placeholder="100"
                            className="pr-10"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`emp-benefits-${employee.id}`}>Benefits Rate %</Label>
                        <div className="relative">
                          <PercentIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id={`emp-benefits-${employee.id}`}
                            type="number"
                            min="0"
                            max="100"
                            value={employee.benefitsRate || ''}
                            onChange={(e) => updateEmployee(employee.id, 'benefitsRate', parseFloat(e.target.value) || 0)}
                            placeholder="25"
                            className="pr-10"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">R&D Qualified Cost:</span>
                        <span className="text-lg font-bold text-primary">
                          {formatCurrency(employee.annualSalary * (1 + employee.benefitsRate / 100) * (employee.rdTimePercentage / 100))}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="contractors" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Contractor Expenses</h3>
              <p className="text-sm text-muted-foreground">Add contractors and consultants for R&D work</p>
            </div>
            <Button onClick={addContractor} className="flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              Add Contractor
            </Button>
          </div>

          {contractors.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <p>No contractors added yet. Click "Add Contractor" to get started.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {contractors.map((contractor) => (
                <Card key={contractor.id}>
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">Contractor Details</CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeContractor(contractor.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`contractor-name-${contractor.id}`}>Contractor Name *</Label>
                        <Input
                          id={`contractor-name-${contractor.id}`}
                          value={contractor.name}
                          onChange={(e) => updateContractor(contractor.id, 'name', e.target.value)}
                          placeholder="ABC Consulting LLC"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`contractor-type-${contractor.id}`}>Contractor Type *</Label>
                        <Select value={contractor.type} onValueChange={(value) => updateContractor(contractor.id, 'type', value)}>
                          <SelectTrigger id={`contractor-type-${contractor.id}`}>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {CONTRACTOR_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`contractor-cost-${contractor.id}`}>Total Cost *</Label>
                        <div className="relative">
                          <DollarSignIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id={`contractor-cost-${contractor.id}`}
                            type="number"
                            value={contractor.totalCost || ''}
                            onChange={(e) => updateContractor(contractor.id, 'totalCost', parseFloat(e.target.value) || 0)}
                            placeholder="50000"
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`contractor-rd-time-${contractor.id}`}>R&D Time % *</Label>
                        <div className="relative">
                          <PercentIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id={`contractor-rd-time-${contractor.id}`}
                            type="number"
                            min="0"
                            max="100"
                            value={contractor.rdTimePercentage || ''}
                            onChange={(e) => updateContractor(contractor.id, 'rdTimePercentage', parseFloat(e.target.value) || 0)}
                            placeholder="100"
                            className="pr-10"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`contractor-desc-${contractor.id}`}>Work Description *</Label>
                      <Textarea
                        id={`contractor-desc-${contractor.id}`}
                        value={contractor.description}
                        onChange={(e) => updateContractor(contractor.id, 'description', e.target.value)}
                        placeholder="Describe the R&D work performed by this contractor..."
                        rows={3}
                      />
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">R&D Qualified Cost:</span>
                        <span className="text-lg font-bold text-primary">
                          {formatCurrency(contractor.totalCost * (contractor.rdTimePercentage / 100) * 0.65)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        * IRS Section 41 limits contractor costs to 65% for R&D credit
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="supplies" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Supply Expenses</h3>
              <p className="text-sm text-muted-foreground">Add materials and supplies used for R&D</p>
            </div>
            <Button onClick={addSupply} className="flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              Add Supply
            </Button>
          </div>

          {supplies.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <p>No supplies added yet. Click "Add Supply" to get started.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {supplies.map((supply) => (
                <Card key={supply.id}>
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">Supply Details</CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeSupply(supply.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`supply-desc-${supply.id}`}>Description *</Label>
                        <Input
                          id={`supply-desc-${supply.id}`}
                          value={supply.description}
                          onChange={(e) => updateSupply(supply.id, 'description', e.target.value)}
                          placeholder="Testing materials, prototyping supplies, etc."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`supply-category-${supply.id}`}>Category *</Label>
                        <Select value={supply.category} onValueChange={(value) => updateSupply(supply.id, 'category', value)}>
                          <SelectTrigger id={`supply-category-${supply.id}`}>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {SUPPLY_CATEGORIES.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                <div className="flex items-center gap-2">
                                  {category.name}
                                  {category.rdQualified && <Badge variant="secondary" className="text-xs">R&D Qualified</Badge>}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`supply-cost-${supply.id}`}>Total Cost *</Label>
                        <div className="relative">
                          <DollarSignIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id={`supply-cost-${supply.id}`}
                            type="number"
                            value={supply.totalCost || ''}
                            onChange={(e) => updateSupply(supply.id, 'totalCost', parseFloat(e.target.value) || 0)}
                            placeholder="5000"
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`supply-allocation-${supply.id}`}>R&D Allocation % *</Label>
                        <div className="relative">
                          <PercentIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id={`supply-allocation-${supply.id}`}
                            type="number"
                            min="0"
                            max="100"
                            value={supply.rdAllocation || ''}
                            onChange={(e) => updateSupply(supply.id, 'rdAllocation', parseFloat(e.target.value) || 0)}
                            placeholder="100"
                            className="pr-10"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">R&D Qualified Cost:</span>
                        <span className="text-lg font-bold text-primary">
                          {formatCurrency(supply.totalCost * (supply.rdAllocation / 100))}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="software" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Software & Cloud Expenses</h3>
              <p className="text-sm text-muted-foreground">Add software subscriptions and cloud services for R&D</p>
            </div>
            <Button onClick={addSoftware} className="flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              Add Software
            </Button>
          </div>

          {software.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <p>No software expenses added yet. Click "Add Software" to get started.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {software.map((soft) => (
                <Card key={soft.id}>
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">Software Details</CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeSoftware(soft.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`software-name-${soft.id}`}>Software Name *</Label>
                        <Input
                          id={`software-name-${soft.id}`}
                          value={soft.name}
                          onChange={(e) => updateSoftware(soft.id, 'name', e.target.value)}
                          placeholder="AWS, OpenAI API, GitHub Copilot, etc."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`software-category-${soft.id}`}>Category *</Label>
                        <Select value={soft.category} onValueChange={(value) => updateSoftware(soft.id, 'category', value)}>
                          <SelectTrigger id={`software-category-${soft.id}`}>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {SOFTWARE_CATEGORIES.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                <div className="flex items-center gap-2">
                                  {category.name}
                                  <Badge 
                                    variant={category.rdRelevance === 'high' ? 'default' : category.rdRelevance === 'medium' ? 'secondary' : 'outline'}
                                    className="text-xs"
                                  >
                                    {category.rdRelevance.toUpperCase()} R&D
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`software-cost-${soft.id}`}>Monthly Cost *</Label>
                        <div className="relative">
                          <DollarSignIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id={`software-cost-${soft.id}`}
                            type="number"
                            value={soft.monthlyCost || ''}
                            onChange={(e) => updateSoftware(soft.id, 'monthlyCost', parseFloat(e.target.value) || 0)}
                            placeholder="500"
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`software-allocation-${soft.id}`}>R&D Allocation % *</Label>
                        <div className="relative">
                          <PercentIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id={`software-allocation-${soft.id}`}
                            type="number"
                            min="0"
                            max="100"
                            value={soft.rdAllocation || ''}
                            onChange={(e) => updateSoftware(soft.id, 'rdAllocation', parseFloat(e.target.value) || 0)}
                            placeholder="100"
                            className="pr-10"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Annual R&D Qualified Cost:</span>
                        <span className="text-lg font-bold text-primary">
                          {formatCurrency(soft.monthlyCost * 12 * (soft.rdAllocation / 100))}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExpenseBreakdownSection;