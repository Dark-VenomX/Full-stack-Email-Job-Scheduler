import { ArrowLeft, Star, Trash2, Archive } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { client } from "../lib/client";
import { useAuth } from "../hooks/useAuth";
import type { ScheduledEmail } from "../types";

const EmailView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const [email, setEmail] = useState<ScheduledEmail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      setLoading(true);
      client
        .getEmail(id)
        .then((data) => setEmail(data))
        .catch((err) => console.error("Failed to load email", err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col h-full bg-white items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  if (!email) {
    return (
      <div className="flex-1 flex flex-col h-full bg-white items-center justify-center text-gray-500">
        Email not found.
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-brand-green font-medium"
        >
          Go Back
        </button>
      </div>
    );
  }

  const recipients = Array.isArray(email.recipients)
    ? email.recipients.join(", ")
    : email.recipients;

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-y-auto">
      <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-1 text-gray-500 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-medium text-gray-900">
            {user?.name?.split(" ")[0] || "User"}, hello there! |{" "}
            <span className="text-gray-500 font-normal">
              #{email.id.substring(0, 8)}
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3 text-gray-400">
          <button className="p-2 hover:text-yellow-400 transition-colors">
            <Star className="w-4 h-4" />
          </button>
          <button className="p-2 hover:text-gray-600 transition-colors">
            <Archive className="w-4 h-4" />
          </button>
          <button className="p-2 hover:text-red-500 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
          <div className="w-8 h-8 rounded-full overflow-hidden ml-2 bg-gray-200">
            <img
              src={
                user?.avatar ||
                "https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver"
              }
              alt="User"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full p-8">
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-medium text-lg uppercase">
              {recipients?.[0] || "U"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900">
                  To: {recipients}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-0.5">from me ⌄</div>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {new Date(
              email.startTime || email.createdAt || Date.now(),
            ).toLocaleString()}
          </div>
        </div>

        <div className="text-gray-800 space-y-6 text-[15px] leading-relaxed">
          <h2 className="text-2xl font-semibold mb-6">{email.subject}</h2>

          <div dangerouslySetInnerHTML={{ __html: email.body }} />
        </div>

        {email.attachments && email.attachments.length > 0 && (
          <div className="mt-12 flex flex-wrap gap-4">
            {email.attachments.map((att, i) => {
              const isImage = att.type.startsWith("image/");
              return (
                <div
                  key={i}
                  className="group relative w-48 rounded-xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-all"
                >
                  <div className="h-32 bg-gray-50 flex items-center justify-center overflow-hidden">
                    {isImage ? (
                      <img
                        src={att.content}
                        alt={att.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-gray-400 font-medium uppercase text-xl">
                        {att.name.split(".").pop()}
                      </div>
                    )}
                  </div>
                  <div className="p-3 bg-white">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {att.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {(att.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailView;
