import RoleLoginShell from './RoleLoginShell';
import { ActiveRole } from '../types';

export default function GovernmentParichayLogin({ onAuthenticate, onBack }: { onAuthenticate: (role: ActiveRole) => void; onBack: () => void }) {
  return <RoleLoginShell
    role="gov"
    eyebrow="Parichay Government SSO · Ministry of Coal & DGMS Access Gateway"
    title="National regulatory command, secured by identity."
    subtitle="A high-security access gateway for DGMS surveillance, statutory enforcement, and national mine oversight."
    fields={[
      { name: 'email', label: 'Government Email', placeholder: 'name@dgms.gov.in' },
      { name: 'password', label: 'Secure Token Password', placeholder: 'Enter secure token password', type: 'password' }
    ]}
    demoLabel="Quick Fill DGMS Regulator Credentials"
    theme="command"
    onAuthenticate={onAuthenticate}
    onBack={onBack}
  />;
}
