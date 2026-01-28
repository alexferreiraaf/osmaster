import { getEmployees } from '@/lib/data';
import { SettingsForm } from '@/components/settings/settings-form';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const employees = await getEmployees();
  
  return <SettingsForm employees={employees} />;
}
