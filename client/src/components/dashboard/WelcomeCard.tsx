import { useAuth } from "@/hooks/useAuth";
import { formatCurrency } from "@/services/calculator.service";
import { Card, CardContent } from "@/components/ui/card";

interface WelcomeCardProps {
  estimatedCredit: number;
}

export default function WelcomeCard({ estimatedCredit }: WelcomeCardProps) {
  const { user } = useAuth();
  
  const userName = user?.email ? user.email.split('@')[0] : '';
  const currentTime = new Date().getHours();
  const greeting = currentTime < 12 ? 'Good morning' : currentTime < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <Card className="bg-gradient-to-r from-rd-primary-500 to-rd-secondary-500 text-white">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {greeting}{userName ? `, ${userName}` : ''}!
            </h1>
            <p className="text-rd-primary-100 text-lg">
              Track your R&D tax credit progress and manage your documentation.
            </p>
          </div>
          <div className="text-right">
            <div className="text-rd-primary-100 text-sm mb-1">Estimated Credit</div>
            <div className="text-4xl font-bold">
              {formatCurrency(estimatedCredit)}
            </div>
            <div className="text-rd-primary-100 text-sm mt-1">
              Based on your calculation
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}