import RoleLoginShell from './RoleLoginShell';
import { ActiveRole } from '../types';

export default function CollieryCorporateLogin({ onAuthenticate, onBack }: { onAuthenticate: (role: ActiveRole) => void; onBack: () => void }) {
  return <RoleLoginShell
    role="operator"
    eyebrow="Enterprise compliance identity gateway"
    title="Colliery Leaseholder Compliance & SCN Resolution Desk"
    subtitle="Corporate access for ECL lease filings, statutory responses, boundary evidence, and SCN resolution."
    fields={[
      { name: 'email', label: 'Corporate Email', placeholder: 'compliance@ecl.gov.in' },
      { name: 'code', label: 'Mine Lease Registration Code (CIN/MLC)', placeholder: 'ECL-MLC-RAJ-2026' }
    ]}
    demoLabel="Quick Fill ECL Operator Credentials"
    theme="corporate"
    onAuthenticate={onAuthenticate}
    onBack={onBack}
  />;
}
