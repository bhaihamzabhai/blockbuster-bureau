export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-display text-4xl text-white mb-4">Settings</h1>
      <p className="text-stardust mb-8">
        Configure your site settings and preferences.
      </p>

      <div className="bg-nebula rounded-xl border border-white/5 p-6">
        <p className="text-stardust text-center py-8">
          Settings panel coming soon. This section will include:
        </p>
        <ul className="text-stardust text-sm space-y-2 max-w-md mx-auto">
          <li>• Site title and description</li>
          <li>• Logo and favicon upload</li>
          <li>• Social media links</li>
          <li>• Analytics integration</li>
          <li>• SEO defaults</li>
          <li>• Email notifications</li>
        </ul>
      </div>
    </div>
  );
}