import React from 'react';
import Link from 'next/link';

interface DashboardCardProps {
  title: string;
  description: string;
  href: string;
  buttonText: string;
  icon?: React.ReactNode;
  color?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  description,
  href,
  buttonText,
  icon,
  color = 'blue'
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
    green: 'bg-green-50 border-green-200 hover:bg-green-100',
    purple: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
    red: 'bg-red-50 border-red-200 hover:bg-red-100',
    yellow: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100',
    indigo: 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100',
    pink: 'bg-pink-50 border-pink-200 hover:bg-pink-100',
    gray: 'bg-gray-50 border-gray-200 hover:bg-gray-100'
  };

  const buttonClasses = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
    red: 'bg-red-600 hover:bg-red-700',
    yellow: 'bg-yellow-600 hover:bg-yellow-700',
    indigo: 'bg-indigo-600 hover:bg-indigo-700',
    pink: 'bg-pink-600 hover:bg-pink-700',
    gray: 'bg-gray-600 hover:bg-gray-700'
  };

  return (
    <div className={`border rounded-lg p-6 transition-colors duration-200 ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
        </div>
        {icon && (
          <div className="ml-4 text-2xl">
            {icon}
          </div>
        )}
      </div>
      <Link
        href={href}
        className={`inline-block px-4 py-2 text-white rounded-md transition-colors duration-200 ${buttonClasses[color as keyof typeof buttonClasses]}`}
      >
        {buttonText}
      </Link>
    </div>
  );
};

export default DashboardCard;
