
import React from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import { OfferType } from '../types';

interface OfferTypeSelectorProps {
  onSelect: (type: OfferType) => void;
  selectedProblem: string;
}

const OfferTypeSelector: React.FC<OfferTypeSelectorProps> = ({ onSelect, selectedProblem }) => {
  return (
    <Card>
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-sky-400 mb-2">Step 3: Offer Alignment</h2>
        <p className="text-slate-400 mb-1">Your offer solves the problem of:</p>
        <p className="text-xl font-semibold text-slate-200 bg-slate-800/50 rounded-md p-3 mb-6 max-w-2xl mx-auto">"{selectedProblem}"</p>

        <p className="text-slate-400 mb-6">Is your offer a direct product, or an assessment that diagnoses this problem?</p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button onClick={() => onSelect('product')} variant="secondary" size="large">
            It's a Product
          </Button>
          <Button onClick={() => onSelect('assessment')} variant="secondary" size="large">
            It's an Assessment
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default OfferTypeSelector;
