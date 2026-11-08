export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
import { ApprovalsComponent } from '@gitroom/frontend/components/approvals/approvals.component';
export const metadata: Metadata = {
  title: 'Castkite Approvals',
  description: '',
};
export default async function Index() {
  return <ApprovalsComponent />;
}
