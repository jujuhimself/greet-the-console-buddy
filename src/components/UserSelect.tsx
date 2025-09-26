
interface UserSelectProps {
  value: string;
  onChange: (value: string) => void;
  user: { id: string; email?: string } | null;
}

const UserSelect = ({ value, onChange, user }: UserSelectProps) => {
  return (
    <div>
      <label className="text-sm mr-1">User:</label>
      <select 
        className="border rounded px-2 py-1 text-sm"
        value={value} 
        onChange={e => onChange(e.target.value)}
      >
        <option value="">All Users</option>
        {user && <option value={user.id}>Current User ({user.email})</option>}
      </select>
    </div>
  );
};

export default UserSelect;
