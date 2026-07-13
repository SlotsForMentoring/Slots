import { useAuthStore } from '@/stores/authStore'
import { RoleBadge } from '@/components/atoms'

// Note: this page is routed at /home for trainees but isn't linked from the
// navbar (Navbar's trainee links are "Browse Slots" and "My Bookings") — it
// looks like early scaffolding from before the design system existed. Kept
// as a simple account summary and restyled to match the rest of the app;
// worth confirming whether it should be linked somewhere or removed.
export default function HomePage() {
  const user = useAuthStore((state) => state.user)

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-5 sm:px-6 py-10 sm:py-14">
        <p className="[font-family:var(--font-family-display)] text-[26px] font-semibold tracking-tight text-foreground">
          Your account
        </p>

        {user && (
          <div className="mt-6 rounded-xl border border-border bg-card shadow-[var(--shadow-soft-sm)] divide-y divide-border">
            <div className="flex items-center justify-between px-5 py-4">
              <span className="text-sm text-muted-foreground">Name</span>
              <span className="text-sm font-medium text-foreground">{user.name}</span>
            </div>
            <div className="flex items-center justify-between px-5 py-4">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="text-sm font-medium text-foreground">{user.email}</span>
            </div>
            <div className="flex items-center justify-between px-5 py-4">
              <span className="text-sm text-muted-foreground">Role</span>
              <RoleBadge role={user.role} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
