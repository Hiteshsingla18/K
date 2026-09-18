import RoleLoginShell from './RoleLoginShell';
import { ActiveRole } from '../types';

export default function MineOfficerServiceLogin({ onAuthenticate, onBack }: { onAuthenticate: (role: ActiveRole) => void; onBack: () => void }) {
  return <RoleLoginShell
    role="MINE_OFFICER"
    eyebrow="Coal India subsidiary operational theme"
    title="Mine Safety Officer Operations Desk"
    subtitle="DGMS Rule 29 field access for inspections, gas telemetry, PPE verification, and CAPA dispatch."
    fields={[
      { name: 'serviceId', label: 'CIL Officer Service ID', placeholder: 'CIL-RAJ-9041' },
      { name: 'pin', label: 'Biometric Security PIN', placeholder: '••••', type: 'password', inputMode: 'numeric' }
    ]}
    demoLabel="Quick Fill Rajmahal Officer Credentials"
    theme="coal"
    onAuthenticate={onAuthenticate}
    onBack={onBack}
  />;
}
