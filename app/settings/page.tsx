import PageContainer from "@/components/PageContainer";

export default function SettingsPage() {
  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your app preferences and display options
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            General Preferences
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Control your default app experience
          </p>

          <div className="mt-5 space-y-4">
            <div className="rounded-xl border border-gray-100 bg-slate-50 p-4">
              <p className="text-sm font-medium text-gray-900">Currency</p>
              <p className="mt-1 text-sm text-gray-500">
                Malaysian Ringgit (RM)
              </p>
            </div>

            <div className="rounded-xl border border-gray-100 bg-slate-50 p-4">
              <p className="text-sm font-medium text-gray-900">Theme</p>
              <p className="mt-1 text-sm text-gray-500">
                Light Minimal Fintech
              </p>
            </div>

            <div className="rounded-xl border border-gray-100 bg-slate-50 p-4">
              <p className="text-sm font-medium text-gray-900">Notifications</p>
              <p className="mt-1 text-sm text-gray-500">
                Payment reminders and savings updates
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Account</h2>
          <p className="mt-1 text-sm text-gray-500">
            Profile and sync settings will appear here
          </p>

          <div className="mt-5 space-y-4">
            <div className="rounded-xl border border-gray-100 bg-slate-50 p-4">
              <p className="text-sm font-medium text-gray-900">Profile Name</p>
              <p className="mt-1 text-sm text-gray-500">Savvyra User</p>
            </div>

            <div className="rounded-xl border border-gray-100 bg-slate-50 p-4">
              <p className="text-sm font-medium text-gray-900">Data Sync</p>
              <p className="mt-1 text-sm text-gray-500">
                Cloud sync will be available after backend integration
              </p>
            </div>

            <div className="rounded-xl border border-gray-100 bg-slate-50 p-4">
              <p className="text-sm font-medium text-gray-900">Security</p>
              <p className="mt-1 text-sm text-gray-500">
                Authentication and privacy settings coming soon
              </p>
            </div>
          </div>
        </section>
      </div>
    </PageContainer>
  );
}