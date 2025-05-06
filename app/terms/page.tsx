import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to home
        </Link>
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-6">Guidelines for using Super Learn</p>
      </div>

      <div className="max-w-3xl mx-auto prose dark:prose-invert">
        <h2>Acceptance of Terms</h2>
        <p>
          By accessing or using Super Learn, you agree to be bound by these Terms of Service. If you do not agree to
          these terms, please do not use the service.
        </p>

        <h2>Description of Service</h2>
        <p>
          Super Learn provides a browser-based learning platform with note-taking, flashcard, and quiz functionality.
          All data is stored locally in your browser.
        </p>

        <h2>User Responsibilities</h2>
        <p>
          You are responsible for maintaining the confidentiality of your data and for all activities that occur under
          your use. We recommend regularly backing up your data using the export functionality.
        </p>

        <h2>Intellectual Property</h2>
        <p>
          The content you create using Super Learn belongs to you. The Super Learn application, including its design,
          code, and features, is protected by copyright and other intellectual property laws.
        </p>

        <h2>Limitation of Liability</h2>
        <p>
          Super Learn is provided "as is" without warranties of any kind. We are not responsible for any data loss or
          other damages that may occur from using the service.
        </p>

        <h2>Changes to Terms</h2>
        <p>
          We reserve the right to modify these terms at any time. We will provide notice of significant changes by
          posting the new Terms of Service on this page.
        </p>

        <h2>Governing Law</h2>
        <p>
          These Terms shall be governed by the laws of the jurisdiction in which we operate, without regard to its
          conflict of law provisions.
        </p>

        <p className="text-sm text-muted-foreground mt-8">Last updated: May 6, 2025</p>
      </div>
    </div>
  )
}
