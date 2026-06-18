import { useParams, Link } from "wouter";
import { useEffect, useRef, useState } from "react";
import { useGetSession, useGetPromoStatus, useGetUserPurchases, getGetUserPurchasesQueryKey, useListSessions, getListSessionsQueryKey } from "@workspace/api-client-react";
import { ArrowLeft, Lock, Video, FileText, AlertCircle, ChevronRight, PlayCircle, Heart, WifiOff } from "lucide-react";
import Layout from "@/components/Layout";
import { getUser, logActivity, isFavorite, toggleFavorite } from "@/lib/auth";

function HlsPlayer({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { sessionId } = useParams<{ sessionId: string }>();
  const [hasLogged, setHasLogged] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let cleanup: (() => void) | undefined;
    if (src.includes(".m3u8")) {
      import("hls.js").then(({ default: Hls }) => {
        if (Hls.isSupported()) {
          const hls = new Hls();
          hls.loadSource(src);
          hls.attachMedia(video);
          cleanup = () => hls.destroy();
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
        }
      });
    } else {
      video.src = src;
    }
    return () => cleanup?.();
  }, [src]);

  function handleTimeUpdate() {
    const video = videoRef.current;
    if (!hasLogged && video && video.currentTime > 10) {
      setHasLogged(true);
      logActivity("video", sessionId ?? src);
    }
  }

  return (
    <video
      ref={videoRef}
      controls
      className="w-full max-h-[70vh] bg-black rounded-xl"
      onTimeUpdate={handleTimeUpdate}
      data-testid="video-player"
    >
      Your browser does not support video playback.
    </video>
  );
}

function YouTubeEmbed({ url, sessionId }: { url: string; sessionId: string }) {
  const videoId = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/)?.[1];
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) return;
    const timer = setTimeout(() => logActivity("video", sessionId), 15_000);
    return () => clearTimeout(timer);
  }, [started, sessionId]);

  if (!videoId) return <div className="h-40 flex items-center justify-center text-white/50 text-sm">Could not extract video ID from URL</div>;
  return (
    <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=0&enablejsapi=1`}
        className="absolute inset-0 w-full h-full rounded-xl"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        onLoad={() => setStarted(true)}
        data-testid="youtube-embed"
        title="Video lecture"
      />
    </div>
  );
}

function PdfViewer({ url, title }: { url: string; title: string }) {
  const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
  const fullUrl = url.startsWith("http") ? url : `${base}${url}`;
  return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b bg-gray-50">
          <FileText size={18} className="text-red-500" />
          <span className="text-sm font-semibold text-gray-700 truncate flex-1">{title}</span>
          <a
            href={fullUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 font-medium hover:underline shrink-0"
          >
            Open in new tab ↗
          </a>
        </div>
        <iframe
          src={fullUrl}
          className="w-full"
          style={{ height: "75vh" }}
          title={title}
          data-testid="pdf-viewer"
        />
      </div>
    </div>
  );
}

function FirebasePlayer({ src, title }: { src: string; title: string }) {
  const [status, setStatus] = useState<"loading" | "playing" | "error">("loading");
  const { sessionId } = useParams<{ sessionId: string }>();

  return (
    <div className="rounded-2xl overflow-hidden shadow-2xl">
      {status === "error" ? (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-center text-white">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
            <WifiOff size={30} className="text-white/60" />
          </div>
          <p className="font-black text-lg mb-2 leading-snug">{title}</p>
          <div className="bg-white/10 rounded-xl p-3 mb-5 text-left text-xs text-white/60 space-y-1.5">
            <p>⚠️ This video is hosted on Firebase Storage and can only be streamed through the TNC mobile app.</p>
            <p>Firebase Storage does not allow direct browser playback for this content.</p>
          </div>
          <p className="text-xs text-white/50 mb-4 font-medium uppercase tracking-wide">Watch on the TNC app</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://play.google.com/store/apps/details?id=com.tncnursing"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M3 20.5v-17c0-.83 1-.83 1.5-.5l15 8.5-15 8.5c-.5.33-1.5.33-1.5-.5z"/></svg>
              Play Store
            </a>
            <a
              href="https://apps.apple.com/in/app/team-nursing-classes-tnc/id6445818921"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
              App Store
            </a>
          </div>
        </div>
      ) : (
        <div className="bg-black rounded-2xl overflow-hidden">
          <video
            src={src}
            controls
            autoPlay={false}
            className="w-full max-h-[70vh] bg-black"
            data-testid="firebase-video-player"
            onLoadedData={() => setStatus("playing")}
            onError={() => setStatus("error")}
            onTimeUpdate={(e) => {
              if ((e.target as HTMLVideoElement).currentTime > 10) {
                logActivity("video", sessionId ?? src);
              }
            }}
          >
            Your browser does not support video playback.
          </video>
        </div>
      )}
    </div>
  );
}

function NoContentCard({ title }: { title: string }) {
  return (
    <div className="bg-gray-50 rounded-2xl border border-gray-100 p-8 text-center">
      <AlertCircle size={40} className="mx-auto text-gray-300 mb-3" />
      <h2 className="text-base font-semibold text-gray-600 mb-1">{title}</h2>
      <p className="text-sm text-gray-400">No viewable content is attached to this session yet.</p>
    </div>
  );
}

function CoursePlaylist({ courseId, currentSessionId }: { courseId: string; currentSessionId: string }) {
  const [showAll, setShowAll] = useState(false);
  const { data: sessions } = useListSessions(
    { courseId },
    { query: { queryKey: getListSessionsQueryKey({ courseId }) } }
  );

  const videoSessions = (sessions ?? []).filter(
    (s) => s.contentType === "youtube" || s.contentType === "firebase" || s.videoUrl || s.contentType === "pdf"
  );
  const displaySessions = showAll ? videoSessions : videoSessions.slice(0, 10);

  if (!videoSessions.length) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-800">Course Playlist</h3>
        <span className="text-xs text-gray-400">{videoSessions.length} lessons</span>
      </div>
      <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
        {displaySessions.map((s) => {
          const isCurrent = s.rowId === currentSessionId;
          const isPdf = s.contentType === "pdf" && !s.videoUrl;
          return (
            <Link
              key={s.rowId}
              href={isPdf ? `/pdf/${s.rowId}` : `/watch/${s.rowId}`}
              className={`flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors ${isCurrent ? "bg-blue-50 border-l-2 border-blue-600" : ""}`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${isCurrent ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"}`}>
                {isPdf ? <FileText size={13} /> : <PlayCircle size={14} />}
              </div>
              <p className={`text-xs font-medium truncate flex-1 ${isCurrent ? "text-blue-700" : "text-gray-700"}`}>{s.title}</p>
              {isCurrent && <div className="w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0" />}
            </Link>
          );
        })}
      </div>
      {videoSessions.length > 10 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full py-2.5 text-xs font-medium text-blue-600 hover:bg-blue-50 border-t transition-colors"
        >
          {showAll ? "Show less" : `Show all ${videoSessions.length} lessons`}
        </button>
      )}
    </div>
  );
}

