import { Search, Filter, RotateCw, Star, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { client } from "../lib/client";
import type { ScheduledEmail, SentRecord } from "../types";

interface HomepageProps {
  tab: "scheduled" | "sent";
}

const Homepage = ({ tab }: HomepageProps) => {
  const navigate = useNavigate();
  const [scheduledEmails, setScheduledEmails] = useState<ScheduledEmail[]>([]);
  const [sentEmails, setSentEmails] = useState<SentRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      if (tab === "scheduled") {
        const data = await client.listEmails();
        setScheduledEmails(data);
      } else {
        const data = await client.listHistory();
        setSentEmails(data);
      }
    } catch (err) {
      console.error("Failed to fetch emails", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, [tab]);

  const displayItems =
    tab === "scheduled"
      ? scheduledEmails.map((e) => ({
          id: e.id,
          to: Array.isArray(e.recipients)
            ? e.recipients.join(", ")
            : e.recipients || "No Recipient",
          time: new Date(
            e.startTime || e.createdAt || Date.now(),
          ).toLocaleString(),
          subject: e.subject || "No Subject",
          snippet:
            (e.body || "").replace(/<[^>]*>?/gm, "").substring(0, 50) + "...",
          status:
            e.status === "SENT"
              ? "delivered"
              : e.status === "FAILED"
                ? "failed"
                : "scheduled",
          statusText:
            e.status === "SENT"
              ? "Delivered"
              : e.status === "FAILED"
                ? "Failed"
                : "",
        }))
      : sentEmails.map((e) => ({
          id: e.emailId || e.id,
          to: e.recipient,
          time: new Date(e.sentAt).toLocaleString(),
          subject: e.subject || "No Subject",
          snippet: (e as any).body
            ? (e as any).body.replace(/<[^>]*>?/gm, "").substring(0, 50) + "..."
            : e.status === "SENT"
              ? "Successfully delivered."
              : `Failed: ${e.error || "Unknown error"}`,
          status: "sent",
          statusText: "Sent",
        }));

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex-1 max-w-2xl flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="w-full bg-[#f5f5f5] text-sm py-2 pl-9 pr-4 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Filter className="w-4 h-4" />
          </button>
          <button
            onClick={fetchEmails}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <RotateCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && displayItems.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : displayItems.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No {tab} emails found.
          </div>
        ) : (
          displayItems.map((email) => (
            <div
              key={email.id}
              onClick={() => navigate(`/email/${email.id}`)}
              className="group flex items-center gap-4 px-6 py-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="w-48 font-semibold text-sm truncate">
                To: {email.to}
              </div>

              <div className="w-40 flex-shrink-0">
                {email.status === "scheduled" ? (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-100/50 text-orange-700 text-xs font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    {email.time}
                  </div>
                ) : email.status === "delivered" ? (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                    Delivered
                  </div>
                ) : email.status === "failed" ? (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                    Failed
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                    {email.statusText}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 text-sm truncate">
                <span className="font-semibold text-gray-900">
                  {email.subject}
                </span>
                <span className="text-gray-400 mx-2">-</span>
                <span className="text-gray-500">{email.snippet}</span>
              </div>

              <button className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-yellow-400 transition-all">
                <Star className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Homepage;
