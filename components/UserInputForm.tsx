
import React, { useState } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import TextArea from './ui/TextArea';

interface UserInputFormProps {
  onSubmit: (productDescription: string, avatarDescription: string) => void;
  isLoading: boolean;
}

const UserInputForm: React.FC<UserInputFormProps> = ({ onSubmit, isLoading }) => {
  const [product, setProduct] = useState('');
  const [avatar, setAvatar] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (product.trim() && avatar.trim()) {
      onSubmit(product, avatar);
    }
  };

  return (
    <Card>
      <div className="p-8">
        <h2 className="text-2xl font-bold text-sky-400 mb-2">Step 1: Define Your Offer</h2>
        <p className="text-slate-400 mb-6">Tell us about your product and your ideal customer. The more detail, the better the ads.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <TextArea
            id="product-description"
            label="What is your product/offer?"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            placeholder="e.g., A 12-week online course that teaches freelance writers how to land high-paying clients."
            required
          />
          <TextArea
            id="avatar-description"
            label="Who is your ideal customer?"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
            placeholder="e.g., Plumbers running a local service business. They struggle with inconsistent lead flow, are tired of competing on price, and want a predictable way to get 5-10 new high-quality jobs each week."
            required
            rows={5}
          />
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isLoading || !product.trim() || !avatar.trim()}>
              {isLoading ? 'Discovering Problems...' : 'Discover Problems'}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
};

export default UserInputForm;
