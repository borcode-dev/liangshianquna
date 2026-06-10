import { businessEnterprises } from '@/lib/mock-data';
import BusinessEnterpriseDetailClient from './client';

export function generateStaticParams() {
  return businessEnterprises.map((e) => ({ id: e.id }));
}

export default function BusinessEnterpriseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <BusinessEnterpriseDetailClient params={params} />;
}