export default function WatchPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const user = getUser();
  const [fav, setFav] = useState(() => isFavorite("sessions", sessionId ?? ""));

  const { data: session, isLoading } = useGetSession(sessionId ?? "");
  const { data: promo } = useGetPromoStatus();
  const { data: purchases } = useGetUserPurchases(user?.userId ?? "", {
    query: { enabled: !!user, queryKey: getGetUserPurchasesQueryKey(user?.userId ?? "") },
  });

  const purchasedIds = new Set((purchases ?? []).map((p) => p.courseId));
  const isCourseUnlocked = promo?.enabled || (!!session?.courseId && purchasedIds.has(session.courseId));
  const isUnlocked = !session?.isPaid || isCourseUnlocked;

  function handleToggleFav() {
    const result = toggleFavorite("sessions", sessionId ?? "");
    setFav(result);
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="h-80 skeleton rounded-2xl mb-4" />
          <div className="h-6 skeleton rounded w-1/2 mb-2" />
          <div className="h-4 skeleton rounded w-3/4" />
        </div>
      </Layout>
    );
  }

  if (!session) {
    return (
      <Layout>
        <div className="text-center py-20">
          <Video size={48} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-500 font-medium">Session not found</p>
          <Link href="/courses" className="text-blue-600 text-sm mt-2 inline-block">Back to courses</Link>
        </div>
      </Layout>
    );
  }

  const contentType = session.contentType ?? (session.videoUrl ? "youtube" : "none");
  const backHref = session.courseId ? `/courses/${session.courseId}` : "/courses";

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-6">
        <Link
          href={backHref}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4 w-fit"
          data-testid="link-back-session"
        >
          <ArrowLeft size={14} /> Back to Course
        </Link>

        <div className="flex flex-col lg:flex-row gap-5">
          <div className="flex-1 min-w-0">
            {!isUnlocked ? (
              <div className="bg-gray-100 rounded-2xl p-12 text-center">
                <Lock size={48} className="mx-auto text-gray-300 mb-4" />
                <h2 className="text-lg font-bold text-gray-700 mb-2">Content Locked</h2>
                <p className="text-gray-500 text-sm mb-4">Purchase the course to access this paid session</p>
                <Link href="/buy" className="px-6 py-2 rounded-xl tnc-brand-gradient text-white text-sm font-semibold inline-block" data-testid="btn-buy-unlock">
                  Buy Course
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {contentType === "youtube" && session.videoUrl ? (
                  <div className="bg-black rounded-2xl overflow-hidden shadow-2xl">
                    {session.videoUrl.includes("youtube.com") || session.videoUrl.includes("youtu.be") ? (
                      <YouTubeEmbed url={session.videoUrl} sessionId={sessionId ?? ""} />
                    ) : (
                      <HlsPlayer src={session.videoUrl} />
                    )}
                  </div>
                ) : contentType === "pdf" && session.pdfUrl ? (
                  <PdfViewer url={session.pdfUrl} title={session.title} />
                ) : contentType === "firebase" && session.videoUrl ? (
                  <FirebasePlayer src={session.videoUrl} title={session.title} />
                ) : (
                  <NoContentCard title={session.title} />
                )}

                {contentType !== "pdf" && (
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-start justify-between gap-3">
                      <h1 className="text-lg font-black text-gray-900 leading-snug" data-testid="session-title">
                        {session.title}
                      </h1>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!session.isPaid && (
                          <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">FREE</span>
                        )}
                        <button
                          onClick={handleToggleFav}
                          className={`p-2 rounded-full transition-colors ${fav ? "text-red-500 bg-red-50" : "text-gray-400 hover:text-red-400 hover:bg-red-50"}`}
                          aria-label={fav ? "Remove from favorites" : "Add to favorites"}
                          data-testid="btn-favorite-session"
                        >
                          <Heart size={18} fill={fav ? "currentColor" : "none"} />
                        </button>
                      </div>
                    </div>
                    {session.courseId && (
                      <Link href={`/courses/${session.courseId}`} className="text-xs text-blue-600 mt-2 inline-flex items-center gap-1 hover:underline">
                        View full course <ChevronRight size={12} />
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {session.courseId && (
            <div className="lg:w-72 flex-shrink-0">
              <CoursePlaylist courseId={session.courseId} currentSessionId={sessionId ?? ""} />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
