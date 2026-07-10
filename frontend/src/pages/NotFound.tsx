import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <Card className="max-w-md w-full text-center p-8 flex flex-col items-center gap-6 shadow-2xl">
        <div className="p-4 bg-amber-50 rounded-full border border-secondary text-primary animate-bounce">
          <Compass className="w-12 h-12" />
        </div>
        <div className="space-y-2 select-none">
          <h2 className="text-3xl font-extrabold text-text-primary tracking-tight">
            404 - Page Not Found
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            The page you are trying to visit does not exist or has been moved. Check the URL or click the button below to navigate back to safety.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/')}
          className="w-full flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" /> Go back Home
        </Button>
      </Card>
    </div>
  );
};
