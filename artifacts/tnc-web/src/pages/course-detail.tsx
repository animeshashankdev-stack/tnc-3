import { useParams, Link } from "wouter";
import { useGetCourses, useListSessions, useGetPromoStatus, useGetUserPurchases, getGetUserPurchasesQueryKey, getListSessionsQueryKey } from "@workspace/api-client-react";
import { Video, FileText, Lock, PlayCircle, ChevronRight, ArrowLeft, Smartphone, AlertCircle } from "lucide-react";
import Layout from "@/components/Layout";
import { getUser } from "@/lib/auth";
import { motion } from "framer-motion";
import { useState } from "react";

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const user = getUser();
  const [activeTab, setActiveTab] = useState<"all" | "video" | "pdf">("all");

  const { data: courses, isLoading: coursesLoading } = useGetCourses();
  const course = (courses ?? []).find((c) => c.rowId === courseId);

  const { data: sessions, isLoading: sessionsLoading } = useListSessions(
    { courseId },
    { query: { queryKey: getListSessionsQueryKey({ courseId }) } }
  );

  const { data: promo } = useGetPromoStatus();
  const { data: purchases } = useGetUserPurchases(user?.userId ?? "", {
    query: { enabled: !!user, queryKey: getGetUserPurchasesQueryKey(user?.userId ?? "") },
  });

  const purchasedIds = new Set((purchases ?? []).map((p) => p.courseId));
  const isCourseUnlocked = promo?.enabled || purchasedIds.has(courseId ?? "");

  const allSessions = sessions ?? [];
  const videoSessions = allSessions.filter((s) => s.contentType === "youtube" || s.videoUrl);
  const pdfSessions = allSessions.filter((s) => s.contentType === "pdf" || s.pdfUrl);
  const firebaseSessions = allSessions.filter((s) => s.contentType === "firebase");

  const displaySessions = activeTab === "video"
    ? videoSessions
    : activeTab === "pdf"
      ? pdfSessions
      : allSessions;

  if (coursesLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
          <div className="h-8 skeleton rounded w-1/2" />
          <div className="h-48 skeleton rounded-2xl" />
          <div className="h-4 skeleton rounded w-3/4" />
        </div>
      </Layout>
    );
  }

  if (!course) {
    return (
      <Layout>
        <div className="text-center py-20">
          <p className="text-gray-500 font-medium">Course not found</p>
          <Link href="/courses" className="text-blue-600 text-sm mt-2 inline-block">Back to courses</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero */}
      <div className="tnc-hero-gradient text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link href="/courses" className="flex items-center gap-1 text-white/70 hover:text-white text-sm mb-4 w-fit" data-testid="link-back-courses">
            <ArrowLeft size={14} /> Back to Courses
          </Link>
          <div className="flex flex-col md:flex-row gap-6">
            {course.imageUrl && (
              <div className="w-full md:w-48 h-32 md:h-36 rounded-xl overflow-hidden flex-shrink-0">
                <img src={course.imageUrl} alt={course.name} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-xl md:text-2xl font-black mb-2">{course.name}</h1>
              {course.description && course.description !== "Description" && (
                <p className="text-white/70 text-sm leading-relaxed mb-3">{course.description}</p>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-white/80">
                <span className="flex items-center gap-1"><Video size={14} /> {videoSessions.length} Videos</span>
                <span className="flex items-center gap-1"><FileText size={14} /> {pdfSessions.length} Notes</span>
                {firebaseSessions.length > 0 && (
                  <span className="flex items-center gap-1"><Smartphone size={14} /> {firebaseSessions.length} App-only</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Unlock banner */}
      {!isCourseUnlocked && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
          <div className="max-w-4xl mx-auto flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 text-amber-800 text-sm">
              <Lock size={16} className="text-amber-500" />
              <span>Purchase this course to unlock all paid content. Free lessons are accessible below.</span>
            </div>
            <Link href="/buy" className="px-4 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition-colors" data-testid="btn-unlock-buy">
              Buy Now
            </Link>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white border-b sticky top-16 z-30">
        <div className="max-w-4xl mx-auto px-4 flex gap-1 py-2">
          {[
            { key: "all", label: `All (${allSessions.length})` },
            { key: "video", label: `Videos (${videoSessions.length})` },
            { key: "pdf", label: `Notes (${pdfSessions.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === tab.key
                  ? "bg-blue-600 text-white"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {sessionsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 skeleton rounded-xl" />
            ))}
          </div>
        ) : displaySessions.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <AlertCircle size={48} className="mx-auto text-gray-200 mb-3" />
            <p className="font-medium">No {activeTab === "video" ? "video" : activeTab === "pdf" ? "PDF" : ""} content available yet</p>
            <p className="text-sm mt-1">Check back soon</p>
          </div>
        ) : (
          <div className="space-y-2">
            <h2 className="text-base font-black text-gray-900 mb-4">
              Course Content <span className="text-gray-400 font-normal text-sm">({displaySessions.length} items)</span>
            </h2>
            {displaySessions.map((session, i) => {
              const isVideo = session.contentType === "youtube" || (!session.pdfUrl && session.videoUrl);
              const isPdf = session.contentType === "pdf" || session.pdfUrl;
              const isFirebase = session.contentType === "firebase";
              // Free sessions are accessible even without purchase; paid sessions need unlock
              const canAccess = !session.isPaid || isCourseUnlocked;

              const href = isVideo
                ? `/watch/${session.rowId}`
                : isPdf
                  ? `/pdf/${session.rowId}`
                  : `/watch/${session.rowId}`;

              const typeColor = isVideo
                ? "bg-blue-100 text-blue-600"
                : isPdf
                  ? "bg-red-50 text-red-500"
                  : "bg-gray-100 text-gray-500";

              const typeLabel = isVideo ? "VIDEO" : isPdf ? "PDF" : isFirebase ? "APP" : "CONTENT";
              const TypeIcon = isVideo ? PlayCircle : isPdf ? FileText : isFirebase ? Smartphone : PlayCircle;

              return (
                <motion.div
                  key={session.rowId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.5) }}
                >
                  {canAccess && !isFirebase ? (
                    <Link
                      href={href}
                      className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all group"
                      data-testid={`session-item-${session.rowId}`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${typeColor}`}>
                        <TypeIcon size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{session.title}</p>
                        {!session.isPaid && (
                          <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">FREE</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400 flex-shrink-0">
                        <span className={`px-2 py-0.5 rounded-full font-medium text-[10px] ${typeColor}`}>{typeLabel}</span>
                        <ChevronRight size={16} className="group-hover:text-blue-600 transition-colors" />
                      </div>
                    </Link>
                  ) : isFirebase ? (
                    <div
                      className="flex items-center gap-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100"
                      data-testid={`session-firebase-${session.rowId}`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-500 flex items-center justify-center flex-shrink-0">
                        <Smartphone size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-700 truncate">{session.title}</p>
                        <p className="text-xs text-blue-500">Available in the TNC mobile app</p>
                      </div>
                      <a
                        href="https://play.google.com/store/apps/details?id=in.tncnursing.app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs px-2 py-1 rounded-lg bg-blue-600 text-white font-medium shrink-0"
                      >
                        Download App
                      </a>
                    </div>
                  ) : (
                    <div
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 opacity-70"
                      data-testid={`session-locked-${session.rowId}`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <Lock size={18} className="text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-600 truncate">{session.title}</p>
                        <p className="text-xs text-gray-400">Purchase course to unlock</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${typeColor} opacity-60`}>{typeLabel}</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
