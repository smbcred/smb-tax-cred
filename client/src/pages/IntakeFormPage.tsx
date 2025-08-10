import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import IntakeForm from '@/components/forms/IntakeForm';
import { Loader2 } from 'lucide-react';

export default function IntakeFormPage() {
  const params = useParams();
  const intakeFormId = params?.id;

  // Fetch intake form data if ID is provided
  const { data: intakeFormData, isLoading } = useQuery({
    queryKey: ['/api/intake-forms', intakeFormId],
    enabled: !!intakeFormId,
  });

  if (isLoading && intakeFormId) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600">Loading intake form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <IntakeForm intakeFormId={intakeFormId} />
    </div>
  );
}