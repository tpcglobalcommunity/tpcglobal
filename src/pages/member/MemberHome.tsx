import React from 'react';

type Props = {
  lang: any;
};

export default function MemberHome({ lang }: Props) {
  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">Member Dashboard</h1>
      <div className="text-white/70">
        Welcome to the Member Area. Your profile is complete and you have full access.
      </div>
    </div>
  );
}
