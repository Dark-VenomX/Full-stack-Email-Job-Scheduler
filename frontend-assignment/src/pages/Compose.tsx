import { useState, useRef } from "react";
import { ArrowLeft, Paperclip, Clock, ChevronUp, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { client } from "../lib/client";
import { useAuth } from "../hooks/useAuth";
import type { Attachment } from "../types";
import DefaultEditor from "react-simple-wysiwyg";

const Compose = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [showSendLater, setShowSendLater] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [to, setTo] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [subject, setSubject] = useState("");
  const [delay, setDelay] = useState("0");
  const [limit, setLimit] = useState("100");
  const [body, setBody] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const emails =
          text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi) ||
          [];
        if (emails.length > 0) {
          setTo((prev) => Array.from(new Set([...prev, ...emails])));
        } else {
          alert("No valid emails found in the file.");
        }
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          setAttachments((prev) => [
            ...prev,
            {
              name: file.name,
              type: file.type || "application/octet-stream",
              size: file.size,
              content: base64,
            },
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const getSuggestedTime = (offsetHours: number) => {
    const d = new Date();
    d.setHours(d.getHours() + offsetHours);

    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  const handleSchedule = async () => {
    // Flush any email that was typed but not confirmed with Enter/comma
    const pendingEmail = emailInput.trim().replace(/,/g, "");
    const finalRecipients = pendingEmail && !to.includes(pendingEmail)
      ? [...to, pendingEmail]
      : [...to];

    if (finalRecipients.length === 0) {
      alert("Please add at least one recipient.");
      return;
    }

    setIsSubmitting(true);
    try {
      let dateObj = new Date();
      if (scheduledTime) {
        dateObj = new Date(scheduledTime);
      }

      await client.scheduleEmail({
        recipients: finalRecipients,
        subject: subject,
        body: body,
        delaySeconds: parseInt(delay) || 0,
        hourlyLimit: parseInt(limit) || 1,
        startTime: dateObj.toISOString(),
        attachments: attachments,
      });

      navigate("/");
    } catch (err) {
      console.error("Failed to schedule", err);
      const message = err instanceof Error ? err.message : "Failed to schedule email.";
      alert(`Failed to schedule email: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col items-center py-8">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[800px]">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-1 text-gray-500 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-medium text-gray-900">
              Compose New Email
            </h1>
          </div>

          <div className="flex items-center gap-4 relative">
            <input
              type="file"
              multiple
              className="hidden"
              ref={attachmentInputRef}
              onChange={handleAttachmentUpload}
            />
            <button
              onClick={() => attachmentInputRef.current?.click()}
              className="relative p-2 text-gray-400 hover:text-gray-600"
            >
              <Paperclip className="w-5 h-5" />
              {attachments.length > 0 && (
                <span className="absolute bottom-1.5 right-1.5 text-[10px] font-bold text-gray-500 bg-white rounded-full w-3 h-3 flex items-center justify-center border border-gray-200">
                  {attachments.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowSendLater(!showSendLater)}
              className="p-2 text-brand-green hover:text-green-700"
              title="Schedule a time"
            >
              <Clock className="w-5 h-5" />
            </button>
            <button
              onClick={handleSchedule}
              disabled={isSubmitting}
              className="border border-brand-green bg-brand-green text-white font-medium py-1.5 px-6 rounded-full hover:bg-green-700 transition-colors text-sm disabled:opacity-50 ml-2"
            >
              {isSubmitting
                ? "Sending..."
                : scheduledTime
                  ? "Send Later"
                  : "Send Now"}
            </button>

            {showSendLater && (
              <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Send Later
                  </h3>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full text-sm py-2 px-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-green"
                    />
                  </div>
                </div>
                <div className="py-2">
                  <button
                    onClick={() => setScheduledTime(getSuggestedTime(24))}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Tomorrow
                  </button>
                  <button
                    onClick={() => setScheduledTime(getSuggestedTime(24 * 3))}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    In 3 Days
                  </button>
                </div>
                <div className="p-4 border-t border-gray-100 flex items-center justify-end gap-3">
                  <button
                    onClick={() => setShowSendLater(false)}
                    className="text-sm font-medium text-gray-900 hover:text-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setShowSendLater(false)}
                    className="border border-brand-green text-brand-green bg-green-50 text-sm font-medium py-1.5 px-4 rounded-full hover:bg-green-100"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-8 pb-4 space-y-6">
          <div className="flex items-center gap-8">
            <label className="w-12 text-sm font-medium text-gray-600">
              From
            </label>
            <div className="bg-[#f5f5f5] px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer">
              <span className="text-sm font-medium text-gray-900">
                {user?.email || "user@domain.io"}
              </span>
              <ChevronUp className="w-4 h-4 text-gray-500 rotate-180" />
            </div>
          </div>

          <div className="flex items-center gap-8 border-b border-gray-100 pb-4">
            <label className="w-12 text-sm font-medium text-gray-600">To</label>
            <div className="flex-1 flex flex-wrap gap-2 items-center min-h-[32px]">
              {to.map((email, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1 bg-[#e8f5e9] text-brand-green px-3 py-1 rounded-full text-sm font-medium border border-green-200"
                >
                  <span>{email}</span>
                  <button
                    onClick={() =>
                      setTo((prev) => prev.filter((_, idx) => idx !== i))
                    }
                    className="hover:text-green-700 ml-1 text-base leading-none translate-y-[-1px]"
                  >
                    ×
                  </button>
                </div>
              ))}
              <input
                type="text"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => {
                  if (["Enter", ",", " "].includes(e.key)) {
                    e.preventDefault();
                    const val = emailInput.trim().replace(/,/g, "");
                    if (val && !to.includes(val)) {
                      setTo((prev) => [...prev, val]);
                    }
                    setEmailInput("");
                  } else if (
                    e.key === "Backspace" &&
                    !emailInput &&
                    to.length > 0
                  ) {
                    setTo((prev) => prev.slice(0, -1));
                  }
                }}
                onBlur={() => {
                  const val = emailInput.trim().replace(/,/g, "");
                  if (val && !to.includes(val)) {
                    setTo((prev) => [...prev, val]);
                  }
                  setEmailInput("");
                }}
                placeholder={to.length === 0 ? "Comma separated emails" : ""}
                className="flex-1 min-w-[150px] focus:outline-none placeholder-gray-400 text-sm py-1 bg-transparent"
              />
            </div>
            <input
              type="file"
              accept=".csv,.txt"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 text-brand-green text-sm font-medium hover:text-green-700 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload List
            </button>
          </div>

          <div className="flex items-center gap-8 border-b border-gray-100 pb-4">
            <label className="w-12 text-sm font-medium text-gray-600">
              Subject
            </label>
            <input
              type="text"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="flex-1 focus:outline-none placeholder-gray-400"
            />
          </div>

          <div className="flex items-center gap-8 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-600">
                Delay (s)
              </label>
              <input
                type="number"
                placeholder="0"
                value={delay}
                onChange={(e) => setDelay(e.target.value)}
                className="w-16 text-center border border-gray-200 rounded-lg py-1 focus:outline-none focus:border-brand-green"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-600">
                Hourly Limit
              </label>
              <input
                type="number"
                placeholder="0"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className="w-16 text-center border border-gray-200 rounded-lg py-1 focus:outline-none focus:border-brand-green"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col p-8 pt-0 min-h-[250px]">
          <DefaultEditor
            value={body}
            onChange={(e: any) => setBody(e.target.value)}
            containerProps={{ style: { height: "100%" } }}
          />

          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-100">
              {attachments.map((att, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-1 w-32 relative group"
                >
                  {att.type.startsWith("image/") ? (
                    <div className="w-32 h-24 rounded-lg bg-gray-100 overflow-hidden border border-gray-200">
                      <img
                        src={att.content}
                        alt={att.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-32 h-24 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400">
                      <Paperclip className="w-8 h-8" />
                    </div>
                  )}
                  <div className="flex flex-col px-1">
                    <span className="text-xs font-medium text-gray-700 truncate">
                      {att.name}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {(att.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      setAttachments((prev) =>
                        prev.filter((_, idx) => idx !== i),
                      )
                    }
                    className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 bg-white shadow-sm border border-gray-200 w-6 h-6 flex items-center justify-center rounded-full text-gray-500 hover:text-red-500 hover:border-red-200 transition-all z-10"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Compose;
