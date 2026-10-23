import { PageHeader } from "@/components/dashboard/PageHeader";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "How do I add a new project?",
    answer: "Navigate to the Projects page from the sidebar, then click the 'New Project' button in the top right corner. Fill in the project details including name, client, budget, and due date."
  },
  {
    question: "Can I track time spent on tasks?",
    answer: "Yes! Each task can have time tracking enabled. Click on a task to open the details panel, then use the time tracking feature to log hours spent on that specific task."
  },
  {
    question: "How do invoices work?",
    answer: "Invoices can be created from the Invoices page. You can link them to specific projects and clients. The system automatically calculates totals and tracks payment status (pending, paid, overdue)."
  },
  {
    question: "Can I invite team members?",
    answer: "Team collaboration features are coming soon. Currently, the dashboard supports single-user accounts. Stay tuned for updates on team workspaces."
  },
  {
    question: "How do I change my profile information?",
    answer: "Go to Settings from the sidebar, then click on 'Profile'. Here you can update your name, company information, and avatar."
  },
  {
    question: "What do the project statuses mean?",
    answer: "Projects have three statuses: 'Active' (currently being worked on), 'On Hold' (temporarily paused), and 'Completed' (finished). You can change status from the project details page."
  },
  {
    question: "How is progress calculated?",
    answer: "Project progress is manually set as a percentage (0-100%). You can update it from the project details to reflect actual completion. Task completion does not automatically update project progress."
  },
  {
    question: "Can I export my data?",
    answer: "Use Export in Settings to download a JSON backup containing the owner profile, clients, leads, projects, tasks, invoices, forms, templates, proposals, notifications, and activity records."
  },
  {
    question: "How do calendar events work?",
    answer: "The dashboard calendar combines project deadlines, task due dates, and events. Use the Calendar page to create and manage meetings, deadlines, and custom events."
  },
  {
    question: "Is my data secure?",
    answer: "Yes, all data is encrypted and stored securely. Each user can only access their own data through row-level security policies. We never share your information with third parties."
  }
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="glass rounded-xl overflow-hidden animate-slide-up">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-5 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
      >
        <span className="font-medium text-foreground pr-4">{question}</span>
        <ChevronDown className={cn(
          "w-5 h-5 text-muted-foreground shrink-0 transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>
      {isOpen && (
        <div className="px-5 pb-5 pt-0">
          <p className="text-muted-foreground leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <PageHeader 
        title="Frequently Asked Questions" 
        description="Find answers to common questions about using the agency dashboard."
      />

      <div className="max-w-3xl space-y-3">
        {faqs.map((faq, index) => (
          <div key={index} style={{ animationDelay: `${index * 50}ms` }}>
            <FAQItem {...faq} />
          </div>
        ))}
      </div>

      <div className="max-w-3xl mt-8 glass rounded-xl p-6 text-center">
        <h3 className="text-lg font-semibold text-foreground mb-2">Still have questions?</h3>
        <p className="text-muted-foreground mb-4">
          Can't find what you're looking for? Reach out to our support team.
        </p>
        <a 
          href="mailto:support@agency.com" 
          className="text-primary hover:underline font-medium"
        >
          Contact Support
        </a>
      </div>
    </div>
  );
}
