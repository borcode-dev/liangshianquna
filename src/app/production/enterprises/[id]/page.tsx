import { productionEnterprises } from '@/lib/mock-data';
import ProductionEnterpriseDetailClient from './client';

export function generateStaticParams() {
  return productionEnterprises.map((e) => ({ id: e.id }));
}

export default function ProductionEnterpriseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <ProductionEnterpriseDetailClient params={params} />;
}
