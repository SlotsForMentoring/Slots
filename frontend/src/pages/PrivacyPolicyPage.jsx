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

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-5 py-14 sm:px-6 sm:py-20">
        <p className="[font-family:var(--font-family-display)] text-[26px] font-semibold tracking-tight text-foreground">
          Privacy Policy
        </p>
        <p className="mt-1.5 text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>

        <div className="mt-8 border-t border-border pt-8">
          <Section title="Overview">
            <p>
              iMeet is a pair-scheduling platform that connects trainees with volunteer mentors for
              1-on-1 sessions. This policy explains what information we collect when you use iMeet,
              how we use it, and the choices you have.
            </p>
          </Section>

          <Section title="Information we collect">
            <p>When you sign in with Google, we receive and store:</p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Your name, email address, and profile picture from your Google account.</li>
              <li>Your role on the platform (trainee, volunteer mentor, or admin).</li>
            </ul>
            <p>
              To schedule sessions, we also request access to your Google Calendar
              (<code className="rounded bg-muted px-1 py-0.5 text-xs">calendar.events</code> scope).
              This is used only to create a calendar event with a video call link when a session is
              booked — we do not read, browse, or store the rest of your calendar.
            </p>
            <p>
              When you create or book a session, we store the slot's date and time, the session
              agenda or notes you provide, and the booking status.
            </p>
          </Section>

          <Section title="How we use your information">
            <ul className="list-disc space-y-1.5 pl-5">
              <li>To authenticate you and keep you signed in.</li>
              <li>To show trainees which mentors have open slots, and let them book a session.</li>
              <li>To create a calendar event and video call link for confirmed bookings.</li>
              <li>To let admins manage user roles and oversee platform activity.</li>
            </ul>
          </Section>

          <Section title="How we share your information">
            <p>
              We do not sell your personal information, and we do not share it with third parties
              for advertising or marketing purposes.
            </p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                When you book a session, your name, email, and session agenda are shared with the
                mentor (or trainee) on the other side of that booking, so the session can happen.
              </li>
              <li>
                Google's APIs are used solely to create calendar events and meeting links on your
                behalf — no data is shared with any other outside service.
              </li>
              <li>Platform administrators can see slot and booking details for oversight purposes.</li>
            </ul>
          </Section>

          <Section title="Data retention">
            <p>
              We retain your account and booking information for as long as your account is active.
              You can request deletion of your account and associated data at any time by contacting
              us at the address below.
            </p>
          </Section>

          <Section title="Your choices">
            <ul className="list-disc space-y-1.5 pl-5">
              <li>You can request access to, correction of, or deletion of your personal data.</li>
              <li>
                You can revoke iMeet's access to your Google account at any time from your{' '}
                <a
                  href="https://myaccount.google.com/permissions"
                  target="_blank"
                  rel="noreferrer"
                  className="text-flame-600 underline hover:text-flame-700 dark:text-flame-400"
                >
                  Google Account permissions
                </a>{' '}
                page.
              </li>
            </ul>
          </Section>

          <Section title="Security">
            <p>
              We use industry-standard measures — including encrypted connections (HTTPS) and secure,
              HTTP-only session cookies — to protect your information. No method of transmission or
              storage is 100% secure, but we work to protect your data using reasonable safeguards.
            </p>
          </Section>

          <Section title="Children's privacy">
            <p>
              iMeet is not directed at children under 16, and we do not knowingly collect personal
              information from them.
            </p>
          </Section>

          <Section title="Changes to this policy">
            <p>
              We may update this policy from time to time. If we make material changes, we'll update
              the "Last updated" date above.
            </p>
          </Section>

          <Section title="Contact us">
            <p>
              Questions about this policy or your data? Email us at{' '}
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
