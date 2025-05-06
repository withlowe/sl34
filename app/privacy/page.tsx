import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to home
        </Link>
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-6">How we handle your data</p>
      </div>

      <div className="max-w-3xl mx-auto prose dark:prose-invert">
        <h2>Data Storage</h2>
        <p>
          Super Learn is designed with privacy in mind. All your notes, flashcards, and learning data are stored locally
          in your browser using localStorage. We do not collect, transmit, or store your content on our servers.
        </p>

        <h2>Data Export and Backup</h2>
        <p>
          You can export your data at any time using the Export feature. We recommend regularly backing up your data to
          prevent loss due to browser data clearing or device changes.
        </p>

        <h2>Cookies and Tracking</h2>
        <p>
          Super Learn does not use cookies or tracking technologies to monitor your usage or collect analytics data.
        </p>

        <h2>Third-Party Services</h2>
        <p>We do not integrate with third-party services that would collect or process your data.</p>

        <h2>Changes to This Policy</h2>
        <p>
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
          Privacy Policy on this page.
        </p>

        <h2>Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us at privacy@superlearn.example.com.</p>

        <p className="text-sm text-muted-foreground mt-8">Last updated: May 6, 2025</p>
      </div>
    </div>
  )
}
