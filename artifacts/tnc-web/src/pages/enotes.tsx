import { useState } from "react";
import { Link } from "wouter";
import { useGetCourses, useGetPromoStatus, useGetUserPurchases, getGetUserPurchasesQueryKey } from "@workspace/api-client-react";
import { FileText, Lock, Search, BookOpen, ChevronRight, ArrowRight } from "lucide-react";
import Layout from "@/components/Layout";
import { getUser } from "@/lib/auth";
import { motion } from "framer-motion";

export default function EnotesPage() {
  const user = getUser();
  const [search, setSearch] = useState("");

  const { data: courses, isLoading } = useGetCourses();
  const { data: promo } = useGetPromoStatus();
  const { data: purchases } = useGetUserPurchases(user?.userId ?? "", {
    query: { enabled: !!user, queryKey: getGetUserPurchasesQueryKey(user?.userId ?? "") },
  });

  const purchasedIds = new Set((purchases ?? []).map((p) => p.courseId));

  function isUnlocked(courseRowId: string) {
    return promo?.enabled || purchasedIds.has(courseRowId);
  }

  const filtered = (courses ?? []).filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="tnc-brand-gradient text-white py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <FileText size={22} />
            </div>
            <h1 className="text-2xl md:text-3xl font-black">E-Notes / PDF Notes</h1>
          </div>
          <p className="text-white/70 text-sm ml-[52px]">
            {(courses ?? []).length > 0 ? `${(courses ?? []).length} courses with comprehensive study materials` : "Structured PDF notes for all nursing exams"}
          </p>
        </div>
      </div>

      <div className="bg-white border-b sticky top-16 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses..."
              className="w-full pl-9 pr-4 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              data-testid="input-search-notes"
            />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <p className="text-xs text-gray-500 mb-5 font-medium uppercase tracking-wide">Select a course to browse its PDF notes</p>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 skeleton rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <FileText size={48} className="mx-auto text-gray-200 mb-3" />
            <p className="font-medium">No courses found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((course, i) => {
              const unlocked = isUnlocked(course.rowId);
              return (
                <motion.div
                  key={course.rowId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  data-testid={`card-note-course-${course.rowId}`}
                >
                  <div className={`bg-white rounded-2xl border p-4 flex items-center gap-4 hover:shadow-md transition-all ${
                    unlocked ? "border-gray-100 hover:border-red-200" : "border-gray-100"
                  }`}>
                    <div className={`w-12 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      unlocked ? "bg-red-50" : "bg-gray-100"
                    }`}>
                      {course.imageUrl ? (
                        <img
                          src={course.imageUrl}
                          alt={course.name}
                          className="w-full h-full object-cover rounded-xl"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      ) : (
                        <div className="text-center">
                          <FileText size={22} className={unlocked ? "text-red-500" : "text-gray-400"} />
                          <span className="text-[9px] mt-0.5 block font-bold text-gray-400">PDF</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">{course.name}</p>
                      {course.description && course.description !== "Description" && (
                        <p className="text-xs text-gray-400 truncate mt-0.5">{course.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                          unlocked ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                        }`}>
                          {unlocked ? "Unlocked" : <><Lock size={9} /> Locked</>}
                        </div>
                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                          <BookOpen size={10} /> Course Notes
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {unlocked ? (
                        <Link
                          href={`/courses/${course.rowId}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors"
                          data-testid={`btn-open-note-${course.rowId}`}
                        >
                          View Notes <ChevronRight size={13} />
                        </Link>
                      ) : (
                        <Link
                          href="/buy"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-600 text-xs font-semibold hover:bg-amber-100 transition-colors"
                          data-testid={`btn-unlock-note-${course.rowId}`}
                        >
                          <Lock size={12} /> Unlock
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="mt-10 bg-red-50 rounded-2xl p-5 border border-red-100 flex items-center justify-between gap-4">
          <div>
            <p className="font-bold text-gray-900 text-sm">Get all PDF notes</p>
            <p className="text-xs text-gray-500 mt-0.5">Well-structured e-notes for NORCET, AIIMS & all nursing exams</p>
          </div>
          <Link href="/buy" className="flex items-center gap-1 px-4 py-2 rounded-xl tnc-brand-gradient text-white text-xs font-semibold hover:opacity-90 transition-opacity whitespace-nowrap">
            Buy Now <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </Layout>
  );
}
