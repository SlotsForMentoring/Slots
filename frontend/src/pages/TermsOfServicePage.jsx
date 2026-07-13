const CONTACT_EMAIL = 'jeny.janybek@gmail.com'
const LAST_UPDATED = 'July 13, 2026'

function Section({ title, children }) {
  return (
    <section className="mt-8 first:mt-0">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <div className="mt-2 space-y-3 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  )
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-5 py-14 sm:px-6 sm:py-20">
        <p className="[font-family:var(--font-family-display)] text-[26px] font-semibold tracking-tight text-foreground">
          Terms of Service
        </p>
        <p className="mt-1.5 text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>

        <div className="mt-8 border-t border-border pt-8">
          <Section title="Overview">
            <p>
              iMeet is a free pair-scheduling platform that connects trainees with volunteer mentors
              for 1-on-1 sessions. By signing in and using iMeet, you agree to these terms.
            </p>
          </Section>

          <Section title="Accounts">
            <ul className="list-disc space-y-1.5 pl-5">
              <li>You sign in to iMeet using your Google account — there are no separate iMeet passwords.</li>
              <li>You're responsible for the accuracy of the information tied to your Google account.</li>
              <li>Your role (trainee, volunteer mentor, or admin) determines what you can do on the platform, and is managed by iMeet admins.</li>
              <li>One account per person. Don't share your account or impersonate someone else.</li>
            </ul>
          </Section>

          <Section title="Acceptable use">
            <p>When using iMeet, you agree not to:</p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Harass, abuse, or discriminate against another user in a session or message.</li>
              <li>Create fake slots or bookings, or use the platform for anything other than genuine mentoring sessions.</li>
              <li>Attempt to disrupt, reverse-engineer, or gain unauthorized access to iMeet or other users' data.</li>
              <li>Use iMeet for any unlawful purpose.</li>
            </ul>
          </Section>

          <Section title="Mentoring sessions">
            <p>
              Volunteer mentors offer their own time and set their own availability — iMeet does not
              guarantee that any mentor will be available, nor does it vet, supervise, or take
              responsibility for the content, quality, or outcome of a mentoring session.
            </p>
            <p>
              When a session is booked, iMeet creates a Google Calendar event with a Google Meet link
              for both participants. If you need to cancel or reschedule, please contact the other
              participant directly using the contact details shared for that booking.
            </p>
          </Section>

          <Section title="No warranty">
            <p>
              iMeet is provided "as is" and "as available," without warranties of any kind, express or
              implied. We don't guarantee the service will be uninterrupted, error-free, or available
              at all times.
            </p>
          </Section>

          <Section title="Limitation of liability">
            <p>
              To the fullest extent permitted by law, iMeet and its operator are not liable for any
              indirect, incidental, or consequential damages arising from your use of the platform or
              from any mentoring session arranged through it.
            </p>
          </Section>

          <Section title="Suspension and termination">
            <p>
              We may suspend or terminate your access to iMeet if you violate these terms or misuse
              the platform. You can stop using iMeet at any time; see our{' '}
              <a href="/privacy" className="text-flame-600 underline hover:text-flame-700 dark:text-flame-400">
                Privacy Policy
              </a>{' '}
              for how to request deletion of your data.
            </p>
          </Section>

          <Section title="Changes to these terms">
            <p>
              We may update these terms from time to time. If we make material changes, we'll update
              the "Last updated" date above. Continuing to use iMeet after a change means you accept
              the updated terms.
            </p>
          </Section>

          <Section title="Contact us">
            <p>
              Questions about these terms? Email us at{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-flame-600 underline hover:text-flame-700 dark:text-flame-400">
                {CONTACT_EMAIL}
              </a>.
            </p>
          </Section>
        </div>
      </div>
    </div>
  )
}
